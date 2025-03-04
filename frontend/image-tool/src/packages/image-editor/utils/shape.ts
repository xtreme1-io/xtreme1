import { AnnotateObject } from '../types';
import { Rect } from '../ImageView/shape';
import ImageView from '../ImageView';
import { ISideRect, Vector2, IRectOption } from '../ImageView/type';
import { countAngleFromX, countTransformPoint, getArea, getDistance, vectorAngle } from './common';

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
    const rotation = countAngleFromX(points[0], points[1]);
    return { x, y, width, height, rotation };
  }
  return getRectFromPoints([points[0], points[points.length - 1]]);
}

export function constraintY(object: AnnotateObject) {
  return function (abPos: Vector2) {
    return {
      x: object.absolutePosition().x,
      y: abPos.y,
    };
  };
}

export function constraintX(object: AnnotateObject) {
  return function (abPos: Vector2) {
    return {
      x: abPos.x,
      y: object.absolutePosition().y,
    };
  };
}

export function constraintInImage(object: AnnotateObject, view: ImageView) {
  return function (abPos: Vector2) {
    if (!view.editor.state.config.limitPosition) return abPos;
    // limit position
    const { backgroundWidth, backgroundHeight } = view;
    const transform = view.stage.getAbsoluteTransform().copy();
    transform.invert();
    const stagePos = transform.point(abPos);
    clampToRect(stagePos, 0, 0, backgroundWidth, backgroundHeight);
    transform.invert();
    const newPos = transform.point(stagePos);
    return newPos;
  };
}

export function multiConstrain(constraints: ((e: Vector2) => Vector2)[]) {
  return function (abPos: Vector2) {
    let newPos = abPos;
    constraints.forEach((fn) => {
      newPos = fn(newPos);
    });
    return newPos;
  };
}

// 获取旋转后的矩形四个点坐标(返回[左上,右上,右下,左下])
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

export function getRectSide(rect: IRectOption) {
  const { x, y, width, height } = rect;
  const left = x;
  const right = x + width;
  const top = y;
  const bottom = y + height;
  return { left, right, top, bottom };
}

export function getRectFromSide(side: ISideRect) {
  const minX = Math.min(side.left, side.right);
  const minY = Math.min(side.top, side.bottom);
  return {
    x: minX,
    y: minY,
    width: Math.abs(side.left - side.right),
    height: Math.abs(side.top - side.bottom),
  };
}

export function clampToRect(point: Vector2, x: number, y: number, width: number, height: number) {
  if (point.x < x) point.x = x;
  if (point.x > x + width) point.x = x + width;
  if (point.y < y) point.y = y;
  if (point.y > y + height) point.y = y + height;
}

export function clampRect(rect: IRectOption, to: IRectOption) {
  const { x, y, width, height } = rect;
  let left = Math.min(x, x + width);
  let right = Math.max(x, x + width);
  let top = Math.min(y, y + height);
  let bottom = Math.max(y, y + height);

  if (left < to.x) left = to.x;
  if (top < to.y) top = to.y;
  if (right > to.x + to.width) right = to.x + to.width;
  if (bottom > to.y + to.height) bottom = to.y + to.height;

  return getRectFromSide({ left, right, top, bottom });
}

export function mergeSamePoints(points: Vector2[], distance = 0.01) {
  const newPoints = [] as Vector2[];

  let lastP = undefined as Vector2 | undefined;
  points.forEach((p) => {
    if (lastP) {
      let dis = (p.x - lastP.x) * (p.x - lastP.x) + (p.y - lastP.y) * (p.y - lastP.y);
      dis = Math.sqrt(dis);
      if (dis < distance) return;
    }
    lastP = p;
    newPoints.push(p);
  });
  return newPoints;
}
// 判断点是否全在box内
export function pointsInBox(points: Vector2[], box: ISideRect) {
  let invalid = false;
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    invalid =
      point.y < box.top || point.y > box.bottom || point.x < box.left || point.x > box.right;
    if (invalid) return true;
  }
  return invalid;
}
// 使得 box1 无论怎样转换都在 box2 中, 计算 box1 转换后的偏移量
/**
 * @param abPos: box1变换后的position
 * @param box1
 * @param box2
 */
export function transformOffset(abPos: Vector2, box1: IRectOption, box2: ISideRect) {
  const left = abPos.x + box1.x;
  const top = abPos.y + box1.y;
  const right = left + box1.width;
  const bottom = top + box1.height;

  let offsetX = 0;
  let offsetY = 0;

  if (left < box2.left) offsetX = box2.left - left;
  else if (right > box2.right) offsetX = box2.right - right;
  if (top < box2.top) offsetY = box2.top - top;
  else if (bottom > box2.bottom) offsetY = box2.bottom - bottom;

  return { offsetX, offsetY };
}

/**
 * 椭圆包围盒
 * @param radiusX x
 * @param radiusY x
 * @param rotation 角度 0~360
 * @returns {x,y,width,height}
 */
export function getEllipseBoundingBox(radiusX: number, radiusY: number, rotation: number) {
  const theta = (rotation / 180) * Math.PI;
  const sin_theta = Math.sin(theta);
  const cos_theta = Math.cos(theta);
  const A = radiusX ** 2 * sin_theta ** 2 + radiusY ** 2 * cos_theta ** 2;
  const B = 2 * (radiusX ** 2 - radiusY ** 2) * sin_theta * cos_theta;
  const C = radiusX ** 2 * cos_theta ** 2 + radiusY ** 2 * sin_theta ** 2;
  const D = -(radiusX ** 2 * radiusY ** 2);
  const h = Math.sqrt((4 * A * D) / (B ** 2 - 4 * A * C));
  const w = Math.sqrt((4 * C * D) / (B ** 2 - 4 * A * C));
  return { x: -w, y: -h, width: w * 2, height: h * 2 };
}

/**
 * 多边形突刺处理(按面积处理)
 * 循环每个点, 比较原面积与去掉该点后的面积, 若差值小于1或者原面积的1%的最小值,
 * 则认为该点无效, 应当去除
 */
export function clearPointsByArea(points: Vector2[]) {
  let newPoints = [...points];
  let initArea = getArea(points);
  if (initArea < 1) return newPoints;
  const diff = Math.min(1, initArea * 0.01);
  for (let i = 0; i < newPoints.length; i++) {
    if (newPoints.length < 3) return [];
    const spPoints = newPoints.filter((p, index) => index != i);
    const spArea = getArea(spPoints);
    if (Math.abs(spArea - initArea) < diff) {
      newPoints = spPoints;
      initArea = spArea;
      i--;
    }
  }
  return newPoints;
}
/**
 * 多边形突刺处理(按点曲率处理)
 * 循环每个点, 计算每个点的两条边的夹角, 若夹角小于diff, 或者该点与上一个点形成的边长过短,
 * 则认为该点无效, 应当去除
 */
export function clearPointsByAngle(points: Vector2[], diff: number = 0.36) {
  const newPoints = [...points];
  for (let i = 0; i < newPoints.length; i++) {
    if (newPoints.length < 3) return [];
    const p = newPoints[i];
    const lastP = newPoints[i - 1] || newPoints[newPoints.length - 1];
    const nextP = newPoints[i + 1] || newPoints[0];
    const angle = Math.abs(vectorAngle([p, lastP], [p, nextP]) % 360);
    if (
      angle < diff ||
      Math.abs(angle - 180) < diff ||
      360 - angle < diff ||
      getDistance(p, lastP) < 0.01
    ) {
      newPoints.splice(i, 1);
      i--;
    }
  }
  return newPoints;
}
