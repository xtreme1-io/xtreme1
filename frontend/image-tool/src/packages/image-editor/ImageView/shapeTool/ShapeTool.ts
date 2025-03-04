import { AnnotateObject, Circle } from '../shape';
import Konva from 'konva';
import ImageView from '../index';
import EventEmitter from 'eventemitter3';
import { Cursor, Event } from '../../config';
import {
  Vector2,
  ToolAction,
  ToolModelEnum,
  StatusType,
  ToolName,
  IShapeConfig,
} from '../../types';
import { isBoolean, isNumber } from 'lodash';

export type ToolEvent =
  | 'object'
  | 'draw-start'
  | 'draw-clear'
  | 'draw-change'
  | 'draw-end'
  | 'edit-start'
  | 'edit-change'
  | 'edit-end';

interface IConfig {
  disableRenderLayer: boolean;
}

export default class ShapeTool extends EventEmitter {
  name: ToolName = ToolName.default;
  toolMode: ToolModelEnum = ToolModelEnum.INSTANCE;
  view: ImageView;
  enable: boolean = true;
  cursor: string = Cursor.crosshair;
  // config
  config: IConfig = {
    disableRenderLayer: true,
  };
  // draw
  drawGroup: Konva.Group;
  mouseDown: boolean = false;
  mouseDowning: boolean = false;
  holder!: AnnotateObject;
  currentAnchor!: Circle;
  drawConfig: IShapeConfig = { stroke: '#ffffff' };
  // edit
  editGroup: Konva.Group;
  _anchorIndex = -1;
  _anchorType = -1;
  _hoverIndex = -1;
  _hoverType = -1;
  // help
  helpGroup: Konva.Group;
  object: AnnotateObject | undefined = undefined;
  changeEvent: string = '';
  roundMousePoint = false;
  constructor(view: ImageView) {
    super();
    this.view = view;
    this.drawGroup = new Konva.Group({ visible: false, sign: 'tool-draw-group' });
    this.editGroup = new Konva.Group({ visible: false, sign: 'tool-edit-group' });
    this.helpGroup = new Konva.Group({ visible: false, sign: 'tool-help-group' });
    this.drawGroup.listening(false);
    this.view.helpLayer.add(this.drawGroup);
    this.view.helpLayer.add(this.editGroup);
    this.view.helpLayer.add(this.helpGroup);

    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onDocMouseUp = this._onDocMouseUp.bind(this);
    this._onKeydown = this._onKeydown.bind(this);
    this._onKeyup = this._onKeyup.bind(this);

    this._onObjectChange = this._onObjectChange.bind(this);
  }
  /**
   * 开始绘制
   */
  draw() {}
  /**
   * 停止绘制
   */
  stopDraw() {}
  /**
   * 清除绘制信息重新开会绘制
   */
  clearDraw() {}
  /**
   * 停止当前这次绘制，开始新的绘制，比如line polygon的绘制需要手动结束，需要调用这个方法
   */
  stopCurrentDraw() {}
  /**
   * undo 处理
   */
  undoDraw() {}
  /**
   * delete 处理
   */
  onToolDelete() {}
  /**
   * 刷新工具, 提供一个方法给外面来刷新当前工具的一些状态
   */
  updateTool() {}
  /**
   * 刷新工具绘制数据, 提供一个方法给外面来刷新当前工具正在绘制的数据
   */
  updateHolder() {}
  /**
   * 绘制结果回调，比如stopCurrentDraw调用之后就会调用这个方法
   */
  onDraw(object: AnnotateObject | AnnotateObject[] | undefined) {
    this.emit('object' as ToolEvent, object);
    // 结束绘制
    // if (this.view) this.view.editor.state.status = StatusType.Default;
  }
  onDrawStart() {
    this.emit('draw-start' as ToolEvent);
  }
  // 正在绘制中
  onDrawChange() {
    this.emit('draw-change' as ToolEvent);
    this.updateStatus();
  }
  onDrawClear() {
    this.emit('draw-clear' as ToolEvent);
    this.updateStatus(false);
    // 取消绘制
    // if (this.view) this.view.editor.state.status = StatusType.Default;
  }
  onDrawEnd() {
    this.emit('draw-end' as ToolEvent);
    this.updateStatus(false);
  }
  drawInfo() {
    return '';
  }

  doing(): boolean {
    return false;
  }

  updateStatus(doing?: boolean) {
    const state = this.view.editor.state;
    doing = isBoolean(doing) ? doing : this.doing();
    const toStatus = doing ? StatusType.Create : StatusType.Default;
    const curStatus = state.status;
    if (toStatus === curStatus) return;
    state.status = toStatus;
  }

  // edit
  edit(object: AnnotateObject) {
    this.addKeyboardEvent();
    this.enableEditEvent();
  }
  updateEditObject() {}
  stopEdit() {
    this.removeKeyboardEvent();
  }
  clearEdit() {}

  disableEditEvent() {
    this.editGroup.listening(false);
  }
  enableEditEvent() {
    this.editGroup.listening(true);
  }
  addKeyboardEvent() {
    document.addEventListener('keydown', this._onKeydown);
    document.addEventListener('keyup', this._onKeyup);
  }
  removeKeyboardEvent() {
    document.removeEventListener('keydown', this._onKeydown);
    document.removeEventListener('keyup', this._onKeyup);
  }
  // keyboardEvent
  _onKeydown(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey || e.shiftKey) {
      this.disableEditEvent();
    }
  }
  _onKeyup(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey || e.shiftKey) {
      this.enableEditEvent();
    }
  }

  onEditStart() {
    this.emit('edit-start' as ToolEvent);
  }
  onEditChange() {
    this.object?.onPointChange();
    this.emit('edit-change' as ToolEvent);
  }
  onEditEnd() {
    this.emit('edit-end' as ToolEvent);
  }
  selectAnchorIndex(val?: number, type?: number) {
    if (isNumber(val)) {
      this.anchorType(isNumber(type) ? type : -1);
      this._anchorIndex = val;
      this.view.editor.emit(Event.ANNOTATE_OBJECT_POINT);
    }
    return this._anchorIndex;
  }
  anchorType(val?: number) {
    if (isNumber(val)) this._anchorType = val;
    return this._anchorType;
  }
  hoverIndex(index?: number, type?: number) {
    if (isNumber(index)) {
      this.hoverType(isNumber(type) ? type : -1);
      this._hoverIndex = index;
    }
    return this._hoverIndex;
  }
  hoverType(val?: number) {
    if (isNumber(val)) this._hoverType = val;
    return this._hoverType;
  }

  /**
   *
   * 默认的行为处理
   */
  onAction(action: ToolAction) {
    switch (action) {
      case ToolAction.undo:
        this.undoDraw();
        this.updateStatus();
        break;
      case ToolAction.esc:
        if (this.drawGroup.visible()) {
          this.clearDraw();
          this.onDrawClear();
        } else if (this.editGroup.visible()) {
          this.clearEdit();
        }
        break;
      case ToolAction.stop:
        this.stopCurrentDraw();
        this.updateStatus();
        break;
      case ToolAction.del:
        this.onToolDelete();
        break;
    }
  }

  /**
   * 是否处理某种行为
   */
  checkAction(action: ToolAction): boolean {
    // draw
    if (this.drawGroup.visible()) {
      return this.checkDrawAction(action);
    } else if (this.editGroup.visible()) {
      // edit
      return this.checkEditAction(action);
    }
    return false;
  }
  checkDrawAction(action: ToolAction) {
    return [ToolAction.esc, ToolAction.stop, ToolAction.undo].includes(action);
  }
  checkEditAction(action: ToolAction) {
    return false;
  }

  /**
   * 其他的函数
   */
  // default draw event handle
  clearEvent() {
    this.mouseDown = false;
    this.view.stage.off('mousedown', this._onMouseDown);
    this.view.stage.off('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onDocMouseUp);
  }
  initEvent() {
    this.view.stage.on('mousedown', this._onMouseDown);
    this.view.stage.on('mousemove', this._onMouseMove);
    document.addEventListener('mouseup', this._onDocMouseUp);
  }
  _onDocMouseUp(e: MouseEvent) {
    this.mouseDowning = false;
    this._onMouseUp({ evt: e } as Konva.KonvaEventObject<MouseEvent>);
  }
  _onMouseUp(e: Konva.KonvaEventObject<MouseEvent>) {
    const point = this.intPoint(this.view.stage.getRelativePointerPosition());
    this.mouseUpInevitable(e, point);
    // 左键
    if (e.evt.button !== 0) return;
    this.onMouseUp(e, point);
  }
  _onMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    let point = this.intPoint(this.view.stage.getRelativePointerPosition());
    this.mouseDownInevitable(e, point);
    // 左键
    if (e.evt.button !== 0) return;

    // valid position
    if (!this.isValid(point)) {
      point = this.validPosition(point);
    }

    this.mouseDown = true;
    // 开始绘制
    // if (this.view && this.view.editor.state.status != StatusType.Create)
    //     this.view.editor.state.status = StatusType.Create;
    this.onMouseDown(e, point);
    this.mouseDowning = true;
  }
  _onMouseMove(e: Konva.KonvaEventObject<MouseEvent>) {
    let point = this.intPoint(this.view.stage.getRelativePointerPosition());
    this.mouseMoveInevitable(e, point);
    if (!this.mouseDown) return;

    // valid position
    if (!this.isValid(point)) {
      point = this.validPosition(point);
    }

    this.onMouseMove(e, point);
  }
  _onMouseOut() {
    this.onMouseOut();
  }

  updateAttrHtml() {
    this.view.emit(Event.UPDATE_ATTR);
  }

  onMouseDown(e: Konva.KonvaEventObject<MouseEvent>, point: Vector2) {}
  onMouseUp(e: Konva.KonvaEventObject<MouseEvent>, point: Vector2) {}
  onMouseMove(e: Konva.KonvaEventObject<MouseEvent>, point: Vector2) {}
  onMouseOut() {}
  mouseMoveInevitable(e: Konva.KonvaEventObject<MouseEvent>, point: Vector2) {}
  mouseDownInevitable(e: Konva.KonvaEventObject<MouseEvent>, point: Vector2) {}
  mouseUpInevitable(e: Konva.KonvaEventObject<MouseEvent>, point: Vector2) {}

  // edit
  addChangEvent() {
    if (!this.object || !this.changeEvent) return;
    this.object.on(this.changeEvent, this._onObjectChange);
  }
  removeChangeEvent() {
    if (!this.object || !this.changeEvent) return;
    this.object.off(this.changeEvent, this._onObjectChange);
  }

  _onObjectChange(e: any) {
    // console.log('onObjectChange', e.type);
    // utils.requestAnimFrame(this, 'onObjectChange', () => {
    //     this.onObjectChange();
    // });
    this.onObjectChange();
  }

  onObjectChange() {}

  // valid
  validPosition(position: Vector2) {
    return position;
  }

  isValid(position: Vector2) {
    return true;
  }

  // 取整
  intPoint(point?: Vector2 | null) {
    if (this.roundMousePoint && point) {
      point.x = Math.floor(point.x);
      point.y = Math.floor(point.y);
    }
    return point || { x: 0, y: 0 };
  }
  // 设置绘制的配置
  assignConfig(config: IShapeConfig) {
    Object.assign(this.drawConfig, config);
  }
}
