/**
 * mathematical formulas
 */

import { IPolygonInnerConfig, IRectOption, Vector2 } from '../ImageView/type';

export function getDistance(p0: Vector2, p1: Vector2, zoom: number = 1) {
  const dis = Math.sqrt(Math.pow(p0.x - p1.x, 2) + Math.pow(p0.y - p1.y, 2));
  return dis / zoom;
}

export function getLineLength(points: Vector2[], zoom: number = 1) {
  let ret = 0;
  const length = points.length;
  if (length < 2) return ret;
  for (let i = 1; i < length; i++) {
    ret = ret + getDistance(points[i - 1], points[i], zoom);
  }
  return ret;
}
/**
 * Calculate the area of a closed shape
 * @param points
 * @param inners
 * @returns number
 */
export function getArea(points: Vector2[], inners?: IPolygonInnerConfig[]) {
  const l = points.length;
  let area = 0;
  points = points.concat(points[0]);
  let s = 0;
  for (let i = 0; i < l; i++) {
    s += points[i].x * points[i + 1].y - points[i].y * points[i + 1].x;
  }
  area = Math.abs(s / 2);
  if (inners && inners.length > 0) {
    let innerArea = 0;
    inners.forEach((innerPoints) => {
      innerArea += getArea(innerPoints.points);
    });
    area -= innerArea;
  }
  return area;
}
// Calculation vector modulus
export function getMinVectorIndex(p: Vector2, points: Vector2[]) {
  let minDis = Infinity;
  let minIndex = -1;
  points.forEach((e, index) => {
    const dirx = e.x - p.x;
    const diry = e.y - p.y;
    const dis = Math.sqrt(dirx * dirx + diry * diry);
    if (dis < minDis) {
      minDis = dis;
      minIndex = index;
    }
  });
  return minIndex;
}
// [0, 2π] => [0, 360]
export function rad2deg(ra: number) {
  return ra * (180 / Math.PI);
}
// [0, 360] => [0, 2π]
export function deg2radian(deg: number) {
  return deg * (Math.PI / 180);
}
// Calculate the coordinates of a point rotating a certain angle around another point
export function countTransformPoint(center: Vector2, point: Vector2, angle: number): Vector2 {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const r = deg2radian(angle);
  const x = dx * Math.cos(r) - dy * Math.sin(r) + center.x;
  const y = dx * Math.sin(r) + dy * Math.cos(r) + center.y;
  return { x, y };
}
// vector rad
export function computeDegree(point1: Vector2, point2?: Vector2) {
  let x: number;
  let y: number;
  if (point2) {
    x = point2.x - point1.x;
    y = point2.y - point1.y;
  } else {
    x = point1.x;
    y = point1.y;
  }
  const angel = Math.atan2(-y, -x) + Math.PI;
  return ((angel / Math.PI) * 180) % 360;
}
// b-box
export function getPointsBoundRect(points: Vector2[]): IRectOption {
  if (points.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

  let minX = points[0].x,
    maxX = points[0].x;
  let minY = points[0].y,
    maxY = points[0].y;
  for (let n = 1; n < points.length; n++) {
    const q = points[n];
    minX = Math.min(q.x, minX);
    maxX = Math.max(q.x, maxX);
    minY = Math.min(q.y, minY);
    maxY = Math.max(q.y, maxY);
  }

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function getPointOnLine(relativePoint: Vector2, startPoint: Vector2, endPoint: Vector2) {
  const dx = endPoint.x - startPoint.x;
  if (dx == 0) {
    return {
      x: startPoint.x,
      y: relativePoint.y,
    };
  }
  const A = (endPoint.y - startPoint.y) / dx;
  const B = endPoint.y - A * endPoint.x;
  const m = relativePoint.x + A * relativePoint.y;
  const x = (m - A * B) / (A * A + 1);
  const y = A * x + B;
  return {
    x: x,
    y: y,
  };
}
// 1 clockwise; -1 anticlockwise
export function countPointsOrder(points: Vector2[]) {
  let maxXindex = 0;
  let maxX = 0;
  points.forEach((p, index) => {
    if (p.x > maxX) {
      maxX = p.x;
      maxXindex = index;
    }
  });
  const index0 = (maxXindex === 0 ? points.length : maxXindex) - 1;
  const index1 = maxXindex === points.length - 1 ? 0 : maxXindex + 1;
  const p0 = points[index0];
  const p1 = points[maxXindex];
  const p2 = points[index1];
  const crossResult = (p1.x - p0.x) * (p2.y - p1.y) - (p1.y - p0.y) * (p2.x - p1.x);
  if (crossResult < 0) return -1;
  else if (crossResult > 0) return 1;
  else if (p2.y > p1.y) return 1;
  else if (p2.y < p1.y) return -1;
  else return 1;
}
