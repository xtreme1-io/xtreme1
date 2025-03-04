import Konva from 'konva';
import Shape from './Shape';
import { Vector2, IPolygonConfig, IPolygonInnerConfig, CacheName } from '../type';
import * as utils from '../../utils';
import { ToolType } from '../../types';

export default class Polygon extends Shape {
  className = 'polygon';
  declare attrs: Required<IPolygonConfig>;
  constructor(config?: IPolygonConfig) {
    super(Object.assign({ points: [], hitStrokeWidth: 4 }, config));
    this.userData.pointsLimit = config?.pointsLimit || 0;

    this.on('xChange yChange pointsChange innerPointsChange', function () {
      this.onPointChange();
    });
  }

  onPointChange() {
    this._clearCache('area' as CacheName);
    super.onPointChange();
  }

  _sceneFunc(context: Konva.Context, shape: Konva.Shape) {
    const { points, innerPoints } = this.attrs;

    if (!points || points.length === 0) return;

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
    this.drawPoint(
      context,
      points.concat(
        innerPoints?.reduce((a, b) => {
          return a.concat(b.points);
        }, [] as Vector2[]),
      ),
    );
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
    return utils.getPointsBoundRect(this.attrs.points);
  }

  _getTextPosition() {
    this.updateTextPosition();
    const { points, textPosIndex } = this.attrs;
    return points[textPosIndex || 0];
  }

  updateTextPosition() {
    const rect = this.getBoundRect();
    const points = utils.getShapeRealPoint(this);
    const index = utils.getClosestPointIndex({ x: rect.x, y: rect.y }, points);
    if (index < 0) return;
    this.attrs.textPosIndex = index;
  }

  clonePointsData() {
    const { points, innerPoints } = this.attrs;
    const clonePoints = [] as Vector2[];
    const cloneInnerPoints = [] as IPolygonInnerConfig[];
    points.forEach((e) => {
      clonePoints.push({ ...e });
    });

    if (innerPoints && innerPoints.length > 0) {
      innerPoints.forEach((e) => {
        const innerConfig: IPolygonInnerConfig = { points: [] };
        e.points.forEach((p) => {
          innerConfig.points.push({ ...p });
        });
        cloneInnerPoints.push(innerConfig);
      });
    }
    return {
      points: clonePoints,
      innerPoints: cloneInnerPoints,
    };
  }
  newShape() {
    return new Polygon();
  }
  get toolType() {
    return ToolType.POLYGON;
  }
}
