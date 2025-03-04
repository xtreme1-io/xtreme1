import { Vector2 } from '../types';

export function quadraticCurve(p1: Vector2, c: Vector2, p2: Vector2, t: number) {
  const x = Math.pow(1 - t, 2) * p1.x + 2 * (1 - t) * t * c.x + Math.pow(t, 2) * p2.x;
  const y = Math.pow(1 - t, 2) * p1.y + 2 * (1 - t) * t * c.y + Math.pow(t, 2) * p2.y;
  return { x, y };
}

export function cubicCurve(p1: Vector2, c1: Vector2, c2: Vector2, p2: Vector2, t: number) {
  const x =
    Math.pow(1 - t, 3) * p1.x +
    3 * Math.pow(1 - t, 2) * t * c1.x +
    3 * (1 - t) * Math.pow(t, 2) * c2.x +
    Math.pow(t, 3) * p2.x;
  const y =
    Math.pow(1 - t, 3) * p1.y +
    3 * Math.pow(1 - t, 2) * t * c1.y +
    3 * (1 - t) * Math.pow(t, 2) * c2.y +
    Math.pow(t, 3) * p2.y;
  return { x, y };
}

export function distance(p1: Vector2, p2: Vector2) {
  return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
}

export function rescaleTo(s1: number, s2: number, t1: number, t2: number, value: number) {
  return t1 + ((value - s1) / (s2 - s1)) * (t2 - t1);
}
