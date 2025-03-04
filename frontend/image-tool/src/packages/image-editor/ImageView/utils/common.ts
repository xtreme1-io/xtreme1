import { Vector2 } from '../type';
import Konva from 'konva';

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

export function resizeGroup(group: Konva.Group, size = 0, getObject: () => Konva.Shape) {
  let children = group.children || [];
  while (children.length > size) {
    children[children.length - 1].destroy();
  }

  children = group.children || [];
  while (children.length < size) {
    group.add(getObject());
  }
}
