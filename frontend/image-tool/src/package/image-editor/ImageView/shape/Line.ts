import Konva from 'konva';
import { AnnotateClassName, CacheName, IShapeConfig } from '../type';
import { ToolType } from '../../types';
import Shape from './Shape';
import * as utils from '../../utils';
import { cloneDeep } from 'lodash';

export default class Line extends Shape {
  className = 'polyline' as AnnotateClassName;

  constructor(config?: IShapeConfig) {
    super(Object.assign({ points: [] }, config));

    this.on('pointsChange', function () {
      this.onPointChange();
    });
  }
  _sceneFunc(context: Konva.Context, shape: Konva.Shape) {
    const { points } = this.attrs;

    if (!points || points.length === 0) return;

    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      context.lineTo(p.x, p.y);
    }

    context.strokeShape(this);
  }
  onPointChange() {
    this._clearCache('length' as CacheName);
    super.onPointChange();
  }
  getLength() {
    return this._getCache('length' as CacheName, this._getLength) as number;
  }
  _getLength() {
    const { points } = this.attrs;
    const len = utils.getLineLength(points);
    return len;
  }
  getSelfRect() {
    const { points } = this.attrs;
    return utils.getPointsBoundRect(points);
  }
  _getTextPosition() {
    this.updateTextPosition();
    const { points, textPosIndex } = this.attrs;
    return points[textPosIndex || 0];
  }

  updateTextPosition() {
    const { points } = this.attrs;
    const rect = this.getBoundRect();
    const index = utils.getMinVectorIndex({ x: rect.x, y: rect.y }, points);
    if (index < 0) return;
    this.attrs.textPosIndex = index;
  }
  clonePointsData() {
    return { points: cloneDeep(this.attrs.points) };
  }
  newShape() {
    return new Line();
  }
  get toolType() {
    return ToolType.POLYLINE;
  }
}
