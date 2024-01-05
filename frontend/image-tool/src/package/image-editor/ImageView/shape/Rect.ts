import Konva from 'konva';
import { AnnotateClassName, IShapeConfig } from '../type';
import { ToolType } from '../../types';
import Shape from './Shape';

export default class Rect extends Shape {
  className = 'rect' as AnnotateClassName;

  constructor(config?: IShapeConfig) {
    const cfg = Object.assign({ width: 1, height: 1, points: [] }, config);
    super(cfg);

    this.on('xChange yChange widthChange heightChange', () => {
      this.onPointChange();
    });
  }
  _sceneFunc(context: Konva.Context, shape: Konva.Shape) {
    const { width, height } = this.attrs;

    context.beginPath();
    context.rect(0, 0, width, height);
    context.closePath();

    context.fillStrokeShape(this);
  }
  get rotationCenter() {
    const { x, y } = this.attrs;
    return { x, y };
  }
  getSelfRect(onlySelf?: boolean) {
    const { width, height } = this.attrs;
    if (onlySelf) return { x: 0, y: 0, width, height };
    const w = width - 2;
    const h = height - 2;
    return {
      x: 1,
      y: 1,
      width: Math.abs(w) < 1 ? 1 : w,
      height: Math.abs(h) < 1 ? 1 : h,
    };
  }
  getArea() {
    const { width, height } = this.attrs;
    return width * height;
  }
  clonePointsData() {
    const { width, height, x, y } = this.attrs;
    return { width, height, x, y };
  }
  newShape() {
    return new Rect();
  }
  get toolType() {
    return ToolType.BOUNDING_BOX;
  }
}
