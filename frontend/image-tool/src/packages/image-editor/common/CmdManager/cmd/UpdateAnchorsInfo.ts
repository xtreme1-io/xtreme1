import CmdBase from '../CmdBase';
import type { ICmdOption } from './index';
import { IUserData, AnnotateObject, Vector2 } from '../../../types';
import { Event } from '../../../config';
import { cloneDeep } from 'lodash';

interface IPointAttr {
  index: number;
  typeIndex: number;
  data: IUserData;
}
export interface IUpdateAnchorsInfoOption {
  object: AnnotateObject;
  data: IPointAttr;
}

export default class UpdateAnchorsInfo extends CmdBase<
  ICmdOption['update-anchors-info'],
  ICmdOption['update-anchors-info']
> {
  name: string = 'update-anchors-info';

  redo(): void {
    // const editor = this.editor;
    const { data, object } = this.data;
    const { points, innerPoints } = object.attrs;
    const arr = data.typeIndex === -1 ? points : innerPoints?.[data.typeIndex].points;
    if (!arr) return;
    let point = arr[data.index];
    if (!point) {
      point = { x: 0, y: 0, attr: {} } as Vector2;
      arr[data.index] = point;
    }

    if (!this.undoData) {
      this.undoData = {
        object: object,
        data: { index: -1, typeIndex: -1, data: {} },
      };
    }
    this.undoData.object = object;
    this.undoData.data = {
      index: data.index,
      typeIndex: data.typeIndex,
      data: cloneDeep(point.attr),
    };
    point.attr = data.data;
    this.editor.emit(Event.ANNOTATE_ANCHOR_ATTR);
    this.editor.dataManager.onAnnotatesChange([object], 'other');
  }

  undo(): void {
    if (!this.undoData) return;
    const { data, object } = this.undoData;
    const { points, innerPoints } = object.attrs;
    const arr = data.typeIndex === -1 ? points : innerPoints?.[data.typeIndex]?.points;
    const point = arr?.[data.index];
    if (!point) return;
    point.attr = data.data;
    this.editor.mainView.currentEditTool?.updateEditObject();
    this.editor.mainView.currentEditTool?.selectAnchorIndex(data.index, data.typeIndex);
  }

  canMerge(cmd: UpdateAnchorsInfo): boolean {
    const data = this.data;
    const offsetTime = Math.abs(this.updateTime - cmd.updateTime);
    const valid =
      cmd instanceof UpdateAnchorsInfo && data.object === data.object && offsetTime < 1000;

    return valid;
  }

  merge(cmd: UpdateAnchorsInfo) {
    Object.assign(this.data.data, cmd.data.data);
    this.updateTime = new Date().getTime();
  }
}
