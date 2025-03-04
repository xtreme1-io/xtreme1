import Konva from 'konva';
import Shape from './Shape';
import { defaultAnchorConfig, defaultAnchorStateStyle } from '../../config';
import { IShapeConfig } from '../type';

export interface ICircleConfig extends IShapeConfig {
  radius?: number;
  sizeAttenuation?: boolean;
}

export default class Circle extends Shape {
  className = 'circle';
  defaultStyle: IShapeConfig = defaultAnchorConfig;
  declare attrs: Required<ICircleConfig>;
  constructor(config?: ICircleConfig) {
    super(Object.assign({ sizeAttenuation: false }, defaultAnchorConfig, config));
    this.stateStyles = defaultAnchorStateStyle;
    this.on('xChange yChange widthChange heightChange', function () {
      this.onPointChange();
    });
  }

  getSelfRect() {
    const { radius, strokeWidth } = this.attrs;
    const size = radius + (strokeWidth || 0);
    return {
      x: -size,
      y: -size,
      width: size * 2,
      height: size * 2,
    };
  }

  _sceneFunc(context: Konva.Context, shape: Konva.Shape) {
    const { radius, sizeAttenuation } = this.attrs;

    // 大小不受stage scale影响
    let scale = 1;
    if (!sizeAttenuation) {
      const stage = this.getStage();
      if (stage) {
        scale = 1 / stage.scaleX();
      }
    }

    context.beginPath();
    context.arc(0, 0, radius * scale, 0, 2 * Math.PI, true);
    context.closePath();

    context.fillStrokeShape(shape);
  }
  newShape() {
    return new Circle();
  }
}
