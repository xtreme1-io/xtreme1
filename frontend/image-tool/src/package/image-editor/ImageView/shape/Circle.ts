import { cloneDeep } from 'lodash';
import Konva from 'konva';
import { AnnotateClassName, ICircleConfig } from '../type';
import { CircleStateStyle, defaultCircleConfig } from '../../configs';
import Shape from './Shape';

// Circle Point
export default class Circle extends Shape {
  className = 'circle' as AnnotateClassName;
  declare attrs: Required<ICircleConfig>;
  _stateStyles = cloneDeep(CircleStateStyle);

  constructor(config?: ICircleConfig) {
    const _cfg = Object.assign({ sizeAttenuation: false }, defaultCircleConfig, config);
    super(_cfg);
    // this.stateStyles = CircleStateStyle;
  }
  _sceneFunc(context: Konva.Context, shape: Konva.Shape) {
    const { radius, sizeAttenuation } = this.attrs;
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
  getSelfRect(onlySelf?: boolean) {
    const { radius, strokeWidth } = this.attrs;
    const size = onlySelf ? 0 : radius + (strokeWidth || 0);
    return { x: -size, y: -size, width: size * 2, height: size * 2 };
  }
  get stateStyles() {
    const { general, hover, select } = this._stateStyles;
    return {
      general,
      hover: {
        ...hover,
        radius: general?.radius + hover.radius,
        strokeWidth: (general?.strokeWidth ?? 0) + (hover.strokeWidth ?? 0),
      },
      select: {
        ...select,
        radius: general.radius + select.radius,
        strokeWidth: (general.strokeWidth ?? 0) + (select.strokeWidth ?? 0),
      },
    };
  }
}
