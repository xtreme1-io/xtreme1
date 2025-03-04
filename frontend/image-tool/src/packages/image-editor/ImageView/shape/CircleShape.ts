import Circle, { ICircleConfig } from './Circle';
import { ToolType } from '../../types';
import { defaultCircleStateStyle } from '../../config';

const defaultStyle = { fill: 'rgba(0, 0, 0, 0)', strokeWidth: 2 };
export default class CircleShape extends Circle {
  className = 'shape-circle';
  declare attrs: Required<ICircleConfig>;
  constructor(config?: ICircleConfig) {
    super(Object.assign({ sizeAttenuation: true }, defaultStyle, config));
    this.stateStyles = defaultCircleStateStyle;
    this.defaultStyle = defaultStyle;
    this.on('xChange yChange widthChange heightChange', function () {
      this.onPointChange();
    });
  }
  newShape() {
    return new CircleShape();
  }
  getSelfRect() {
    const { radius } = this.attrs;
    return {
      x: -radius,
      y: -radius,
      width: radius * 2,
      height: radius * 2,
    };
  }
  getClientRect(): { width: number; height: number; x: number; y: number } {
    const { radius, x, y } = this.attrs;
    return {
      x: x - radius,
      y: y - radius,
      width: radius * 2,
      height: radius * 2,
    };
  }
  clonePointsData() {
    const { x, y, radius } = this.attrs;
    return {
      x,
      y,
      radius,
    };
  }
  area() {
    return Math.PI * this.radius() * this.radius();
  }
  radius(value?: number) {
    if (typeof value === 'number') {
      this.attrs.radius = value;
    }
    return this.attrs.radius || 0;
  }
  get toolType() {
    return ToolType.CIRCLE;
  }
}
