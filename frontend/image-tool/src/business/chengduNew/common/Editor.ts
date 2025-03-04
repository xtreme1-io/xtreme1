import {
  Editor as BaseEditor,
  IFrame,
  Event,
  BSError,
  StatusType,
  LoadStatus,
  IModel,
  SelectHoverAction,
  Shape,
  AnnotateObject,
  IModelRunningState,
  ModelTypeEnum,
  DataTypeEnum,
  IUserData,
  utils as baseUtils,
  MaskShape,
  ToolModelEnum,
  ToolType,
  UIType,
  IClassType,
  PropValueOrigin,
  IAttr,
  Const,
  LangType,
  ShapeRoot,
} from 'image-editor';
import { getDefault } from '../state';
import { IBSState, SourceType, ISegmentInfo, ISignParam } from '../type';
import * as utils from '../utils';
import * as api from '../api';
import hotkeys from 'hotkeys-js';

import LoadManager from './LoadManager';
import BusinessManager from './BusinessManager';
import DataManager from './DataManager';
import SocketManager from './SocketManager';
import ReportManager from './ReportManager';
import ModelManager from './ModelManager';
import ErrorlogManager from './ErrorlogManager';
import TrackManager from './TrackManager';
import WindowTest from './../utils/test';
import BsEvent from '../config/event';
import axios, { Canceler } from 'axios';
import { IBasicAIFormat } from '../utils';
import useAutoSave from '../hook/useAutoSave';
import { cloneDeep } from 'lodash';
import { setGZIPDownload } from '../api/base';
import { i18n, t } from '../../../lang';
import { ClassUtils, IClassTypeItem, ToolTypeEnum } from '@basicai/tool-components';
import { IConfirmBtn } from '../components/Modal/type';
import { historyStore } from '../stores';

export const dataFlowSource = {
  sourceId: '-1',
  name: '',
  sourceType: SourceType.DATA_FLOW,
};

export default class Editor extends BaseEditor {
  bsState: IBSState = getDefault();
  workStartTime: Record<string, number> = {};
  version = '1.0';
  loadManager: LoadManager;
  businessManager: BusinessManager;
  dataManager: DataManager;
  socketManager: SocketManager;
  reportManager: ReportManager;
  modelManager: ModelManager;
  trackManager: TrackManager;
  autoSaveUtil: ReturnType<typeof useAutoSave>;
  constructor() {
    super();

    this.loadManager = new LoadManager(this);
    this.businessManager = new BusinessManager(this);
    this.dataManager = new DataManager(this);
    this.socketManager = new SocketManager(this);
    this.reportManager = new ReportManager(this);
    this.modelManager = new ModelManager(this);
    this.trackManager = new TrackManager(this);
    ErrorlogManager.getInstance().init(this);
    WindowTest.getInstance().init(this);
    this.initBSEvent();
    this.autoSaveUtil = useAutoSave(this);
  }
  initBSEvent() {
    const emitUpdateTimeLine = () => {
      this.emit(Event.UPDATE_TIME_LINE);
    };
    this.on(BsEvent.UPDATE_COMMENTS, emitUpdateTimeLine);
    this.on(BsEvent.UPDATE_COMMENT_VIEW, emitUpdateTimeLine);
    this.on(BsEvent.DELETE_COMMENT, emitUpdateTimeLine);
    this.on(Event.HOTKEY, () => {
      this.bindTaskPaused();
      this.bindTaskStart();
    });
    this.on(Event.BEFORE_FRAME_CHANGE, () => {
      this.reportWorkTime();
    });
    this.on(Event.FRAME_CHANGE, () => {
      this.resetWorkTime();
    });
    document.addEventListener('visibilitychange', () => {
      if (this.bsState.query.stageType !== 'acceptance') return;
      if (document.hidden) {
        this.reportWorkTime();
      } else {
        this.resetWorkTime();
      }
    });
  }
  resetWorkTime(frame?: IFrame) {
    frame = frame || this.getCurrentFrame();
    if (!frame) return;
    this.workStartTime[String(frame.id)] = Date.now();
  }
  async reportWorkTime(frame?: IFrame) {
    const bsState = this.bsState;
    const version = this.version;
    const taskId = bsState.taskId;
    const flag = bsState.claim || bsState.query.stageType === 'acceptance';
    frame = frame || this.getCurrentFrame();
    if (!taskId || !flag || !bsState.isTaskFlow || !frame || bsState.isVisitorClaim) return;
    const dataId = String(frame.id) || '';
    const startTm = this.workStartTime[dataId];
    if (!startTm) return;

    const now = Date.now();
    const time = Math.round((now - startTm) / 1000);
    if (time < 1) return;

    await api
      .reportWorkTime(taskId, {
        dataId: dataId,
        version: version,
        workingDuration: time,
      })
      .then(() => {
        delete this.workStartTime[dataId];
      })
      .catch(() => {});
  }
  bindTaskPaused() {
    hotkeys('shift+p', (event, handler) => {
      event.preventDefault();
      if (
        this.bsState.claim &&
        this.bsState.isTaskFlow &&
        this.state.status === StatusType.Default
      ) {
        this.emit(BsEvent.TASK_PAUSE);
      }
    });
  }
  bindTaskStart() {
    hotkeys(`${utils.isMac() ? '⌘' : 'ctrl'}+shift+p`, (event, handler) => {
      event.preventDefault();
      if (this.bsState.claim && this.bsState.isTaskFlow && this.state.blocked) {
        this.emit(BsEvent.TASK_CONTINUE);
      }
    });
  }
  setLang(lang: LangType) {
    this.state.lang = lang;
    (<any>i18n).global.locale.value = lang;
    utils.setDayjsLocale(lang);
  }

  handleErr(err: BSError | Error | any, message: string = '') {
    if (err instanceof BSError) {
      utils.handleError(this, err);
    } else {
      utils.handleError(this, new BSError('', message, err));
    }
  }

  setFrameFromIds(dataIds: string[]) {
    const frames: IFrame[] = dataIds.map((id) => {
      return {
        id: id,
        loadState: '',
        classifications: [],
      } as IFrame;
    });
    this.setFrames(frames);
  }
  getTaskFrameId() {
    return this.state.isSeriesFrame
      ? this.state.sceneId
      : this.state.frames[this.state.frameIndex]?.id || '';
  }

  clearFrames(frame?: IFrame) {
    if (frame) {
      this.dataResource.clear(frame);
      this.dataManager.clear(frame);
    } else {
      this.dataResource.clear();
      this.dataManager.clear();
    }
  }
  // 获取到sourceData后通知页面更新数据
  gotSourceData() {
    this.emit(Event.GOT_SOURCELIST);
  }
  initOtherInfo(object: AnnotateObject) {
    // 初始一些其他信息
    const { userData } = object;
    if (!userData.sourceId) userData.sourceId = this.bsState.currentSource;
    if (!userData.resultStatus) userData.resultStatus = Const.True_Value;
    object.userData.needComposeClass = true;
  }
  // 连续帧创建新对象时需要创建一个追踪对象信息
  createTrackObj(objects: AnnotateObject | AnnotateObject[]) {
    if (!this.state.isSeriesFrame) return;
    if (!Array.isArray(objects)) objects = [objects];
    const trackObjects = [] as IUserData[];
    objects.forEach((e) => {
      const userData = e.userData as IUserData;
      const classObj = this.getClassType(userData.classId || '');
      trackObjects.push({
        trackId: userData.trackId,
        trackName: userData.trackName,
        classId: userData.classId,
        classType: userData.classType || classObj?.name || '',
        annotationType: baseUtils.getAnnotationType(e),
        sourceId: userData.sourceId || this.bsState.currentSource || '-1',
      });
    });
    return trackObjects;
  }
  updateUiAuth() {
    const authConfig: Partial<Record<ToolType, boolean>> = {};
    this.state.classTypes.forEach((e) => {
      if (e.toolType) {
        authConfig[e.toolType] = true;
      }
    });

    const actionMap: Partial<Record<keyof typeof UIType, ToolType[]>> = {
      tool_polygon: [ToolType.POLYGON, ToolType.POLYGON_PLUS],
      tool_line: [ToolType.POLYLINE],
      tool_skeleton: [ToolType.SKELETON],
      tool_splineCurve: [ToolType.CURVE],
      tool_rect: [ToolType.RECTANGLE, ToolType.BOUNDING_BOX],
      tool_cuboid: [ToolType.IMAGE_CUBOID],
      tool_circle: [ToolType.CIRCLE],
      tool_ellipse: [ToolType.ELLIPSE],
      tool_keyPoint: [ToolType.KEY_POINT],
      tool_mask: [ToolType.MASK],
    };
    const { actions, ui } = this.state.modeConfig;
    Object.keys(actionMap).forEach((e: keyof typeof UIType) => {
      const auth = actionMap[e]?.some((i) => authConfig[i]) === true;
      if (actions[e] === true) {
        actions[e] = auth;
      }
      if (ui[e] === true) {
        ui[e] = auth;
      }
    });
  }
  async reloadObjects() {
    const { frameIndex } = this.state;
    this.dataManager.clear();
    this.showLoading({ type: 'loading', content: 'reload data...' });
    try {
      await this.loadManager.loadAllFrameData();
    } catch (error) {
      this.showLoading(false);
      throw error;
    }
    this.showLoading(false);
    await this.loadFrame(frameIndex, true, true);
  }

  frameChangeToggle(change: boolean, frame?: IFrame | IFrame[]) {
    let frames = frame || this.state.frames;
    if (!Array.isArray(frames)) frames = [frames];
    frames.forEach((frame) => {
      frame.needSave = !!change;
    });
    this.trackManager.clearChangedTrack();
  }

  blockEditor(blocked: boolean, msg?: string, data?: any) {
    this.state.editorMuted = Boolean(msg && blocked);
    this.state.editorMutedMsg = msg;
    this.state.editorMutedData = data;
    this.state.blocked = blocked;
  }
  clearResource(config?: { clearComment?: boolean; resetBgRotation?: boolean }) {
    super.clearResource();
    if (config?.clearComment) {
      this.dataManager.clearAllCommentMap();
      this.emit(BsEvent.UPDATE_COMMENTS);
    }
    if (config?.resetBgRotation) this.mainView.stage.rotation(0);
  }

  needSave(frames?: IFrame[]) {
    frames = frames || this.state.frames;
    const needSaveData = frames.filter((e) => e.needSave);
    return needSaveData.length > 0;
  }
  async saveEnable(saveDatas: IBasicAIFormat[], saveFrames: IFrame[]) {
    const { datasetId } = this.bsState;
    const params = {
      isTransferResult: true,
      isOnlyDetectMandatoryRules: true,
      annotationResults: saveDatas,
      datasetId: datasetId,
      dataIds: saveFrames.map((e) => e.id),
    } as any;
    if (this.state.isSeriesFrame) params.sceneIds = [this.state.sceneId];

    const data = await api.queryQaResultRealtime(params);
    if (data?.isMandatoryRulesViolated === true) {
      const status = await this.showConfirm({
        // icon: createVNode(ExclamationCircleOutlined),
        title: t('image.Warning'),
        // zIndex: 1003,
        subTitle: t('image.msg-dataflow-qaerror'),
        okText: t('image.Save'),
        cancelText: t('image.Cancel'),
        okDanger: false,
      })
        .then(() => true)
        .catch(() => false);
      if (!status) {
        await this.showQualityModal({ data: data, visible: true });
        return false;
      }
    }
    return true;
  }

  async save() {
    const { bsState } = this;
    let saveResult;
    if (!bsState.isTaskFlow) {
      saveResult = await this.saveDataFlow();
    } else {
      saveResult = await this.saveTaskFlow();
    }
    this.emit(Event.SAVE_SUCCESS);
    return saveResult;
  }
  onSaveError() {
    const buttons: IConfirmBtn[] = [
      { type: 'default', action: 'issue', content: t('common.btnReportIssue') },
      { type: 'primary', action: 'got_it', content: t('common.btnGotIt') },
    ];
    this.showModal('confirm', {
      width: 400,
      title: t('image.Warning'),
      maskCloseable: false,
      data: {
        content: t('common.msgSaveError'),
        buttons: buttons,
      },
    })
      .then((action) => {
        if (action == 'issue') {
          this.emit(Event.SHOW_REPORT);
        }
      })
      .catch(() => {});
  }
  async saveDataFlow() {
    const { bsState } = this;
    if (bsState.doing.saving) return;

    const saveFrames = this.state.frames.filter((e) => e.needSave);
    if (saveFrames.length == 0) return;

    const { saveDatas, segmentInfos } = utils.getDataFlowSaveData(this, saveFrames);
    if (saveDatas.length === 0) return;

    bsState.doing.saving = true;

    let saveResult;
    try {
      const saveEnabled = await this.saveEnable(saveDatas, saveFrames);
      if (!saveEnabled) {
        bsState.doing.saving = false;
        return;
      }
      if (segmentInfos && segmentInfos.length > 0) {
        await this.uploadSegments(segmentInfos);
      }
      await api.saveDataflow(bsState.datasetId, saveDatas);
      this.frameChangeToggle(false, saveFrames);
      this.showMsg('success', t('image.save-ok'));
      saveResult = true;
    } catch (e: any) {
      this.showMsg('error', t('image.save-error'));
      this.onSaveError();
    }
    bsState.doing.saving = false;
    return saveResult;
  }

  async saveTaskFlow(
    saveFrames?: IFrame[],
    option?: { isForceSave?: boolean; isAutoSave?: boolean },
  ) {
    const { bsState } = this;
    if (bsState.doing.saving) return;

    const { frames } = this.state;
    saveFrames = (saveFrames || frames).filter((e) => e.needSave);
    if (saveFrames.length == 0) return;

    const { saveDatas, segmentInfos } = utils.getTaskSaveData(this, saveFrames);
    if (saveDatas.length === 0) return;

    bsState.doing.saving = true;
    frames.forEach((frame) => {
      frame.needSave = false;
    });
    try {
      if (segmentInfos && segmentInfos.length > 0) {
        await this.uploadSegments(segmentInfos, '-1');
      }
      const config = {
        taskId: bsState.task.id,
        stageType: bsState.stage && bsState.stage.type ? bsState.stage.type : 'NEED_ACCEPTANCE',
        results: saveDatas,
        isAutoSave: !!option?.isAutoSave,
        isForceSave: !!option?.isForceSave,
        historyRecords: historyStore().getDifRecords(saveDatas),
      };
      await api.taskSaveObject(bsState.task.id, config);
      historyStore().updateCurrentSnapshotData(saveDatas);
      this.trackManager.clearChangedTrack();
      this.showMsg('success', t('image.save-ok'));
      bsState.doing.saving = false;
      return true;
    } catch (error) {
      frames.forEach((frame) => {
        frame.needSave = true;
      });
      this.showMsg('error', t('image.save-error'));
      this.onSaveError();
      bsState.doing.saving = false;
      throw error;
    }
  }

  async uploadSegments(segmentInfos: ISegmentInfo[], filterSource?: string) {
    const configs = segmentInfos.map((e) => {
      return {
        ...e,
        objects: undefined,
        deviceName: undefined,
        sourceData: undefined,
      } as ISignParam;
    });
    const presignedInfoMap = await api.getPresignedUrlBatch(configs);
    const runner = utils.multiRun({ taskN: segmentInfos.length }, async (index) => {
      const info = segmentInfos[index];
      this.updateMaskShapesNo(info);
      const sourceId = filterSource || info.sourceId || '-1';
      const imgBlob = await this.getMaskShapesResource(info.dataId, sourceId);
      // 上传
      const key = this.formatId(info.dataId, info.sourceId);
      await api.uploadBufferData(presignedInfoMap[key].presignedUrl, imgBlob);
      info.sourceData.segmentations.push({
        deviceName: info.deviceName,
        resultFilePath: presignedInfoMap[key].filePath,
      });
    });

    await runner.promise.then(() => {
      console.log('upload completed');
    });
  }
  downloadGZIP(val: boolean) {
    setGZIPDownload(val);
  }
  formatId(fId: string, sId: string) {
    return `${fId}##${sId}`;
  }
  updateMaskShapesNo(info: ISegmentInfo) {
    const frame = this.getFrame(info.dataId);
    info.objects.forEach((obj) => {
      if (obj.no) {
        const shape = this.dataManager.getObject(obj.id, frame);
        shape && (shape.userData.no = obj.no);
      }
    });
  }
  async showQualityModal(option: { data: any; visible: boolean }) {}

  // mask分层筛选
  filterMaskShape() {
    const selection = this.selection;
    const isSelect = selection.length === 1 && selection[0] instanceof MaskShape;
    const frame = this.getCurrentFrame();
    const curSource = this.bsState.currentSource;
    const objs = this.dataManager.getFrameRoot(frame.id, ToolModelEnum.SEGMENTATION).allObjects;
    console.log('[filterMaskShape]', objs);
    let selects: MaskShape[];
    let others: MaskShape[];
    if (isSelect) {
      selects = selection as MaskShape[];
      others = objs.filter((obj) => {
        return (
          obj instanceof MaskShape &&
          obj.uuid != selects[0].uuid &&
          obj.userData.sourceId == curSource
        );
      }) as MaskShape[];
    } else {
      selects = [];
      others = objs.filter((obj) => {
        return obj instanceof MaskShape && obj.userData.sourceId == curSource;
      }) as MaskShape[];
    }
    return {
      selects,
      others,
    };
  }
  handleModel(modelType: ModelTypeEnum) {
    const frame = this.getCurrentFrame();
    const model = frame.model as IModelRunningState;
    if (model && model.state === LoadStatus.LOADING) return;
    const result = this.modelManager.hasModelResult(modelType);
    if (result) {
      api.clearModel([+frame.id], model.recordId);
      this.modelManager.addModelData(modelType);
    } else {
      this.runModel();
    }
  }
  async runModel() {
    const modelConfig = this.state.modelConfig;
    if (!modelConfig.model) {
      this.showMsg('warning', 'Please choose Model');
      return;
    }
    // let toolState = pageTool.state;
    const frame = this.getCurrentFrame();
    const model = this.state.models.find((e) => e.name === modelConfig.model) as IModel;
    const resultFilterParam: Record<string, any> = {
      classes: model?.classes.map((e) => e.value),
    };
    if (modelConfig.confidence[0]) resultFilterParam.minConfidence = modelConfig.confidence[0];
    if (modelConfig.confidence[1]) resultFilterParam.maxConfidence = modelConfig.confidence[1];
    if (!modelConfig.predict) {
      const selectedClasses = Object.values(modelConfig.classes[modelConfig.model]).reduce(
        (classes, item) => {
          if (item.selected) {
            classes.push(item.value);
          }
          return classes;
        },
        [] as string[],
      );
      if (selectedClasses.length <= 0) {
        this.showMsg('warning', 'Select at least one Class!');
        return;
      }
      resultFilterParam.classes = selectedClasses;
    }
    // debugger;
    const config = {
      datasetId: this.bsState.datasetId,
      dataIds: [+frame.id],
      modelId: +model.id,
      modelVersion: model?.version,
      dataType: DataTypeEnum.SINGLE_DATA,
      // modelCode: model.code,
      resultFilterParam,
    };

    modelConfig.loading = true;
    let modelRunTm = 0;
    const startTm = Date.now();
    try {
      const result = await api.runModel(config);
      if (!result.data) throw new Error('Model Run Error');
      frame.model = {
        recordId: result.data,
        id: model.id,
        version: model.version,
        state: LoadStatus.LOADING,
      };
    } catch (error: any) {
      this.showMsg('error', error.message || 'Model Run Error');
    }
    modelConfig.loading = false;
    await this.dataManager.pollDataModelResult();

    // 模型运行上报
    modelRunTm = Date.now() - startTm;
    const data = {
      modelConfig,
      time: modelRunTm,
      classes: modelConfig.predict ? [] : resultFilterParam.classes,
    };
    this.emit(Event.MODEL_RUN, data);
  }

  async runIdentify(
    param: { datas: api.IIdentify[]; params: { distThres: string } },
    cancelTokenFn: (cancel: Canceler) => void,
  ) {
    const config = { ...param, modelId: this.state.config.interactiveModel };
    return api.identifyImage(config, {
      cancelToken: new axios.CancelToken(cancelTokenFn),
    });
  }
  initMainView() {
    const action = this.mainView.getAction('select-hover') as SelectHoverAction;
    action.filter = (target: any) => {
      if (target._deleted) return false;
      if (target instanceof Shape) {
        const curSource = this.bsState.currentSource;
        const userData = this.getUserData(target);
        const sourceId = userData.sourceId || this.state.config.defaultSourceId;
        return curSource == sourceId;
      }
      return true;
    };
  }
  checkSkePoints(skeId: string, index: number) {
    const frame = this.getCurrentFrame();
    if (!frame) return false;
    const comments = this.dataManager.getCommentsByFrameId(frame.id);
    const comment = comments?.find(
      (e) => e.objectId === skeId && e.attributes?.pointIndex === index,
    );
    return Boolean(comment);
  }
  checkTrackLineItem(index: number, objectId?: string) {
    if (!this.bsState.isTaskFlow) return false;
    const frame = this.state.frames[index];
    if (!frame) return false;
    const comments = this.dataManager.getCommentsByFrameId(frame.id);
    // const selectIds = this.selection.map((e) => e.uuid);
    if (objectId === undefined) return comments?.length > 0;
    const comment = comments?.find((e) => e.objectId === objectId);
    return Boolean(comment);
  }
  // 获取属性默认值
  getAttrsDefaultValue(classType: IClassType, type?: PropValueOrigin) {
    type = type || this.state.config.propValue;
    let defaultAttrs: Record<string, any> = {};
    if (type === PropValueOrigin.inherit) {
      if (
        this.selection.length > 0 &&
        this.checkObjectMate(this.selection[this.selection.length - 1], classType)
      ) {
        defaultAttrs = cloneDeep(this.selection[this.selection.length - 1].userData.attrs);
        return defaultAttrs;
      }
    }
    this.setDefaultAttrValueMap(defaultAttrs, (classType as IClassTypeItem).getAttrs());
    return defaultAttrs;
  }
  setDefaultAttrValueMap(map: Record<string, any>, attrs: IAttr[]) {
    attrs.forEach((attr) => {
      const isMulti = ClassUtils.isAttrValueTypeArr(attr.type);
      let attrInfo = map[attr.id];
      if (!attrInfo) {
        attrInfo = {
          id: attr.id,
          name: attr.name || '',
          alias: attr.alias,
          value: isMulti ? [] : '',
        };
      }
      (attr.options || []).forEach((e) => {
        if (e.checked) isMulti ? attrInfo.value.push(e.name) : (attrInfo.value = e.name);
        if (e.attributes) this.setDefaultAttrValueMap(map, e.attributes);
      });
      if (attrInfo.value?.length > 0) map[attr.id] = attrInfo;
    });
  }
  async loadJiraJson(
    url: string,
    option?: { sourceId?: string; frameId?: string; index?: number },
  ) {
    if (!url) {
      throw 'Url can not be empty';
    }
    const jiraJson = await fetch(url).then(async (response) => await response.json());
    const { sourceId = '-1', frameId = this.getCurrentFrame().id, index = 0 } = option ?? {};
    const results = jiraJson.resultData.saveDatas;
    const frame = this.getFrame(frameId);
    const result = results[index];
    result.sourceId = sourceId;
    const annotates_ins: AnnotateObject[] = utils.convertObject2Annotate(result, this);
    const annotates_seg: AnnotateObject[] = await utils.getSegmentAnnotates(result, this);
    const root_ins = new ShapeRoot({ frame, type: ToolModelEnum.INSTANCE });
    const root_seg = new ShapeRoot({ frame, type: ToolModelEnum.SEGMENTATION });
    root_ins.addObjects(annotates_ins);
    root_seg.addObjects(annotates_seg);
    this.dataManager.setFrameRoot(frame.id, [root_ins, root_seg]);
    this.loadManager.updateFrameIdInfo(frame.id);
    this.loadManager.loadDataFromManager();
    return jiraJson;
  }
  async loadJiraObjects(
    objects: any[],
    option?: { sourceId?: string; frameId?: string; index?: number },
  ) {
    const { sourceId = '-1', frameId = this.getCurrentFrame().id } = option ?? {};
    const segments = objects.filter((o) => o.type == ToolTypeEnum.MASK);
    const instances = objects.filter((o) => o.type != ToolTypeEnum.MASK);
    const frame = this.getFrame(frameId);
    const result = { segments: segments, objects: instances, sourceId } as any;
    const annotates_ins: AnnotateObject[] = utils.convertObject2Annotate(result, this);
    const annotates_seg: AnnotateObject[] = await utils.getSegmentAnnotates(result, this);
    const root_ins = new ShapeRoot({ frame, type: ToolModelEnum.INSTANCE });
    const root_seg = new ShapeRoot({ frame, type: ToolModelEnum.SEGMENTATION });
    root_ins.addObjects(annotates_ins);
    root_seg.addObjects(annotates_seg);
    this.dataManager.setFrameRoot(frame.id, [root_ins, root_seg]);
    this.loadManager.updateFrameIdInfo(frame.id);
    this.loadManager.loadDataFromManager();
  }

  /** 页面刷新前 */
  beforeRefresh() {
    const storage = baseUtils.storageSetting();
    const setting = storage.get();
    setting.rotation = this.state.toolConfig.rectRotate;
    storage.set(setting);
  }
}
