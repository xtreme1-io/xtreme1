/** mixpanel-manager封装 */
//@ts-ignore
import MixPanel from 'mixpanel-browser';
import { debounce } from 'lodash';

import { mixpanelToken, IToolParams, ReportEvent, ReportStage } from './type';
import Editor from '../Editor';
import { AnnotateObject, Background, Event, IModelConfig } from 'image-editor';
import BsEvent from '../../config/event';

export default class ReportManager {
  mixpanel: MixPanel;
  editor: Editor;
  enabled?: boolean;

  constructor(editor: Editor) {
    this.editor = editor;
  }
  init() {
    this.mixpanel = MixPanel;
    const { config, user } = this.editor.bsState;
    const { enabled, token } = config?.uba?.mixpanel || { enabled: false, token: '' };
    if (!enabled) return;

    this.enabled = enabled;
    const hostName = window.location.hostname;
    let tok = token;
    if (hostName.includes('dev') || hostName.includes('localhost')) {
      tok = mixpanelToken.dev;
    } else if (hostName.includes('test')) {
      tok = mixpanelToken.test;
    }

    if (!tok) {
      console.error('mixpanel token is not find');
      return;
    }

    this.mixpanel.init(tok, { debug: !!import.meta.env.DEV });
    if (user.id) {
      this.mixpanel.identify(user.id);
      // this.initEvent();
      this.reportEnter();
    } else {
      this.closeReport();
    }
  }

  initEvent() {
    this.eventFunctionBindThis();

    // editor events
    this.editor.on(Event.SAVE_SUCCESS, this.reportSave);
    this.editor.on(Event.FRAME_SWITCH, this.reportSwitchData);
    this.editor.on(Event.FRAME_CHANGE, this.reportLoaded);
    this.editor.on(Event.ANNOTATE_CREATE, this.reportCreated);
    this.editor.on(Event.SELECT, this.reportSelected);
    this.editor.on(Event.ANNOTATE_HANDLE_DELETE, this.reportDeleted);
    this.editor.on(Event.ANNOTATE_CHANGE, this.reportEdited);
    this.editor.on(Event.MODEL_RUN, this.reportModelRun);
    this.editor.on(Event.MODEL_RESULT_ADD, this.reportModelResultAdd);
    this.editor.on(Event.MODEL_RUN_TRACK, this.reportModelTrack);
    this.editor.on(Event.MODEL_RUN_TRACK_SUCCESS, this.reportModelTrackSuccess);
    this.editor.on(Event.FRAME_AUTOLOAD, this.reportAutoLoad);
    this.editor.on(Event.FRAME_PLAY_SPEED, this.reportSpeed);
    this.editor.on(Event.FRAME_PLAY, this.reportPlay);
    this.editor.on(Event.FRAME_PAUSE, this.reportPause);
    this.editor.on(Event.FRAME_REPLAY, this.reportReplay);
    this.editor.on(BsEvent.ERROR_CONSOLE, this.reportError);

    // window events
    window.addEventListener('beforeunload', this.reportClose);
  }
  clearEvent() {
    this.editor.off(Event.SAVE_SUCCESS, this.reportSave);
    this.editor.off(Event.FRAME_SWITCH, this.reportSwitchData);
    this.editor.off(Event.FRAME_CHANGE, this.reportLoaded);
    this.editor.off(Event.ANNOTATE_CREATE, this.reportCreated);
    this.editor.off(Event.SELECT, this.reportSelected);
    this.editor.off(Event.ANNOTATE_HANDLE_DELETE, this.reportDeleted);
    this.editor.off(Event.ANNOTATE_CHANGE, this.reportEdited);
    this.editor.off(Event.MODEL_RUN, this.reportModelRun);
    this.editor.off(Event.MODEL_RESULT_ADD, this.reportModelResultAdd);
    this.editor.off(Event.MODEL_RUN_TRACK, this.reportModelTrack);
    this.editor.off(Event.MODEL_RUN_TRACK_SUCCESS, this.reportModelTrackSuccess);
    this.editor.off(Event.FRAME_AUTOLOAD, this.reportAutoLoad);
    this.editor.off(Event.FRAME_PLAY_SPEED, this.reportSpeed);
    this.editor.off(Event.FRAME_PLAY, this.reportPlay);
    this.editor.off(Event.FRAME_PAUSE, this.reportPause);
    this.editor.off(Event.FRAME_REPLAY, this.reportReplay);
    this.editor.off(BsEvent.ERROR_CONSOLE, this.reportError);

    window.removeEventListener('beforeunload', this.reportClose);
  }
  eventFunctionBindThis() {
    this.reportClose = this.reportClose.bind(this);
    this.reportSave = this.reportSave.bind(this);
    this.reportSwitchData = this.reportSwitchData.bind(this);
    this.reportLoaded = this.reportLoaded.bind(this);
    this.reportCreated = this.reportCreated.bind(this);
    this.reportSelected = this.reportSelected.bind(this);
    this.reportDeleted = this.reportDeleted.bind(this);
    this.reportEdited = debounce(this.reportEdited.bind(this), 1000);
    this.reportModelRun = this.reportModelRun.bind(this);
    this.reportModelResultAdd = this.reportModelResultAdd.bind(this);
    this.reportModelTrack = this.reportModelTrack.bind(this);
    this.reportModelTrackSuccess = this.reportModelTrackSuccess.bind(this);
    this.reportAutoLoad = this.reportAutoLoad.bind(this);
    this.reportSpeed = this.reportSpeed.bind(this);
    this.reportPlay = this.reportPlay.bind(this);
    this.reportPause = this.reportPause.bind(this);
    this.reportReplay = this.reportReplay.bind(this);
    this.reportError = this.reportError.bind(this);
  }

  closeReport() {
    this.enabled = false;
    this.clearEvent();
  }
  getBaseParam(): IToolParams {
    return {
      Mode: this.editor.state.modeConfig.op == 'edit' ? 'Annotate' : 'View',
      'Is Frame Series': this.editor.state.isSeriesFrame,
      '# of Data': 1,
      'Enter From': this.editor.bsState.isTaskFlow ? 'Task' : 'Dataset',
      'Enter From Stage': (ReportStage as any)[this.editor.state.modeConfig.name],
      'Task Role': 'Worker',
    };
  }

  /**
   * report 方法
   */
  report(event: ReportEvent, params?: any) {
    if (!this.enabled) return;
    // console.log('mixpanel 2222222222========>:', event, params);
    this.mixpanel.track(event, params);
  }
  // 进入图片工具
  reportEnter() {
    this.report(ReportEvent.ENTER, this.getBaseParam());
  }
  // 关闭图片工具
  reportClose() {
    this.report(ReportEvent.CLOSE, this.getBaseParam());
  }
  // 点击保存结果
  reportSave() {
    this.report(ReportEvent.SAVE, this.getBaseParam());
  }
  // 切换Data
  reportSwitchData(params: {
    Method: 'Input' | 'Next' | 'Previous' | 'Timeline';
    'Data No. Before': number;
    'Data No. After': number;
  }) {
    const data = Object.assign(this.getBaseParam(), params);
    this.report(ReportEvent.SWITCHDATA, data);
  }
  // Data加载完成
  reportLoaded(frameIdx: number) {
    const params = { 'Data No. ': frameIdx + 1 };
    this.report(ReportEvent.LOADED, params);
  }
  // 结果创建完成 'end', shapeToolDraw.holder, shapeToolDraw
  reportCreated(objs: AnnotateObject[]) {
    const types = objs.map((e) => e.toolType);
    const frame = this.editor.getCurrentFrame();
    if (!frame) return;
    const params: Record<string, any> = { 'Result Type': types.join(','), DataId: frame.id };
    if (frame.imageData?.image?.src !== Background.getInstance().getImageUrl()) {
      params.oriImg = frame.imageData?.image?.src;
      params.realImg = Background.getInstance().getImageUrl();
      params.reportTime = new Date().getTime();
    }
    this.report(ReportEvent.CREATED, params);
  }
  // 选中结果
  reportSelected() {
    const selects = this.editor.selection;
    if (!selects || selects.length === 0) return;
    const types = selects.map((e) => e.toolType);
    const params = {
      'Result Type': types.join(','),
      'Object Source': 'Ground Truth',
    };
    this.report(ReportEvent.SELECTED, params);
  }
  // 删除结果
  reportDeleted(data: { objects: AnnotateObject[]; type: number }) {
    const { objects = [], type = 1 } = data;
    if (objects.length == 0) return;
    const types = ['Backspace', 'Result List'];
    const Method = types[type - 1] || '';
    const status = objects.map((e) => e.userData.resultStatus);
    const params = {
      Method,
      '# of Objects': objects.length,
      'Object Source': status.join(','),
    };
    this.report(ReportEvent.DELETED, params);
  }
  // 编辑结果
  reportEdited(objects: AnnotateObject[], type: string) {
    if (!objects || objects.length == 0) return;
    let editType = 'Shape';
    switch (type) {
      case 'userData': {
        editType = 'Class';
        break;
      }
      case 'attrs': {
        editType = 'Attribute';
        break;
      }
      default: {
        break;
      }
    }
    const ids: string[] = [];
    const types: string[] = [];
    const status: string[] = [];
    objects.forEach((e) => {
      ids.push(e.uuid);
      types.push(e.toolType);
      status.push(e.userData.resultStatus);
    });
    const params = {
      'Object ID': ids.join(','),
      'Result Type': types.join(','),
      'Object Source': status.join(','),
      'Edit Type': editType,
    };
    this.report(ReportEvent.EDITED, params);
  }
  // 跑识别模型
  reportModelRun(data: { modelConfig: IModelConfig; time: number; classes: string[] }) {
    const { modelConfig, time, classes } = data;
    const params = {
      'Model Name': modelConfig.model,
      'Is Predict All': modelConfig.predict,
      'Confidence Level': modelConfig.confidence,
      'Selected Classes': classes,
      'Model Run Time': time,
    };
    this.report(ReportEvent.MODELRUN, params);
  }
  // 添加模型结果
  reportModelResultAdd() {
    this.report(ReportEvent.MODEL_RESULT_ADD);
  }
  // 跑追踪模型
  reportModelTrack(data: any) {
    const params = {
      Method: data.method == 'copy' ? 'copy' : 'tracking',
      Objects: data.object,
      Direction: data.direction,
      'Frame No.': data.frameN,
      'Model Name': data.modelName,
    };
    this.report(ReportEvent.MODEL_TRACK, params);
  }
  // 追踪成功
  reportModelTrackSuccess(data: { time: number }) {
    const params = { 'Model Run Time': data.time };
    this.report(ReportEvent.MODEL_TRACK_SUCCESS, params);
  }
  // 自动加载开关
  reportAutoLoad(state: boolean) {
    const params = { 'Set Value to': state ? 'On' : 'Off' };
    this.report(ReportEvent.AUTO_LOAD, params);
  }
  // 倍速
  reportSpeed(Speed: number) {
    this.report(ReportEvent.SPEED, { Speed });
  }
  // 播放
  reportPlay(index: number) {
    this.report(ReportEvent.PLAY, { 'Current Frame No.': index });
  }
  // 暂停
  reportPause(index: number) {
    this.report(ReportEvent.PAUSE, { 'Current Frame No.': index });
  }
  // 重播
  reportReplay(index: number) {
    this.report(ReportEvent.REPLAY, { 'Current Frame No.': index });
  }
  // 上报错误
  reportError(error: any) {
    this.report(ReportEvent.ERROR, error);
  }
}
