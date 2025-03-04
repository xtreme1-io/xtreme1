import { Rect, Circle, Line, GroupObject, Cuboid, Polygon } from '../shape';
import { IRectOption, ToolName, Vector2 } from '../../types';
import ShapeTool from './ShapeTool';
import Konva from 'konva';
import ImageView from '../index';
import * as utils from '../../utils';

export default class CuboidTool extends ShapeTool {
  name = ToolName.cuboid;
  // draw
  anchorList: number[] = [0, 1, 2, 3, 4, 5, 6, 7];
  points: Vector2[] = [];
  anchors: Konva.Group;
  rects: Konva.Group;
  currentAnchor: Circle;
  holder: Rect;
  holderUpdate: boolean = false;
  // edit
  object: Cuboid | undefined = undefined;
  // drag
  dragging = false;
  dragObject!: any;
  dragLastPos?: Vector2;
  constructor(view: ImageView) {
    super(view);

    // draw
    this.holder = new Rect({ strokeWidth: 2 });
    this.currentAnchor = new Circle();
    this.anchors = new Konva.Group();
    this.rects = new Konva.Group();
    this.drawGroup.add(this.holder, this.rects, this.anchors, this.currentAnchor);

    // edit
    this.initEditObject();
    this.initEditEvent();
    this.changeEvent = 'absoluteTransformChange pointsChange';
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
  stopDraw() {
    this.clearDraw();
    this.clearEvent();
    this.drawGroup.hide();
    this.onDrawEnd();
  }
  stopCurrentDraw() {
    let cuboid = undefined;
    if (this.points.length === 8) {
      cuboid = new Cuboid({ points: this.points });
    }
    this.onDraw(cuboid);
    this.clearDraw();
  }
  undoDraw() {
    // TODO
  }
  clearDraw() {
    this.mouseDown = false;
    this.points = [];
    this.currentAnchor.hide();
    this.anchors.removeChildren();
    this.rects.removeChildren();
    this.holder.setAttrs({ width: 0, height: 0 });
    this.onDrawClear();
  }

  onMouseDown(e: Konva.KonvaEventObject<MouseEvent>, point: Vector2) {
    this.addPoint(point);

    // holder处理: 第一个矩形实线, 第二个矩形虚线
    const len = this.points.length;
    this.holderUpdate = len === 1 || len === 5;
    const holderConfig = { width: 0, height: 0, dash: [], ...this.drawConfig };
    switch (len) {
      case 1: {
        Object.assign(holderConfig, this.points[0]);
        break;
      }
      case 5: {
        Object.assign(holderConfig, { ...this.points[4], dash: [5, 5] });
        break;
      }
      case 8: {
        this.stopCurrentDraw();
        return;
      }
    }
    this.holder.setAttrs(holderConfig);
  }
  onMouseMove(e: Konva.KonvaEventObject<MouseEvent>, point: Vector2) {
    this.currentAnchor.position(point);
    this.updateHolder();
    this.onDrawChange();
  }

  updateHolder() {
    if (!this.holderUpdate) return;
    const endPos = this.currentAnchor.position();
    const holderPos = this.holder.position();
    this.holder.width(endPos.x - holderPos.x);
    this.holder.height(endPos.y - holderPos.y);
  }

  addPoint(point: Vector2) {
    const len = this.points.length;
    if (len === 0 || len === 4) {
      this.points.push(point);
      this.anchors.add(new Circle({ ...point, ...this.drawConfig }));
    } else if (len === 1 || len === 5) {
      const lastPoint = this.points.pop() as Vector2;
      const { x, y, width, height } = utils.getRectFromPoints([lastPoint, point]);
      this.points.push({ x, y });
      this.points.push({ x: x + width, y });
      this.points.push({ x: x + width, y: y + height });
      this.points.push({ x, y: y + height });
      this.anchors.removeChildren();
      this.rects.add(
        new Konva.Rect({
          x,
          y,
          width,
          height,
          stroke: this.drawConfig.stroke,
          strokeWidth: 2,
        }),
      );
    }
  }

  // edit
  edit(object: Cuboid) {
    if (this.object) {
      this.removeChangeEvent();
    }

    this.object = object;
    this.object.setAttrs({ draggable: false });
    this.updateEditObject();
    this.editGroup.show();

    this.addChangEvent();
  }
  stopEdit() {
    if (this.object) {
      this.removeChangeEvent();
      this.object.setAttrs({ draggable: true });
    }
    this.object = undefined;
    this.editGroup.hide();
  }

  initEditObject() {
    // 层级顺序(下->上): 虚线面->实线面->线->点
    // 面
    let poly = new Polygon({ anchors: [4, 5, 6, 7] });
    this.editGroup.add(poly);
    poly = new Polygon({ anchors: [0, 1, 2, 3] });
    this.editGroup.add(poly);
    this.anchorList.forEach((order) => {
      // 边
      const lines: Line[] = [];
      const lineConfig = { hitStrokeWidth: 6, points: [], opcity: 0 };
      if (order < 4) {
        lines.push(new Line({ ...lineConfig, anchors: [order, (order + 1) % 4] }));
        lines.push(new Line({ ...lineConfig, anchors: [order, order + 4] }));
      } else {
        lines.push(
          new Line({ ...lineConfig, dash: [5, 5], anchors: [order, ((order + 1) % 4) + 4] }),
        );
      }
      this.editGroup.add(...lines);
      // 顶点
      const anchor = new Circle({ anchors: [order] });
      anchor.dragBoundFunc(utils.constraintInImage(anchor, this.view));
      this.editGroup.add(anchor);
    });
  }

  initEditEvent() {
    this.editGroup.on('dragstart', (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!this.object) return;
      this.onEditStart();
      // drag
      this.dragging = true;
      this.dragObject = e.target;
      this.dragLastPos = this.dragObject.position();
    });

    this.editGroup.on('dragmove', (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (
        !this.object ||
        !this.dragObject ||
        !this.dragLastPos ||
        this.dragObject instanceof Cuboid
      )
        return;
      const anchors = e.evt.ctrlKey ? this.anchorList : this.dragObject.attrs.anchors;
      if (!anchors) return;
      // e.target 拖动限制处理
      let position = this.dragObject.position();
      let dragX: number = 0;
      let dragY: number = 0;
      if (this.dragObject.attrs.anchors.length > 1) {
        const targetRect = this.getTargetRect(this.dragObject);
        const { offsetX, offsetY } = this.targetValidPos(position, targetRect);
        this.dragObject.position({ x: position.x + offsetX, y: position.y + offsetY });
        position = this.dragObject.position();
      }
      dragX = position.x - this.dragLastPos.x;
      dragY = position.y - this.dragLastPos.y;

      const { points } = this.object.attrs;
      anchors.forEach((i: number) => {
        points[i].x += dragX;
        points[i].y += dragY;
      });

      this.object.setAttrs({ points });
      if (e.evt.ctrlKey) {
        const objRect = this.object.getSelfRect();
        const objPos = this.object.position();
        const { offsetX, offsetY } = this.targetValidPos(objPos, objRect);
        const validPoints = this.object.attrs.points.map((e) => {
          return { x: e.x + offsetX, y: e.y + offsetY };
        });
        this.object.setAttrs({ points: validPoints });
        this.dragObject.position({ x: position.x + offsetX, y: position.y + offsetY });
        position = this.dragObject.position();
      }
      this.dragLastPos = position;
      this.updateEditObject();
      this.onEditChange();
    });

    this.editGroup.on('dragend', () => {
      this.dragging = false;
      this.dragObject = undefined;
      this.dragLastPos = undefined;
      this.onEditEnd();
    });
  }
  getTargetRect(target: any) {
    if (!target || !target.getSelfRect || !target.attrs) return { x: 0, y: 0, width: 0, height: 0 };
    let targetRect = target.getSelfRect();
    if (target.attrs.anchors?.length == 1 || target instanceof Circle) {
      targetRect = { x: target.attrs.x, y: target.attrs.y, width: 0, height: 0 };
    }
    return targetRect as IRectOption;
  }

  updateEditObject() {
    if (!this.object) return;
    const object = this.object;
    const { x, y, points } = object.attrs;

    // update parent pos
    const parent = object.parent;
    if (parent && parent instanceof GroupObject) {
      this.editGroup.setAttrs(parent.position());
    } else {
      this.editGroup.setAttrs({ x: 0, y: 0 });
    }

    const children = this.editGroup.children || [];
    children.forEach((e) => {
      if (e === this.dragObject) return;

      const { anchors } = e.attrs;
      if (!anchors) return;
      const anchorsNum = anchors.length;
      // 1点; 2线; 4面
      switch (anchorsNum) {
        case 1: {
          const p = points[anchors[0]];
          e.setAttrs({ x: x + p.x, y: y + p.y, stroke: object.stroke() });
          break;
        }
        case 2:
        case 4: {
          const ps: Vector2[] = [];
          anchors.forEach((i: number) => {
            const p = points[i];
            ps.push({ x: p.x + x, y: p.y + y });
          });
          e.setAttrs({ x: 0, y: 0, points: ps, stroke: object.stroke(), opacity: 1 });
          break;
        }
      }
    });
  }
  targetValidPos(abPosition: Vector2, rect: IRectOption) {
    const left = abPosition.x + rect.x;
    const top = abPosition.y + rect.y;
    const right = left + rect.width;
    const bottom = top + rect.height;

    let offsetX = 0;
    let offsetY = 0;
    const imageRect = {
      left: 0,
      top: 0,
      right: this.view.backgroundWidth,
      bottom: this.view.backgroundHeight,
    };

    if (left < imageRect.left) offsetX = imageRect.left - left;
    else if (right > imageRect.right) offsetX = imageRect.right - right;
    if (top < imageRect.top) offsetY = imageRect.top - top;
    else if (bottom > imageRect.bottom) offsetY = imageRect.bottom - bottom;

    return { offsetX, offsetY };
  }

  onObjectChange() {
    if (!this.object || this.dragging) return;
    this.updateEditObject();
  }
}
