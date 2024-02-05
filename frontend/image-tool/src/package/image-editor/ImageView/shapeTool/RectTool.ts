import Konva from 'konva';
import { ToolAction, ToolName, Vector2 } from '../../types';
import { Cursor, Event, defaultCircleConfig } from '../../configs';
import ShapeTool from './ShapeTool';
import ImageView from '../index';
import { Anchor, Line, Rect, Shape } from '../shape';
import * as utils from '../../utils';
import { handleRotateToCmd } from '../utils';

// rect lines
enum Lines {
  TOP = 'line-top',
  BOTTOM = 'line-bottom',
  LEFT = 'line-left',
  RIGHT = 'line-right',
  TRANS = 'line-trans',
}
// rect anchors
enum Anchors {
  TOPLEFT = 'top-left',
  TOPRIGHTT = 'top-right',
  BOTTOMLEFT = 'bottom-left',
  BOTTOMRIGHT = 'bottom-right',
  TRANS = 'rotater',
}
// clockwise
const AnchorsOrder = [Anchors.TOPLEFT, Anchors.TOPRIGHTT, Anchors.BOTTOMRIGHT, Anchors.BOTTOMLEFT];

export default class RectTool extends ShapeTool {
  name = ToolName.rect;
  points: Vector2[] = [];
  // draw
  holder: Rect;
  currentAnchor: Anchor;
  anchors: Konva.Group;
  // edit
  declare object?: Rect;
  editObjectMap = {} as Record<Anchors | Lines, Shape>;
  transform: Konva.Transformer = new Konva.Transformer({
    resizeEnabled: false,
    // rotationSnaps: [0, 90, 180, 270],
    // rotationSnapTolerance: 5,
    borderEnabled: true,
    enabledAnchors: [
      'top-left',
      'top-right',
      'bottom-left',
      'bottom-right',
      'middle-right',
      'middle-left',
      'top-center',
      'bottom-center',
    ],
  });
  // drag
  dragging = false;
  dragObject!: any;
  dragLastPos: Vector2 | undefined;

  constructor(view: ImageView) {
    super(view);
    this.holder = new Rect({ dash: [5, 5], strokeWidth: 2 });
    this.currentAnchor = new Anchor();
    this.anchors = new Konva.Group();
    this.drawGroup.add(this.holder, this.anchors, this.currentAnchor);

    // edit
    this.initEditObject();
    this.initEditEvent();
    this.changeEvent = 'absoluteTransformChange widthChange heightChange transform';
    handleRotateToCmd(this.view, this.transform);
  }
  doing(): boolean {
    return this.points.length > 0;
  }
  validPoint(p: Vector2, referPoint?: Vector2) {
    if (!referPoint) return true;
    const w = p.x - referPoint.x;
    const h = p.y - referPoint.y;
    if (this.invalidSide(w) || this.invalidSide(h)) return false;
    return true;
  }
  invalidSide(val: number) {
    if (!val || Math.abs(val) < 0.01) return true;
    return false;
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
  clearDraw() {
    this.mouseDown = false;
    this.points = [];
    this.holder.hide();
    this.currentAnchor.hide();
    this.anchors.removeChildren();
    this.onDrawClear();
  }
  stopCurrentDraw() {
    let rect = undefined;
    if (this.points.length === 2) {
      const rectOption = utils.getRectFromPoints(this.points as any);
      rect = new Rect(rectOption);
    }
    this.onDraw(rect);
    this.clearDraw();
  }
  undoDraw() {
    this.clearDraw();
  }
  drawInfo() {
    if (!this.holder.visible()) return '';
    const { width, height } = this.holder.attrs;
    return `width:${Math.abs(width).toFixed(0)}px;
      height:${Math.abs(height).toFixed(0)}px;
      area:${Math.abs(width * height).toFixed(0)};
      W/H:${Math.abs(width / height).toFixed(2)};`;
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
  addPoint(point: Vector2) {
    if (this.validPoint(point, this.points[0])) {
      this.points.push(point);
      this.anchors.add(new Anchor({ ...point }));
    }
  }
  updateHolder() {
    const startPos = this.points[0];
    const endPos = this.currentAnchor.position();

    const rectOption = utils.getRectFromPoints([startPos, endPos]);
    this.holder.setAttrs(rectOption);

    this.holder.show();
    this.currentAnchor.show();
  }

  // edit
  edit(object: Rect) {
    this.removeChangeEvent();
    this._hoverIndex = -1;
    this.object = object;
    this.updateAnchors(-1);
    this.updateEditObject();
    this.updateTransformer();
    this.editGroup.show();

    this.addChangEvent();
  }
  stopEdit() {
    this.removeChangeEvent();
    this.transform.detach();
    this.object = undefined;
    this.editGroup.hide();
  }
  initEditObject() {
    this.editGroup.add(this.transform);
    const lines = [Lines.BOTTOM, Lines.LEFT, Lines.RIGHT, Lines.TOP];
    const cursor = Cursor.move;
    lines.forEach((id) => {
      const line = new Line({
        id,
        cursor,
        points: [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ],
        opacity: 0,
      });
      this.editGroup.add(line);
      this.editObjectMap[id] = line;
    });

    const anchors = [Anchors.BOTTOMLEFT, Anchors.BOTTOMRIGHT, Anchors.TOPLEFT, Anchors.TOPRIGHTT];
    anchors.forEach((id) => {
      const anchor = new Anchor({ id, cursor });
      this.editGroup.add(anchor);
      this.editObjectMap[id] = anchor;
    });
  }
  initEditEvent() {
    let endRect: { x: number; y: number; width: number; height: number } | undefined;
    this.editGroup.on(Event.DRAG_START, (e: Konva.KonvaEventObject<MouseEvent>) => {
      endRect = undefined;
      this.onEditStart();
      // drag
      this.dragging = true;
      this.dragObject = e.target;
      this.dragLastPos = { x: this.dragObject.x(), y: this.dragObject.y() };
    });

    this.editGroup.on(Event.DRAG_MOVE, (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!this.dragging) return;

      const dragNode = e.target;
      this.validLineDrag(dragNode);
      const id = dragNode.attrs.id;
      const rect = this.object as Rect;
      const { x, y } = dragNode.attrs;

      const r = rect.rotation();
      let rectInfo = { x: 0, y: 0, width: 0, height: 0 };
      let compareAnchor: Shape, transPos: Vector2;
      let topLeft!: Vector2, topRight!: Vector2, bottomLeft!: Vector2, bottomRight!: Vector2;
      let newWidth: number = 0,
        newHeight: number = 0,
        newPos: Vector2 = { x: 0, y: 0 };

      if (id === Lines.TOP) {
        topLeft = { x, y };
        const bottomLeftAnchor = this.editObjectMap[Anchors.BOTTOMLEFT];
        bottomLeft = { x: bottomLeftAnchor.x(), y: bottomLeftAnchor.y() };
        const bottomTrans = utils.countTransformPoint(topLeft, bottomLeft, -r);
        newWidth = rect.attrs.width;
        newHeight = bottomTrans.y - topLeft.y;
      } else if (id === Lines.BOTTOM) {
        const topLeftAnchor = this.editObjectMap[Anchors.TOPLEFT];
        topLeft = { x: topLeftAnchor.x(), y: topLeftAnchor.y() };
        transPos = utils.countTransformPoint(topLeft, { x, y }, -r);

        newWidth = rect.attrs.width;
        newHeight = transPos.y - topLeft.y + dragNode.attrs.points[0].y;
        bottomLeft = { x: topLeft.x, y: topLeft.y + newHeight };
        bottomLeft = utils.countTransformPoint(topLeft, bottomLeft, r);
      } else if (id === Lines.LEFT) {
        topLeft = { x, y };
        const topRightAnchor = this.editObjectMap[Anchors.TOPRIGHTT];
        topRight = { x: topRightAnchor.x(), y: topRightAnchor.y() };
        const rightTrans = utils.countTransformPoint(topLeft, topRight, -r);
        newWidth = rightTrans.x - topLeft.x;
        newHeight = rect.attrs.height;
      } else if (id === Lines.RIGHT) {
        const topLeftAnchor = this.editObjectMap[Anchors.TOPLEFT];
        topLeft = { x: topLeftAnchor.x(), y: topLeftAnchor.y() };
        transPos = utils.countTransformPoint(topLeft, { x, y }, -r);

        newWidth = transPos.x - topLeft.x + dragNode.attrs.points[0].x;
        newHeight = rect.attrs.height;
        topRight = { x: topLeft.x + newWidth, y: topLeft.y };
        topRight = utils.countTransformPoint(topLeft, topRight, r);
      } else if (id === Anchors.TOPLEFT) {
        topLeft = { x, y };
        compareAnchor = this.editObjectMap[Anchors.BOTTOMRIGHT];
        bottomRight = { x: compareAnchor.x(), y: compareAnchor.y() };
        transPos = utils.countTransformPoint(bottomRight, topLeft, -r);
        topRight = utils.countTransformPoint(bottomRight, { x: bottomRight.x, y: transPos.y }, r);
        bottomLeft = utils.countTransformPoint(bottomRight, { x: transPos.x, y: bottomRight.y }, r);
        newWidth = bottomRight.x - transPos.x;
        newHeight = bottomRight.y - transPos.y;
      } else if (id === Anchors.TOPRIGHTT) {
        topRight = { x, y };
        compareAnchor = this.editObjectMap[Anchors.BOTTOMLEFT];
        bottomLeft = { x: compareAnchor.x(), y: compareAnchor.y() };
        transPos = utils.countTransformPoint(bottomLeft, topRight, -r);
        topLeft = utils.countTransformPoint(bottomLeft, { x: bottomLeft.x, y: transPos.y }, r);
        bottomRight = utils.countTransformPoint(bottomLeft, { x: transPos.x, y: bottomLeft.y }, r);
        newWidth = transPos.x - bottomLeft.x;
        newHeight = bottomLeft.y - transPos.y;
      } else if (id === Anchors.BOTTOMLEFT) {
        bottomLeft = { x, y };
        compareAnchor = this.editObjectMap[Anchors.TOPRIGHTT];
        topRight = { x: compareAnchor.x(), y: compareAnchor.y() };
        transPos = utils.countTransformPoint(topRight, bottomLeft, -r);
        topLeft = utils.countTransformPoint(topRight, { x: transPos.x, y: topRight.y }, r);
        bottomRight = utils.countTransformPoint(topRight, { x: topRight.x, y: transPos.y }, r);
        newWidth = topRight.x - transPos.x;
        newHeight = transPos.y - topRight.y;
      } else if (id === Anchors.BOTTOMRIGHT) {
        bottomRight = { x, y };
        compareAnchor = this.editObjectMap[Anchors.TOPLEFT];
        topLeft = { x: compareAnchor.x(), y: compareAnchor.y() };
        transPos = utils.countTransformPoint(topLeft, bottomRight, -r);
        topRight = utils.countTransformPoint(topLeft, { x: transPos.x, y: topLeft.y }, r);
        bottomLeft = utils.countTransformPoint(topLeft, { x: topLeft.x, y: transPos.y }, r);
        newWidth = transPos.x - topLeft.x;
        newHeight = transPos.y - topLeft.y;
      }
      rectInfo = { ...topLeft, width: newWidth, height: newHeight };
      if (newWidth < 0 && newHeight < 0) newPos = bottomRight;
      else if (newWidth < 0) newPos = topRight;
      else if (newHeight < 0) newPos = bottomLeft;
      else newPos = topLeft;
      endRect = { ...newPos, width: Math.abs(newWidth), height: Math.abs(newHeight) };
      this.dragLastPos = { x: this.dragObject.x(), y: this.dragObject.y() };
      rect.setAttrs(rectInfo);
      this.updateEditObject();
      this.onEditChange();
    });

    this.editGroup.on(Event.DRAG_END, (e: Konva.KonvaEventObject<MouseEvent>) => {
      // console.log('dragstend');
      this.dragging = false;
      this.dragObject = undefined;
      this.dragLastPos = undefined;
      endRect && this.object?.setAttrs(endRect);
      endRect = undefined;
      this.updateEditObject();
      this.onEditEnd();
      if (this.object) {
        if (this.invalidSide(this.object.width()) || this.invalidSide(this.object.height())) {
          this.view.editor.actionManager.execute('undo');
        }
      }
    });

    this.editGroup.on(Event.CLICK, (e: Konva.KonvaEventObject<MouseEvent>) => {
      const isAnchors = Object.values(Anchors).includes(e.target.attrs?.id);
      if (e.target instanceof Anchor && isAnchors) {
        const idx = AnchorsOrder.indexOf(e.target.attrs?.id as any);
        this.updateAnchors(idx);
      }
    });
  }
  updateTransformer() {
    if (!this.object) return;
    const anchorStyle = defaultCircleConfig;
    this.transform.setAttrs({
      anchorFill: anchorStyle.fill,
      anchorSize: ((anchorStyle.radius || 3) + (anchorStyle.strokeWidth || 2)) * 2,
      anchorStrokeWidth: anchorStyle.strokeWidth,
      anchorStroke: this.object.stroke(),
      borderStroke: this.object.stroke(),
    });
    this.transform.nodes([this.object]);
    const rotaterAnchor = this.transform.getChildren((child: any) => {
      return child.attrs.name?.indexOf('rotater') != -1;
    })[0];
    if (rotaterAnchor) {
      rotaterAnchor.on('mouseenter', () => {
        const stage = rotaterAnchor.getStage();
        if (stage && stage.content) {
          stage.content.style.cursor = Cursor.rotating;
        }
      });
    }
  }
  updateEditObject() {
    if (!this.object) return;
    const object = this.object;
    const { x, y, width, height, rotation = 0 } = object.attrs;
    this.editGroup.setAttrs({ x: 0, y: 0 });

    const children = this.editGroup.children || [];
    const left = x;
    const top = y;
    const right = x + width;
    const bottom = y + height;
    children.forEach((e) => {
      if (e === this.dragObject || e instanceof Konva.Transformer) return;

      const id = e.attrs.id as any;
      const isAnchors = Object.values(Anchors).includes(id);
      const isLines = Object.values(Lines).includes(id);
      const center = object.rotationCenter;
      if (isAnchors) {
        const anchor = e as Anchor;
        anchor.updateStateStyles({ general: { fill: object.attrs.stroke as string } });
        anchor.fill(object.attrs.stroke as string);
        if (id === Anchors.TOPLEFT) {
          anchor.position(utils.countTransformPoint(center, { x: left, y: top }, rotation));
        } else if (id === Anchors.TOPRIGHTT) {
          anchor.position(utils.countTransformPoint(center, { x: right, y: top }, rotation));
        } else if (id === Anchors.BOTTOMLEFT) {
          anchor.position(utils.countTransformPoint(center, { x: left, y: bottom }, rotation));
        } else if (id === Anchors.BOTTOMRIGHT) {
          anchor.position(utils.countTransformPoint(center, { x: right, y: bottom }, rotation));
        }
      } else if (isLines) {
        const line = e as Line;
        line.position(center);
        line.rotation(rotation);
        line.setAttrs({ center });
        const point0 = line.attrs.points[0];
        const point1 = line.attrs.points[1];
        if (id === Lines.TOP) {
          point1.x = width;
          point1.y = 0;
        } else if (id === Lines.BOTTOM) {
          point0.x = 0;
          point0.y = height;
          point1.x = width;
          point1.y = height;
        } else if (id === Lines.LEFT) {
          point1.x = 0;
          point1.y = height;
        } else if (id === Lines.RIGHT) {
          point0.x = width;
          point0.y = 0;
          point1.x = width;
          point1.y = height;
        }
      }
    });
  }
  updateAnchors(idx: number = -1) {
    AnchorsOrder.forEach((id, i) => {
      const anchor = this.editObjectMap[id];
      anchor.state.select = i === idx;
    });
    this.view.updateStateStyle(AnchorsOrder.map((e) => this.editObjectMap[e]));
    this.selectAnchorIndex(idx);
    this.updateAttrHtml();
  }
  validLineDrag(dragNode: any) {
    const { x, y, rotation = 0, id } = dragNode.attrs;
    const isLines = Object.values(Lines).includes(id);
    if (!this.object || !isLines) return;

    const topLeftAnchor = this.editObjectMap[Anchors.TOPLEFT];
    const topleft = { x: topLeftAnchor.x(), y: topLeftAnchor.y() };
    const transPos = utils.countTransformPoint(topleft, { x, y }, -rotation);

    let validPos = { x: 0, y: 0 };
    if (id === Lines.TOP || id === Lines.BOTTOM) {
      transPos.x = topleft.x;
    } else if (id === Lines.LEFT || id === Lines.RIGHT) {
      transPos.y = topleft.y;
    }

    validPos = utils.countTransformPoint(topleft, transPos, rotation);
    dragNode.position(validPos);
  }
  onObjectChange() {
    if (this.dragging) return;
    this.updateEditObject();
  }
  checkEditAction(action: ToolAction) {
    return [ToolAction.esc].includes(action) && this.selectAnchorIndex() !== -1;
  }
  clearEdit() {
    this.updateAnchors(-1);
  }
}
