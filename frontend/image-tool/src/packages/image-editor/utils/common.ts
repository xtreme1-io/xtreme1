import { v4 as uuid } from 'uuid';
import { Vector2, IRectOption, IPolygonInnerConfig } from '../types';
import Konva from 'konva';
import { nanoid } from 'nanoid';
import { GroupObject, AnnotateObject } from '../ImageView/export';
//@ts-ignore
import MathJax from '../../public/basic-mathjax.js';
// trackId
export function createTrackId() {
  return nanoid(16);
}

// uuid
export function createUUID() {
  return uuid();
}

// formatId
export function formatId(args: string[]) {
  return args.join('##');
}

// 'template { name }ddd'
// 'template { 0 }ddd'
export function template(str: string, args: Record<string, any> = {}) {
  const reg = /\{\s*(\w+)\s*\}/g;
  return str.replace(reg, (word: string, name: string) => {
    return args[name] || '';
  });
}

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

export function isPointInRect(
  px: number,
  py: number,
  x: number,
  y: number,
  width: number,
  height: number,
): boolean {
  return px >= x && px < x + width && py >= y && py <= y + height;
}

export function claimPoint2Rect(
  px: number,
  py: number,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  let pointX = px;
  let pointY = py;
  if (pointX < x) pointX = x;
  if (pointX > x + width) pointX = x + width;
  if (pointY < y) pointY = y;
  if (pointY > y + height) pointY = y + height;
  return { x: pointX, y: pointY };
}

export function getClosestPointIndex(p: Vector2, points: Vector2[]) {
  let minDis = Infinity;
  let minIndex = -1;
  points.forEach((e, index) => {
    const dis = getDistance(p, e);
    if (dis < minDis) {
      minDis = dis;
      minIndex = index;
    }
  });
  return minIndex;
}
// 两点间距离，按缩放比例转换到原图上
export function getDistance(p0: Vector2, p1: Vector2, zoom: number = 1) {
  const dis = Math.sqrt(Math.pow(p0.x - p1.x, 2) + Math.pow(p0.y - p1.y, 2));
  return dis / zoom; //转为图片中的距离
}

// 计算一组点的折线长度
export function getLineLength(points: Vector2[]) {
  let ret = 0;
  const length = points.length;
  if (length < 2) return ret;
  for (let i = 1; i < length; i++) {
    ret = ret + getDistance(points[i - 1], points[i]);
  }
  return ret;
}
// 计算一组点的闭合图形的面积
// 参数1: 闭合图形的点, 参数2: 需要排除的内部镂空点集
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

export function requestAnimFrame(obj: any, type: string, cb: () => void) {
  const id = '_animation_frame_' + type;
  if (obj[id]) return;

  obj[id] = true;
  Konva.Util.requestAnimFrame(() => {
    obj[id] = false;
    cb();
  });
}

export function flatObjects(objects: AnnotateObject[]) {
  const flats = [] as AnnotateObject[];
  traverse(objects, (e) => {
    flats.push(e);
  });
  return flats;
}

export function traverse(objects: AnnotateObject[], fn: (e: AnnotateObject) => void) {
  objects.forEach((e) => {
    fn(e);
  });
}

export function traverseShape(objects: AnnotateObject[], fn: (e: Konva.Shape) => void) {
  objects.forEach((e) => {
    if (e instanceof Konva.Shape) {
      fn(e);
    }

    if (e instanceof GroupObject) {
      fn(e.bgRect);
    }

    if (e instanceof Konva.Container && e.children) {
      traverseShape(e.children, fn);
    }
  });
}

// 弧度转角度
export function radian2angle(ra: number) {
  return ra * (180 / Math.PI);
}
// 角度转π
export function angle2radian(angle: number) {
  return angle * (Math.PI / 180);
}
// 计算一个点绕另一个点旋转某个角度后的坐标
export function countTransformPoint(center: Vector2, point: Vector2, angle: number) {
  const r = angle2radian(angle);
  const v = vectorRotate({ x: point.x - center.x, y: point.y - center.y }, r);
  return { x: v.x + center.x, y: v.y + center.y };
}
// 计算向量与x轴的夹角
export function countAngleFromX(point1: Vector2, point2: Vector2) {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  const len = getDistance(point1, point2, 1) || 1;
  let angle = radian2angle(Math.asin(Math.abs(dy) / len));

  if (dx >= 0 && dy === 0) angle = 0;
  else if (dx >= 0 && dy > 0) angle = 0 + angle;
  else if (dx >= 0 && dy < 0) angle = 0 - angle;
  else if (dx < 0 && dy === 0) angle = 180;
  else if (dx < 0 && dy > 0) angle = 180 - angle;
  else if (dx < 0 && dy < 0) angle = 180 + angle;
  return angle;
}
// 计算两个向量夹角
export function vectorAngle(v1: [Vector2, Vector2], v2: [Vector2, Vector2]) {
  const v1x = v1[0].x - v1[1].x;
  const v1y = v1[0].y - v1[1].y;
  const v2x = v2[0].x - v2[1].x;
  const v2y = v2[0].y - v2[1].y;
  const dot = v1x * v2x + v1y * v2y;
  const det = v1x * v2y - v1y * v2x;
  const rad = Math.atan2(det, dot);
  return radian2angle(rad);
}
/** 计算向量旋转后的新向量 (r 弧度) */
export function vectorRotate(v: Vector2, r: number) {
  const x = v.x * Math.cos(r) - v.y * Math.sin(r);
  const y = v.x * Math.sin(r) + v.y * Math.cos(r);
  return { x, y };
}
// 计算向量点乘
export function vectorDot(v1: Vector2, v2: Vector2) {
  return v1.x * v2.x + v1.y * v2.y;
}

// 顺时针夹角 0 ~ 360
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

export function toMMl(value: string) {
  MathJax.texReset();
  return MathJax.tex2mml(value);
}

export function isHorizontal(points: Vector2[]) {
  return new Set(points.map((e) => e.y)).size === 1;
}
export function isVerticality(points: Vector2[]) {
  return new Set(points.map((e) => e.x)).size === 1;
}
// 计算一组点顺序(1顺时针; -1逆时针)
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
/**
 * 以某组点为参照, 调整另一组点的顺序以及起始点
 */
export function adjustPoints(points: Vector2[], reference: Vector2[]) {
  const referenceOrd = countPointsOrder(reference);
  const ord = countPointsOrder(points);
  if (ord !== referenceOrd) points.reverse();
  const referenceFirst = reference[0];
  let dis = Infinity;
  let nearest = 0;
  points.forEach((p, i) => {
    const d = getDistance(p, referenceFirst);
    if (d < dis) {
      dis = d;
      nearest = i;
    }
  });
  const len = points.length;
  const newPoints: Vector2[] = [];
  while (newPoints.length < len) {
    nearest = nearest % len;
    newPoints.push(points[nearest]);
    nearest++;
  }
  return newPoints;
}
