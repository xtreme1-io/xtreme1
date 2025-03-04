import { computed, onBeforeUnmount, onMounted, nextTick } from 'vue';
import { isNumber } from 'lodash';
import { MdEditor, QaType } from '@basicai/tool-components';
import {
  AnnotateObject,
  DataTypeEnum,
  IFrame,
  IValidity,
  LangType,
  StatusType,
  ToolModelEnum,
  __ALL__,
  Event as editorEvent,
} from 'image-editor';
import * as api from '../../api';
import { useInjectBSEditor } from '../../context';
import * as _utils from '../../utils';
import Event from '../../config/event';
import highLight, { QaNodeTarget } from './useHighlight';
import { tabKey } from '../Operation/typing';

enum RuleCode {
  DATA_NO_INSTANCE = 'DATA_HAS_INSTANCE',
  DATA_NO_SEGMENTATION = 'DATA_HAS_SEGMENTATION',
  DATA_NO_CLASSIFICATION_VALUE = 'DATA_HAS_CLASSIFICATION_ATTRIBUTE_VALUE',
  DATA_VALID = 'DATA_VALID',
  OBJECT_NO_CLASS = 'OBJECT_HAS_CLASS',
  OBJECT_NO_CLASS_VALUE = 'OBJECT_HAS_CLASS_ATTRIBUTE_VALUE',
  OBJECT_OUT_RANGE = 'OBJECT_INSIDE_RANGE',
  OBJECT_SIZE_ERROR = 'FIXED_OBJECT_SIZE_CONSISTENT',
  OBJECT_CLASS_VALID = 'OBJECT_CONFORMED_ONTOLOGY_CONSTRAINTS',
  TRACK_HAS_DIF_CLASS = 'TRACKING_OBJECT_CLASS_CONSISTENT',
  CLASS_NEED_UPDATE = 'CLASS_NOT_UPDATE',
  CLASSIFICATION_NEED_UPDATE = 'CLASSIFICATION_NOT_UPDATE',
}
const targetMap = {
  [RuleCode.DATA_NO_INSTANCE]: QaNodeTarget.FRAME,
  [RuleCode.DATA_NO_SEGMENTATION]: QaNodeTarget.FRAME,
  [RuleCode.DATA_NO_CLASSIFICATION_VALUE]: QaNodeTarget.CLASSIFICATION,
  [RuleCode.DATA_VALID]: QaNodeTarget.VALIDITY,
  [RuleCode.OBJECT_NO_CLASS]: QaNodeTarget.CLASS,
  [RuleCode.OBJECT_NO_CLASS_VALUE]: QaNodeTarget.CLASS,
  [RuleCode.OBJECT_OUT_RANGE]: QaNodeTarget.OBJECT,
  [RuleCode.OBJECT_SIZE_ERROR]: QaNodeTarget.OBJECT,
  [RuleCode.OBJECT_CLASS_VALID]: QaNodeTarget.CLASS,
  [RuleCode.TRACK_HAS_DIF_CLASS]: QaNodeTarget.CLASS,
  [RuleCode.CLASS_NEED_UPDATE]: QaNodeTarget.CLASS,
  [RuleCode.CLASSIFICATION_NEED_UPDATE]: QaNodeTarget.CLASSIFICATION,
};
export enum QASTATUS {
  RUNNING = 'running',
  PASS = 'pass',
  FAILED = 'failed',
  DEFAULT = '',
}

export default function useQA() {
  const editor = useInjectBSEditor();
  const { bsState, state } = editor;
  const qaState = bsState.qa;
  const errorRule: QaType.RuleLevel[] = ['MANDATORY', 'WARNING'];
  const nodeProxy = highLight();

  let trackMap: Record<string, string> = {};
  let inProgress = false;
  const langMap: Record<LangType, 'ko' | 'en' | 'zh-CN' | 'ar_AE'> = {
    [LangType['en-US']]: 'en',
    [LangType['ko-KR']]: 'ko',
    [LangType['zh-CN']]: 'zh-CN',
    [LangType['ar-AE']]: 'ar_AE',
  };
  editor.showQualityModal = async (option) => {
    qaState.visible = option.visible;
    qaState.loading = true;
    updateSource(option.data);
    const itemObject = qaState.objectSource.find((e) => e._rule_level === 'MANDATORY');
    const itemData = qaState.dataSource.find((e) => e._rule_level === 'MANDATORY');
    if (itemObject) {
      qaState.activeTab = 'object';
      qaState.activeRow = itemObject.id;
      onAction(QaType.ActionType.ROW_CLICK, itemObject);
    } else if (itemData) {
      qaState.activeTab = 'data';
      qaState.activeRow = itemData.id;
      onAction(QaType.ActionType.ROW_CLICK, itemData);
    }
    qaState.loading = false;
  };
  onMounted(() => {
    editor.on(editorEvent.SELECT, nodeProxy.reset);
    editor.on(editorEvent.FRAME_CHANGE, updateIfSingleFrame);
    editor.on(Event.SCENE_LOADED, updateIfSceneData);
    if (bsState.query.jobId) {
      editor.on(Event.BUSINESS_INIT, onQaVisibleTrue);
    }
  });
  onBeforeUnmount(() => {
    editor.off(editorEvent.SELECT, nodeProxy.reset);
    editor.off(editorEvent.FRAME_CHANGE, updateIfSingleFrame);
    editor.off(Event.SCENE_LOADED, updateIfSceneData);
    if (bsState.query.jobId) {
      editor.off(Event.BUSINESS_INIT, onQaVisibleTrue);
    }
  });

  function reset() {
    nodeProxy.reset();
    qaState.executed = false;
    qaState.visible = false;
    qaState.activeRow = '';
    qaState.version = -1;
    qaState.dataSource = [];
    qaState.objectSource = [];
    qaState.loading = false;
    qaState.hasError = false;
  }
  function onQaVisibleTrue(resetQA: boolean = true) {
    resetQA && reset();
    if (bsState.query.jobId) {
      qaState.visible = true;
      firstLoad();
    }
  }
  async function updateIfSingleFrame() {
    if (state.isSeriesFrame) return;
    await updateData();
  }
  async function updateIfSceneData() {
    if (!state.isSeriesFrame) return;
    await updateData();
  }
  async function updateData() {
    const preVisible = qaState.visible;
    reset();
    if (!preVisible) return;
    qaState.visible = true;
    editor.state.status = StatusType.Loading;
    if (bsState.query.jobId) await updateSourceByJob();
    else await updateSourceByRealTime();
    editor.state.status = StatusType.Default;
  }
  function createVersion() {
    if (editor.state.isSeriesFrame) {
      return editor.state.frames.reduce((v, e) => {
        return v + (e.version || 0);
      }, 0);
    } else {
      const frame = editor.getCurrentFrame();
      return frame ? +(String(frame.id) + (frame.version || 0)) : 0;
    }
  }
  function findInstruction(ruleId: string) {
    const rule = qaState.ruleConfig[ruleId];
    const infos = (rule?.instruction || {}) as any;
    const lang = editor.state.lang;
    const info = infos[langMap[lang]] ?? infos[lang] ?? Object.values(infos)[0];
    return info;
  }
  function findTrackName(trackId: string) {
    if (editor.state.isSeriesFrame) {
      return editor.trackManager.getTrackObject(trackId)?.trackName;
    } else {
      return trackMap[trackId];
    }
  }
  function findRuleLevel(ruleId: string) {
    const rule = qaState.ruleConfig[ruleId];
    return rule?.requirement;
  }
  const validVersion = computed(() => {
    return createVersion() === qaState.version;
  });

  function defaultClassificationIds() {
    return editor.bsState.classifications.reduce((attrIds, item) => {
      item.attrs.forEach((e) => {
        e.id && attrIds.push(e.id);
      });
      return attrIds;
    }, [] as string[]);
  }

  async function firstLoad(force?: boolean) {
    if ((!qaState.visible || qaState.executed) && !force) return;
    try {
      // await updateRuleConfig();
      if (bsState.query.jobId) {
        await updateSourceByJob();
      }
    } catch (e: any) {
      console.error(e);
    }
  }

  async function updateSourceByJob() {
    qaState.loading = true;
    const frame = editor.getCurrentFrame();
    const isScene = editor.state.isSeriesFrame;
    const jobId = bsState.query.jobId;
    const itemType = isScene ? DataTypeEnum.SCENE : DataTypeEnum.SINGLE_DATA;
    const itemId = isScene ? state.sceneId : frame.id;
    try {
      const data = await api.queryQaResult(jobId, itemId, itemType);
      if (!isScene) {
        const objects = getObjects(frame.id);
        objects.forEach((e) => {
          trackMap[e.userData.trackId || ''] = e.userData.trackName;
        });
      }
      updateSource(data);
      qaState.loading = false;
    } catch (error: any) {
      console.log(error);
      qaState.loading = false;
      editor.handleErr(error);
      throw error;
    }
  }

  function updateSource(results: any) {
    if (!results || !qaState.loading) return;
    const { dataQaResults = [], objectQaResults = [], ruleConfig = [] } = results;

    let hasError = false;
    const _ruleConfig: Record<string, QaType.RuleItem> = {};
    ruleConfig.forEach((e: any) => {
      _ruleConfig[e.id] = {
        id: e.id,
        annotationType: e.annotationType,
        toolType: e.dataType,
        code: e.code,
        description: e.description,
        requirement: e.requirement,
        instruction: e.instruction,
        name: e.name,
        target: e.targetOn,
        message: e.violateMessage,
      };
    });
    qaState.ruleConfig = Object.freeze(_ruleConfig);

    qaState.dataSource = dataQaResults.map((e: QaType.TableDataItem) => {
      const ruleLevel = findRuleLevel(e.violationRuleId);
      if (!hasError && errorRule.includes(ruleLevel)) {
        hasError = true;
      }
      const infos = e.violateDataInfos
        ? e.violateDataInfos.sort((a: any, b: any) => {
            return editor.getFrameIndex(a.dataId) - editor.getFrameIndex(b.dataId);
          })
        : [];
      const item: QaType.TableDataItem = {
        id: e.id,
        _data_count: infos.length,
        _rule_level: findRuleLevel(e.violationRuleId),
        _message: infos[0]?.violateMessage || '',
        hasInstruction: !!findInstruction(e.violationRuleId),
        violateDataInfos: Object.freeze(infos) as any,
        datasetId: e.datasetId,
        ruleResult: Object.freeze(e.ruleResult),
        violationRuleId: e.violationRuleId,
        dataId: e.dataId,
      };
      return item;
    });

    qaState.objectSource = objectQaResults
      .map((e: any) => {
        const ruleLevel = findRuleLevel(e.violationRuleId);
        if (!hasError && errorRule.includes(ruleLevel)) {
          hasError = true;
        }
        const id = `${e.trackId}#${e.violationRuleId}`;
        const _item: QaType.TableObjectItem = {
          id: id,
          _id: e.id,
          _track_name: findTrackName(e.trackId),
          _rule_level: findRuleLevel(e.violationRuleId),
          _data_count: e.objectInfos.length,
          _message: e.objectInfos[0]?.violateMessage || '',
          hasInstruction: !!findInstruction(e.violationRuleId),
          violateObjectInfos: Object.freeze(
            e.objectInfos
              .map((item: any) => {
                const { classAttributeIds = [], classifications = [] } = item.ruleResult || {};
                return {
                  objectId: item.objectId,
                  dataId: item.dataId,
                  classAttributeIds: classAttributeIds,
                  classifications: classifications,
                  violateMessage: item.violateMessage,
                };
              })
              .sort((a: any, b: any) => {
                return editor.getFrameIndex(a.dataId) - editor.getFrameIndex(b.dataId);
              }),
          ),
          violationRuleId: e.violationRuleId,
          dataName: e.dataName,
          itemId: e.itemId,
        };

        return _item;
      })
      .sort((a: any, b: any) => a._track_name - b._track_name);

    qaState.version = createVersion();
    qaState.executed = true;
    qaState.hasError = hasError;
    nodeProxy.reset();
  }

  async function updateSourceByRealTime() {
    const { isSeriesFrame } = state;
    const params = {
      isTransferResult: true,
      isOnlyDetectMandatoryRules: false,
    } as any;
    let frames: IFrame[] = [];
    if (isSeriesFrame) {
      frames = state.frames;
      params.sceneIds = [state.sceneId];
      params.dataIds = state.frames.map((e) => e.id);
    } else {
      const frame = editor.getCurrentFrame();
      if (frame) {
        params.dataIds = [frame.id];
        frames = [frame];
      }
    }
    let annotationResults: _utils.IBasicAIFormat[];
    params.datasetId = bsState.datasetId;
    if (bsState.isTaskFlow) {
      const { saveDatas } = _utils.getTaskSaveData(editor, frames);
      params.taskId = bsState.taskId;
      annotationResults = saveDatas;
    } else {
      const { saveDatas } = _utils.getDataFlowSaveData(editor, frames);
      annotationResults = saveDatas;
    }
    if (!isSeriesFrame) {
      trackMap = annotationResults.reduce((map: any, item) => {
        [...item.objects, ...item.segments].forEach((e) => {
          map[e.trackId || ''] = e.trackName;
        });
        return map;
      }, {});
    }
    params.annotationResults = annotationResults;
    const validParams = Object.values(params).some((e) => {
      if (Array.isArray(e) && e.length <= 0) return true;
      else if (e == undefined || e === '') return true;
      return false;
    });
    if (validParams) return;
    qaState.loading = true;
    try {
      const data = await api.queryQaResultRealtime(params);
      updateSource(data);
      qaState.loading = false;
    } catch (error: any) {
      console.error(error);
      editor.handleErr(error);
      qaState.loading = false;
      throw error;
    }
  }
  /**
   * 聚焦到对应的元素上
   */
  // 切换到对应帧
  async function toFrame(frameId: string) {
    const frameIndex = editor.getFrameIndex(frameId);
    if (!isNumber(frameIndex)) return;
    await editor.loadFrame(frameIndex, true);
  }
  // 切到对应source分支
  async function toSource(sourceId: string = '-1') {
    sourceId = editor.bsState.isTaskFlow ? '-1' : sourceId;
    editor.bsState.currentSource = sourceId + '';
    editor.bsState.activeSource = [__ALL__];
    await editor.loadManager.loadDataFromManager();
  }
  // 切换到对应工具模式
  function toToolMode(type: ToolModelEnum) {
    editor.actionManager.execute('changeToolMode', type);
  }
  function toToolModeByCode(code: RuleCode) {
    let type: ToolModelEnum | undefined;
    if (code === RuleCode.DATA_NO_INSTANCE) type = ToolModelEnum.INSTANCE;
    else if (code === RuleCode.DATA_NO_SEGMENTATION) type = ToolModelEnum.SEGMENTATION;
    if (!type) return;
    toToolMode(type);
  }
  function toToolModeByFrameObject(frameId: string, objectId: string) {
    const root_seg = editor.dataManager.getFrameRoot(frameId, ToolModelEnum.SEGMENTATION);
    const is_seg = root_seg.hasMap.get(objectId);
    let type: ToolModelEnum = ToolModelEnum.INSTANCE;
    if (is_seg) type = ToolModelEnum.SEGMENTATION;
    toToolMode(type);
  }
  // 切换到对应tab页(结果/classifications/validity)
  function toOperationTab(tab: tabKey) {
    editor.emit(Event.OPERATION_TAB_CHANGE, tab);
  }
  function getObjects(dataId: string) {
    const root_ins = editor.dataManager.getFrameRoot(dataId, ToolModelEnum.INSTANCE);
    let list = root_ins.allObjects;
    const root_seg = editor.dataManager.getFrameRoot(dataId, ToolModelEnum.SEGMENTATION);
    list = list.concat(root_seg.allObjects);
    return list;
  }
  function getObject(uuid: string, dataId: string) {
    const root_ins = editor.dataManager.getFrameRoot(dataId, ToolModelEnum.INSTANCE);
    let object = root_ins.hasMap.get(uuid);
    if (object) return object;
    const root_seg = editor.dataManager.getFrameRoot(dataId, ToolModelEnum.SEGMENTATION);
    object = root_seg.hasMap.get(uuid);
    return object;
  }

  async function focusData(
    dataId: string,
    ruleId: string,
    option: {
      sourceId?: string;
      attrIds?: string[];
    },
  ) {
    if (inProgress) return;
    inProgress = true;
    const { sourceId, attrIds } = option;
    const code = qaState.ruleConfig[ruleId]?.code as RuleCode;
    const targetType = targetMap[code];

    // UI切换
    await toFrame(dataId);
    await toSource(sourceId);
    toToolModeByCode(code);
    let highlightIds = attrIds;
    if (targetType === QaNodeTarget.CLASSIFICATION) {
      toOperationTab(tabKey.CLASSIFICATION);
      highlightIds = attrIds || defaultClassificationIds();
    } else if (targetType === QaNodeTarget.VALIDITY) {
      toOperationTab(tabKey.VALIDITY);
      highlightIds = [dataId];
      const sourceData = editor.dataManager.getAllSourceData(editor.getCurrentFrame());
      const findSource = Object.values(sourceData).find((e) => e.validity !== IValidity.VALID);
      findSource && (await toSource(findSource.id));
    } else if (targetType === QaNodeTarget.FRAME) {
      toOperationTab(tabKey.INSTANCE);
    }
    nextTick(() => {
      nodeProxy.setHighlight(highlightIds);
      inProgress = false;
    });
  }
  async function focusObject(
    object: AnnotateObject,
    record: QaType.TableObjectItem,
    dataId: string,
    attrIds?: string[],
  ) {
    if (inProgress) return;
    inProgress = true;
    const code = qaState.ruleConfig[record.violationRuleId]?.code as RuleCode;
    const targetType = targetMap[code];

    // UI切换
    await toFrame(dataId);
    await toSource(object.userData.sourceId);
    toToolModeByFrameObject(dataId, object.uuid);
    // toToolModeByCode(code);
    toOperationTab(tabKey.INSTANCE);
    if (targetType == QaNodeTarget.CLASS) editor.state.config.showClassView = true;
    editor.selectObject(object);
    editor.mainView.focusObject(object);
    editor.emit(editorEvent.SHOW_CLASS_INFO, object);
    const highlightIds = [object.uuid].concat(attrIds || []);
    setTimeout(() => {
      nodeProxy.setHighlight(highlightIds);
      inProgress = false;
    }, 200);
  }

  async function onAction(
    type: QaType.ActionType,
    data?: QaType.TableDataItem | QaType.TableObjectItem,
  ) {
    const dataInfos = data?.violateDataInfos as QaType.TableDataItem['violateDataInfos'];
    const objectInfos = data?.violateObjectInfos as QaType.TableObjectItem['violateObjectInfos'];
    if (data) {
      qaState.activeRow = data.id;
    }
    switch (type) {
      case QaType.ActionType.RUN: {
        await updateSourceByRealTime();
        break;
      }
      case QaType.ActionType.STOP: {
        qaState.loading = false;
        break;
      }
      case QaType.ActionType.INSTRUCTION: {
        MdEditor.preview(findInstruction(data?.violationRuleId || ''));
        break;
      }
      case QaType.ActionType.PRE:
      case QaType.ActionType.NEXT: {
        if (dataInfos && data) {
          const index = data.infoIndex || 0;
          if (index < 0) return;
          let _index = QaType.ActionType.PRE === type ? index - 1 : index + 1;
          const count = dataInfos.length;
          if (_index < 0) {
            _index = count - 1;
          } else if (_index >= count) {
            _index = 0;
          }
          const { classifications = [] } = data.ruleResult;
          const { violateMessage, dataId } = dataInfos[_index] || {};
          const dataInfo = classifications?.find((e: any) => e.dataId == dataId) || {};
          await focusData(dataId, data.violationRuleId, {
            attrIds: dataInfo.attributes,
            sourceId: dataInfo.sourceId,
          });
          data.infoIndex = _index;
          data._message = violateMessage;
        } else if (objectInfos && data) {
          const index = data.infoIndex || 0;
          if (index < 0) return;
          let _index = QaType.ActionType.PRE === type ? index - 1 : index + 1;
          const count = objectInfos.length;
          if (_index < 0) {
            _index = count - 1;
          } else if (_index >= count) {
            _index = 0;
          }
          data.infoIndex = _index;
          const { dataId, objectId, classAttributeIds, violateMessage } = objectInfos[_index] || {};
          data._message = violateMessage;
          const object = getObject(objectId, dataId);
          object && focusObject(object, data as QaType.TableObjectItem, dataId, classAttributeIds);
        }
        break;
      }
      case QaType.ActionType.ROW_CLICK: {
        const index = data?.infoIndex || 0;
        if (dataInfos && data) {
          const { classifications = [] } = data.ruleResult;
          const { dataId } = dataInfos[index] || {};
          const dataInfo = classifications?.find((e: any) => e.dataId == dataId) || {};
          focusData(dataId, data.violationRuleId, {
            attrIds: dataInfo.attributes,
            sourceId: dataInfo.sourceId,
          });
        } else if (objectInfos && data) {
          const { dataId, objectId, classAttributeIds } = objectInfos[index] || {};
          const object = getObject(objectId, dataId);
          object && focusObject(object, data as QaType.TableObjectItem, dataId, classAttributeIds);
        }
        break;
      }
    }
  }
  function onQaVisible() {
    qaState.visible = !qaState.visible;
    firstLoad();
  }
  function qaStatus() {
    if (qaState.loading) {
      return QASTATUS.RUNNING;
    } else if (!qaState.executed || !validVersion.value) {
      return QASTATUS.DEFAULT;
    } else if (!qaState.hasError) {
      return QASTATUS.PASS;
    } else if (qaState.hasError) {
      return QASTATUS.FAILED;
    }
    return QASTATUS.DEFAULT;
  }

  return {
    qaStatus,
    onAction,
    onQaVisible,
  };
}
