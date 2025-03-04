import { Circle, GroupObject, Shape } from '../shape';
import { ToolName, Vector2 } from '../../types';
import ShapeTool from './ShapeTool';
import Konva from 'konva';
import ImageView from '../index';
import * as utils from '../../utils';
import { Cursor, Event, getCursor } from '../../config';
import CircleShape from '../shape/CircleShape';

// 矩形锚点 id枚举(左上开始,顺时针)
enum Anchors {
  CENTER = 'center',
  RING = 'ring',
}

export default class CircleTool extends ShapeTool {
  name = ToolName['shape-circle'];
  // draw
  currentAnchor: Circle;
  points: Vector2[] = [];
  holder: CircleShape;
  anchors: Konva.Group;
  // edit
  object: CircleShape | undefined = undefined;
  editObjectMap = {} as Record<Anchors, Shape | Konva.Shape>;
  // drag
  dragging = false;
  dragObject!: any;
  dragLastPos: Vector2 | undefined;
  constructor(view: ImageView) {
    super(view);

    // draw
    this.holder = new CircleShape({
      dash: [5, 5],
    });
    this.currentAnchor = new Circle();
    this.anchors = new Konva.Group();
    this.drawGroup.add(this.holder, this.anchors, this.currentAnchor);

    // edit
    this.initEditObject();
    this.initEditEvent();
    this.changeEvent = 'radiusChange absoluteTransformChange';
  }
  doing(): boolean {
    return this.points.length > 0;
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
  isValid(position: Vector2) {
    if (this.points.length <= 0) return super.isValid(position);
    return true;
  }
  stopDraw() {
    this.clearDraw();
    this.clearEvent();
    this.drawGroup.hide();
    this.onDrawEnd();
  }
  stopCurrentDraw() {
    let circle = undefined;
    if (this.points.length === 2) {
      circle = new CircleShape();
      const [startPos, endPos] = this.points;
      const distance = Math.sqrt(
        Math.pow(startPos.x - endPos.x, 2) + Math.pow(startPos.y - endPos.y, 2),
      );
      circle.position(startPos);
      circle.radius(distance);
    }
    this.onDraw(circle);
    this.clearDraw();
  }
  clearDraw() {
    this.mouseDown = false;
    this.points = [];
    this.holder.hide();
    this.currentAnchor.hide();
    this.anchors.removeChildren();
    this.onDrawClear();
  }
  drawInfo() {
    if (this.drawGroup.visible() || this.object) {
      const { radius } = this.object?.attrs || this.holder.attrs;
      if (!this.object && this.points.length === 0) return '';
      const area = this.object?.area() ?? this.holder.area();
      return `radius:${radius.toFixed(0)}px; area:${area.toFixed(0)}`;
    }
    return '';
  }

  onMouseDown(e: Konva.KonvaEventObject<MouseEvent>, point: Vector2) {
    this.addPoint(point);

    if (this.points.length >= 2) {
      this.stopCurrentDraw();
    }
  }
  onMouseMove(e: Konva.KonvaEventObject<MouseEvent>, point: Vector2) {
    this.currentAnchor.position(point);
    this.updateHolder();
    this.onDrawChange();
  }

  updateHolder() {
    const startPos = this.points[0];
    const endPos = this.currentAnchor.position();
    const distance = Math.sqrt(
      Math.pow(startPos.x - endPos.x, 2) + Math.pow(startPos.y - endPos.y, 2),
    );
    this.holder.setAttrs({ ...startPos, radius: distance, ...this.drawConfig });

    this.holder.show();
    this.currentAnchor.show();
  }

  addPoint(point: Vector2) {
    const pre = this.points[this.points.length - 1];
    if (pre) {
      const distance = Math.sqrt(Math.pow(pre.x - point.x, 2) + Math.pow(pre.y - point.y, 2));
      if (distance <= 0.1) return;
    }
    this.points.push(point);
    this.anchors.add(new Circle({ x: point.x, y: point.y, ...this.drawConfig }));
  }

  // edit
  edit(object: CircleShape) {
    if (this.object) {
      this.removeChangeEvent();
    }

    this.object = object;
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
    const centerAnchor = new Circle({ id: Anchors.CENTER, draggable: true });
    centerAnchor.dragBoundFunc(utils.constraintInImage(centerAnchor, this.view));
    // centerAnchor.listening(false);
    const ringAnchor = new Konva.Ring({
      id: Anchors.RING,
      cursor: Cursor.ewResize,
    } as any);
    this.editGroup.add(ringAnchor);
    this.editGroup.add(centerAnchor);
    this.editObjectMap[Anchors.RING] = ringAnchor;
    this.editObjectMap[Anchors.CENTER] = centerAnchor;
  }

  initEditEvent() {
    const ring = this.editObjectMap[Anchors.RING];
    if (ring) {
      const mouseMove = () => {
        const point = this.view.stage.getRelativePointerPosition() as Vector2;
        if (this.object) {
          const { x, y } = this.object.attrs;
          const radius = utils.distance({ x, y }, point);
          this.object.setAttrs({ radius });
          this.updateEditObject();
          this.onEditChange();
        }
      };
      const mouseUp = (e: MouseEvent) => {
        this.onEditEnd();
        this.dragging = false;
        document.removeEventListener(Event.MOUSE_MOVE, mouseMove);
        document.removeEventListener(Event.MOUSE_UP, mouseUp);
      };
      ring.on(Event.MOUSE_DOWN, (evt) => {
        this.onEditStart();
        this.dragging = true;
        document.addEventListener(Event.MOUSE_MOVE, mouseMove);
        document.addEventListener(Event.MOUSE_UP, mouseUp);
      });
      ring.on(Event.MOUSE_ENTER, () => {
        if (!this.object || this.dragging) return;
        const { x, y } = this.object.attrs;
        const point = this.view.stage.getRelativePointerPosition() as Vector2;
        const deg = utils.computeDegree({ x, y }, point);
        const degCursor = getCursor(deg) || '';
        this.view.setCursor(degCursor);
      });
    }
    const centerAnchor = this.editObjectMap[Anchors.CENTER];
    if (centerAnchor) {
      centerAnchor.on(Event.DRAG_START, () => {
        this.onEditStart();
      });
      centerAnchor.on(Event.DRAG_MOVE, () => {
        this.object?.setAttrs({ ...centerAnchor.position() });
        this.onEditChange();
      });
      centerAnchor.on(Event.DRAG_END, () => {
        this.onEditEnd();
      });
    }
  }
  updateEditObject() {
    const object = this.object;
    if (!object) return;
    const { radius, fill } = object.attrs;
    const parent = object.parent;
    if (parent && parent instanceof GroupObject) {
      this.editGroup.setAttrs(parent.position());
    } else {
      this.editGroup.setAttrs({ x: 0, y: 0 });
    }
    const children = this.editGroup.children || [];
    const scale = 1 / this.view.stage.scaleX();
    const ringWidth = scale * 2;
    children.forEach((e) => {
      if (e === this.dragObject) return;
      const { id } = e.attrs;
      if (id === Anchors.CENTER) {
        const anchor = e as Circle;
        anchor.stroke(object.attrs.stroke as string);
        anchor.position(object.position());
      } else if (id === Anchors.RING) {
        const anchor = e as Konva.Ring;
        anchor.fill(fill);
        anchor.innerRadius(radius - ringWidth);
        anchor.outerRadius(radius + ringWidth);
        anchor.position(object.position());
      }
    });
  }

  onObjectChange() {
    if (this.dragging) return;
    this.updateEditObject();
  }
}
