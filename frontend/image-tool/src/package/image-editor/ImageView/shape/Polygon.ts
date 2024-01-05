import Konva from 'konva';
import Shape from './Shape';
import { IPolygonConfig, CacheName, AnnotateClassName } from '../type';
import * as utils from '../../utils';
import { ToolType } from '../../types';
import { cloneDeep } from 'lodash';

export default class Polygon extends Shape {
  className = 'polygon' as AnnotateClassName;
  declare attrs: Required<IPolygonConfig>;

  constructor(config?: IPolygonConfig) {
    super(Object.assign({ points: [], innerPoints: [] }, config));

    this.on('pointsChange innerPointsChange', function () {
      this.onPointChange();
    });
  }

  onPointChange() {
    this._clearCache('area' as CacheName);
    super.onPointChange();
  }

  _sceneFunc(context: Konva.Context, shape: Konva.Shape) {
    const { points, innerPoints } = this.attrs;
    if (!points || points.length < 3) return;

    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      context.lineTo(p.x, p.y);
    }
    context.closePath();
    if (innerPoints && innerPoints.length > 0) {
      innerPoints.forEach((config) => {
        const points = config.points;
        context.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          const p = points[i];
          context.lineTo(p.x, p.y);
        }
        context.closePath();
      });
    }
    context.fillStrokeShape(this);
  }

  getArea() {
    return this._getCache('area' as CacheName, this._getArea) as number;
  }
  _getArea() {
    const { points, innerPoints } = this.attrs;
    const area = utils.getArea(points, innerPoints);
    return area;
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
    const { points, innerPoints } = this.attrs;
    return {
      points: cloneDeep(points),
      innerPoints: cloneDeep(innerPoints),
    };
  }
  newShape() {
    return new Polygon();
  }
  get toolType() {
    return ToolType.POLYGON;
  }
}
