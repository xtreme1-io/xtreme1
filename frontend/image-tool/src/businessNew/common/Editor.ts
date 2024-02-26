import {
  Editor as BaseEditor,
  __ALL__ as ALL,
  IFrame,
  Event,
  MsgType,
  BSError,
  AnnotateObject,
  IModel,
  DataTypeEnum,
  LoadStatus,
  ModelCodeEnum,
} from 'image-editor';
import { getDefault } from '../state';
import { IBSState, ISaveResp } from '../types';
import { ILocale, languages } from '@/locales';
import * as utils from '../utils';
import * as api from '../api';

import LoadManager from './LoadManager';
import DataManager from './DataManager';

export default class Editor extends BaseEditor {
  bsState: IBSState = getDefault();

  loadManager: LoadManager;
  dataManager: DataManager;

  constructor() {
    super();
    this.loadManager = new LoadManager(this);
    this.dataManager = new DataManager(this);
  }
  // locale common
  lang<T extends keyof ILocale>(name: T, args?: Record<string, any> | any[]) {
    const data = this.i18n.lang(this.state.lang, name, args);
    if (!data) {
      return this.i18n.lang(languages.default, name, args);
    }
    return data;
  }
  frameChangeToggle(change: boolean, frame?: IFrame | IFrame[]) {
    let frames = frame || this.state.frames;
    if (!Array.isArray(frames)) frames = [frames];
    frames.forEach((frame) => {
      frame.needSave = !!change;
    });
    // this.trackManager.clearChangedTrack();
  }
  needSave(frames?: IFrame[]) {
    frames = frames || this.state.frames;
    const needSaveData = frames.filter((e) => e.needSave);
    return needSaveData.length > 0;
  }
  async save() {
    const { bsState } = this;
    if (bsState.doing.saving) return;
    const saveFrames = this.state.frames.filter((e) => e.needSave);
    if (saveFrames.length == 0) return;

    const { saveDatas } = utils.getDataFlowSaveData(this, saveFrames);
    // console.log('========> saveDataFlow saveDatas: ', saveDatas);
    if (saveDatas.length === 0) return;

    bsState.doing.saving = true;
    let saveResult;
    try {
      const res = await api.saveData(bsState.datasetId, saveDatas);
      this.updateBackId(res);
      this.frameChangeToggle(false, saveFrames);
      this.showMsg(MsgType.success, this.lang('save-ok'));
      saveResult = true;
    } catch (e: any) {
      this.showMsg(MsgType.error, this.lang('save-error'));
    }
    bsState.doing.saving = false;
    this.emit(Event.SAVE_SUCCESS);
    return saveResult;
  }
  updateBackId(data: ISaveResp[]) {
    data.forEach((e) => {
      const frame = this.getFrame(e.dataId + '');
      const obj = this.dataManager.getObject(e.frontId, frame);
      obj && (obj.userData.backId = e.id);
    });
  }
  handleErr(err: BSError | Error | any, message: string = '') {
    if (err instanceof BSError) {
      utils.handleError(this, err);
    } else {
      utils.handleError(this, new BSError('', message, err));
    }
  }
  getRenderFilter() {
    const { bsState, state } = this;

    // source
    const sourceMap: any = {};
    bsState.activeSource.forEach((s) => {
      sourceMap[s] = true;
    });

    // class
    const classMap: any = {};
    bsState.filterClasses.forEach((e) => {
      classMap[e] = true;
    });

    return (e: AnnotateObject) => {
      const userData = this.getUserData(e);
      const sourceId = userData.sourceId || state.defaultSourceId;
      const classId = userData.classId || '';

      const validSource = sourceMap[ALL] || sourceMap[sourceId];
      const validClass = classMap[ALL] || classMap[classId];

      return !!(validSource && validClass);
    };
  }
  handleModel() {
    const frame = this.getCurrentFrame();
    const model = frame.model;
    if (!model || !model.code || model.state !== LoadStatus.COMPLETE) return;
    const result = this.dataManager.hasModelResult(model.code, frame);
    if (result) {
      this.addModelData(model.code);
      api.clearModel([+frame.id], model.recordId);
    } else {
      this.runModel();
    }
  }
  async addModelData(modelCode: ModelCodeEnum) {
    const frame = this.getCurrentFrame();
    if (!frame || !frame.model) return;
    const { state } = this;
    const data = this.dataManager.getModelResult(modelCode, frame);
    if (!data) return;
    const subTitle = this.lang('Add Results?');

    const ok = await this.showConfirm({
      title: this.lang('Warning'),
      subTitle,
      okText: this.lang('confirm'),
      cancelText: this.lang('cancel'),
      okDanger: true,
    })
      .then(
        () => true,
        () => false,
      )
      .catch(() => false);
    if (!ok) return;
    await this.addInstanceResult(data);
    frame.model = undefined;
    frame.needSave = true;
    this.dataManager.removeModelResult(frame.id);
    this.emit(Event.MODEL_RESULT_ADD);
  }
  async addInstanceResult(data: any) {
    const { objects, segmentFileUrl } = data;
    if (!objects) {
      const errTips = segmentFileUrl
        ? '检测到有分割模型结果,若想要添加分割模型结果, 请先切换到分割模式'
        : '无模型结果数据';
      this.handleErr(errTips);
      return;
    }
    const annotates = utils.convertObject2Annotate(
      this,
      objects.map((o: any) => {
        return {
          classAttributes: Object.assign({ contour: o }, o.classAttributes || o || {}),
          ...o,
        };
      }),
    );
    annotates.forEach((e) => {
      this.initIDInfo(e);
    });
    if (annotates.length > 0) {
      this.cmdManager.withGroup(() => {
        if (this.state.isSeriesFrame) {
          this.cmdManager.execute('add-track', this.createTrackObj(annotates));
        }
        this.cmdManager.execute('add-object', annotates);
      });
    }
  }
  async runModel() {
    const modelConfig = this.state.modelConfig;
    if (!modelConfig.model) {
      this.showMsg(MsgType.warning, 'Please choose Model');
      return;
    }
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
        this.showMsg(MsgType.warning, 'Select at least one Class!');
        return;
      }
      resultFilterParam.classes = selectedClasses;
    }
    const config = {
      datasetId: this.bsState.datasetId,
      dataIds: [+frame.id],
      modelId: +model.id,
      modelVersion: model?.version,
      dataType: DataTypeEnum.SINGLE_DATA,
      modelCode: model.code,
      resultFilterParam,
    };

    modelConfig.loading = true;
    try {
      let result = await api.runModel(config);
      if (!result.data) throw new Error('Model Run Error');
      frame.model = {
        recordId: result.data,
        id: model.id,
        version: model.version,
        state: LoadStatus.LOADING,
        code: model.code,
      };
    } catch (error: any) {
      this.showMsg(MsgType.error, error.message || 'Model Run Error');
    }
    modelConfig.loading = false;
    await this.dataManager.pollDataModelResult();
  }
}
