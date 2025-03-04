import CmdBase from '../CmdBase';
import type { ICmdOption } from './index';
import { ITransform } from '../../../types';
import { AnnotateObject } from '../../../ImageView/shape';
import { cloneDeep } from 'lodash';

export interface IUpdateTransformOption {
  objects: AnnotateObject[] | AnnotateObject;
  transforms: ITransform[] | ITransform;
  startData?: ITransform[] | ITransform;
}

export default class UpdateTransform extends CmdBase<
  ICmdOption['update-transform'],
  ICmdOption['update-transform']
> {
  name: string = 'update-transform';
  redo(): void {
    const editor = this.editor;

    let { objects, transforms, startData } = this.data;
    if (!Array.isArray(objects)) objects = [objects];

    if (!this.undoData) {
      const undoData: IUpdateTransformOption = {
        objects: objects,
        transforms: [],
      };
      if (startData) {
        if (!Array.isArray(startData)) startData = [startData];
        undoData.transforms = startData;
      } else {
        objects.forEach((obj, index) => {
          const changePro = Array.isArray(transforms)
            ? transforms[index] || transforms[0]
            : transforms;
          const clonePro: Record<string, any> = {};
          Object.keys(changePro).forEach((key) => {
            if (obj.attrs[key] != undefined) clonePro[key] = cloneDeep(obj.attrs[key]);
          });
          (undoData.transforms as ITransform[]).push(clonePro);
        });
      }
      this.undoData = undoData;
    }

    editor.dataManager.setAnnotatesTransform(objects, transforms);
  }
  undo(): void {
    if (!this.undoData) return;
    const editor = this.editor;
    let { transforms, objects } = this.undoData;
    if (!Array.isArray(objects)) objects = [objects];

    editor.dataManager.setAnnotatesTransform(objects, transforms);
  }
  canMerge(cmd: CmdBase): boolean {
    const offsetTime = Math.abs(this.updateTime - cmd.updateTime);
    return cmd instanceof UpdateTransform &&
      this.data.objects === cmd.data.objects &&
      !Array.isArray(this.data.transforms) &&
      offsetTime < 500
      ? true
      : false;
  }

  merge(cmd: UpdateTransform) {
    Object.assign(this.data.transforms, cmd.data.transforms);
    this.updateTime = new Date().getTime();
  }
}
