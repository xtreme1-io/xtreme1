import Konva from 'konva';
import { v4 as uuid } from 'uuid';
import * as utils from '../utils';
import { removeShapeKey, addShapeKey } from '../utils';
import { AnnotateObject } from '../shape';
import { IFrame, AnnotateModeEnum } from '../../types';

interface IShapeRoot {
  frame?: IFrame;
  children?: AnnotateObject[];
  type?: AnnotateModeEnum;
}
const renderFilter = (e: AnnotateObject) => true;

export default class ShapeRoot extends Konva.Container {
  className: string = 'shape-root';
  uuid: string = uuid();
  children: AnnotateObject[] = [];
  hasMap: Map<string, AnnotateObject> = new Map();
  renderFilter = renderFilter;
  frame!: IFrame;
  type: AnnotateModeEnum = AnnotateModeEnum.INSTANCE;

  constructor(config: IShapeRoot) {
    super();
    if (config.frame) this.frame = config.frame;
    if (config.children) this.addObjects(config.children);
    if (config.type) this.type = config.type;
  }

  get allObjects() {
    return Array.from(this.hasMap.values());
  }

  addObjects(objects: AnnotateObject[] | AnnotateObject) {
    if (!Array.isArray(objects)) objects = [objects];
    if (objects.length === 0) return;

    utils.traverse(objects, (e) => {
      e.frame = this.frame;
      this.hasMap.set(e.uuid, e);
    });

    objects.forEach((e) => {
      e._clearCaches();
      e.parent = this;
    });

    this.children.push(...objects);
    this._setChildrenIndices();
    addShapeKey(objects);
    this._requestDraw();
  }

  _addObjectIndex(index: number = Infinity, object: AnnotateObject) {
    object.parent = this;
    object._clearCaches();
    object.frame = this.frame;

    if (index === Infinity) {
      this.children.push(object);
    } else {
      index = index < 0 ? 0 : index;
      this.children.splice(index, 0, object);
    }
    addShapeKey(object);
    this._requestDraw();
  }

  addObjectIndex(index: number = Infinity, object: AnnotateObject) {
    this._addObjectIndex(index, object);
    this._setChildrenIndices();
    this._requestDraw();
  }

  removeObjects(objects: AnnotateObject[] | AnnotateObject) {
    if (!Array.isArray(objects)) objects = [objects];

    utils.traverse(objects, (e) => {
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
    // update bgRect
    this.children?.forEach((child: AnnotateObject) => {
      if (this.renderFilter(child)) {
        child[drawMethod as keyof AnnotateObject](canvas, top);
      }
    });
  }
}
