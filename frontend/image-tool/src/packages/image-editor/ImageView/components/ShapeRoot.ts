import Konva from 'konva';
import { v4 as uuid } from 'uuid';
import * as editorUtils from '../../utils';
import { removeShapeKey, addShapeKey } from '../utils';
import { AnnotateObject } from '../shape';
import { IFrame, ToolModelEnum } from '../../types';

interface IShapeRoot {
  frame?: IFrame;
  children?: AnnotateObject[];
  type?: ToolModelEnum;
}
const renderFilter = (e: AnnotateObject) => true;

export default class ShapeRoot extends Konva.Container {
  className: string = 'shape-root';
  uuid: string = uuid();
  children: AnnotateObject[] = [];
  hasMap: Map<string, AnnotateObject> = new Map();
  renderFilter = renderFilter;
  frame!: IFrame;
  type: ToolModelEnum = ToolModelEnum.INSTANCE;

  constructor(config: IShapeRoot) {
    super();
    if (config.frame) this.frame = config.frame;
    if (config.children) this.addObjects(config.children);
    if (config.type) this.type = config.type;
  }

  // 该root下所有objects, 包括组内的结果
  get allObjects() {
    return Array.from(this.hasMap.values());
  }

  addObjects(objects: AnnotateObject[] | AnnotateObject, indexs?: number | number[]) {
    if (!Array.isArray(objects)) objects = [objects];
    const idxArr = indexs != undefined ? (Array.isArray(indexs) ? indexs : [indexs]) : [];
    if (objects.length === 0) return;

    objects.forEach((e, i) => {
      e._clearCaches();
      e.parent = this;
      e.frame = this.frame;
      this.hasMap.set(e.uuid, e);
      const index = idxArr[i] ?? idxArr[0] ?? Infinity;
      this.children = this.children.filter((c) => c.uuid != e.uuid);
      if (index >= 0 && index < this.children.length) {
        this.children.splice(index, 0, e);
      } else {
        this.children.push(e);
      }
    });
    this._setChildrenIndices();
    addShapeKey(objects);
    this._requestDraw();
  }

  getObjectIndexs(object: AnnotateObject) {
    return this.children.findIndex((e) => e.uuid === object.uuid);
  }

  removeObjects(objects: AnnotateObject[] | AnnotateObject) {
    if (!Array.isArray(objects)) objects = [objects];

    editorUtils.traverse(objects, (e) => {
      this.hasMap.delete(e.uuid);
    });

    const delMap: any = {};
    objects.forEach((e) => {
      e._clearCaches();
      delMap[e.uuid] = true;
      e.parent = null;
      e.remove();
    });

    this.children = this.children.filter((e) => !delMap[e.uuid]);
    this._setChildrenIndices();
    removeShapeKey(objects);
    this._requestDraw();
  }
  destroySelf() {
    this.removeChildren();
    this.hasMap.clear();
    this.remove();
    this.destroy();
  }

  // override
  _validateAdd(node: Konva.Node) {}
  _drawChildren(drawMethod: string, canvas: any, top: any) {
    const groups: AnnotateObject[] = [];
    const others: AnnotateObject[] = [];
    this.children?.forEach((child: AnnotateObject) => {
      if (this.renderFilter(child)) {
        child.isGroup() ? groups.push(child) : others.push(child);
      }
    });
    [...groups, ...others].forEach((e) => {
      e.updateZIndex();
      e[drawMethod as keyof AnnotateObject](canvas, top);
    });
  }
}
