import Konva from 'konva';
import { v4 as uuid } from 'uuid';
import { IFrame, ToolModelEnum, ToolType } from '../../types';
import { IShapeConfig, IStateMap, IPointsData, IRectOption, CacheName } from '../type';
// import * as _utils from '../utils';
import { defaultConfig } from '../../config';
import { IAnnotateObject } from './Shape';
import { AnnotateObject } from './index';
import Rect from './Rect';
import { cloneDeep, isString } from 'lodash';
import { LogOpEnum } from '@basicai/tool-components';

const renderFilter = (e: AnnotateObject) => true;

export default class GroupObject extends Konva.Container implements IAnnotateObject {
  className: string = 'group-object';
  uuid: string = uuid();
  userData: Record<string, any> = {};
  frame!: IFrame;
  boundRect!: IRectOption;
  object!: any;
  groups: GroupObject[] = [];
  annotateType: ToolModelEnum = ToolModelEnum.INSTANCE;
  editTarget?: any;
  member: AnnotateObject[] = [];
  // all
  children: AnnotateObject[] = [];
  renderFilter = renderFilter;
  // state
  state: IStateMap = {};
  editable = true;
  // style
  stateStyles?: Record<string, IShapeConfig>;
  defaultStyle: IShapeConfig = defaultConfig;
  statePriority?: string[];
  // bg
  bgRect!: Rect;
  bgPadding = 20;
  showBgRect: boolean = true;
  // 统计
  lastTime?: number;
  updateTime?: number;
  createdAt?: any;
  createdBy?: any;
  version?: number;
  _log_op?: LogOpEnum;
  _updated: boolean = true;
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
  constructor(config?: IShapeConfig) {
    const _config: IShapeConfig = {
      selectable: true,
      draggable: true,
      x: 0,
      y: 0,
    };
    super(Object.assign(_config, defaultConfig, config));
    const group = this;
    this.bgRect = new Rect({
      draggable: false,
      skipStateStyle: false,
      selectable: false,
      dash: [5, 5],
      stroke: 'rgba(222, 126, 246, 1)',
      strokeWidth: 2,
      sceneFunc(context: Konva.Context) {
        const stage = group.getStage();
        const showGroupBox = stage?.attrs.showGroupBox ?? true;
        if (showGroupBox || group.state.select) {
          const { x, y, width, height } = group.getBoundRect();
          const position = group.position();
          context.beginPath();
          context.rect(x - position.x, y - position.y, width, height);
          context.closePath();
          context.fillStrokeShape(group.bgRect);
        }
      },
    });
    this.bgRect.object = this;
    this.bgRect.className = 'group-bg';
    this.add(this.bgRect);
    this.on('xChange yChange', () => {
      this._updated = false;
    });
  }
  selected(): boolean {
    return this.state.select || this.groups.some((e) => e.selected());
  }
  onPointChange() {
    this._updated = true;
    this.setAttrs({ x: 0, y: 0 });
    this._clearCache('boundRect' as CacheName);
    // this.getBoundRect();
    this.updateZIndex();
    this.updateGroup();
    this._requestDraw();
  }

  addObject(adds: AnnotateObject | AnnotateObject[], indexs: number | number[] = []) {
    if (!Array.isArray(adds)) adds = [adds];
    const idxs = Array.isArray(indexs) ? indexs : [indexs];
    // const childrenIds = this.member.map((e) => e.uuid);
    adds.forEach((e, index) => {
      if (this.contain(e)) return;
      e.relationGroup(this);
      const i = idxs[index];
      if (i >= 0 && i < this.member.length) {
        this.member.splice(i, 0, e);
      } else {
        this.member.push(e);
      }
    });
    this.onPointChange();
    return this;
  }

  removeObject(removes: AnnotateObject | AnnotateObject[], syncObjectData?: boolean) {
    if (!Array.isArray(removes)) removes = [removes];
    const removeIds = removes.map((e) => e.uuid);

    this.member = this.member.filter((e) => !removeIds.includes(e.uuid));
    if (syncObjectData) removes.forEach((e) => e.breakoffGroup(this));
    this.onPointChange();

    return this;
  }
  // 满足产品的特性化需求, 自定义object的显示控制
  get showVisible() {
    return this.bgRect ? this.bgRect.visible() : true;
  }
  set showVisible(val: boolean) {
    this.bgRect?.visible(val);
  }
  get toolType() {
    return ToolType.GROUP;
  }

  isGroup() {
    return true;
  }
  contain(object: AnnotateObject): boolean {
    return this.member.some((m) => {
      if (m instanceof GroupObject && m.isGroup()) {
        return m.contain(object);
      } else {
        return m == object;
      }
    });
  }
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
  updateGroup() {
    if (!this.object && this.groups.length > 0) {
      this.groups.forEach((e) => e.onPointChange());
    }
  }
  updateZIndex() {
    if (!this.parent) return;
    let minZIndex = 0;
    this.member.forEach(function (child) {
      const i = child.getZIndex() || 0;
      minZIndex = Math.min(minZIndex, i);
    });
    this.setZIndex(minZIndex);
    this.groups.forEach((e) => e.updateZIndex());
  }
  hasMember(member: string | AnnotateObject) {
    const id = isString(member) ? member : member.uuid;
    return this.member.some((e) => e.uuid === id);
  }

  clonePointsData(): IPointsData {
    return {};
  }
  /** 获取非组的成员
   * @param onlySelf 是否仅返回自己的成员
   */
  getChildrenNotGroup(onlySelf: boolean = false): AnnotateObject[] {
    return Array.from(
      this.member.reduce((set, item) => {
        if (item.isGroup() && item instanceof GroupObject) {
          if (!onlySelf) {
            item.getChildrenNotGroup(onlySelf).forEach((e) => {
              set.add(e);
            });
          }
        } else {
          set.add(item);
        }
        return set;
      }, new Set<AnnotateObject>()),
    );
  }
  getAllChildren() {
    return this.member.reduce<AnnotateObject[]>((childs, object) => {
      if (object.isGroup()) {
        childs.push(...(object as GroupObject).getAllChildren());
      }
      childs.push(object);
      return childs;
    }, []);
  }
  // 删除结果自身
  remove() {
    this.groups.forEach((g) => g.removeObject(this));
    this.isGroup() && this.member.forEach((c) => c.breakoffGroup(this));
    this.groups = [];
    this.member = [];
    super.remove();
    return this;
  }
  getSelfBoundRect() {
    const rect = this.getBoundRect();
    rect.x -= this.x();
    rect.y -= this.y();
    return rect;
  }
  getClientRect(config: Record<string, any> = {}) {
    const { skipTransform, relativeTo } = config;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    let selfRect = { x: Infinity, y: Infinity, width: 0, height: 0 };

    // const children = this.getChildrenNotGroup();
    this.member.forEach(function (child) {
      const rect: any = child.getBoundRect();
      minX = Math.min(minX, rect.x);
      minY = Math.min(minY, rect.y);
      maxX = Math.max(maxX, rect.x + rect.width);
      maxY = Math.max(maxY, rect.y + rect.height);
    });
    selfRect = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
    if (
      !isFinite(selfRect.x) ||
      !isFinite(selfRect.y) ||
      !isFinite(selfRect.width) ||
      !isFinite(selfRect.height)
    ) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    if (!skipTransform) {
      return this._transformedRect(selfRect, relativeTo);
    }
    return selfRect;
  }
  getSelfRect() {
    return this.getClientRect({ skipTransform: true });
  }
  getBoundRect() {
    return this._getCache('boundRect' as CacheName, this._getBoundRect) as IRectOption;
  }
  _getBoundRect() {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    this.member.forEach((m) => {
      const rect = m.getBoundRect();
      minX = Math.min(minX, rect.x);
      minY = Math.min(minY, rect.y);
      maxX = Math.max(maxX, rect.x + rect.width);
      maxY = Math.max(maxY, rect.y + rect.height);
    });
    minX -= this.bgPadding;
    minY -= this.bgPadding;
    maxX += this.bgPadding;
    maxY += this.bgPadding;
    // const padding = rect.width === 0 || rect.height === 0 ? 0 : this.bgPadding;
    // const { x, y } = this.attrs;
    // this.bgRect.setAttrs({
    //   x: rect.x - x - padding,
    //   y: rect.y - y - padding,
    //   width: rect.width + padding * 2,
    //   height: rect.height + padding * 2,
    // });
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  getTextPosition() {
    return this._getTextPosition();
  }
  _getTextPosition() {
    const { x, y } = this.getBoundRect();
    return { x, y };
  }

  // override
  _validateAdd(node: Konva.Node) {}
  _clearCache(attr?: string) {
    this.bgRect._clearCache(attr);
    super._clearCache(attr);
  }
  _drawChildren(drawMethod: string, canvas: any, top: any) {
    if (this.showBgRect) {
      this.bgRect[drawMethod as keyof Rect](canvas, top);
    }
  }
  cloneProps(prop: string): any {
    return this[prop as keyof GroupObject] ? cloneDeep(this[prop as keyof GroupObject]) : {};
  }
  cloneThisShape(cloneMember = true) {
    const newGroup = this.newShape();
    if (cloneMember && this.member.length > 0) {
      this.member.forEach((shape) => {
        shape && shape.cloneThisShape && newGroup.addObject(shape.cloneThisShape(true));
      });
    }
    newGroup.setAttrs(this.cloneProps('attrs'));
    newGroup.userData = this.cloneProps('userData');
    return newGroup;
  }
  newShape() {
    return new GroupObject();
  }
}
