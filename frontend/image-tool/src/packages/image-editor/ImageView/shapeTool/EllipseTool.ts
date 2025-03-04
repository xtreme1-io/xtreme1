import { Circle, GroupObject, Shape, Ellipse } from '../shape';
import { IRectOption, ToolName, Vector2 } from '../../types';
import ShapeTool from './ShapeTool';
import Konva from 'konva';
import ImageView from '../index';
import * as utils from '../../utils';
import { Event } from '../../config';

// 矩形锚点 id枚举(左上开始,顺时针)
enum Anchors {
  CENTER = 'center',
  ELLIPSE = 'ellipse',
  POINT_X = 'point_x',
  POINT_Y = 'point_y',
}

// 顺时针夹角 0 ~ 360
function computeDegree(point1: Vector2, point2?: Vector2) {
  let x: number;
  let y: number;
  if (point2) {
    x = point2.x - point1.x;
    y = point2.y - point1.y;
  } else {
    x = point1.x;
    y = point1.y;
  }
  const angel = Math.atan2(-y, -x) + Math.PI;
  return ((angel / Math.PI) * 180) % 360;
}

export default class EllipseTool extends ShapeTool {
  name = ToolName.ellipse;
  // draw
  currentAnchor: Circle;
  points: Vector2[] = [];
  holder: Ellipse;
  anchors: Konva.Group;
  // edit
  object: Ellipse | undefined = undefined;
  editObjectMap = {} as Record<Anchors, Shape | Konva.Shape>;
  // drag
  dragging = false;
  dragObject!: any;
  dragLastPos: Vector2 | undefined;
  constructor(view: ImageView) {
    super(view);

    // draw
    this.holder = new Ellipse({
      dash: [5, 5],
    });
    this.currentAnchor = new Circle();
    this.anchors = new Konva.Group();
    this.drawGroup.add(this.holder, this.anchors, this.currentAnchor);

    // edit
    this.initEditObject();
    this.initEditEvent();
    this.changeEvent = 'radiusXChange radiusYChange absoluteTransformChange transform';
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
    let ellipse = undefined;
    if (this.points.length >= 3) {
      ellipse = new Ellipse();
      const [center, posX, posY] = this.points;
      const radiusX = Math.max(utils.distance(center, posX), 1);
      const radiusY = Math.max(utils.distance(center, posY), 1);
      const angle = computeDegree(center, posY) - 90;
      ellipse.position(center);
      ellipse.radiusX(radiusX);
      ellipse.radiusY(radiusY);
      ellipse.rotation(angle);
    }
    this.onDraw(ellipse);
    this.clearDraw();
  }
  undoDraw() {
    // TODO
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
      if (!this.object && this.points.length < 2) return '';
      const area = this.object?.area() ?? this.holder.area();
      return `area:${area.toFixed(0)}`;
    }
    return '';
  }

  onMouseDown(e: Konva.KonvaEventObject<MouseEvent>, point: Vector2) {
    this.addPoint(point);

    if (this.points.length >= 3) {
      this.stopCurrentDraw();
    }
  }
  onMouseMove(e: Konva.KonvaEventObject<MouseEvent>, point: Vector2) {
    this.currentAnchor.position(point);
    this.updateHolder();
    this.onDrawChange();
  }

  updateHolder() {
    if (this.points.length < 2) return;
    const [center, posX] = this.points;

    const posY = this.currentAnchor.position();
    const radiusX = Math.max(utils.distance(center, posX), 1);
    const radiusY = Math.max(utils.distance(center, posY), 1);
    const angle = computeDegree(center, posY) - 90;
    this.holder.setAttrs({
      radiusX,
      radiusY,
      rotation: angle,
      ...center,
      ...this.drawConfig,
    });

    const transform = this.holder.getTransform();
    const newPosX = transform.point({ x: radiusX, y: 0 });
    posX.x = newPosX.x;
    posX.y = newPosX.y;
    const anchors = this.anchors.children;
    if (anchors && anchors[1] instanceof Circle) {
      anchors[1].position(posX);
    }

    this.holder.show();
    this.currentAnchor.show();
  }

  addPoint(point: Vector2) {
    this.points.push(point);
    this.anchors.add(new Circle({ x: point.x, y: point.y, ...this.drawConfig }));
  }

  // edit
  edit(object: Ellipse) {
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
    const xAnchor = new Circle({ id: Anchors.POINT_X, draggable: true });
    const yAnchor = new Circle({ id: Anchors.POINT_Y, draggable: true });
    centerAnchor.dragBoundFunc(utils.constraintInImage(centerAnchor, this.view));
    // centerAnchor.listening(false);
    this.editGroup.add(centerAnchor);
    this.editGroup.add(xAnchor);
    this.editGroup.add(yAnchor);
    this.editObjectMap[Anchors.CENTER] = centerAnchor;
    this.editObjectMap[Anchors.POINT_X] = xAnchor;
    this.editObjectMap[Anchors.POINT_Y] = yAnchor;
  }

  initEditEvent() {
    this.editGroup.on(Event.DRAG_START, (e: Konva.KonvaEventObject<MouseEvent>) => {
      this.onEditStart();
      // drag
      this.dragging = true;
    });

    this.editGroup.on(Event.DRAG_MOVE, (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!this.dragging) return;

      const dragNode = e.target;
      const ellipse = this.object as Ellipse;
      const { id, x, y } = dragNode.attrs;

      // 旋转坐标转换
      const center = ellipse.position();
      const nodePos = dragNode.position();
      if (id === Anchors.POINT_X) {
        const newRadiusX = Math.max(utils.distance(center, nodePos), 1);
        const rotation = computeDegree(center, nodePos);
        ellipse.setAttrs({ rotation, radiusX: newRadiusX });
      } else if (id === Anchors.POINT_Y) {
        const newRadiusY = Math.max(utils.distance(center, nodePos), 1);
        const rotation = computeDegree(center, nodePos) - 90;
        ellipse.setAttrs({ rotation, radiusY: newRadiusY });
      } else if (id === Anchors.CENTER) {
        ellipse.setAttrs({ x, y });
      }
      this.updateEditObject();
      this.onEditChange();
    });

    this.editGroup.on(Event.DRAG_END, (e: Konva.KonvaEventObject<MouseEvent>) => {
      this.dragging = false;
      this.updateEditObject();
      this.onEditEnd();
    });
  }
  updateEditObject() {
    const object = this.object;
    if (!object) return;
    const { radiusX, radiusY, fill } = object.attrs;
    const parent = object.parent;
    if (parent && parent instanceof GroupObject) {
      this.editGroup.setAttrs(parent.position());
    } else {
      this.editGroup.setAttrs({ x: 0, y: 0 });
    }
    const children = this.editGroup.children || [];
    const transform = object.getTransform();
    children.forEach((e) => {
      if (e === this.dragObject) return;
      const { id } = e.attrs;

      if (id === Anchors.CENTER) {
        const anchor = e as Circle;
        anchor.stroke(object.attrs.stroke as string);
        anchor.position(object.position());
      } else if (id === Anchors.POINT_X) {
        const anchor = e as Circle;
        anchor.stroke(object.attrs.stroke as string);
        anchor.position(transform.point({ x: radiusX, y: 0 }));
      } else if (id === Anchors.POINT_Y) {
        const anchor = e as Circle;
        anchor.stroke(object.attrs.stroke as string);
        anchor.position(transform.point({ x: 0, y: radiusY }));
      } else if (id === Anchors.ELLIPSE) {
        const anchor = e as Ellipse;
        anchor.fill(fill);
        anchor.radiusX(radiusX);
        anchor.radiusY(radiusY);
        anchor.position(object.position());
      }
    });
  }
  // 检测拖动是否存在超出限制的部分
  invalidRect(rect: IRectOption, pos?: Vector2) {
    if (!this.view.editor.state.config.limitPosition) return false;
    const { backgroundWidth, backgroundHeight } = this.view;
    pos = pos || this.object?.position();
    if (!pos) return true;
    const { width, height } = rect;
    const halfW = width / 2;
    const halfH = height / 2;
    const offsetTop = pos.y - halfH;
    const offsetBottom = pos.y + halfH - backgroundHeight;
    const offsetLeft = pos.x - halfW;
    const offsetRight = pos.x + halfW - backgroundWidth;
    if (offsetBottom <= 0 && offsetTop >= 0 && offsetLeft >= 0 && offsetRight <= 0) return false;
    else if ((offsetLeft < 0 && offsetRight > 0) || (offsetBottom > 0 && offsetTop < 0))
      return true;
    return {
      x: offsetLeft < 0 ? -offsetLeft : -offsetRight,
      y: offsetTop < 0 ? -offsetTop : -offsetBottom,
    };
  }

  onObjectChange() {
    if (this.dragging) return;
    this.updateEditObject();
  }
}
