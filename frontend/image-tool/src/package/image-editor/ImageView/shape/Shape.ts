import Konva from 'konva';
import { v4 as uuid } from 'uuid';
import { cloneDeep } from 'lodash';
import { IFrame, IUserData, ToolType } from '../../types';
import { defaultConfig, Cursor, defaultStateStyle } from '../../configs';
import { IShapeConfig, Vector2, IStateMap, ITransform, IRectOption, CacheName } from '../type';
import { AnnotateClassName } from './index';

export interface IAnnotateObject {
  className: AnnotateClassName;
  uuid: string;
  userData: IUserData;
  frame: IFrame;
  boundRect: IRectOption;
  object?: any;
  // state
  state: IStateMap;
  // style
  stateStyles?: Record<string, IShapeConfig>;
  statePriority?: string[];
  showVisible: boolean;
  toolType: ToolType | '';

  clonePointsData(): ITransform;
  cloneThisShape(children?: boolean): Shape;
  cloneProps(prop: string): any;
  newShape(): any;
  // updateBoundRect(): void;
  onPointChange(): void;
  // updateGroup(): void;
  remove(): this;
  // isObject(): boolean;
  getBoundRect(): IRectOption;
  // _getBoundRect(): IRectOption;
  getTextPosition(): Vector2;
  _getTextPosition(): Vector2;
}

export default class Shape extends Konva.Shape implements IAnnotateObject {
  className = '' as AnnotateClassName;
  uuid = uuid();
  userData: IUserData = {};
  frame!: IFrame;
  boundRect!: IRectOption;
  object!: any;
  state: IStateMap = {};
  statePriority = ['hover', 'select'];
  _stateStyles: Record<string, IShapeConfig> = cloneDeep(defaultStateStyle);
  _editable = true;

  // 统计信息
  lastTime?: number;
  updateTime?: number;
  createdAt?: any;
  createdBy?: any;
  version?: number;

  declare attrs: Required<IShapeConfig>;
  constructor(config: IShapeConfig = {}) {
    const _config: IShapeConfig = {
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
  get stateStyles() {
    return this._stateStyles;
  }
  get defaultStyle(): IShapeConfig {
    return this._stateStyles.general;
  }
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
  updateStateStyles(styles: Record<string, IShapeConfig>) {
    const { general = {}, hover = {}, select = {} } = styles;
    Object.assign(this._stateStyles.general, general);
    Object.assign(this._stateStyles.hover, hover);
    Object.assign(this._stateStyles.select, select);
  }
  clonePointsData(): ITransform {
    return {};
  }
  cloneThisShape(): Shape {
    const newShape = this.newShape();
    newShape.setAttrs(this.cloneProps('attrs'));
    newShape.userData = this.cloneProps('userData');
    return newShape;
  }
  cloneProps(prop: string) {
    return this[prop as keyof Shape] ? cloneDeep(this[prop as keyof Shape]) : {};
  }
  newShape() {
    return new Shape();
  }
  onPointChange() {
    this._clearCache('boundRect' as CacheName);
    this._clearCache('textPosition' as CacheName);
  }
  getSelfRect(onlySelf?: boolean) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  getBoundRect() {
    return this._getCache('boundRect' as CacheName, this.getSelfRect) as IRectOption;
  }
  getTextPosition() {
    return this._getCache('textPosition' as CacheName, this._getTextPosition) as Vector2;
  }
  _getTextPosition(): Vector2 {
    return { x: 0, y: 0 };
  }
}
