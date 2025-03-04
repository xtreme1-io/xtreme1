import { ToolModelEnum, ToolType } from '../types';
import {
  AnnotateObject,
  Rect,
  Polygon,
  Line,
  Skeleton,
  KeyPoint,
  SplineCurve,
  MaskShape,
} from '../ImageView/shape';

export function getObjectToolType(object: AnnotateObject) {
  let toolType: ToolType = ToolType.BOUNDING_BOX;
  if (object instanceof Rect) {
    toolType = ToolType.BOUNDING_BOX;
  } else if (object instanceof Polygon) {
    toolType = ToolType.POLYGON;
  } else if (object instanceof Line) {
    toolType = ToolType.POLYLINE;
  } else if (object instanceof KeyPoint) {
    toolType = ToolType.KEY_POINT;
  } else if (object instanceof Skeleton) {
    toolType = ToolType.SKELETON;
  } else if (object instanceof SplineCurve) {
    toolType = ToolType.CURVE;
  } else if (object.isGroup()) {
    toolType = ToolType.GROUP;
  } else if (object instanceof MaskShape) {
    toolType = ToolType.MASK;
  }

  return toolType;
}

export function Tooltype2Toolmode(type: ToolType): ToolModelEnum[] {
  let mode: ToolModelEnum[] = [];
  switch (type) {
    case ToolType.MASK: {
      mode = [ToolModelEnum.SEGMENTATION];
      break;
    }
    default: {
      mode = [ToolModelEnum.INSTANCE];
      break;
    }
  }
  return mode;
}

export function getAnnotationType(object: AnnotateObject) {
  let type: ToolModelEnum = ToolModelEnum.INSTANCE;
  if (object instanceof MaskShape) {
    type = ToolModelEnum.SEGMENTATION;
  }
  return type;
}
