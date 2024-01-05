import CmdBase from '../CmdBase';
import type { ICmdOption } from './index';
import { IUserData, AnnotateObject } from '../../../types';
import * as utils from '../../../utils';

export interface IUpdateUserDataOption {
  objects: AnnotateObject[] | AnnotateObject;
  data: IUserData[] | IUserData;
}

export default class UpdateUserData extends CmdBase<
  ICmdOption['update-user-data'],
  ICmdOption['update-user-data']
> {
  name: string = 'update-user-data';
  redo(): void {
    const editor = this.editor;

    let { data, objects } = this.data;

    if (!Array.isArray(objects)) objects = [objects];

    if (!this.undoData) {
      const undoData: IUpdateUserDataOption = {
        objects: objects,
        data: [],
        // transform: { objects: [], transforms: [] },
      };

      const attrKeys = Object.keys(Array.isArray(data) ? data[0] : data);
      objects.forEach((object, index) => {
        const copeData = utils.pickAttrs(object.userData, attrKeys) as IUserData;
        undoData.data.push(copeData);
      });

      this.undoData = undoData;
    }

    editor.dataManager.setAnnotatesUserData(objects, data);
  }
  undo(): void {
    const editor = this.editor;

    if (!this.undoData) return;

    let { data, objects } = this.undoData;
    if (!Array.isArray(objects)) objects = [objects];

    editor.dataManager.setAnnotatesUserData(objects, data);
  }

  canMerge(cmd: UpdateUserData): boolean {
    const data = this.data;
    const offsetTime = Math.abs(this.updateTime - cmd.updateTime);
    const valid =
      cmd instanceof UpdateUserData &&
      data.objects === data.objects &&
      !Array.isArray(data.data) &&
      offsetTime < 1000;

    return valid;
  }

  merge(cmd: UpdateUserData) {
    Object.assign(this.data.data, cmd.data.data);
    this.updateTime = new Date().getTime();
  }
}
