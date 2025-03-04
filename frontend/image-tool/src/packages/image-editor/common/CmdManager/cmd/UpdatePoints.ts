import CmdBase from '../CmdBase';
import type { ICmdOption } from './index';
import { IPointsData } from '../../../types';
import { AnnotateObject } from '../../../ImageView/shape';
export interface IUpdatePointsOption {
  object: AnnotateObject;
  pointsData: IPointsData;
}

export default class UpdatePoints extends CmdBase<
  ICmdOption['update-points'],
  ICmdOption['update-points']['pointsData']
> {
  name: string = 'update-points';
  redo(): void {
    const { object, pointsData } = this.data;
    const editor = this.editor;

    if (!this.undoData) {
      this.undoData = object.clonePointsData();
    }

    editor.dataManager.setAnnotatesTransform(object as any, pointsData);
  }
  undo(): void {
    if (!this.undoData) return;
    const editor = this.editor;
    const { object } = this.data;

    editor.dataManager.setAnnotatesTransform(object as any, this.undoData);
  }
  canMerge(cmd: CmdBase): boolean {
    const offsetTime = Math.abs(this.updateTime - cmd.updateTime);
    return cmd instanceof UpdatePoints && this.data.object === cmd.data.object && offsetTime < 500
      ? true
      : false;
  }

  merge(cmd: UpdatePoints) {
    Object.assign(this.data.pointsData, cmd.data.pointsData);
    this.updateTime = new Date().getTime();
  }
}
