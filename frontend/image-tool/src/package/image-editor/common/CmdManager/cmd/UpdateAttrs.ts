import CmdBase from '../CmdBase';
import * as THREE from 'three';
import type { ICmdOption } from './index';
import { ITransform, IShapeConfig } from '../../../types';
import { AnnotateObject } from '../../../ImageView/shape';
import * as utils from '../../../utils';

export interface IUpdateAttrsOption {
  objects: AnnotateObject[] | AnnotateObject;
  data: IShapeConfig[] | IShapeConfig;
}

export default class UpdateAttrs extends CmdBase<ICmdOption['update-attrs'], IShapeConfig[]> {
  name: string = 'update-points';
  redo(): void {
    let { data, objects } = this.data;
    const editor = this.editor;

    if (!Array.isArray(objects)) objects = [objects];

    if (!this.undoData) {
      const undoData = [] as IShapeConfig[];

      const attrKeys = Object.keys(Array.isArray(data) ? data[0] : data);
      objects.forEach((object, index) => {
        const copeData = pickAttrs(object, attrKeys) as IShapeConfig;
        undoData.push(copeData);
      });

      this.undoData = undoData;
    }

    // editor.dataManager.setAnnotatesAttrs(objects, data);
  }
  undo(): void {
    if (!this.undoData) return;
    const editor = this.editor;
    let { objects } = this.data;

    if (!Array.isArray(objects)) objects = [objects];

    // editor.dataManager.setAnnotatesAttrs(objects, this.undoData);
  }
}

function pickAttrs(object: AnnotateObject, attrs: string[]) {
  const newObj: any = {};
  attrs.forEach((attr) => {
    newObj[attr] = object.getAttr(attr);
  });
  return newObj;
}
