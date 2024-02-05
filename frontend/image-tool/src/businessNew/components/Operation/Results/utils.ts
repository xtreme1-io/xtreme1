import { AnnotateObject, Rect, Polygon, Line } from 'image-editor';

export function getObjectInfo(object: AnnotateObject) {
  const infos = [] as string[];
  if (object instanceof Rect) {
    const { width, height, rotation = 0 } = object.attrs;
    infos.push(`width: ${format(width)}`);
    infos.push(`height: ${format(height)}`);
    infos.push(`area: ${format(width * height)}`);
    infos.push(`W/H: ${format(width / height, 2)}`);
    infos.push(`rotation: ${formatRotation(rotation)}`);
  } else if (object instanceof Polygon) {
    const area = object.getArea();
    infos.push(`area: ${format(area)}`);
  } else if (object instanceof Line) {
    const length = object.getLength();
    infos.push(`length: ${format(length)}`);
  }
  return infos;
}

function format(v: number, precision: number = 0): string {
  return Math.abs(v).toFixed(precision);
}

function formatRotation(r: number, precision: number = 1): string {
  let angle = r % 360;
  angle = angle < 0 ? 360 + angle : angle;
  return angle.toFixed(precision);
}
