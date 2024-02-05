import {
  DataManager as BaseDataManager,
  IFrame,
  IModelRunningState,
  LoadStatus,
  ModelCodeEnum,
  MsgType,
  utils as EditorUtils,
} from 'image-editor';
import Editor from './Editor';
import * as api from '../api';
import { IObject } from '../types';

interface IModelData {
  objects?: any[];
  modelCode: ModelCodeEnum;
}

export default class DataManager extends BaseDataManager {
  declare editor: Editor;
  modelMap: Map<string, IModelData> = new Map();

  constructor(editor: Editor) {
    super(editor);
    this.editor = editor;
  }
  clearModelData() {
    this.modelMap.clear();
  }
  removeModelResult(frameId: string, code?: ModelCodeEnum) {
    if (code) {
      const id = EditorUtils.formatId(frameId, code);
      this.modelMap.delete(id);
    } else {
      const ids: string[] = Array.from(this.modelMap.keys());
      ids.forEach((id) => {
        if (id.indexOf(frameId) === 0) this.modelMap.delete(id);
      });
    }
  }
  setModelResult(frameId: any, data: IModelData) {
    const id = EditorUtils.formatId(frameId, data.modelCode);
    this.modelMap.set(id, data);
  }
  getModelResult(code: ModelCodeEnum, frame?: IFrame) {
    frame = frame || this.editor.getCurrentFrame();
    const id = EditorUtils.formatId(frame.id, code);
    return this.modelMap.get(id) as IModelData;
  }
  hasModelResult(modelCode: ModelCodeEnum, frame?: IFrame) {
    frame = frame || this.editor.getCurrentFrame();
    if (!frame) return false;
    const result = this.getModelResult(modelCode, frame);
    if (result) return true;
    return false;
  }

  async pollDataModelResult() {
    const _this = this;
    const editor = this.editor;
    const { state } = this.editor;
    const confidence = state.modelConfig.confidence || [0.5, 1];
    const modelMap = {} as Record<string, IFrame[]>;

    state.frames.forEach((frame) => {
      if (frame.model && frame.model.state !== LoadStatus.COMPLETE) {
        const id = frame.model.recordId;
        modelMap[id] = modelMap[id] || [];
        modelMap[id].push(frame);
      }
    });
    if (Object.keys(modelMap).length === 0) return;

    const requests = [] as Promise<any>[];
    Object.keys(modelMap).forEach((recordId) => {
      requests.push(createRequest(recordId, modelMap[recordId]));
    });

    await Promise.all(requests);

    setTimeout(this.pollDataModelResult.bind(this), 1000);

    function createRequest(recordId: string, dataList: IFrame[]) {
      const ids = dataList.map((e) => e.id);
      const request = api
        .getModelResult(ids, recordId)
        .then((data) => {
          const { frameIndex, frames } = state;
          const curData = frames[frameIndex];
          data = data.data || {};
          const resultList = data.modelDataResults;
          if (!resultList) return;

          const modelCode = data.modelCode;
          const resultMap = {} as Record<string, any>;
          resultList.forEach((e: any) => {
            resultMap[e.dataId] = e;
          });

          dataList.forEach((frame) => {
            const info = resultMap[frame.id];
            const model = (frame.model ?? { code: modelCode }) as IModelRunningState;

            if (info) {
              const modelResult = info.modelResult;
              if (modelResult.code != 'OK') {
                frame.model = undefined;
                if (frame.id === curData.id) {
                  editor.showMsg(MsgType.error, modelResult.message || 'Model Run Error');
                }
                return;
              }
              let objects = (modelResult.objects || []) as IObject[];
              if (objects.length > 0) {
                model.state = LoadStatus.COMPLETE;
                objects = objects.filter(
                  (e: any) => e.confidence >= confidence[0] && e.confidence <= confidence[1],
                );

                _this.setModelResult(frame.id, { objects, modelCode });
                frame.model = model;
              } else {
                frame.model = undefined;
                if (frame.id === curData.id) editor.showMsg(MsgType.warning, 'No Model Results.');
              }
            } else {
              frame.model = undefined;
              if (frame.id === curData.id) editor.showMsg(MsgType.warning, 'No Model Results.');
            }
          });
        })
        .catch(() => {});

      return request;
    }
  }
}
