import { cloneDeep } from 'lodash';
import Konva from 'konva';
import Shape from './Shape';
import { Vector2 } from '../../types';
import { IShapeConfig, CacheName } from '../type';
import * as utils from '../../utils';
import { ToolType } from '../../types';
import { defaultLineStateStyle } from '../../config';

export interface ILineConfig extends IShapeConfig {
  points?: Vector2[];
}

export default class Line extends Shape {
  className = 'line';
  stateStyles = cloneDeep(defaultLineStateStyle);
  declare attrs: Required<ILineConfig>;
  constructor(config?: ILineConfig) {
    super(Object.assign({ points: [], hitStrokeWidth: 6 }, config));

    this.on('xChange yChange pointsChange', function () {
      this.onPointChange();
    });
  }

  onPointChange() {
    this._clearCache('length' as CacheName);
    super.onPointChange();
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
    this.drawPoint(context, points);
  }

  getLength() {
    return this._getCache('length' as CacheName, this._getLength) as number;
  }
  _getLength() {
    const { points } = this.attrs;
    const len = utils.getLineLength(points);
    return len;
  }

  getSelfRect(onlySelf?: boolean) {
    return utils.getPointsBoundRect(this.attrs.points);
  }

  _getTextPosition() {
    this.updateTextPosition();
    const { points, textPosIndex } = this.attrs;
    return points[textPosIndex || 0];
  }

  updateTextPosition() {
    const { points } = this.attrs;
    const rect = this.getBoundRect();
    const index = utils.getClosestPointIndex({ x: rect.x, y: rect.y }, points);
    if (index < 0) return;
    this.attrs.textPosIndex = index;
  }

  clonePointsData() {
    const { points } = this.attrs;
    const clonePoints = [] as Vector2[];
    points.forEach((e) => {
      clonePoints.push({ ...e });
    });
    return {
      points: clonePoints,
    };
  }
  newShape() {
    return new Line();
  }
  get toolType() {
    return ToolType.POLYLINE;
  }
}
