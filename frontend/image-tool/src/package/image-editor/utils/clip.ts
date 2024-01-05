// import polygonClip from 'polygon-clipping';
// @ts-ignore
import polygonClip from '../lib/polygon-clipping';
import { Polygon } from '../ImageView/shape';
import { Vector2, IPolygonInnerConfig } from '../types';
import { countPointsOrder, getArea } from './common';
import { getShapeRealPoint } from './shape';

export function polygon2GeoPointsArray(polygon: Polygon) {
  const { points, innerPoints, x, y } = polygon.attrs;
  const toFixed = (n: any) => {
    return +Number(n).toFixed(8);
  };
  const geom: polygonClip.Polygon = [];
  const pointsArray = points.map((p) => [toFixed(p.x + x), toFixed(p.y + y)]);
  geom.push(pointsArray);

  innerPoints.forEach((e) => {
    const inPointsArr = e.points.map((p) => [toFixed(p.x + x), toFixed(p.y + y)]);
    if (inPointsArr.length > 0) {
      geom.push(inPointsArr);
    }
  });
  return geom;
}
export function polygon2PointsVector(polygon: Polygon) {
  const { points, innerPoints, x, y } = polygon.attrs;

  const geoArray: { points: Vector2[]; innerPoints?: IPolygonInnerConfig[] } = {
    points: [] as Vector2[],
  };
  const pointsArray = [] as any[];
  points.forEach((p) => {
    pointsArray.push({ x: p.x + x, y: p.y + y });
  });
  geoArray.points = pointsArray;

  if (innerPoints && innerPoints.length > 0) {
    const innerPointsArray = [] as IPolygonInnerConfig[];
    innerPoints.forEach((config) => {
      const inners: IPolygonInnerConfig = { points: [] as Vector2[] };
      config.points.forEach((p) => {
        inners.points.push({ x: p.x + x, y: p.y + y });
      });
      innerPointsArray.push(inners);
    });
    geoArray.innerPoints = innerPointsArray;
  }

  return geoArray;
}

export function geoPointsArray2Polygon(pointsArray: number[][][], originPoints?: Vector2[]) {
  let points = [] as Vector2[];
  const innerPoints = [] as IPolygonInnerConfig[];
  const mapKey = (p: number[]) => `${p[0].toFixed(4)}-${p[1].toFixed(4)}`;

  pointsArray.forEach((_pointsArray, index) => {
    const pointsMap: Record<string, Vector2> = {};
    if (index === 0) {
      _pointsArray.forEach((p) => {
        const p2v = { x: p[0], y: p[1] };
        if (!pointsMap[mapKey(p)]) {
          pointsMap[mapKey(p)] = p2v;
          points.push(p2v);
        }
      });
    } else {
      const inner = [] as Vector2[];
      _pointsArray.forEach((p) => {
        const p2v = { x: p[0], y: p[1] };
        if (!pointsMap[mapKey(p)]) {
          pointsMap[mapKey(p)] = p2v;
          inner.push(p2v);
        }
      });
      if (inner.length > 2) innerPoints.push({ points: inner });
    }
  });
  if (points.length > 2) return new Polygon({ points, innerPoints });
  return null;
}

export function polygonToClip(cliped: Polygon, clip: Polygon) {
  const newShapes: Polygon[] = [];
  const clipedPoints: any[] = polygon2GeoPointsArray(cliped);
  const clipPoints: any[] = polygon2GeoPointsArray(clip);
  const results = polygonClip.difference(clipedPoints, clipPoints);
  results.forEach((result: any) => {
    const poly = geoPointsArray2Polygon(result as any, getShapeRealPoint(cliped, undefined, true));
    poly && newShapes.push(poly);
  });
  return newShapes;
}
export function polygonToClips(cliped: Polygon, clips: Polygon[]) {
  const newShapes: Polygon[] = [];
  const clipedPoints: any[] = polygon2GeoPointsArray(cliped);
  const clipPoints: any[] = [];
  clips.forEach((e) => {
    clipPoints.push(polygon2GeoPointsArray(e));
  });
  const results = polygonClip.difference(clipedPoints, ...clipPoints);
  results.forEach((result: any) => {
    const poly = geoPointsArray2Polygon(result as any, getShapeRealPoint(cliped, undefined, true));
    poly && newShapes.push(poly);
  });
  return newShapes;
}
export function polygonsHollow(hollowedShape: Polygon, holes: Polygon[]) {
  const hollowedOrder = countPointsOrder(hollowedShape.attrs.points);
  const holesPoints = [] as IPolygonInnerConfig[];
  holes.forEach((holeShape) => {
    let nowPoints = polygon2PointsVector(holeShape).points;
    const polygonOrder = countPointsOrder(holeShape.attrs.points);
    if (hollowedOrder === polygonOrder) {
      nowPoints = nowPoints.reverse();
    }
    holesPoints.push({ points: nowPoints });
  });
  return holesPoints;
}

export function pointIsInPolygon(p: Vector2, polygon: Vector2[]) {
  let minX = polygon[0].x,
    maxX = polygon[0].x;
  let minY = polygon[0].y,
    maxY = polygon[0].y;
  for (let n = 1; n < polygon.length; n++) {
    const q = polygon[n];
    minX = Math.min(q.x, minX);
    maxX = Math.max(q.x, maxX);
    minY = Math.min(q.y, minY);
    maxY = Math.max(q.y, maxY);
  }

  if (p.x < minX || p.x > maxX || p.y < minY || p.y > maxY) {
    return false;
  }

  let isInside = false;
  let i = 0,
    j = polygon.length - 1;
  for (; i < polygon.length; j = i++) {
    if (
      polygon[i].y > p.y != polygon[j].y > p.y &&
      p.x <
        ((polygon[j].x - polygon[i].x) * (p.y - polygon[i].y)) / (polygon[j].y - polygon[i].y) +
          polygon[i].x
    ) {
      isInside = !isInside;
    }
  }

  return isInside;
}

export const POSTYPE = {
  intersect: 'intersect',
  disjoint: 'disjoint',
  contain: 'contain',
  contain_1: 'contain_1',
};
export function polygonContains(source: Polygon, target: Polygon) {
  const sourcePoints = polygon2PointsVector(source);
  const targetPoints = polygon2PointsVector(target).points;
  return checkPolygonHollowCondition(sourcePoints, targetPoints);
}
export function checkPolygonInnerPoints(shape: Polygon): boolean {
  const realPoints = polygon2PointsVector(shape);
  const innerPoints = realPoints.innerPoints;
  const innerLen = innerPoints?.length || 0;
  if (!innerPoints || innerLen === 0) return true;
  for (let i = 0; i < innerLen; i++) {
    if (!checkPolygonHollowCondition(realPoints, innerPoints[i].points, i)) return false;
  }
  return true;
}
/**
 * @param polgon
 * @param hole
 * @param holeIndex
 */
export function checkPolygonHollowCondition(
  polgon: {
    points: Vector2[];
    innerPoints?: IPolygonInnerConfig[];
  },
  hole: Vector2[],
  holeIndex?: number,
): boolean {
  const holeArea = getArea(hole);
  if (getArea(polgon.points) <= holeArea) return false;
  for (let i = 0; i < hole.length; i++) {
    if (!pointIsInPolygon(hole[i], polgon.points)) return false;
  }
  const sourceRelation = shapePositionRelation(polgon.points, hole);
  if (sourceRelation !== POSTYPE.contain) return false;
  let allDisJoint: boolean = true;
  if (polgon.innerPoints && polgon.innerPoints.length > 0) {
    polgon.innerPoints.forEach((ring, index) => {
      if (index === holeIndex) return;
      const args = getArea(ring.points) > holeArea ? [ring.points, hole] : [hole, ring.points];
      if (shapePositionRelation(args[0], args[1]) !== POSTYPE.disjoint) {
        allDisJoint = false;
        return;
      }
    });
  }
  return allDisJoint;
}
export function shapePositionRelation(points1: Vector2[], points2: Vector2[]): string {
  const lines1 = getEdgesByPoints(points1);
  const lines2 = getEdgesByPoints(points2);
  let linesIntersect: boolean = false;
  lines2.forEach((line2: Vector2[]) => {
    lines1.forEach((line1: Vector2[]) => {
      if (checkLinesIntersect(line1, line2)) {
        linesIntersect = true;
        return;
      }
    });
    if (linesIntersect) return;
  });
  if (linesIntersect) return POSTYPE.intersect;
  let allIn_p1 = true;
  for (let i = 0; i < points2.length; i++) {
    const point_in_p1 = pointIsInPolygon(points2[i], points1);
    if (!point_in_p1) {
      allIn_p1 = false;
      break;
    }
  }
  if (allIn_p1) return POSTYPE.contain;
  let allIn_p2 = true;
  for (let i = 0; i < points1.length; i++) {
    const point_in_p2 = pointIsInPolygon(points1[i], points2);
    if (!point_in_p2) {
      allIn_p2 = false;
      break;
    }
  }
  if (allIn_p2) return POSTYPE.contain_1;
  return POSTYPE.disjoint;
}
export function getEdgesByPoints(points: Vector2[]): Vector2[][] {
  const len = points.length;
  const arr = [];
  for (let i = 0; i < len; i++) {
    if (i === len - 1) arr.push([points[i], points[0]]);
    else arr.push([points[i], points[i + 1]]);
  }
  return arr;
}
export function checkLinesIntersect(L1: Vector2[], L2: Vector2[]): boolean {
  if (L1.length === 0 || L2.length === 0) return false;
  if (Math.max(L1[0].x, L1[1].x) < Math.min(L2[0].x, L2[1].x)) return false;
  if (Math.max(L2[0].x, L2[1].x) < Math.min(L1[0].x, L1[1].x)) return false;
  if (Math.max(L1[0].y, L1[1].y) < Math.min(L2[0].y, L2[1].y)) return false;
  if (Math.max(L2[0].y, L2[1].y) < Math.min(L1[0].y, L1[1].y)) return false;
  function mult(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
    return (x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3);
  }
  if (
    mult(L2[0].x, L2[0].y, L1[1].x, L1[1].y, L1[0].x, L1[0].y) *
      mult(L1[1].x, L1[1].y, L2[1].x, L2[1].y, L1[0].x, L1[0].y) <
    0
  )
    return false;
  if (
    mult(L1[0].x, L1[0].y, L2[1].x, L2[1].y, L2[0].x, L2[0].y) *
      mult(L2[1].x, L2[1].y, L1[1].x, L1[1].y, L2[0].x, L2[0].y) <
    0
  )
    return false;
  return true;
}
