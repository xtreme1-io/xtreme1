import { IModeConfig, OPType } from '../types';
import { AllActions, IActionName } from '../common/ActionManager';

function toMap<T extends string>(arr: T[]) {
  const map = {} as Record<T, boolean>;
  arr.forEach((e) => (map[e] = true));
  return map;
}

export const UIType = {
  // ****** left tool**********
  edit: 'edit',
  tool_rect: 'tool_rect',
  tool_polygon: 'tool_polygon',
  tool_line: 'tool_line',
  tool_splineCurve: 'tool_splineCurve',
  tool_keyPoint: 'tool_keyPoint',
  tool_skeleton: 'tool_skeleton',
  tool_cuboid: 'tool_cuboid',
  tool_group: 'tool_group',
  tool_circle: 'tool_circle',
  tool_ellipse: 'tool_ellipse',
  tool_comment: 'tool_comment',
  tool_mask: 'tool_mask',
  tool_interactive: 'tool_interactive', // 实例的交互式工具
  model: 'model', // 实例的模型工具
  tool_intellect: 'tool_intellect', // 分割的交互式工具(智能分割)
  model_panoramic: 'model_panoramic', // 分割的识别模型
  setting: 'setting',
  info: 'info',
  show_points: 'show_points',
};

export type IUIType = keyof typeof UIType;

const allUI = Object.keys(UIType) as IUIType[];

// test mode
const all: IModeConfig<IUIType, IActionName> = {
  name: 'all',
  op: OPType.EDIT,
  ui: toMap(allUI),
  actions: toMap(AllActions),
};

// test mode
const empty: IModeConfig<IUIType, IActionName> = {
  name: 'empty',
  op: OPType.VIEW,
  ui: toMap([] as IUIType[]),
  actions: toMap([] as IActionName[]),
};

export const modes = {
  empty,
  all,
};

export type IModeType = keyof typeof modes;

export const ModeKeys = Object.keys(modes).filter((e) => e !== 'all') as IModeType[];
