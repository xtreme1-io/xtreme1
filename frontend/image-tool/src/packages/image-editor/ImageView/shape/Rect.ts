import Konva from 'konva';
import Shape from './Shape';
import { Vector2, ToolType } from '../../types';
import { IShapeConfig } from '../type';
import * as utils from '../../utils';
export interface IRectConfig extends IShapeConfig {
  points?: Vector2[];
}

export default class Rect extends Shape {
  className = 'rect';
  declare attrs: Required<IRectConfig>;

  constructor(config?: IRectConfig) {
    const cfg = Object.assign({ width: 10, height: 10, hitStrokeWidth: 4, points: [] }, config);
    super(cfg);

    this.on('xChange yChange widthChange heightChange rotationChange', function () {
      this.onPointChange();
    });
  }

  _sceneFunc(context: Konva.Context, shape: Konva.Shape) {
    const { width, height } = this.attrs;

    context.beginPath();
    context.rect(0, 0, width, height);
    context.closePath();

    context.fillStrokeShape(this);
    this.drawPoint(context, this.getRelativePoints());
  }
  getRelativePoints(): Vector2[] {
    const { width, height } = this.attrs;
    return [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height },
    ];
  }
  // getPointChangeEvent() {
  //     return 'xChange yChange widthChange heightChange';
  // }

  getTextPosition() {
    return { x: 0, y: 0 };
  }

  // 旋转中心
  get rotationCenter() {
    const { x, y } = this.attrs;
    return { x, y };
  }
  getSelfRect() {
    const { width, height } = this.attrs;
    return { x: 0, y: 0, width, height };
  }
  _getBoundRect() {
    const transform = this.getTransform();
    return utils.getPointsBoundRect(this.getRelativePoints().map((p) => transform.point(p)));
  }
  getArea() {
    const { width, height } = this.attrs;
    return width * height;
  }

  clonePointsData() {
    const { width, height, x, y } = this.attrs;
    return {
      width,
      height,
      x,
      y,
    };
  }
  newShape() {
    return new Rect();
  }
  get toolType() {
    return ToolType.BOUNDING_BOX;
  }
}
