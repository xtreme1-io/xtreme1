import Konva from 'konva';
import Shape from './Shape';
import { IShapeConfig, Vector2, CacheName } from '../type';
import * as utils from '../../utils';
import { ToolType } from '../../types';
import { cloneDeep } from 'lodash';
import { defaultLineStateStyle } from '../../config';

export interface ISplineCurveConfig extends IShapeConfig {
  points?: Vector2[];
  tension?: number;
}

export interface ICurveConfig {
  type: 'quadratic' | 'cubic';
  points: Vector2[];
  lenStart?: number;
  lenEnd?: number;
}

export default class SplineCurve extends Shape {
  className = 'spline-curve';
  expandPoints: Vector2[] = [];
  stateStyles = cloneDeep(defaultLineStateStyle);
  declare attrs: Required<ISplineCurveConfig>;
  constructor(config?: ISplineCurveConfig) {
    super(Object.assign({ points: [], hitStrokeWidth: 6, tension: 0.5 }, config));

    this.on('xChange yChange pointsChange tensionChange', function () {
      this.onPointChange();
    });
  }
  get toolType() {
    return ToolType.CURVE;
  }

  onPointChange() {
    this._clearCache('expandData' as CacheName);
    this._clearCache('curveLength' as CacheName);
    super.onPointChange();
  }

  _sceneFunc(context: Konva.Context, shape: Konva.Shape) {
    const { points } = this.attrs;
    const length = points.length;
    // let closed = false;

    if (length < 2) return;

    context.beginPath();
    if (length === 2) {
      context.moveTo(points[0].x, points[0].y);
      context.lineTo(points[1].x, points[1].y);
    } else {
      const config = this.getExpandData();
      context.moveTo(config[0].points[0].x, config[0].points[0].y);
      config.forEach((e) => {
        const p = e.points;
        if (e.type === 'quadratic') {
          context.quadraticCurveTo(p[1].x, p[1].y, p[2].x, p[2].y);
        } else {
          context.bezierCurveTo(p[1].x, p[1].y, p[2].x, p[2].y, p[3].x, p[3].y);
        }
      });
    }
    context.strokeShape(this);
    this.drawPoint(context, points);
  }

  getExpandData() {
    return this._getCache('expandData', this._getExpandData) as ICurveConfig[];
  }
  _getExpandData() {
    const { points, tension } = this.attrs;
    const eps = expandPoints(points, tension);
    const curveConfig = [] as ICurveConfig[];
    // save points
    this.expandPoints = eps;
    curveConfig.push({ type: 'quadratic', points: [points[0], eps[0], eps[1]] });
    let n = 2;
    const len = eps.length;
    while (n < len - 1) {
      curveConfig.push({
        type: 'cubic',
        points: [eps[n - 1], eps[n], eps[n + 1], eps[n + 2]],
      });
      n = n + 3;
    }
    curveConfig.push({
      type: 'quadratic',
      points: [eps[eps.length - 2], eps[eps.length - 1], points[points.length - 1]],
    });

    return curveConfig;
  }

  getLength() {
    return this._getCache('curveLength', this._getLength) as number;
  }

  _getLength() {
    const curves = this.getExpandData();
    let total = 0;
    curves.forEach((e) => {
      const len = getCurveLength(e);
      e.lenStart = total;
      e.lenEnd = total + len;
      total = total + len;
    });
    return total;
  }

  getSelfRect() {
    const { points } = this.attrs;
    this.getExpandData();
    return utils.getPointsBoundRect([points[0], ...this.expandPoints, points[points.length - 1]]);
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

  getPoint(t: number) {
    if (this.attrs.points.length === 2) {
      const p1 = this.attrs.points[0];
      const p2 = this.attrs.points[1];
      const diffX = p2.x - p1.x;
      const diffY = p2.y - p1.y;
      return { x: p1.x + t * diffX, y: p1.y + t * diffY };
    }
    const curves = this.getExpandData() as Required<ICurveConfig>[];
    const length = this.getLength();
    const tLen = length * t;

    const find = curves.find((e) => tLen >= e.lenStart && tLen <= e.lenEnd);
    if (!find) return this.attrs.points[0];

    t = (tLen - find.lenStart) / (find.lenEnd - find.lenStart);

    const curveFn = find.type === 'quadratic' ? utils.quadraticCurve : utils.cubicCurve;
    return (curveFn as any)(...find.points, t) as Vector2;
  }
  newShape() {
    return new SplineCurve();
  }
}

function getControlPoints(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  t: number,
) {
  const d01 = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2)),
    d12 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)),
    fa = (t * d01) / (d01 + d12),
    fb = (t * d12) / (d01 + d12),
    p1x = x1 - fa * (x2 - x0),
    p1y = y1 - fa * (y2 - y0),
    p2x = x1 + fb * (x2 - x0),
    p2y = y1 + fb * (y2 - y0);

  return [p1x, p1y, p2x, p2y];
}

function expandPoints(p: Vector2[], tension: number) {
  let len = p.length,
    allPoints = [] as Vector2[],
    n,
    cp;

  for (n = 1; n < len - 1; n++) {
    cp = getControlPoints(p[n - 1].x, p[n - 1].y, p[n].x, p[n].y, p[n + 1].x, p[n + 1].y, tension);
    if (isNaN(cp[0])) {
      continue;
    }
    allPoints.push({ x: cp[0], y: cp[1] });
    allPoints.push(p[n]);
    allPoints.push({ x: cp[2], y: cp[3] });
  }

  return allPoints;
}

function getCurveLength(config: ICurveConfig, n = 30) {
  const curveFn = config.type === 'quadratic' ? utils.quadraticCurve : utils.cubicCurve;
  let prevP = undefined as any as Vector2;
  let curP = undefined as any as Vector2;
  let v = 0;
  let len = 0;
  for (let i = 0; i <= n; i++) {
    v = i / n;
    curP = (curveFn as any)(...config.points, v);
    if (prevP) {
      len += utils.distance(curP, prevP);
    }
    prevP = curP;
  }
  return len;
}
