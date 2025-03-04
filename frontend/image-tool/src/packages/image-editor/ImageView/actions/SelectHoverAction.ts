import { Vector2 } from './../type';
import Action from '../Action';
import ImageView from '../index';
import Konva from 'konva';
import { Line, Shape, Skeleton, SkeletonEdge } from '../shape';
import { Cursor, ShiftKey } from '../../config';
import { transformOffset } from '../../utils';
import { OPType, ToolModelEnum } from '../../types';
import { t } from '@/lang';
import { CircleShape, Cuboid, Ellipse, Polygon, Rect, ShapeRoot, SplineCurve } from '../export';
import { ToolTypeEnum } from '@basicai/tool-components';

type IFilter = (e: any) => boolean;

const actionName = 'select-hover';
const whiteList = ['circle', 'key-point', 'mask'];

function isCross(
  rect: { x: number; y: number; width: number; height: number },
  shapeRect: { x: number; y: number; width: number; height: number },
) {
  if (Math.min(rect.x, rect.x + rect.width) > Math.max(shapeRect.x, shapeRect.x + shapeRect.width))
    return false;
  if (Math.max(rect.x, rect.x + rect.width) < Math.min(shapeRect.x, shapeRect.x + shapeRect.width))
    return false;
  if (
    Math.min(rect.y, rect.y + rect.height) > Math.max(shapeRect.y, shapeRect.y + shapeRect.height)
  )
    return false;
  if (
    Math.max(rect.y, rect.y + rect.height) < Math.min(shapeRect.y, shapeRect.y + shapeRect.height)
  )
    return false;
  return true;
}

class SelectHoverAction extends Action {
  // enabled = true;
  selectFlag = true;
  stageClickFlag = true;
  hoverFlag: IFilter = (e?: any) => true;
  cursorFlag = true;
  view: ImageView;
  filter?: IFilter;
  hoverTarget?: Shape;
  copiedObject?: Shape;
  copiedStartPos?: Vector2;
  selectTrackRect: Konva.Rect;
  stageMouseDown = false;
  stageMouseMove = false;
  constructor(view: ImageView) {
    super();
    this.view = view;
    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onMouseClick = this.onMouseClick.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onKeydown = this.onKeydown.bind(this);
    this.onKeyup = this.onKeyup.bind(this);
    this.onDocMouseUp = this.onDocMouseUp.bind(this);
    this.onDocMouseMove = this.onDocMouseMove.bind(this);
    this.selectTrackRect = new Konva.Rect({
      stroke: '#3399ff',
      fill: 'rgba(51, 153, 255, 0.2)',
      listening: false,
      strokeWidth: 0.5,
    });
  }
  init() {
    this.view.stage.on('mouseover', this.onMouseOver);
    this.view.stage.on('mouseout', this.onMouseOut);
    this.view.stage.on('click', this.onMouseClick);
    this.view.stage.on('mousedown', this.onMouseDown);
    document.addEventListener('mouseup', this.onDocMouseUp);
    document.addEventListener('mousemove', this.onDocMouseMove);
    // click
    this.view.shapes.on('click', this.onClick);
  }
  onDocMouseMove(e: MouseEvent) {
    if (!this.stageMouseDown) return;
    if (this.view.editor.dragging) {
      this.stageMouseMove = false;
      this.onDocMouseUp();
      return;
    }
    this.stageMouseMove = true;

    const boundRect = this.view.container.getBoundingClientRect();
    const transformer = this.view.stage.getAbsoluteTransform().copy().invert();
    const point = transformer.point({ x: e.clientX - boundRect.x, y: e.clientY - boundRect.y });
    const position = this.selectTrackRect.position();
    this.selectTrackRect.setAttrs({
      width: point.x - position.x,
      height: point.y - position.y,
    });
    if (!this.selectTrackRect.parent) {
      this.view.helpLayer.add(this.selectTrackRect);
    }
  }
  onDocMouseUp() {
    this.stageMouseDown = false;
    this.selectTrackRect.remove();
    if (!this.stageMouseMove) return;
    const shapeRoot = this.view.getRoot(ToolModelEnum.INSTANCE);
    const objs = shapeRoot?.children || [];
    const rect = {
      x: this.selectTrackRect.x(),
      y: this.selectTrackRect.y(),
      width: this.selectTrackRect.width(),
      height: this.selectTrackRect.height(),
    };
    const selectObjects = objs.filter((e) => {
      return (
        e.toolType != ToolTypeEnum.GROUP &&
        shapeRoot.renderFilter(e) &&
        e.showVisible &&
        isCross(rect, e.getBoundRect())
      );
    });
    this.view.editor.selectObject(selectObjects);
  }
  destroy() {
    this.view.stage.off('mouseover', this.onMouseOver);
    this.view.stage.off('mouseout', this.onMouseOut);
    this.view.stage.off('click', this.onMouseClick);
    this.view.stage.off('mousedown', this.onMouseDown);
    this.view.shapes.off('click', this.onClick);
    document.removeEventListener('mouseup', this.onDocMouseUp);
    document.removeEventListener('mousemove', this.onDocMouseMove);
  }
  addShiftKeyEvent() {
    document.addEventListener('keydown', this.onKeydown);
    document.addEventListener('keyup', this.onKeyup);
  }
  removeShiftKeyEvent() {
    document.removeEventListener('keydown', this.onKeydown);
    document.removeEventListener('keyup', this.onKeyup);
  }
  setTargetDraggable(able: boolean) {
    if (
      whiteList.includes(this.hoverTarget?.className || '') ||
      this.hoverTarget?.parent?.attrs.sign === 'tool-edit-group'
    )
      return;
    this.hoverTarget?.setDraggable(able);
  }

  onMouseClick(e: Konva.KonvaEventObject<MouseEvent>) {
    // if (!this.enabled) return;
    if (e.evt.button !== 0 || !this.selectFlag || !this.stageClickFlag) return;

    if (this.filter && !this.filter(e.target)) return;
    // 点击stage空白处,取消选中
    if (e.target === this.view.stage && !this.view.currentDrawTool) {
      const editor = this.view.editor;
      if (editor.selection.length > 0) editor.selectObject([]);
    }
  }
  onMouseOver(e: Konva.KonvaEventObject<MouseEvent>) {
    if (!this.hoverFlag(e.target)) return;
    if (this.filter && !this.filter(e.target)) return;

    if (e.target === this.view.stage) {
      this.view.setCursor(this.view.cursor || Cursor.auto);
      return;
    }

    let target = e.target as Shape;
    const object = target.object;
    this.hoverTarget = object || target;
    this.setTargetDraggable(e.evt.shiftKey);
    this.addShiftKeyEvent();

    // Skeleton
    if (object && object instanceof Skeleton) {
      if (!target.attrs.skipStateStyle) target.state.hover = true;
      if (!object.attrs.skipStateStyle) this.view.setState(object, { hover: true });
    } else {
      target = object || target;
      if (!target.attrs.skipStateStyle) this.view.setState(target, { hover: true });
    }

    if (this.cursorFlag) {
      this.view.setCursor(target.attrs.cursor || this.view.cursor || Cursor.pointer);
    }
  }

  onMouseOut(e: Konva.KonvaEventObject<MouseEvent>) {
    if (e.target === this.hoverTarget) {
      this.hoverTarget = undefined;
      this.removeShiftKeyEvent();
    }
    if (this.filter && !this.filter(e.target)) return;
    // if (!this.enabled) return;
    // console.log('mouseout', e);
    if (e.target === this.view.stage) {
      return;
    }

    let target = e.target as Shape;
    const object = target.object;

    if (object && object instanceof Skeleton) {
      if (!target.attrs.skipStateStyle) target.state.hover = false;
      if (!object.attrs.skipStateStyle) this.view.setState(object, { hover: false });
    } else {
      target = object || target;
      if (!target.attrs.skipStateStyle) this.view.setState(target, { hover: false });
    }

    if (this.cursorFlag) {
      this.view.setCursor(this.view.cursor || Cursor.auto);
    }
  }

  // click
  onClick(e: Konva.KonvaEventObject<MouseEvent>) {
    // if (!this.enabled) return;
    if (e.evt.button !== 0 || !this.selectFlag) return;

    if (this.filter && !this.filter(e.target)) return;

    const editor = this.view.editor;
    const event = e.evt;
    let target = e.target as Shape;

    // 标记子元素
    if (target.object) {
      if (!(target instanceof SkeletonEdge)) target.object.selectChild = target;
    }
    target = target.object || target;

    if (!target.attrs.selectable) return;

    // console.log(target);
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
      const { selection, selectionMap } = editor;
      let newSelection = [...selection];
      if (selectionMap[target.uuid]) {
        // remove
        newSelection = newSelection.filter((e) => e !== target);
      } else {
        newSelection.push(target);
      }
      editor.selectObject(newSelection);
    } else {
      editor.selectObject(target);
    }
    // editor.mainView.focusView();
  }

  // keyboardEvent
  onKeydown(e: KeyboardEvent) {
    if (ShiftKey.includes(e.key) && this.hoverTarget?.draggable() === false) {
      this.setTargetDraggable(true);
    }
  }
  onKeyup(e: KeyboardEvent) {
    if (ShiftKey.includes(e.key) && this.hoverTarget?.draggable() === true) {
      this.setTargetDraggable(false);
    }
  }

  onMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    // if (!this.enabled) return;
    const isPressCtrl = e.evt.ctrlKey || e.evt.metaKey;
    this.stageMouseMove = false;
    if (!isPressCtrl && !e.evt.shiftKey && !this.view.currentDrawTool) {
      this.stageMouseDown = true;
      const transformer = this.view.stage.getAbsoluteTransform().copy().invert();
      this.selectTrackRect.position(transformer.point({ x: e.evt.offsetX, y: e.evt.offsetY }));
    }
    if (this.view.editor.state.modeConfig.op !== OPType.EDIT) return;
    if (e.evt.button !== 0 || !this.selectFlag || !this.stageClickFlag) return;

    if (!isPressCtrl) return;
    const dragedObject: Shape = this.hoverTarget?.editTarget || this.hoverTarget;
    if (
      ![Line, CircleShape, Cuboid, Ellipse, Polygon, Rect, SplineCurve].some(
        (t) => dragedObject instanceof t,
      ) ||
      !(dragedObject.parent instanceof ShapeRoot)
    )
      return;
    this.copiedObject = dragedObject.cloneThisShape();
    this.copiedObject.setAttrs({ dash: [5, 5] });
    this.copiedStartPos = { x: e.evt.clientX, y: e.evt.clientY };
    this.view.stage.on('mousemove', this.onMouseMove);
    this.view.stage.on('mouseup', this.onMouseUp);
  }
  onMouseMove(e: Konva.KonvaEventObject<MouseEvent>) {
    if (!this.copiedObject || !this.copiedStartPos) return;
    if (!this.copiedObject.parent) {
      this.view.helpLayer.add(this.copiedObject);
    }
    const scale = this.view.stage.scaleX();
    const pos = this.copiedObject.position();
    const coordinate = { x: e.evt.clientX, y: e.evt.clientY };
    let moveX = (coordinate.x - this.copiedStartPos.x) / scale;
    let moveY = (coordinate.y - this.copiedStartPos.y) / scale;
    this.copiedStartPos = coordinate;

    if (this.view.editor.state.config.limitPosition) {
      const { backgroundWidth, backgroundHeight } = this.view;
      const imageRect = { left: 0, top: 0, right: backgroundWidth, bottom: backgroundHeight };
      const rect = this.copiedObject.getBoundRect();
      const { offsetX, offsetY } = transformOffset({ x: 0, y: 0 }, rect, imageRect);
      moveX += offsetX;
      moveY += offsetY;
    }
    this.copiedObject.position({ x: pos.x + moveX, y: pos.y + moveY });
  }
  onMouseUp(e: Konva.KonvaEventObject<MouseEvent>) {
    this.view.stage.off('mousemove', this.onMouseMove);
    this.view.stage.off('mouseup', this.onMouseUp);
    if (!this.copiedObject?.parent) return;
    const editor = this.view.editor;
    this.copiedObject.remove();
    const newObj = this.copiedObject.cloneThisShape();
    newObj.setAttrs({ dash: [] });
    newObj.userData.trackId = undefined;
    newObj.userData.trackName = undefined;
    editor.initIDInfo(newObj);
    editor.cmdManager.withGroup(() => {
      if (editor.state.isSeriesFrame) {
        editor.cmdManager.execute('add-track', editor.createTrackObj(newObj));
      }
      editor.cmdManager.execute('add-object', newObj);
    });
    editor.selectObject(newObj);
    this.copiedObject = undefined;
    this.copiedStartPos = undefined;
    editor.showMsg('success', t('image.successCopy'));
  }
}

SelectHoverAction.prototype.actionName = actionName;

export default SelectHoverAction;
