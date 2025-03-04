import { Line, Circle, Shape, SplineCurve, GroupObject } from '../shape';
import { Vector2, ToolAction, ToolName } from '../../types';
import ShapeTool from './ShapeTool';
import Konva from 'konva';
import ImageView from '../index';
import { constraintInImage } from '../../utils';
import { Event } from '../../config';
import { KonvaEventObject } from 'konva/lib/Node';

export default class SplineCurveTool extends ShapeTool {
  name = ToolName['spline-curve'];
  currentAnchor: Circle;
  points: Vector2[] = [];
  holder: SplineCurve;
  holderLastLine: Line;
  anchors: Konva.Group;
  defaultTension = 0.5;
  //
  _points: any = undefined;
  _tension: number = this.defaultTension;
  _minPointNum = 2;
  constructor(view: ImageView) {
    super(view);

    // draw
    this.holder = new SplineCurve();
    this.holderLastLine = new Line();
    this.currentAnchor = new Circle();
    this.anchors = new Konva.Group();
    this.drawGroup.add(this.holder, this.anchors, this.holderLastLine, this.currentAnchor);

    // edit
    this.initEditEvent();
    this.changeEvent = 'absoluteTransformChange pointsChange';
  }
  set tension(value: number) {
    this._tension = value;
    this.holder.setAttr('tension', value);
  }
  get tension() {
    return this._tension;
  }
  doing(): boolean {
    return this.points.length > 0;
  }
  onAnchorMouseOver(event: KonvaEventObject<any>) {
    const anchor = event.target;
    const idx = anchor.attrs.pointIndex;
    this.hoverIndex(idx);
    this.updateAttrHtml();
  }
  onAnchorMouseOut(event: KonvaEventObject<any>) {
    this.hoverIndex(-1);
    this.updateAttrHtml();
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
    const curve =
      this.points.length >= 2
        ? new SplineCurve({ points: this.points.slice(0), tension: this.tension })
        : undefined;
    this.onDraw(curve);
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

    //
    this.anchors.removeChildren();
    this.holder.hide();
    this.holderLastLine.hide();
    this.currentAnchor.hide();
    // this.onDrawEnd();
  }

  onMouseDown(e: Konva.KonvaEventObject<MouseEvent>, point: Vector2) {
    // let stage = this.view.stage;
    // let point = stage.getRelativePointerPosition();
    this.addPoint(point);
  }
  onMouseMove(e: Konva.KonvaEventObject<MouseEvent>, point: Vector2) {
    // let stage = this.view.stage;
    // let point = stage.getRelativePointerPosition();
    this.currentAnchor.position(point);
    this.updateHolder();
    this.onDrawChange();
  }

  updateHolder() {
    const endPos = this.currentAnchor.position();
    this.holder.setAttrs({
      points: this.points,
      ...this.drawConfig,
    });

    this.holderLastLine.setAttrs({
      points: [this.points[this.points.length - 1], endPos],
      ...this.drawConfig,
    });
    this.currentAnchor.setAttrs({ ...this.drawConfig });

    this.holder.setAttrs({ points: [...this.points, endPos] });
    this.holder.show();
    this.holderLastLine.setAttrs({ visible: this.points.length < 2 });
    this.currentAnchor.show();
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

    this.addChangEvent();
  }
  stopEdit() {
    if (this.object) {
      this.removeChangeEvent();
    }
    this.object = undefined;
    this.editGroup.hide();
  }

  initEditObject() {
    if (!this.object) return;

    const object = this.object as SplineCurve;
    const { points } = object.attrs;
    // clear
    this.editGroup.destroyChildren();

    const start = points[0];
    const end = points[points.length - 1];
    const lines: Line[] = [];
    const anchors: Circle[] = [];
    points.forEach((p, index) => {
      const anchor = new Circle({ pointIndex: index });
      anchor.on('mouseover', this.onAnchorMouseOver.bind(this));
      anchor.on('mouseout', this.onAnchorMouseOut.bind(this));
      anchor.dragBoundFunc(constraintInImage(anchor, this.view));
      anchors.push(anchor);
    });
    if (points.length === 2) {
      lines.push(new Line({ lineIndex: 0, draggable: false, opacity: 0, points: [start, end] }));
    } else {
      lines.push(
        ...object.getExpandData().map((c, index) => {
          return new Line({
            draggable: false,
            lineIndex: index,
            opacity: 0,
            sceneFunc(context, shape) {
              const expandConfig = object.getExpandData();
              const c = expandConfig[index];
              const p = c.points;
              context.beginPath();
              context.moveTo(p[0].x, p[0].y);
              if (c.type == 'quadratic') {
                context.quadraticCurveTo(p[1].x, p[1].y, p[2].x, p[2].y);
              } else {
                context.bezierCurveTo(p[1].x, p[1].y, p[2].x, p[2].y, p[3].x, p[3].y);
              }
              context.strokeShape(shape);
            },
          });
        }),
      );
    }
    lines.forEach((line) => {
      line.on(Event.CLICK, (e) => {
        const stage = line.getStage();
        if (!stage) return;
        const point = stage
          .getAbsoluteTransform()
          .copy()
          .invert()
          .point({ x: e.evt.offsetX, y: e.evt.offsetY });
        const clonePoints = object.attrs.points.toSpliced(line.attrs.lineIndex + 1, -1, point);
        this.onEditStart();
        this.view.editor.dataManager.setAnnotatesTransform(object, { points: clonePoints });
        this.onEditEnd();
      });
    });
    this.editGroup.add(...lines);
    this.editGroup.add(...anchors);

    this._points = points;
    this.updateAnchors(-1);
  }

  initEditEvent() {
    this.editGroup.on(Event.DRAG_START, (e: Konva.KonvaEventObject<MouseEvent>) => {
      this.onEditStart();
    });

    this.editGroup.on(Event.DRAG_MOVE, (e: Konva.KonvaEventObject<MouseEvent>) => {
      const target = e.target as Circle;
      if (!this.object || !(target instanceof Circle)) return;

      const { x, y, points } = this.object.attrs;
      const pointIndex = target.attrs.pointIndex as number;
      const anchorX = target.attrs.x as number;
      const anchorY = target.attrs.y as number;
      points[pointIndex].x = anchorX - x;
      points[pointIndex].y = anchorY - y;
      this.object.setAttrs({ points });
      this.onEditChange();
    });

    this.editGroup.on(Event.DRAG_END, (e: Konva.KonvaEventObject<MouseEvent>) => {
      this.onEditEnd();
    });
    this.editGroup.on(Event.CLICK, (e: Konva.KonvaEventObject<MouseEvent>) => {
      const target = e.target;
      if (!this.object || !(target instanceof Circle)) return;
      this.updateAnchors(target.attrs?.pointIndex);
    });
  }

  updateEditObject() {
    if (!this.object) return;

    const object = this.object;
    const { points, x, y } = this.object.attrs;
    const children = (this.editGroup.children || []) as Circle[];

    // update parent pos
    const parent = object.parent;
    if (parent && parent instanceof GroupObject) {
      this.editGroup.setAttrs(parent.position());
    } else {
      this.editGroup.setAttrs({ x: 0, y: 0 });
    }
    children.forEach((anchor) => {
      const pointIndex = anchor.attrs.pointIndex;
      if (anchor instanceof Circle || pointIndex !== undefined) {
        const p = points[pointIndex];
        const stroke = p.attr?.color || object.attrs.stroke;
        anchor.setAttrs({ x: x + p.x, y: y + p.y, stroke });
      }
    });
  }

  updateAnchors(idx: number = -1) {
    const anchors = this.editGroup.children.filter((e) => e instanceof Circle) as Circle[];
    if (!anchors || anchors.length === 0) return;
    anchors.forEach((e, i) => {
      e.state.select = idx === i;
    });
    this.view.updateStateStyle(anchors);
    this.selectAnchorIndex(idx);
    this.updateAttrHtml();
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
    this.object.setAttrs({ points });
    this.onEditChange();
    this.onEditEnd();
  }
  clearEdit() {
    this.updateAnchors(-1);
  }
}
