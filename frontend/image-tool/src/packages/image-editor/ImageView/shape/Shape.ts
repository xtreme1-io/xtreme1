import Konva from 'konva';
import { v4 as uuid } from 'uuid';
import { IFrame, IUserData, ToolModelEnum, ToolType } from '../../types';
import { IShapeConfig, Vector2, IStateMap, IPointsData, IRectOption, CacheName } from '../type';
import * as _utils from '../utils';
import { defaultConfig, Cursor } from '../../config';
import { cloneDeep } from 'lodash';
import { AnnotateObject, GroupObject } from '.';
import { LogOpEnum } from '@basicai/tool-components';

_utils.hackOverwriteShape();

export interface IAnnotateObject {
  className: string;
  uuid: string;
  userData: IUserData;
  frame: IFrame;
  boundRect: IRectOption;
  object?: any; // 父对象
  editTarget?: any; // 编辑的对象
  groups: GroupObject[];
  member: AnnotateObject[];
  // state
  state: IStateMap;
  // style
  stateStyles?: Record<string, IShapeConfig>;
  defaultStyle?: IShapeConfig;
  statePriority?: string[];
  showVisible: boolean;
  toolType: ToolType | '';
  annotateType: ToolModelEnum;
  _log_op?: LogOpEnum;
  clonePointsData(): IPointsData;
  cloneThisShape(children?: boolean): Shape | GroupObject;
  cloneProps(prop: string): any;
  newShape(): any;
  onPointChange(): void;
  updateZIndex(i?: number): void;
  remove(): this;
  _getBoundRect(): IRectOption;
  getBoundRect(): IRectOption;
  getSelfBoundRect(): IRectOption;
  getTextPosition(): Vector2;
  _getTextPosition(): Vector2;
  selected(): boolean;
  // group 相关
  isGroup(): boolean;
  relationGroup(args: GroupObject | GroupObject[]): void;
  breakoffGroup(args: GroupObject | GroupObject[]): void;
}

export default class Shape extends Konva.Shape implements IAnnotateObject {
  className: string = 'shape';
  uuid: string = uuid();
  userData: IUserData = {};
  frame!: IFrame;
  boundRect!: IRectOption;
  object!: any;
  editTarget?: any;
  groups: GroupObject[] = [];
  member: AnnotateObject[] = [];
  annotateType: ToolModelEnum = ToolModelEnum.INSTANCE;
  // state
  state: IStateMap = {};
  _editable = true;
  // style
  stateStyles?: Record<string, IShapeConfig>;
  defaultStyle: IShapeConfig = defaultConfig;
  statePriority?: string[];
  //
  asyncEvent = false;
  _initEvent = false;
  // 统计
  lastTime?: number;
  updateTime?: number;
  createdAt?: any;
  createdBy?: any;
  version?: number;
  _log_op?: LogOpEnum;
  get _deleted() {
    return this._log_op == LogOpEnum.Delete;
  }
  get _created() {
    return this._log_op == LogOpEnum.Create;
  }
  get _edited() {
    return this._log_op == LogOpEnum.Edit;
  }
  declare attrs: Required<IShapeConfig>;
  constructor(config: IShapeConfig = {}) {
    const _config: IShapeConfig = {
      perfectDrawEnabled: false,
      draggable: true,
      x: 0,
      y: 0,
      stroke: '#fff',
      cursor: Cursor.pointer,
      skipStageScale: true,
      selectable: true,
    };
    super(Object.assign(_config, defaultConfig, config));
  }
  selected() {
    return this.state.select || this.groups.some((e) => e.selected());
  }
  // change
  onPointChange() {
    this._clearCache('boundRect' as CacheName);
    this._clearCache('textPosition' as CacheName);
    this.updateGroup();
  }

  clonePointsData(): IPointsData {
    return {};
  }
  cloneProps(prop: string): any {
    return this[prop as keyof Shape] ? cloneDeep(this[prop as keyof Shape]) : {};
  }
  cloneThisShape(): Shape {
    const newShape = this.newShape();
    newShape.setAttrs(this.cloneProps('attrs'));
    newShape.userData = this.cloneProps('userData');
    return newShape;
  }
  newShape() {
    return new Shape();
  }

  // 删除结果自身
  remove() {
    this.groups.forEach((g) => g.removeObject(this));
    this.groups = [];
    super.remove();
    return this;
  }
  isGroup() {
    return false;
  }

  updateGroup() {
    if (!this.object && this.groups.length > 0) {
      this.groups.forEach((e) => e.onPointChange());
    }
  }
  updateZIndex() {}
  // 脱离组
  breakoffGroup(breaks: GroupObject | GroupObject[]) {
    if (this.groups.length === 0) return;
    if (!Array.isArray(breaks)) breaks = [breaks];
    const breakIds = breaks.map((g) => g.uuid);
    this.groups = this.groups.filter((g) => !breakIds.includes(g.uuid));
    this._clearCaches();
  }
  // 关联组
  relationGroup(relations: GroupObject | GroupObject[]) {
    if (!Array.isArray(relations)) relations = [relations];
    const groupIds = this.groups.map((g) => g.uuid);
    relations = relations.filter((g) => !groupIds.includes(g.uuid));
    this.groups.push(...relations);
    this._clearCaches();
  }

  getSelfRect() {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  _getBoundRect() {
    const rect = this.getSelfRect();
    const pos = this.position();
    rect.x += pos.x;
    rect.y += pos.y;
    return rect;
  }
  getBoundRect() {
    return this._getCache('boundRect' as CacheName, this._getBoundRect) as IRectOption;
  }
  getSelfBoundRect() {
    const rect = this.getBoundRect();
    rect.x -= this.x();
    rect.y -= this.y();
    return rect;
  }
  // _getBoundRect() {
  //     return this.getSelfRect();
  // }

  getTextPosition() {
    return this._getCache('textPosition' as CacheName, this._getTextPosition) as Vector2;
  }
  _getTextPosition(): Vector2 {
    return { x: 0, y: 0 };
  }
  drawPoint(context: Konva.Context, points: Vector2[]) {
    const stage = this.getStage();
    if (!stage?.attrs?.drawPoint) return;
    const scale = 1 / stage.scaleX();
    context.save();
    context.setAttr('fillStyle', this.stroke());
    points.forEach((e) => {
      context.beginPath();
      context.arc(e.x, e.y, 3 * scale, 0, 2 * Math.PI, true);
      context.closePath();
      context.fill();
    });
    context.restore();
  }
  // 满足产品的特性化需求, 自定义object的显示控制
  get showVisible() {
    return this.visible();
  }
  set showVisible(val: boolean) {
    this.visible(val);
  }
  get editable() {
    return this._editable && this.showVisible;
  }
  set editable(val: boolean) {
    this._editable = val;
  }
  get toolType() {
    return '' as ToolType;
  }
}
