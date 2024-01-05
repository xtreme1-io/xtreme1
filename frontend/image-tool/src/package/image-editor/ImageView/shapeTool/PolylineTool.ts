import { ITransform, LineDrawMode, MsgType, ToolAction, ToolName, Vector2 } from '../../types';
import { Event } from '../../configs';
import ShapeTool from './ShapeTool';
import ImageView from '../index';
import { Anchor, Line, Shape } from '../shape';
import Konva from 'konva';
import * as utils from '../../utils';

export default class PolylineTool extends ShapeTool {
  name = ToolName.polyline;
  _points?: Vector2[];
  points: Vector2[] = [];
  _minPointNum = 2;
  intervalTm: number = 0;

  holder: Line;
  holderLastLine: Line;
  anchors: Konva.Group;
  currentAnchor: Anchor;

  constructor(view: ImageView) {
    super(view);

    this.holder = new Line();
    this.holderLastLine = new Line({ dash: [5, 5], strokeWidth: 2 });
    this.anchors = new Konva.Group();
    this.currentAnchor = new Anchor();
    this.drawGroup.add(this.holder, this.holderLastLine, this.anchors, this.currentAnchor);

    this.initEditEvent();
    this.changeEvent = 'absoluteTransformChange pointsChange';
  }
  // draw
  draw() {
    console.log('draw');
    this.clearDraw();
    this.clearEvent();
    this.initEvent();
    this.drawGroup.show();
    this.onDrawStart();
  }
  stopDraw() {
    this.drawGroup.hide();
    this.clearDraw();
    this.clearEvent();
    this.onDrawEnd();
  }
  stopCurrentDraw() {
    if (this.points.length < this._minPointNum) return;
    const line = new Line({ points: this.points.slice(0) });
    this.onDraw(line);
    this.onDrawEnd();
    this.clearDraw();
  }
  clearDraw() {
    this.mouseDown = false;
    this.points = [];
    this.holder.hide();
    this.holderLastLine.hide();
    this.anchors.removeChildren();
    this.currentAnchor.hide();
  }
  undoDraw() {
    if (this.points.length === 0) return;

    this.points.pop();
    const children = this.anchors.children || [];
    const anchor = children[children.length - 1] as Anchor;
    anchor?.remove();
    anchor?.destroy();
    if (this.points.length > 0) {
      this.updateHolder();
    } else {
      this.clearDraw();
    }
    this.onDrawChange();
  }
  drawInfo() {
    if (this.object) {
      const len = utils.getLineLength(this.object.attrs.points);
      return `length:${len.toFixed(0)}px`;
    } else if (this.holder.visible()) {
      const points = [...this.points, this.currentAnchor.position()];
      const len = utils.getLineLength(points);
      return `length:${len.toFixed(0)}px`;
    }
    return '';
  }
  onMouseDown(e: Konva.KonvaEventObject<MouseEvent>, point: Vector2) {
    point = this.updateHolderAnchor(point);
    this.addPoint(point);
    this.updateHolder();
  }
  onMouseMove(e: Konva.KonvaEventObject<MouseEvent>, point: Vector2) {
    this.updateHolderAnchor(point);
    this.updateLastHolderLine();
    this.autoAddPoint(point);
    this.onDrawChange();
  }
  autoAddPoint(point: Vector2) {
    if (!this.mouseDowning) return;
    const { polyAuto, polyAutoTm } = this.view.editor.state.toolConfig;
    if (!polyAuto) return;
    if (Date.now() - this.intervalTm < polyAutoTm) return;
    this.intervalTm = Date.now();
    this.addPoint(point);
    this.updateHolder();
  }
  addPoint(point: Vector2) {
    this.points.push(point);
    this.anchors.add(new Anchor({ ...point }));
  }
  updateHolder() {
    this.holder.show();
    this.holder.setAttrs({ points: this.points });
    this.updateHolderAnchor(this.currentAnchor.attrs.originPos);
    this.updateLastHolderLine();
  }
  updateLastHolderLine() {
    const endPos = this.currentAnchor.position();
    this.holderLastLine.setAttrs({
      points: [this.points[this.points.length - 1], endPos],
    });
    this.holderLastLine.show();
    this.currentAnchor.show();
  }
  updateHolderAnchor(pos: Vector2) {
    if (!pos) return { x: 0, y: 0 };
    const mode = this.view.editor.state.toolConfig.lineMode;
    this.currentAnchor.setAttrs({ originPos: pos });
    const lastPoint = this.points[this.points.length - 1];
    if (mode === LineDrawMode.horizontal && lastPoint) {
      pos = { x: pos.x, y: lastPoint.y };
    } else if (mode === LineDrawMode.vertical && lastPoint) {
      pos = { x: lastPoint.x, y: pos.y };
    }
    this.currentAnchor.position(pos);
    return pos;
  }
  doing(): boolean {
    return this.points.length > 0;
  }

  // edit
  edit(object: Shape) {
    this.removeChangeEvent();
    this.object = object;
    this.initEditObject();
    this.updateEditObject();
    this.editGroup.show();
    this.addChangEvent();
  }
  stopEdit() {
    this.removeChangeEvent();
    this.object = undefined;
    this.editGroup.hide();
  }
  initEditObject() {
    if (!this.object) return;
    const object = this.object as Line;
    const { points } = object.attrs;
    // clear
    const children = [...(this.editGroup.children || [])];
    children.forEach((e) => e.destroy());
    this._points = points;
    const realPoints = utils.getShapeRealPoint(object, points);
    realPoints.forEach((p, index) => {
      if (index >= realPoints.length - 1) return;
      const nextP = realPoints[index + 1];
      const line = new Line({
        lineIndex: index,
        draggable: false,
        opacity: 0,
        points: [p, nextP],
      });
      this.editGroup.add(line);
    });

    realPoints.forEach((p, index) => {
      const anchor = new Anchor({ pointIndex: index, x: p.x, y: p.y });
      this.editGroup.add(anchor);
    });
    this.selectAnchorIndex(-1);
  }
  initEditEvent() {
    this.editGroup.on(Event.DRAG_START, (e: Konva.KonvaEventObject<MouseEvent>) => {
      this.onEditStart();
    });

    this.editGroup.on(Event.DRAG_MOVE, (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!this.object) return;
      const target = e.target;
      if (target instanceof Anchor) {
        const { x, y, points } = this.object.attrs;
        const pointIndex = target.anchorIndex as number;
        const anchorX = target.attrs.x as number;
        const anchorY = target.attrs.y as number;
        points[pointIndex].x = anchorX - x;
        points[pointIndex].y = anchorY - y;
        this.object.setAttrs({ points });
      }
      this.onEditChange();
    });

    this.editGroup.on(Event.DRAG_END, () => {
      this.onEditEnd();
    });

    // line
    this.editGroup.on(Event.CLICK, (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!this.object) return;
      const target = e.target;
      const object = this.object as Line;
      if (target instanceof Line) {
        const { x, y, points } = object.attrs;
        const lineIndex = target.attrs.lineIndex as number;
        this.onEditStart();
        let relPos = this.editGroup.getRelativePointerPosition() || { x: 0, y: 0 };
        relPos = utils.getPointOnLine(relPos, target.attrs.points[0], target.attrs.points[1]);
        points.splice(lineIndex + 1, 0, { x: relPos.x - x, y: relPos.y - y });
        this._points = undefined;
        this.updateAttrsInDataManager({ points });
        this.onEditEnd();
      } else if (target instanceof Anchor) {
        this.updateAnchors(target.attrs.pointIndex);
      }
    });
  }
  updateEditObject() {
    if (!this.object) return;
    const { points } = this.object.attrs;
    const children = this.editGroup.children || [];
    this.editGroup.setAttrs({ x: 0, y: 0 });
    const realPoints = utils.getShapeRealPoint(this.object, points);

    children.forEach((e) => {
      if (e instanceof Anchor) {
        const anchor = e as Anchor;
        const pointIndex = anchor.anchorIndex as number;
        const p = realPoints[pointIndex];
        const fill = this.object?.attrs.stroke as string;
        anchor.updateStateStyles({ general: { fill } });
        anchor.setAttrs({ x: p.x, y: p.y, fill });
      } else {
        const line = e as Line;
        const lineIndex = line.attrs.lineIndex as number;
        const p1 = realPoints[lineIndex];
        const p2 = realPoints[lineIndex + 1];
        line.setAttrs({ points: [p1, p2], x: 0, y: 0 });
      }
    });
  }
  updateAnchors(idx: number = -1) {
    const anchors = this.editGroup.children?.filter((e) => e instanceof Anchor) as Anchor[];
    if (!anchors || anchors.length === 0) return;
    anchors.forEach((e) => {
      e.state.select = idx === e.anchorIndex;
    });
    this.view.updateStateStyle(anchors);
    this.selectAnchorIndex(idx);
  }
  onObjectChange() {
    if (!this.object) return;

    const object = this.object as Line;
    const { points } = object.attrs;

    if (this._points !== points) {
      this.initEditObject();
    }
    this.updateEditObject();
  }
  checkEditAction(action: ToolAction) {
    return [ToolAction.del, ToolAction.esc].includes(action) && this.selectAnchorIndex() !== -1;
  }
  onToolDelete() {
    if (!this.object) return;
    const idx = this.selectAnchorIndex();
    const anchor = this.editGroup.children?.find((e) => (e as Anchor).anchorIndex === idx);
    if (!anchor) return;

    const { points } = this.object.attrs;
    if (points.length <= this._minPointNum) {
      this.view.editor.showMsg(
        MsgType.warning,
        `The line has at least ${this._minPointNum} points`,
      );
      return;
    }

    this.onEditStart();
    points.splice(idx, 1);
    this._points = undefined;
    this.updateAttrsInDataManager({ points });
    this.onEditEnd();
  }
  updateAttrsInDataManager(attrs: ITransform) {
    if (!this.object) return;
    this.view.editor.dataManager.setAnnotatesTransform(this.object, attrs);
  }
  clearEdit() {
    this.updateAnchors(-1);
  }
}
