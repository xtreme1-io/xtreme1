import hotkeys from 'hotkeys-js';
import { Line, Circle, Shape, GroupObject } from '../shape';
import { Vector2, ToolAction, IPointsData, ToolName, LineDrawModeEnum } from '../../types';
import ShapeTool from './ShapeTool';
import Konva from 'konva';
import ImageView from '../index';
import { getPointOnLine } from '../utils/common';
import { constraintInImage, getLineLength } from '../../utils';
import { Event, sharedColor } from '../../config';
import { KonvaEventObject } from 'konva/lib/Node';
import SubLineTool from './SubLineTool';
import { t } from '@/lang';

export default class LineTool extends ShapeTool {
  name = ToolName.line;
  currentAnchor: Circle;
  points: Vector2[] = [];
  // 绘制过程中产生的点和线
  anchors: Konva.Group;
  holderLines: Konva.Group;
  holderLastLine: Line;
  autoPointTm: number = 0;
  //
  _points: any = undefined;
  _minPointNum = 2;
  _editTool?: SubLineTool;

  constructor(view: ImageView) {
    super(view);

    // draw
    this.holderLastLine = new Line({ dash: [5, 5], strokeWidth: 2 });
    this.currentAnchor = new Circle();
    this.anchors = new Konva.Group();
    this.holderLines = new Konva.Group();
    this.drawGroup.add(this.holderLines, this.holderLastLine, this.anchors, this.currentAnchor);

    // edit
    this.initEditEvent();
    this.changeEvent = 'absoluteTransformChange pointsChange';
    this.splitLine = this.splitLine.bind(this);
    this.modifyPoints = this.modifyPoints.bind(this);
  }
  // draw
  draw() {
    console.log('draw');
    this.clearDraw();
    this.clearEvent();
    this.initEvent();
    this.drawGroup.show();
    // hook
    this.onDrawStart();
  }
  stopDraw() {
    this.drawGroup.hide();
    this.clearDraw();
    this.clearEvent();
    this.onDrawEnd();
  }
  stopCurrentDraw() {
    const line = this.points.length > 1 ? new Line({ points: this.points.slice(0) }) : undefined;
    this.onDraw(line);
    this.onDrawEnd();
    this.clearDraw();
  }
  undoDraw() {
    if (this.points.length === 0) return;

    this.points.pop();
    const children = this.anchors.children || [];
    const anchor = children[children.length - 1] as Circle;
    anchor?.remove();
    anchor?.destroy();

    if (this.points.length > 0) {
      this.updateHolder();
    } else {
      this.clearDraw();
    }

    this.onDrawChange();
  }
  clearDraw() {
    this.mouseDown = false;
    this.points = [];

    this.anchors.removeChildren();
    this.holderLines.removeChildren();

    this.holderLastLine.hide();
    this.currentAnchor.hide();
  }
  drawInfo() {
    if (this.drawGroup.visible() || this.object) {
      const { points } = this.object?.attrs || this;
      if (points.length === 0) return '';
      const arr = [...points];
      if (this.drawGroup.visible()) arr.push(this.currentAnchor.position());
      const len = getLineLength(arr);
      return `length:${len.toFixed(0)}px`;
    }
    return '';
  }

  onMouseDown(e: Konva.KonvaEventObject<MouseEvent>, point: Vector2) {
    // this.currentAnchor.position(point);
    point = this.updateHolderAnchor(point);
    this.addPoint(point);
    this.updateHolder();
  }
  onMouseMove(e: Konva.KonvaEventObject<MouseEvent>, point: Vector2) {
    // this.currentAnchor.position(point);
    this.updateHolderAnchor(point);
    this.updateLastHolderLine();
    this.autoAddPoint(point);
    this.onDrawChange();
  }
  autoAddPoint(point: Vector2) {
    if (!this.mouseDowning) return;
    const { polyAuto, polyAutoTm } = this.view.editor.state.toolConfig;
    if (!polyAuto) return;
    if (Date.now() - this.autoPointTm < polyAutoTm) return;
    this.autoPointTm = Date.now();
    this.addPoint(point);
    this.updateHolder();
  }
  doing(): boolean {
    return this.points.length > 0;
  }
  updateHolder() {
    this.holderLines.removeChildren();
    if (this.points.length > 0) {
      this.points.forEach((p, i) => {
        const nextP = this.points[i + 1];
        if (!nextP) return;
        const a = this.anchors.children?.[i] || { attrs: {} };
        const nextAnchor = this.anchors.children?.[i + 1] || { attrs: {} };
        const isShareLine =
          a.attrs.referObject &&
          a.attrs.referObject === nextAnchor.attrs.referObject &&
          a.attrs.referTypeIndex === nextAnchor.attrs.referTypeIndex;
        const newL = new Line({
          points: [p, nextP],
          strokeWidth: 2,
          stroke: isShareLine ? sharedColor : this.drawConfig.stroke,
        });
        this.holderLines.add(newL);
      });
      this.updateHolderAnchor(this.currentAnchor.attrs.originPos);
      this.updateLastHolderLine();
    }
  }
  updateLastHolderLine() {
    const endPos = this.currentAnchor.position();
    this.holderLastLine.setAttrs({
      points: [this.points[this.points.length - 1], endPos],
      ...this.drawConfig,
    });
    this.holderLastLine.show();
    this.currentAnchor.show();
  }
  updateHolderAnchor(pos: Vector2) {
    if (!pos) return { x: 0, y: 0 };
    const mode = this.view.editor.state.toolConfig.lineMode;
    this.currentAnchor.setAttrs({ originPos: pos, ...this.drawConfig });
    const lastPoint = this.points[this.points.length - 1];
    if (mode === LineDrawModeEnum.Horizontal && lastPoint) {
      pos = { x: pos.x, y: lastPoint.y };
    } else if (mode === LineDrawModeEnum.Vertical && lastPoint) {
      pos = { x: lastPoint.x, y: pos.y };
    }
    this.currentAnchor.position(pos);
    return pos;
  }

  addPoint(point: Vector2) {
    const lastPoint = this.points[this.points.length - 1];
    if (point.x == lastPoint?.x && point.y == lastPoint?.y) return;
    this.points.push(point);
    this.anchors.add(new Circle({ x: point.x, y: point.y, ...this.drawConfig }));
  }

  // edit
  edit(object: Shape) {
    if (this.object) {
      this.removeChangeEvent();
    }

    this.object = object;
    this.initEditObject();
    this.updateEditObject();
    this.editGroup.show();

    this.addLineToolEvent();
    super.edit(object);
  }
  stopEdit() {
    this.removeLineToolEvent();
    this.object = undefined;
    this.editGroup.hide();
    super.stopEdit();
  }

  initEditObject() {
    if (!this.object) return;

    const object = this.object as Line;
    const { points, x, y } = object.attrs;
    // clear
    const children = [...(this.editGroup.children || [])];
    children.forEach((e) => e.destroy());
    // this.editGroup.removeChildren();

    this._points = points;

    points.forEach((p, index) => {
      if (index >= points.length - 1) return;
      const nextP = points[index + 1];
      const line = new Line({
        lineIndex: index,
        hitStrokeWidth: 6,
        draggable: false,
        opacity: 0,
        points: [
          { x: x + p.x, y: y + p.y },
          { x: x + nextP.x, y: y + nextP.y },
        ],
      });
      line.editTarget = this.object;
      this.editGroup.add(line);
    });

    points.forEach((p, index) => {
      const anchor = new Circle({
        pointIndex: index,
        x: x + p.x,
        y: y + p.y,
        stroke: p.attr?.color || object.attrs.stroke,
      });
      anchor.on('mouseover', this.onAnchorMouseOver.bind(this));
      anchor.on('mouseout', this.onAnchorMouseOut.bind(this));
      anchor.dragBoundFunc(constraintInImage(anchor, this.view));
      anchor.editTarget = this.object;
      this.editGroup.add(anchor);
    });
    this.selectAnchorIndex(-1);
  }
  onAnchorMouseOver(event: KonvaEventObject<any>) {
    const anchor = event.target;
    const idx = anchor.attrs.pointIndex;
    const type = anchor.attrs.typeIndex;
    this.hoverIndex(idx, type);
    this.updateAttrHtml();
  }
  onAnchorMouseOut(event: KonvaEventObject<any>) {
    this.hoverIndex(-1, -1);
    this.updateAttrHtml();
  }
  initEditEvent() {
    this.editGroup.on(Event.DRAG_START, (e: Konva.KonvaEventObject<MouseEvent>) => {
      this.onEditStart();
    });

    this.editGroup.on(Event.DRAG_MOVE, (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!this.object) return;
      const target = e.target;
      if (target instanceof Circle) {
        const { x, y, points } = this.object.attrs;
        const pointIndex = target.attrs.pointIndex as number;
        const anchorX = target.attrs.x as number;
        const anchorY = target.attrs.y as number;
        points[pointIndex].x = anchorX - x;
        points[pointIndex].y = anchorY - y;
        this.object.setAttrs({ points });
      }
      this.onEditChange();
    });

    this.editGroup.on(Event.DRAG_END, (e: Konva.KonvaEventObject<MouseEvent>) => {
      // console.log('dragstend');
      this.onEditEnd();
    });

    // line
    this.editGroup.on(Event.CLICK, (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!this.object) return;
      const target = e.target;
      const object = this.object as Line;
      if (target instanceof Line) {
        if (this._editTool) return;
        const { x, y, points } = object.attrs;
        const lineIndex = target.attrs.lineIndex as number;

        this.onEditStart();
        let relPos = this.editGroup.getRelativePointerPosition() || { x: 0, y: 0 };
        relPos = getPointOnLine(relPos, target.attrs.points[0], target.attrs.points[1]);
        points.splice(lineIndex + 1, 0, { x: relPos.x - x, y: relPos.y - y });
        this._points = undefined;
        this.updateAttrsInDataManager({ points });
        this.onEditEnd();
      } else if (target instanceof Circle) {
        if (this._editTool) {
          this.completeModify(target.attrs.pointIndex);
        } else {
          this.updateAnchors(target.attrs.pointIndex);
        }
      }
    });
  }
  updateAnchors(idx: number = -1) {
    const anchors = this.editGroup.children?.filter((e) => e instanceof Circle) as Circle[];
    if (!anchors || anchors.length === 0) return;
    anchors.forEach((e) => {
      e.state.select = idx === e.attrs.pointIndex;
    });
    this.view.updateStateStyle(anchors);
    this.selectAnchorIndex(idx);
    this.updateAttrHtml();
  }

  updateEditObject() {
    if (!this.object) return;
    const { points, x, y } = this.object.attrs;
    const children = this.editGroup.children || [];

    // update parent pos
    const parent = this.object.parent;
    if (parent && parent instanceof GroupObject) {
      this.editGroup.setAttrs(parent.position());
    } else {
      this.editGroup.setAttrs({ x: 0, y: 0 });
    }

    children.forEach((e) => {
      if (e instanceof Circle) {
        const anchor = e as Circle;
        const pointIndex = anchor.attrs.pointIndex as number;
        const p = points[pointIndex];
        anchor.setAttrs({ x: x + p.x, y: y + p.y });
      } else {
        const line = e as Line;
        const lineIndex = line.attrs.lineIndex as number;
        const p1 = points[lineIndex];
        const p2 = points[lineIndex + 1];

        const linePoints = line.attrs.points;
        linePoints[0].x = x + p1.x;
        linePoints[0].y = y + p1.y;
        linePoints[1].x = x + p2.x;
        linePoints[1].y = y + p2.y;
        line.setAttrs({ points: linePoints, x: 0, y: 0 });
      }
    });
  }

  onObjectChange() {
    if (!this.object) return;

    const object = this.object as Line;
    const { points } = object.attrs;

    if (this._points !== points) {
      console.log('onObjectChange initEditObject');
      this.initEditObject();
    }
    this.updateEditObject();
  }
  checkEditAction(action: ToolAction) {
    return (
      [ToolAction.del, ToolAction.esc, ToolAction.undo].includes(action) &&
      this.selectAnchorIndex() !== -1
    );
  }
  onToolDelete() {
    if (!this.object) return;
    const idx = this.selectAnchorIndex();
    const anchor = this.editGroup.children?.find((e) => e.attrs.pointIndex === idx);
    if (!anchor) return;

    const { points } = this.object.attrs;
    if (points.length <= this._minPointNum) {
      this.view.editor.showMsg('warning', `The line has at least ${this._minPointNum} points`);
      return;
    }

    this.onEditStart();
    points.splice(idx, 1);
    this._points = undefined;
    this.updateAttrsInDataManager({ points });
    this.onEditEnd();
  }
  updateAttrsInDataManager(attrs: IPointsData) {
    if (!this.object) return;
    this.view.editor.dataManager.setAnnotatesTransform(this.object, attrs);
  }
  splitLine() {
    const idx = this.selectAnchorIndex();
    if (idx === -1 || !this.object) return;
    const points: Vector2[] = this.object.attrs.points;
    if (idx === 0 || idx + 1 === points.length) {
      this.view.editor.showMsg('warning', t('image.splitLineErrorTips'));
      return;
    }
    this.view.splitLine(this.object as Line, idx);
    this.view.editor.showMsg('success', t('image.splitLineSuccessTips'));
  }
  completeModify(second: number) {
    const first = this.selectAnchorIndex();
    if (first === -1 || !this.object || !this._editTool) return;
    if (first === second) return;
    const start = Math.min(first, second) + 1;
    const end = Math.max(first, second);
    const { points } = this.object.attrs;
    const arr0 = points.slice(0, start);
    const arr2 = points.slice(end);
    const arr1 = this._editTool.points.slice(1, this._editTool.points.length - 1);
    const newPoints = [...arr0, ...arr1, ...arr2];
    this.view.editor.cmdManager.execute('update-points', {
      object: this.object,
      pointsData: { points: newPoints },
    });
    this.clearTool();
  }
  modifyPoints() {
    const idx = this.selectAnchorIndex();
    if (idx === -1 || !this.object) return;
    this.clearTool();
    this._editTool = new SubLineTool(this.view, this);
    try {
      this._editTool.draw();
      const point = this.object.attrs.points[idx];
      this._editTool.setFirstPoint(point, idx);
    } catch (error) {
      console.error(error);
    }
  }
  addLineToolEvent() {
    this.addChangEvent();
    hotkeys('shift+f', this.splitLine);
    hotkeys('shift+e', this.modifyPoints);
  }
  removeLineToolEvent() {
    if (this.object) {
      this.removeChangeEvent();
    }
    hotkeys.unbind('shift+f');
  }
  clearEdit() {
    this.updateAnchors(-1);
    this.clearTool();
  }
  clearTool() {
    if (!this._editTool) return;
    this._editTool.destroySelf();
    this._editTool = undefined;
  }
}
