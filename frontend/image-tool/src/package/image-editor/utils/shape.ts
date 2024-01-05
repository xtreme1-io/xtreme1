import { Rect } from '../ImageView/shape';
import { Vector2, IRectOption, AnnotateObject } from '../ImageView/type';
import { computeDegree, countTransformPoint } from './common';

export function getRectSide(rect: IRectOption) {
  const { x, y, width, height } = rect;
  const left = x;
  const right = x + width;
  const top = y;
  const bottom = y + height;
  return { left, right, top, bottom };
}
// return [leftTop, rightTop, rightBottom, leftBottom]
export function getRotatedRectPoints(rect: Rect) {
  const center = rect.rotationCenter;
  const r = rect.rotation() || 0;
  return getRectPointsWithRotation(rect.attrs, r, center);
}
export function getRectPointsWithRotation(rect: IRectOption, r: number, center?: Vector2) {
  const { x, y } = rect;
  center = center || { x, y };
  const { left, right, top, bottom } = getRectSide(rect);
  const topleft = countTransformPoint(center, { x: left, y: top }, r);
  const topright = countTransformPoint(center, { x: right, y: top }, r);
  const bottomright = countTransformPoint(center, { x: right, y: bottom }, r);
  const bottomleft = countTransformPoint(center, { x: left, y: bottom }, r);
  return [topleft, topright, bottomright, bottomleft];
}
export function getRectFromPoints(points: [Vector2, Vector2]) {
  const minX = Math.min(points[0].x, points[1].x);
  const minY = Math.min(points[0].y, points[1].y);
  return {
    x: minX,
    y: minY,
    width: Math.abs(points[0].x - points[1].x),
    height: Math.abs(points[0].y - points[1].y),
    rotation: 0,
  };
}
export function getRectFromPointsWithRotation(points: Vector2[]) {
  if (points.length === 0) return { x: 0, y: 0, width: 0, height: 0, rotation: 0 };
  if (points.length === 4) {
    const x = points[0].x;
    const y = points[0].y;
    let dx = points[1].x - points[0].x;
    let dy = points[1].y - points[0].y;
    const width = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    dx = points[3].x - points[0].x;
    dy = points[3].y - points[0].y;
    const height = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    const rotation = computeDegree(points[0], points[1]);
    return { x, y, width, height, rotation };
  }
  return getRectFromPoints([points[0], points[points.length - 1]]);
}
// Coordinate Mapping
export function getShapeRealPoint(
  object: AnnotateObject,
  points?: Vector2[],
  self: boolean = true,
) {
  const nowPoints: Vector2[] = points || object.attrs.points;
  if (!nowPoints || nowPoints.length === 0) return [];
  const offset = self ? { x: object.attrs.x, y: object.attrs.y } : { x: 0, y: 0 };
  return nowPoints.map((p) => {
    return { x: p.x + offset.x, y: p.y + offset.y, attr: p.attr } as Vector2;
  });
}
