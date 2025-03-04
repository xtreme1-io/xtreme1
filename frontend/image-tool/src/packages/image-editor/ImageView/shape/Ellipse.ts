import Konva from 'konva';
import Shape from './Shape';
import { Vector2, ToolType } from '../../types';
import { IShapeConfig } from '../type';
import { getEllipseBoundingBox } from '../../utils';
import { defaultCircleStateStyle } from '../../config';
const defaultStyle = { fill: 'rgba(0, 0, 0, 0)', strokeWidth: 2 };

export default class Ellipse extends Shape {
  className = 'ellipse';
  declare attrs: Required<IShapeConfig>;
  points: Vector2[] = [];
  constructor(config?: IShapeConfig) {
    super(Object.assign({}, defaultStyle, config));
    this.stateStyles = defaultCircleStateStyle;
    this.defaultStyle = defaultStyle;
    this.on('xChange yChange radiusXChange radiusYChange, rotationChange', function () {
      this.onPointChange();
    });
  }

  _sceneFunc(context: Konva.Context, shape: Konva.Shape) {
    const rx = this.radiusX();
    const ry = this.radiusY();
    context.beginPath();
    context.save();
    if (rx !== ry) {
      context.scale(1, ry / rx);
    }
    context.arc(0, 0, rx, 0, Math.PI * 2, false);
    context.restore();
    context.closePath();
    context.fillStrokeShape(this);
  }
  getWidth() {
    return this.radiusX() * 2;
  }
  getHeight() {
    return this.radiusY() * 2;
  }
  setWidth(width: number) {
    this.radiusX(width / 2);
  }
  setHeight(height: number) {
    this.radiusY(height / 2);
  }
  // getPointChangeEvent() {
  //     return 'xChange yChange widthChange heightChange';
  // }

  getSelfRect() {
    const { radiusX, radiusY, rotation } = this.attrs;
    return getEllipseBoundingBox(radiusX, radiusY, rotation);
  }
  getClientRect(): { width: number; height: number; x: number; y: number } {
    const { x, y } = this.attrs;
    const { width, height } = this.getSelfRect();
    return {
      x: x - width / 2,
      y: y - height / 2,
      width: width,
      height: height,
    };
  }
  clonePointsData() {
    const { x, y, radiusX, radiusY, rotation } = this.attrs;
    return {
      x,
      y,
      radiusX,
      radiusY,
      rotation,
    };
  }
  newShape() {
    return new Ellipse();
  }
  area() {
    return Math.PI * this.radiusX() * this.radiusY();
  }
  get toolType() {
    return ToolType.ELLIPSE;
  }
  radiusX(value?: number) {
    if (typeof value === 'number') {
      this.attrs.radiusX = value;
    }
    return this.attrs.radiusX || 0;
  }
  radiusY(value?: number) {
    if (typeof value === 'number') {
      this.attrs.radiusY = value;
    }
    return this.attrs.radiusY || 0;
  }
}
