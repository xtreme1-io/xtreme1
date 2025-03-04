import Circle, { ICircleConfig } from './Circle';
import { ToolType } from '../../types';

export default class KeyPoint extends Circle {
  className = 'key-point';
  declare attrs: Required<ICircleConfig>;
  constructor(config?: ICircleConfig) {
    super(config);
    this.on('xChange yChange', function () {
      this.onPointChange();
    });
  }
  newShape() {
    return new KeyPoint();
  }
  get toolType() {
    return ToolType.KEY_POINT;
  }
}
