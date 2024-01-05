import { AnnotateClassName, ICircleConfig } from '../type';
import { ToolType } from '../../types';
import Circle from './Circle';

export default class KeyPoint extends Circle {
  className = 'key-point' as AnnotateClassName;

  constructor(config?: ICircleConfig) {
    super(config);
  }
  newShape() {
    return new KeyPoint();
  }
  get toolType() {
    return ToolType.KEY_POINT;
  }
}
