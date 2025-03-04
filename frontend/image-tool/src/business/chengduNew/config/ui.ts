import { UIType } from 'image-editor';
import commentPointer from '../../../assets/commentPointer.svg';

export const Cursor = {
  comment: `url(${commentPointer}) 0 16, auto`,
};

export const BsUIType = {
  // 左侧工具栏
  ...UIType,
  // 顶部工具栏 --
  btnQA: 'btnQA', // QA
  flowLog: 'flowLog',
  flowSave: 'flowSave', // 保存
  flowSubmit: 'flowSubmit',
  flowSuspend: 'flowSuspend',
  flowReject: 'flowReject',
  flowModify: 'flowModify',
  flowPass: 'flowPass',
  flowAccept: 'flowAccept',
  flowRevise: 'flowRevise',
};

export type IBsUIType = keyof typeof BsUIType;
export const allUI = Object.keys(BsUIType) as IBsUIType[];

export const baseViewUI = [BsUIType.setting, BsUIType.info, BsUIType.btnQA] as IBsUIType[];

export const baseEditUI = [
  ...baseViewUI,
  BsUIType.edit,
  BsUIType.tool_polygon,
  BsUIType.tool_line,
  BsUIType.tool_skeleton,
  BsUIType.tool_splineCurve,
  BsUIType.tool_rect,
  BsUIType.tool_cuboid,
  BsUIType.tool_circle,
  BsUIType.tool_ellipse,
  BsUIType.tool_keyPoint,
  BsUIType.tool_mask,
  BsUIType.tool_interactive,
  BsUIType.model,
  BsUIType.tool_intellect,
  BsUIType.model_panoramic,
  BsUIType.tool_group,
] as IBsUIType[];

// preView特殊处理
export const preViewUI = [
  BsUIType.setting,
  BsUIType.info,
  BsUIType.edit,
  BsUIType.tool_polygon,
  BsUIType.tool_line,
  BsUIType.tool_skeleton,
  BsUIType.tool_splineCurve,
  BsUIType.tool_rect,
  BsUIType.tool_cuboid,
  BsUIType.tool_circle,
  BsUIType.tool_ellipse,
  BsUIType.tool_keyPoint,
  BsUIType.tool_mask,
  BsUIType.tool_interactive,
  BsUIType.model,
  BsUIType.tool_intellect,
  BsUIType.model_panoramic,
  BsUIType.tool_group,
] as IBsUIType[];
