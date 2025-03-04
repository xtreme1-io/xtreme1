import CmdBase from '../CmdBase';
import MaskShape, { IMaskShapeConfig } from '../../../ImageView/shape/MaskShape';
export interface IUpdateMaskOption {
  object: MaskShape;
  config: IMaskShapeConfig;
}

export default class UpdateMask extends CmdBase<IUpdateMaskOption, IUpdateMaskOption['config']> {
  name: string = 'update-mask';
  redo(): void {
    const { object, config } = this.data;
    const editor = this.editor;

    if (!this.undoData) {
      this.undoData = object.clonePointsData();
    }

    editor.dataManager.setMaskChange(object, config);
  }
  undo(): void {
    if (!this.undoData) return;
    const editor = this.editor;
    const { object } = this.data;

    editor.dataManager.setMaskChange(object, this.undoData);
  }
}
