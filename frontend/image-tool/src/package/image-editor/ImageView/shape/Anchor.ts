import { isNumber } from 'lodash';
import { AnnotateClassName, ICircleConfig } from '../type';
import Circle from './Circle';

/**
 * Class Anchor
 */
export default class Anchor extends Circle {
  className = 'anchor' as AnnotateClassName;
  anchorIndex: number = 0;
  anchorType: number = -1;

  constructor(config?: ICircleConfig) {
    super(config);
    this.anchorIndex = isNumber(config?.pointIndex) ? config?.pointIndex : 0;
    this.anchorType = isNumber(config?.pointType) ? config?.pointType : -1;
  }
}
