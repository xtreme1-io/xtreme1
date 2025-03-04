import Konva from 'konva';
import Shape from './Shape';
import { Vector2, ToolType } from '../../types';
import { IShapeConfig, CacheName } from '../type';
import * as utils from '../../utils';
import { defaultCuboidStateStyle } from '../../config';

export interface ICuboidConfig extends IShapeConfig {
  points?: Vector2[];
}
/**
 * 伪3D框
 */
export default class Cuboid extends Shape {
  className = 'cuboid';
  stateStyles?: Record<string, IShapeConfig> = defaultCuboidStateStyle;
  declare attrs: Required<ICuboidConfig>;

  constructor(config?: ICuboidConfig) {
    super(Object.assign({ points: [], hitStrokeWidth: 4 }, config));

    this.on('xChange yChange widthChange heightChange pointsChange', function () {
      this.onPointChange();
    });
  }

  _sceneFunc(context: Konva.Context) {
    const { points } = this.attrs;

    if (!points || points.length !== 8) return;

    let i = 0;
    context.beginPath();
    context.setLineDash([]);
    // 四条侧边
    for (i = 0; i < 4; i++) {
      let p = points[i];
      context.moveTo(p.x, p.y);
      p = points[i + 4];
      context.lineTo(p.x, p.y);
      context.closePath();
    }
    context.strokeShape(this);
    // 第一个面
    context.setLineDash([]);
    context.moveTo(points[0].x, points[0].y);
    for (i = 1; i < 4; i++) {
      const p = points[i];
      context.lineTo(p.x, p.y);
    }
    context.closePath();
    context.fillStrokeShape(this);
    // 第二个面
    context.beginPath();
    context.setLineDash([5, 5]);
    context.moveTo(points[4].x, points[4].y);
    for (i = 5; i < 8; i++) {
      const p = points[i];
      context.lineTo(p.x, p.y);
    }
    context.closePath();

    context.fillStrokeShape(this);
    this.drawPoint(context, points);
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
    return new Cuboid();
  }
  get toolType() {
    return ToolType.IMAGE_CUBOID;
  }
}
