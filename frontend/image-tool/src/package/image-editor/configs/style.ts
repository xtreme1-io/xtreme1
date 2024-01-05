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

type StateType = 'general' | 'hover' | 'select';
// shape style
export const defaultConfig: IShapeConfig = {
  fill: '',
  strokeWidth: 1,
  hitStrokeWidth: 6,
};
export const hoverConfig: IShapeConfig = {
  fill: 'rgba(255 ,255 ,255 ,0.15)',
  strokeWidth: 2,
};
export const selectConfig: IShapeConfig = {
  fill: 'rgba(255 ,255 ,255 ,0.22)',
  strokeWidth: 2,
};
export const defaultStateStyle: Record<StateType, IShapeConfig> = {
  general: defaultConfig,
  hover: hoverConfig,
  select: selectConfig,
};

// point style
export const defaultCircleConfig: ICircleConfig = {
  radius: 3,
  fill: '#fff',
  strokeWidth: 1,
  stroke: '#fff',
};
export const hoverCircleConfig: ICircleConfig = {
  radius: 2,
  strokeWidth: 0,
  stroke: '#ff3333',
};
export const selectedCircleConfig: ICircleConfig = {
  radius: 2,
  strokeWidth: 1,
  stroke: '#ff3333',
};
export const CircleStateStyle: Record<StateType, IShapeConfig> = {
  general: defaultCircleConfig,
  hover: hoverCircleConfig,
  select: selectedCircleConfig,
};
