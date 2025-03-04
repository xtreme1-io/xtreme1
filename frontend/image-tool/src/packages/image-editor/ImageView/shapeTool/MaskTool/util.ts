/**
 *  MASK TOOL 通用方法
 */
import { Vector2 } from '../../../types';

export interface IMaskBox {
  x: number;
  y: number;
  x1: number;
  y1: number;
  w: number;
  h: number;
}
export interface ISegmentCanvas {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  index: number;
  x: number;
  y: number;
  y2: number;
  w: number;
  h: number;
  start: number;
  changed?: boolean;
}
/**
 * 计算鼠标移动过程的bounding box
 * @param point1 点1
 * @param point2 点2
 * @param width 画笔宽度
 */
export function box(point1: Vector2, point2: Vector2, width: number): IMaskBox {
  width = width / 2;
  const x1_0 = point1.x - width,
    x1_1 = point1.x + width,
    y1_0 = point1.y - width,
    y1_1 = point1.y + width,
    x2_0 = point2.x - width,
    x2_1 = point2.x + width,
    y2_0 = point2.y - width,
    y2_1 = point2.y + width;
  const x0 = Math.round(Math.min(x1_0, x1_1, x2_0, x2_1)),
    y0 = Math.round(Math.min(y1_0, y1_1, y2_0, y2_1)),
    x1 = Math.round(Math.max(x1_0, x1_1, x2_0, x2_1)),
    y1 = Math.round(Math.max(y1_0, y1_1, y2_0, y2_1));
  const w = x1 - x0,
    h = y1 - y0;
  return { x: x0, y: y0, w, h, x1, y1 };
}
export function pointsBox(points: Vector2[]): IMaskBox {
  if (points.length <= 1) return { x: 0, y: 0, w: 0, h: 0, x1: 0, y1: 0 };
  let x = points[0].x,
    x1 = points[0].x,
    y = points[0].y,
    y1 = points[0].y;
  points.forEach((p) => {
    x = Math.min(x, p.x);
    x1 = Math.max(x1, p.x);
    y = Math.min(y, p.y);
    y1 = Math.max(y1, p.y);
  });
  const w = x1 - x,
    h = y1 - y;
  return { x, y, w, h, x1, y1 };
}
/**
 * 将分层的canvas整合到一个canvas中
 * @param list ISegmentCanvas[]
 * @param canvas 空白canvas
 */
export function composeCanvas(list: ISegmentCanvas[], canvas: HTMLCanvasElement) {
  const imageData = new ImageData(canvas.width, canvas.height);
  list.forEach((e) => {
    const imgData = e.context.getImageData(0, 0, e.w, e.h);
    imageData.data.set(imgData.data, e.start * 4);
  });
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  context.putImageData(imageData, 0, 0);
  return canvas;
}
/**
 * 将分层的canvas整合到一个canvas中
 * @param list ISegmentCanvas[]
 * @param canvas 空白canvas
 */
export function composeImageData(list: ISegmentCanvas[], width: number, height: number) {
  const imageData = new ImageData(width, height);
  list.forEach((e) => {
    const imgData = e.context.getImageData(0, 0, e.w, e.h);
    imageData.data.set(imgData.data, e.start * 4);
  });
  return imageData;
}
