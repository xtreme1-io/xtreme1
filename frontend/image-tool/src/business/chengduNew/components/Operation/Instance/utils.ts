import {
  AnnotateObject,
  Rect,
  Polygon,
  Line,
  SplineCurve,
  MaskShape,
  CircleShape,
  Ellipse,
} from 'image-editor';

export function getObjectInfo(object: AnnotateObject) {
  const infos = [] as string[];
  if (object instanceof Rect) {
    const { width, height, rotation = 0 } = object.attrs;
    infos.push(`width: ${format(width)}`);
    infos.push(`height: ${format(height)}`);
    infos.push(`area: ${format(width * height)}`);
    infos.push(`W/H: ${format(width / height, 2)}`);
    infos.push(`rotation: ${formatRotation(rotation)}`);
  } else if (object instanceof Polygon || object instanceof MaskShape) {
    const area = object.getArea();
    infos.push(`area: ${format(area)}`);
  } else if (object instanceof Line) {
    const length = object.getLength();
    infos.push(`length: ${format(length)}`);
  } else if (object instanceof SplineCurve) {
    const length = object.getLength();
    infos.push(`length: ${format(length)}`);
  } else if (object instanceof CircleShape) {
    infos.push(`radius: ${format(object.radius())}`);
    infos.push(`area: ${format(object.area())}`);
  } else if (object instanceof Ellipse) {
    infos.push(`radiusX: ${format(object.radiusX())}`);
    infos.push(`radiusY: ${format(object.radiusY())}`);
    infos.push(`area: ${format(object.area())}`);
  }
  return infos;
}

function format(v: number, precision: number = 0): string {
  return Math.abs(v).toFixed(precision);
}

// 返回角度在范围(0-360)之间
function formatRotation(r: number, precision: number = 1): string {
  let angle = r % 360;
  angle = angle < 0 ? 360 + angle : angle;
  return angle.toFixed(precision);
}
