import Editor from '../Editor';
import { IFrame, IModel, ModelTypeEnum, utils } from '..';

// 模型结果数据
export interface IModelData {
  objects?: any[]; // 实例结果列表
  segmentFileUrl?: string; // 分割文件url
  segmentFileSize?: number; // 分割文件大小
  segments?: any[]; // 分割结果列表
  modelId: number;
}
export default class ModelManager {
  editor: Editor;
  modelMap: Map<string, IModelData> = new Map();

  constructor(editor: Editor) {
    this.editor = editor;
  }

  clearModelData() {
    this.modelMap.clear();
  }
  removeModelResult(frameId: string, type?: ModelTypeEnum) {
    if (type) {
      const id = utils.formatId([frameId, type, '0']);
      this.modelMap.delete(id);
    } else {
      const ids: string[] = Array.from(this.modelMap.keys());
      ids.forEach((id) => {
        if (id.indexOf(String(frameId)) === 0) this.modelMap.delete(id);
      });
    }
  }
  setModelResult(frameId: any, model: IModel, data: IModelData) {
    const id = utils.formatId([frameId, model.type, model.isInteractive ? '1' : '0']);
    this.modelMap.set(id, data);
  }
  getModelResult(type: ModelTypeEnum, frame?: IFrame, interactive?: boolean) {
    frame = frame || this.editor.getCurrentFrame();
    const id = utils.formatId([frame.id, type, interactive ? '1' : '0']);
    return this.modelMap.get(id) as IModelData;
  }
  hasModelResult(type: ModelTypeEnum, frame?: IFrame) {
    frame = frame || this.editor.getCurrentFrame();
    if (!frame) return false;
    const result = this.getModelResult(type, frame);
    if (result) return true;
    return false;
  }
  async runSAM() {
    throw 'runSAM implement error';
  }
}
