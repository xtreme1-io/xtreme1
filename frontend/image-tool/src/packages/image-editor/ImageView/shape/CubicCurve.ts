import Konva from 'konva';
import Shape from './Shape';
import { IShapeConfig, Vector2, ICubicControl } from '../type';
import * as utils from '../../utils';
import { ToolType } from '../../types';

export interface ICubicCurveConfig extends IShapeConfig {
  points: Vector2[];
  controls: ICubicControl[];
}

export default class CubicCurve extends Shape {
  className = 'cubic-curve';
  declare attrs: Required<ICubicCurveConfig>;
  constructor(config?: ICubicCurveConfig) {
    super(Object.assign({ points: [], hitStrokeWidth: 4 }, config));

    this.on('xChange yChange pointsChange controlsChange', function () {
      this.onPointChange();
    });
  }

  _sceneFunc(context: Konva.Context, shape: Konva.Shape) {
    const { points, controls } = this.attrs;

    if (!points || points.length === 0) return;
    if (!controls || controls.length !== points.length) return;

    context.beginPath();
    let pre = points[0];
    context.moveTo(pre.x, pre.y);
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      const ctrl1 = controls[i - 1][1];
      const ctrl2 = controls[i][0];
      if (!ctrl1 || !ctrl2) break;
      context.bezierCurveTo(ctrl1.x, ctrl1.y, ctrl2.x, ctrl2.y, point.x, point.y);
      pre = point;
    }
    context.strokeShape(this);
  }

  getSelfRect() {
    return utils.getPointsBoundRect(this.attrs.points);
  }

  updateTextPosition() {
    const { points } = this.attrs;
    const rect = this.getBoundRect();
    const index = utils.getClosestPointIndex({ x: rect.x, y: rect.y }, points);
    if (index < 0) return;

    this.attrs.textPosIndex = index;
  }

  clonePointsData() {
    const { points, controls } = this.attrs;

    const clonePoints = JSON.parse(JSON.stringify(points));
    const cloneControls = JSON.parse(JSON.stringify(controls));

    return {
      points: clonePoints,
      controls: cloneControls,
    };
  }
  newShape() {
    return new CubicCurve();
  }
  get toolType() {
    return ToolType.CURVE;
  }
}
