import { IShapeConfig, ICircleConfig } from '../ImageView/type';

import positiveImg from '../assets/positive.svg';
import negativeImg from '../assets/negative.svg';
import commentPointer from '../assets/commentPointer.svg';
import rotating from '../assets/rotating.svg';
import maskfill from '../assets/maskfill.svg';

export const Cursor = {
  auto: 'auto',
  move: 'move',
  crosshair: 'crosshair',
  pointer: 'pointer',
  none: 'none',
  grab: 'garb',
  grabbing: 'grabbing',
  alias: 'alias',
  ewResize: 'ew-resize',
  nsResize: 'ns-resize',
  neswResize: 'nesw-resize',
  nwseResize: 'nwse-resize',
  positive: `url(${positiveImg}), auto`,
  negative: `url(${negativeImg}), auto`,
  comment: `url(${commentPointer}) 0 16, auto`,
  rotating: `url(${rotating}) 10 10, auto`,
  maskfill: `url(${maskfill}) 8 15, auto`,
};
export function getCursor(r: number) {
  if (inRange(r, 0, 22.5) || inRange(r, 337.5, 360)) {
    return Cursor.ewResize;
  } else if (inRange(r, 45 - 22.5, 45 + 22.5)) {
    return Cursor.nwseResize;
  } else if (inRange(r, 90 - 22.5, 90 + 22.5)) {
    return Cursor.nsResize;
  } else if (inRange(r, 135 - 22.5, 135 + 22.5)) {
    return Cursor.neswResize;
  } else if (inRange(r, 180 - 22.5, 180 + 22.5)) {
    return Cursor.ewResize;
  } else if (inRange(r, 225 - 22.5, 225 + 22.5)) {
    return Cursor.nwseResize;
  } else if (inRange(r, 270 - 22.5, 270 + 22.5)) {
    return Cursor.nsResize;
  } else if (inRange(r, 315 - 22.5, 315 + 22.5)) {
    return Cursor.neswResize;
  }
}
function inRange(r: number, start: number, end: number) {
  return r >= start && r < end;
}
// 共享边和共享点的color
export const sharedColor = '#105ce7';
// 骨骼点选中的color
export const skeSelectedColor = '#ff3333';

// window.Cursor = Cursor;

export const defaultConfig: IShapeConfig = {
  // fill: 'rgba(255 ,255 ,255 ,0.1)',
  fill: '', // 默认无填充
  strokeWidth: 1,
  hitStrokeWidth: 6,
};

export const defaultHoverConfig: IShapeConfig = {
  fill: 'rgba(255 ,255 ,255 ,0.15)',
  strokeWidth: 2,
};

export const defaultSelectConfig: IShapeConfig = {
  // ...defaultHoverConfig,
  fill: 'rgba(255 ,255 ,255 ,0.22)',
  strokeWidth: 2,
  // stroke: 'red',
  // strokeWidth: 2,
};
export const defaultLineHoverConfig: IShapeConfig = {
  strokeWidth: 2,
};
export const defaultLineSelectConfig: IShapeConfig = {
  strokeWidth: 3,
};

export const defaultCuboidSelectConfig: IShapeConfig = {
  fill: '',
  strokeWidth: 2,
};

// 锚点
export const defaultAnchorConfig: ICircleConfig = {
  radius: 3,
  hitStrokeWidth: 4,
  fill: '#fff',
  strokeWidth: 2,
};

export const defaultAnchorHoverConfig: ICircleConfig = {
  radius: 5,
  fill: '#fff',
  strokeWidth: 2,
};
export const defaultAnchorSelectConfig: ICircleConfig = {
  radius: 5,
  fill: '#f00',
  strokeWidth: 2,
};

export const defaultStateStyle: Record<string, IShapeConfig> = {
  hover: defaultHoverConfig,
  select: defaultSelectConfig,
};
export const defaultLineStateStyle: Record<string, IShapeConfig> = {
  hover: defaultLineHoverConfig,
  select: defaultLineSelectConfig,
};

export const defaultCuboidStateStyle: Record<string, IShapeConfig> = {
  hover: defaultHoverConfig,
  select: defaultCuboidSelectConfig,
};

export const defaultAnchorStateStyle: Record<string, IShapeConfig> = {
  hover: defaultAnchorHoverConfig,
  select: defaultAnchorSelectConfig,
};

export const defaultCircleStateStyle: Record<string, IShapeConfig> = {
  hover: defaultHoverConfig,
  select: defaultHoverConfig,
};

// Skeleton
export const skeletonStates: Record<string, IShapeConfig> = {
  default: { radius: 4, hitStrokeWidth: 4, strokeWidth: 1 },
  hover: { strokeWidth: 1, radius: 6 },
};
skeletonStates.select = { ...skeletonStates.hover };
skeletonStates.edit = { ...skeletonStates.hover, fill: '#f00' };

export const skeletonAnchorStates: Record<string, IShapeConfig> = {
  default: { radius: 4, hitStrokeWidth: 4, stroke: '#fff', strokeWidth: 1 },
  hover: { radius: 6, strokeWidth: 1 },
  select: { radius: 6, strokeWidth: 3, stroke: '#f00' },
};

export const skeletonEdgeStates: Record<string, IShapeConfig> = {
  default: { hitStrokeWidth: 4, strokeWidth: 1 },
  hover: { strokeWidth: 2 },
  select: { strokeWidth: 2 },
};

/**
 * MASK
 */
// '#df4b26'; // 不清楚什么原因,这些个颜色绘制的图形无法应用opencv进行轮廓识别
export const defaultMaskColor = '#ffffff60';
export const defaultMaskRGBA = [255, 255, 255, 153];

export const defaultMaskConfig: IShapeConfig = {
  fill: 'rgba(237,96,148, 0.5)',
  strokeWidth: 1,
  stroke: '', // 默认无stroke
};

export const defaultMaskHoverConfig: IShapeConfig = {
  fill: 'rgba(237,96,148, 0.6)',
  strokeWidth: 1,
  stroke: '', // 默认无stroke
};

export const defaultMaskSelectConfig: IShapeConfig = {
  fill: 'rgba(237,96,148, 0.6)',
  strokeWidth: 1,
  stroke: 'rgba(255, 255, 255, 1)',
};
export const defaultMaskStateStyle: Record<string, IShapeConfig> = {
  hover: defaultMaskHoverConfig,
  select: defaultMaskSelectConfig,
};
