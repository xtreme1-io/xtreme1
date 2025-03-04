import { defineStore } from 'pinia';

import { ref } from 'vue';
import { SnapshotManager } from './SnapshotManager';
import dayjs from 'dayjs';

import modes from '../../config/mode';

import {
  type LogListItemData,
  type LogListItem,
  type CompareResult,
  LogOpEnum,
  ToolTypeEnum,
} from '@basicai/tool-components';
import { useHistoryUI } from '@basicai/tool-components/lib/components/History/useHistoryUI';
import { useInjectBSEditor } from '../../context';
import { ISourceData, SourceType } from '../../type';
import { t } from '@/lang';
import {
  findHistoricalRecordList,
  queryHistoricalRecord,
  getPreSignUrlList,
  getUrl,
} from '../../api';
import {
  BSError,
  IFrame,
  IModeConfig,
  IValidity,
  ShapeRoot,
  StageTypeEnum,
  utils as EditorUtils,
  AnnotateObject,
  IUserData,
  MaskShape,
  ToolModelEnum,
  OPType,
  utils,
  Konva,
  Skeleton,
  Shape,
  Event as EditorEvent,
} from 'image-editor';
import {
  IBasicAIFormat,
  convertObject2Annotate,
  copyClassificationValues,
  getTaskSaveData,
  segments2Annotate,
} from '../../utils';
import useUI from '../../hook/useUI';
import { BsUIType } from '../../config/ui';
import Event from '../../config/event';
import { tabKey } from '../../components/Operation/typing';
import { cloneDeep } from 'lodash';

export const historyStore = defineStore('history', () => {
  const editor = useInjectBSEditor();
  const { has, canEdit } = useUI();
  const snapshotManager = new SnapshotManager(editor);
  const _dataMap: Map<string, ShapeRoot> = new Map();
  const _trackMap: Map<string, Partial<IUserData>> = new Map();
  const sourceData = ref<Record<string, ISourceData>>({});
  const restoreEnabled = ref<boolean>(false);
  const viewEnabled = ref<boolean>(false);
  const _enabled = ref<boolean>(false);
  let activeLogItem: LogListItemData | undefined;
  const UIOption = {
    onListItemClick: (item: LogListItemData) => viewLogRecord(item),
    onHistory: (() => {
      let inProcess = false;
      return async () => {
        if (inProcess) return;
        inProcess = true;
        UI.state.activeItem = '';
        activeLogItem = undefined;
        try {
          editor.showLoading(true);
          if (UI.state.visible) {
            viewLog(false);
          } else {
            if (editor.bsState.doing.saving) {
              editor.showMsg('warning', t('common.msgSavingTryLater'));
            } else {
              if (canEdit()) {
                await editor.saveTaskFlow();
              }
              await fetchData({ type: 'reset' });
              viewLog(true);
              const currentLogItem0 = UI.state.list[0]?.children?.[0];
              if (!currentLogItem0) {
                editor.showMsg('error', t('common.msgNoHistory'));
                // viewLog(false);
              } else {
                await viewLogRecord(currentLogItem0).catch(() => {});
                editor.emit(Event.OPERATION_TAB_CHANGE, tabKey.INSTANCE);
              }
            }
          }
        } catch (err: any) {
          viewLog(false);
        } finally {
          inProcess = false;
          editor.showLoading(false);
        }
      };
    })(),
    onRestore: async () => {
      if (!UI.state.activeItem) return;
      const yymd = dayjs(activeLogItem?.generatedAt).format('YYYY-MM-DD');
      const hm = dayjs(activeLogItem?.generatedAt).format('HH:mm');
      const replaceObject = await editor
        .showConfirm({
          title: t('image.Warning'),
          subTitle: t('common.msgConfirmRestore', {
            yymd: dayjs(activeLogItem?.generatedAt).format('YYYY-MM-DD'),
            hm: dayjs(activeLogItem?.generatedAt).format('HH:mm'),
          }),
          okText: t('image.Ok'),
          cancelText: t('image.cancel'),
        })
        .then(() => true)
        .catch(() => false);
      if (replaceObject) {
        viewLog(false);
        editor.cmdManager.withGroup(() => {
          let frames = [editor.getCurrentFrame()];
          if (editor.state.isSeriesFrame) {
            frames = editor.state.frames;
          }
          const addObjectOption: { objects: AnnotateObject[]; frame: IFrame }[] = [];
          const allObjects: AnnotateObject[] = [];
          frames.forEach((frame) => {
            const source = editor.dataManager.getSourceData(frame, editor.bsState.currentSource);
            const hSourceData = sourceData.value[frame.id];
            if (source && hSourceData) {
              frame.needSave = true;
              source.needCompose = true;
              source.classifications = cloneDeep(hSourceData.classifications);
              source.validity = hSourceData.validity;
            }

            const objects = editor.dataManager.getFrameAllObject(frame.id) || [];
            const flatObjects = EditorUtils.flatObjects(objects);
            if (flatObjects.length) {
              editor.cmdManager.execute('delete-object', {
                objects: flatObjects,
                frame: frame,
              });
            }
            const keyIns = EditorUtils.formatId([frame.id, ToolModelEnum.INSTANCE]);
            const keySeg = EditorUtils.formatId([frame.id, ToolModelEnum.SEGMENTATION]);
            let replaceIns = _dataMap.get(keyIns)?.children ?? [];
            let replaceSeg = _dataMap.get(keySeg)?.children ?? [];
            replaceIns = replaceIns.filter((e) => {
              return !e._deleted;
            });
            replaceSeg = replaceSeg.filter((e) => {
              return !e._deleted;
            });
            allObjects.push(...replaceIns, ...replaceSeg);
            addObjectOption.push({ objects: [...replaceIns, ...replaceSeg], frame: frame });
          });
          const trackMap: Record<string, Partial<IUserData>> = {};
          allObjects.forEach((o) => {
            o._log_op = undefined;
            const trackId = o.userData.trackId;
            if (!trackMap[trackId]) {
              const trackObj = editor.createTrackObj(o)?.[0];
              if (trackObj) trackMap[trackId] = trackObj;
            }
          });
          const deleteTracks = Array.from(editor.trackManager.trackMap.keys());
          const addTracks = Object.values(trackMap);
          if (deleteTracks.length > 0) editor.cmdManager.execute('delete-track', deleteTracks);
          if (addTracks.length > 0) editor.cmdManager.execute('add-track', addTracks);
          if (addObjectOption.length > 0) editor.cmdManager.execute('add-object', addObjectOption);
        });
        editor.showMsg('success', t('common.msgSuccessRestore', { yymd: yymd, hm: hm }));
      }
    },
    onSwitch: async (value: number) => {
      UI.state.objectIndex = value;
      const objectInfo = getObjectUUIDByIndex(UI.state.objectIndex);
      if (objectInfo) {
        await selectObjectAnywhere(findObjectByUUID(objectInfo.uuid, objectInfo.dataId));
      }
    },
    onMore: () => fetchData({ type: 'more' }),
  };
  const UI = useHistoryUI(UIOption, () => editor.state.lang);
  const viewDeletedUtil = {
    dashStyle: {
      draggable: false,
      fill: '#ff000050',
      stroke: '#ff000080',
      dash: [20, 10],
    },
    viewGroup: new Konva.Group(),
    reset() {
      viewDeletedUtil.viewGroup.removeChildren();
    },
    init() {
      editor.on(EditorEvent.SELECT, viewDeletedUtil.reset);
      editor.mainView.helpLayer.add(viewDeletedUtil.viewGroup);
    },
    destroyed() {
      editor.off(EditorEvent.SELECT, viewDeletedUtil.reset);
      viewDeletedUtil.viewGroup.remove();
    },
  };
  /** 根据历史记录 获取标注结果数据 */
  const getBasicAIFormatDataByRecord = async (item: LogListItemData) => {
    let list = [item];
    if (!item.isFullResult) {
      list = await findHistoricalRecordList(item.id);
      list.sort((a, b) => b.generatedAt - a.generatedAt);
      const fullIndex = list.findIndex((e) => e.isFullResult);
      if (fullIndex < 0) throw new BSError('', 'Unknown error');
      list = list.slice(0, fullIndex + 1);
      list.reverse();
    }
    const baseItem = list[0];

    let baseFileData: IBasicAIFormat[] = [];
    if (baseItem.isEmptyResult) {
      const frames = editor.state.isSeriesFrame ? editor.state.frames : [editor.getCurrentFrame()];
      baseFileData = frames.map((f) => {
        return {
          dataId: f.id,
          validity: editor.bsState.task.dataDefaultValidity || IValidity.VALID,
          classifications: [],
          objects: [],
          segments: [],
          entities: [],
          relations: [],
          segmentations: [],
        };
      });
    } else {
      if (!baseItem.filePath) throw new BSError('', 'Miss full file path');
      baseFileData = await getUrl(baseItem.filePath);
    }

    const baseObjectMap: Record<string, Record<string, any>> = {};
    const baseFileDataMap: Record<string, IBasicAIFormat> = {};

    for (let j = 0; j < baseFileData.length; j++) {
      const frameData = baseFileData[j];
      baseFileDataMap[frameData.dataId] = frameData;
      if (!baseObjectMap[frameData.dataId]) baseObjectMap[frameData.dataId] = {};
      const objectMap = baseObjectMap[frameData.dataId];
      const { objects = [], segments = [] } = frameData;
      [...objects, ...segments].forEach((o) => {
        objectMap[o.id] = o;
      });
      const segmentMap = segments.reduce((m: any, o) => {
        if (o.no && !o.contour.maskData) {
          m[o.no] = o;
        }
        return m;
      }, {});
      if (baseItem.isFullResult && Object.keys(segmentMap).length > 0) {
        const resultFilePath: string[] = await getPreSignUrlList(
          frameData.segmentations.map((e) => e.resultFilePath),
        );
        const segmentObjs = await EditorUtils.image2Mask(resultFilePath[0]);
        segments.forEach((e) => {
          const contour = segmentObjs[String(e.no)];
          e.contour = contour;
        });
      }
    }
    for (let i = 1; i < list.length; i++) {
      const item = list[i];
      const fileData: CompareResult[] = await getUrl(item.filePath);
      fileData.forEach((fcResult) => {
        const objectMap = baseObjectMap[fcResult.dataId] || {};
        const basicAIFormatData = baseFileDataMap[fcResult.dataId];
        basicAIFormatData.validity = fcResult.validity;
        basicAIFormatData.classifications = fcResult.classifications;
        const { segments, objects } = basicAIFormatData;
        const isLastItem = i == list.length - 1;
        fcResult.delete.forEach((e: any) => {
          if (isLastItem) {
            // e._log_op = LogOpEnum.Delete;
            // if (e.type == ToolTypeEnum.MASK) {
            //   segments.push(e);
            // } else {
            //   objects.push(e);
            // }
            if (!objectMap[e.id]) {
              if (e.type == ToolTypeEnum.MASK) {
                segments.push(e);
              } else {
                objects.push(e);
              }
              objectMap[e.id] = e;
              console.error(
                'It seems like there is a problem. The full version does not have this data in DELETE',
              );
            }
            objectMap[e.id]._log_op = LogOpEnum.Delete;
          } else {
            const targets = e.type == ToolTypeEnum.MASK ? segments : objects;
            const index = targets.findIndex((s) => s.id == e.id);
            if (index >= 0) {
              targets.splice(index, 1);
              Reflect.deleteProperty(objectMap, e.id);
            }
          }
        });
        fcResult.create.forEach((e: any) => {
          if (isLastItem) {
            e._log_op = LogOpEnum.Create;
          }
          if (e.type == ToolTypeEnum.MASK) {
            segments.push(e);
          } else {
            objects.push(e);
          }
          objectMap[e.id] = e;
        });
        fcResult.edit.forEach((e: any) => {
          if (isLastItem) {
            e._log_op = LogOpEnum.Edit;
          }
          if (!objectMap[e.id]) {
            if (e.type == ToolTypeEnum.MASK) {
              segments.push(e);
            } else {
              objects.push(e);
            }
            objectMap[e.id] = e;
            console.error(
              'It seems like there is a problem. The full version does not have this data in EDIT',
            );
          }
          Object.assign(objectMap[e.id], e);
        });
      });
    }
    return baseFileData;
  };
  /** 与当前版本对比 返回增量信息 */
  const getDifRecords = (datas: IBasicAIFormat[]) => {
    const baseData = snapshotManager.current;
    const compareResult = snapshotManager.compare(
      baseData,
      datas,
      datas.map((e) => e.dataId),
    );
    if (editor.state.isSeriesFrame) {
      const statistics = compareResult.reduce(
        (info, e) => {
          info.create += e.create.length;
          info.delete += e.delete.length;
          info.edit += e.edit.length;
          return info;
        },
        { edit: 0, delete: 0, create: 0 },
      );
      return [
        {
          itemId: editor.state.sceneId,
          content: compareResult,
          stageId: editor.bsState.stageId,
          statistic: {
            objectStatistic: {
              edit: statistics.edit,
              create: statistics.create,
              delete: statistics.delete,
            },
          },
        },
      ];
    }
    return compareResult.map((e) => {
      return {
        itemId: e.dataId,
        content: [e],
        stageId: editor.bsState.stageId,
        statistic: {
          objectStatistic: {
            edit: e.edit.length,
            create: e.create.length,
            delete: e.delete.length,
          },
        },
      };
    });
  };
  const findObjectByUUID = (uuid: string, dataId: string) => {
    const objects_ins =
      _dataMap.get(EditorUtils.formatId([dataId, ToolModelEnum.INSTANCE]))?.children || [];
    const objects_seg =
      _dataMap.get(EditorUtils.formatId([dataId, ToolModelEnum.SEGMENTATION]))?.children || [];
    return [...objects_seg, ...objects_ins].find((e) => e.uuid == uuid);
  };
  const selectObjectAnywhere = async (object?: AnnotateObject) => {
    if (object) {
      await editor.loadFrame(editor.getFrameIndex(object.frame?.id as string), true);
      const mode =
        object instanceof MaskShape ? ToolModelEnum.SEGMENTATION : ToolModelEnum.INSTANCE;
      await editor.actionManager.execute('changeToolMode', mode);
    }
    viewDeletedUtil.reset();
    editor.selectObject(object);
    if (object && object._deleted) {
      const cloneObj = object.cloneThisShape() as Shape;
      cloneObj.visible(true);
      cloneObj._log_op = LogOpEnum.Delete;
      if (cloneObj instanceof Skeleton) {
        cloneObj.edges.forEach((edge) => edge.setAttrs(viewDeletedUtil.dashStyle));
        cloneObj.points.forEach((point) => point.setAttrs(viewDeletedUtil.dashStyle));
      } else {
        cloneObj.setAttrs(viewDeletedUtil.dashStyle);
      }
      viewDeletedUtil.viewGroup.add(cloneObj);
    }
  };
  const getObjectUUIDByIndex = (index: number) => {
    const idMap = UI.state.objectIdsMap;
    const keys = Object.keys(idMap);
    let tempIndex = 0;
    for (let i = 0; i < keys.length; i++) {
      const ids = idMap[keys[i]] || [];
      for (let j = 0; j < ids.length; j++) {
        if (index == ++tempIndex) return { dataId: keys[i], uuid: ids[j] };
      }
    }
  };
  const viewLogRecord = (() => {
    let inProcess = false;
    return async (item: LogListItemData) => {
      if (inProcess || !item || UI.state.activeItem == item.id) return;
      inProcess = true;
      editor.showLoading(true);
      try {
        const data = await getBasicAIFormatDataByRecord(item);
        const objectIdsMap: Record<string, string[]> = {};
        const frameSourceData: Record<string, ISourceData> = {};
        let total = 0;
        data.forEach((e) => {
          e.sourceId = '-1';
          e.sourceType = SourceType.DATA_FLOW;
          const frame = editor.getFrame(e.dataId + '');
          const root_ins = new ShapeRoot({ frame, type: ToolModelEnum.INSTANCE });
          const root_seg = new ShapeRoot({ frame, type: ToolModelEnum.SEGMENTATION });
          const annotates_ins = convertObject2Annotate(e, editor);
          const annotates_seg = segments2Annotate(e.segments ?? [], editor, {
            sourceId: '-1',
            sourceType: SourceType.DATA_FLOW,
          });
          root_ins.addObjects(annotates_ins);
          root_seg.addObjects(annotates_seg);
          [root_ins, root_seg].forEach((root) => {
            const key = EditorUtils.formatId([frame.id, root.type]);
            _dataMap.set(key, root);
          });

          objectIdsMap[e.dataId] = [];
          const { newClassifications, oldClassifications } = copyClassificationValues(
            editor.bsState.classifications,
            e.classifications || [],
          );
          frameSourceData[e.dataId] = {
            id: '-1',
            type: SourceType.DATA_FLOW,
            validity: e.validity as any,
            classifications: newClassifications,
            oldClassifications: oldClassifications,
            needCompose: false,
          };
          [...annotates_ins, ...annotates_seg].forEach((o) => {
            if (o._log_op) {
              total++;
              objectIdsMap[e.dataId].push(o.uuid);
            }
            if (!o.userData.trackId) o.userData.trackId = utils.createTrackId();
            if (!o.userData.trackName) o.userData.trackName = editor.getId();
            if (!o.userData.sourceId) o.userData.sourceId = '-1';
            if (!o.userData.sourceType) o.userData.sourceType = SourceType.DATA_FLOW;
          });
        });
        sourceData.value = frameSourceData;
        UI.state.totalObjectN = total;
        UI.state.objectIdsMap = objectIdsMap;
        UI.state.objectIndex = Math.min(1, total);
        editor.loadManager.loadDataFromManager();
        const objectInfo = getObjectUUIDByIndex(UI.state.objectIndex);
        if (objectInfo) {
          await selectObjectAnywhere(findObjectByUUID(objectInfo.uuid, objectInfo.dataId));
        } else {
          editor.selectObject();
        }

        UI.state.activeItem = item.id;
        activeLogItem = item;
      } catch (err: any) {
        console.error(err);
        editor.handleErr(new BSError('', t('common.errViewLogItem')));
        throw err;
      } finally {
        inProcess = false;
        editor.showLoading(false);
      }
    };
  })();

  const viewLog = (v: boolean) => {
    const bsState = editor.bsState;
    if (v) {
      viewDeletedUtil.init();
      restoreEnabled.value = editor.state.modeConfig.op == OPType.EDIT;
      editor.setMode(modes.history);
    } else {
      viewDeletedUtil.destroyed();
      const stageType2ModeMap: Partial<Record<StageTypeEnum, () => IModeConfig<string, string>>> = {
        [StageTypeEnum.ANNOTATE]: () => modes.taskAnnotate,
        [StageTypeEnum.REVIEW]: () => (bsState.isModify ? modes.taskReviewEdit : modes.taskReview),
        [StageTypeEnum.ACCEPTANCE]: () =>
          bsState.isModify ? modes.taskAcceptEdit : modes.taskAccept,
        [StageTypeEnum.QUALITY]: () => modes.taskQuality,
        [StageTypeEnum.VIEW]: () => modes.view,
      };
      const stageType = bsState.query.stageType as StageTypeEnum;
      const mode = stageType2ModeMap[stageType]?.();
      if (!mode) return;
      restoreEnabled.value = false;
      editor.setMode(mode);
      editor.loadManager.loadDataFromManager();
    }
    UI.state.activeItem = '';
    UI.state.visible = v;
  };
  const fetchData = (() => {
    let _fetching = false;
    let _reset = false;
    let _pageNo = 1;
    let _dateListRecord: Record<string, LogListItem> = {};
    return async (option: { type: 'reset' | 'more' | 'clear' }) => {
      switch (option.type) {
        case 'reset': {
          _pageNo = 1;
          _dateListRecord = {};
          UI.state.list = [];
          UI.state.loaded = 0;
          _reset = true;
          break;
        }
        case 'clear': {
          _pageNo = 1;
          _dateListRecord = {};
          UI.state.list = [];
          UI.state.loaded = 0;
          _reset = true;
          return;
        }
        case 'more': {
          _reset = false;
          if (_fetching) return;
          if (UI.state.loaded >= UI.state.total) return;
          _pageNo++;
          break;
        }
        default:
          return;
      }
      _fetching = true;
      const taskId = editor.bsState.taskId;
      let itemId = editor.getCurrentFrame().id;
      if (editor.state.isSeriesFrame) {
        itemId = editor.state.sceneId;
      }
      const data = await queryHistoricalRecord({
        pageNo: _pageNo,
        pageSize: 10,
        taskId: taskId,
        itemId: itemId,
      }).catch((e) => {
        editor.handleErr(e);
        return e;
      });
      _fetching = false;
      if (_reset && option.type == 'more') return;
      data.list.forEach((e: any) => {
        const date_yymd = dayjs(e.createdAt).format('YYYY-MM-DD');
        const log_list = _dateListRecord[date_yymd] || {
          key: date_yymd,
          datetime: Date.parse(date_yymd),
          children: [],
        };
        _dateListRecord[date_yymd] = log_list;
        log_list.children.push(e);
      });
      UI.state.loaded += data.list.length;
      UI.state.total = data.total;
      UI.state.list = Object.seal(
        Object.values(_dateListRecord).sort((a, b) => b.datetime - a.datetime),
      );
      UI.state.activeKey = UI.state.list.map((e) => e.key);
    };
  })();

  const H = {
    UI: Object.seal(UI),
    UIOption: Object.seal(UIOption),
    _dataMap: Object.seal(_dataMap),
    _trackMap: Object.seal(_trackMap),
    manager: Object.seal(snapshotManager),
    sourceData: sourceData,
    /**历史记录 相关UI是否可见 */
    getViewEnabled() {
      return viewEnabled.value;
    },
    /**历史记录 恢复按钮是否启用 */
    getRestoreEnabled() {
      return restoreEnabled.value;
    },
    /**历史记录 相关UI是否可见 */
    setViewEnabled(value: boolean) {
      viewEnabled.value = value;
    },
    /**历史记录 恢复按钮是否启用 */
    setRestoreEnabled(value: boolean) {
      restoreEnabled.value = value;
    },
    /**历史记录 结果切换组件是否可见 */
    boolShowObjectSwitcher() {
      return has(BsUIType.flowLog) && editor.state.isHistoryView;
    },
    /**历史记录 按钮是否可见 */
    boolShowBtnHistory() {
      return has(BsUIType.flowLog) && H.getViewEnabled();
    },
    /**历史记录 按钮是否可见 */
    boolShowBtnHistoryBack() {
      return H.boolShowBtnHistory() && UI.state.visible;
    },
    /**历史记录 恢复按钮是否可见 */
    boolShowBtnRestore() {
      return has(BsUIType.flowLog) && editor.state.isHistoryView && H.getRestoreEnabled();
    },
    /** 是否 保存增量信息 */
    enable(value?: boolean) {
      if (value != void 0) {
        _enabled.value = value;
      }
      return _enabled.value;
    },
    clear() {
      snapshotManager.clear();
      _dataMap.clear();
    },
    testDif() {
      const frames = editor.state.frames.filter((f) => f.needSave);
      const { saveDatas } = getTaskSaveData(editor, frames);
      return getDifRecords(saveDatas);
    },
    updateCurrentSnapshot(frames?: IFrame | IFrame[]) {
      if (!_enabled.value) return;
      frames = Array.isArray(frames) ? frames : frames ? [frames] : editor.state.frames;
      const { saveDatas } = getTaskSaveData(editor, frames);
      H.updateCurrentSnapshotData(saveDatas);
    },
    updateCurrentSnapshotData(saveDatas: IBasicAIFormat[]) {
      if (!_enabled.value) return;
      snapshotManager.current.snapshot(saveDatas);
    },
    getDifRecords: getDifRecords,
    selectedDeletedObj(uuid: string, dataId: string) {
      editor.selectObject();
      return selectObjectAnywhere(findObjectByUUID(uuid, dataId));
    },
  };
  return H;
});
