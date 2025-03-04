import { IModeConfig, OPType } from 'image-editor';
import { IBsUIType, BsUIType, baseEditUI, baseViewUI, allUI, preViewUI } from './ui';
import { IBsActionName, baseEditActions, baseViewActions, allActions } from './action';

function toMap<T extends string>(arr: T[]) {
  const map = {} as Record<T, boolean>;
  arr.forEach((e) => (map[e] = true));
  return map;
}

/**
 * all
 */
// all
const all: IModeConfig<IBsUIType, IBsActionName> = {
  name: 'all',
  op: OPType.EDIT,
  ui: toMap(allUI), // executeUI
  actions: toMap<IBsActionName>(allActions), //
};

/**
 * data flow
 */
// 执行
const execute: IModeConfig<IBsUIType, IBsActionName> = {
  name: 'execute',
  op: OPType.EDIT,
  ui: toMap([...baseEditUI, BsUIType.flowSave]), //
  actions: toMap<IBsActionName>([...baseEditActions, 'flowSave']), //
};

// 查看
const view: IModeConfig<IBsUIType, IBsActionName> = {
  name: 'view',
  op: OPType.VIEW,
  ui: toMap([...baseViewUI, BsUIType.show_points, BsUIType.flowLog]),
  actions: toMap<IBsActionName>(baseViewActions),
};
const history: IModeConfig<IBsUIType, IBsActionName> = {
  name: 'history',
  op: OPType.VIEW,
  ui: toMap([...baseViewUI, BsUIType.show_points, BsUIType.flowLog]),
  actions: toMap<IBsActionName>(baseViewActions),
};
/**
 * task flow
 */
// 标注
const taskAnnotate: IModeConfig<IBsUIType, IBsActionName> = {
  name: 'taskAnnotate',
  op: OPType.EDIT,
  ui: toMap([
    ...baseEditUI,
    BsUIType.flowSave,
    BsUIType.flowSuspend,
    BsUIType.flowSubmit,
    BsUIType.flowLog,
  ]),
  actions: toMap<IBsActionName>([...baseEditActions, 'flowSave', 'flowSuspend', 'flowSubmit']),
};

// 审核
const taskReview: IModeConfig<IBsUIType, IBsActionName> = {
  name: 'taskReview',
  op: OPType.VIEW,
  ui: toMap([
    ...baseViewUI,
    BsUIType.edit,
    BsUIType.tool_comment,
    BsUIType.show_points,
    BsUIType.flowReject,
    BsUIType.flowPass,
    BsUIType.flowModify,
    BsUIType.flowSuspend,
    BsUIType.flowLog,
  ]),
  actions: toMap<IBsActionName>([
    ...baseViewActions,
    'flowModify',
    'flowReject',
    'flowSuspend',
    'flowPass',
  ]),
};

// 审核修改
const taskReviewEdit: IModeConfig<IBsUIType, IBsActionName> = {
  name: 'taskReviewEdit',
  op: OPType.EDIT,
  ui: toMap([
    ...baseEditUI,
    BsUIType.flowSave,
    BsUIType.flowPass,
    BsUIType.flowSuspend,
    BsUIType.flowModify,
    BsUIType.flowLog,
  ]),
  actions: toMap<IBsActionName>([
    ...baseEditActions,
    'flowModify',
    'flowSave',
    'flowSuspend',
    'flowPass',
  ]),
};

// 验收
const taskAccept: IModeConfig<IBsUIType, IBsActionName> = {
  name: 'taskAccept',
  op: OPType.VIEW,
  ui: toMap([
    ...baseViewUI,
    BsUIType.edit,
    BsUIType.tool_comment,
    BsUIType.show_points,
    BsUIType.flowReject,
    BsUIType.flowAccept,
    BsUIType.flowModify,
    BsUIType.flowLog,
  ]),
  actions: toMap<IBsActionName>([...baseViewActions, 'flowModify']),
};

// 验收修改
const taskAcceptEdit: IModeConfig<IBsUIType, IBsActionName> = {
  name: 'taskAcceptEdit',
  op: OPType.EDIT,
  ui: toMap([
    ...baseEditUI,
    BsUIType.flowSave,
    BsUIType.flowAccept,
    BsUIType.flowModify,
    BsUIType.flowLog,
  ]),
  actions: toMap<IBsActionName>([...baseEditActions, 'flowModify', 'flowSave']),
};

// 质检
const taskQuality: IModeConfig<IBsUIType, IBsActionName> = {
  name: 'taskQuality',
  op: OPType.VIEW,
  ui: toMap([
    ...baseViewUI,
    BsUIType.edit,
    BsUIType.tool_comment,
    BsUIType.show_points,
    BsUIType.flowRevise,
    BsUIType.flowLog,
  ]),
  actions: toMap<IBsActionName>([...baseViewActions]),
};

/**
 * 特殊
 */
// preview
const preview: IModeConfig<IBsUIType, IBsActionName> = {
  name: 'preview',
  op: OPType.EDIT,
  ui: toMap([...preViewUI]),
  actions: toMap<IBsActionName>([...baseEditActions]),
};

const pageModes = {
  all,
  //
  history,
  execute,
  view,
  preview,
  // task
  taskAnnotate,
  taskReview,
  taskReviewEdit,
  taskAccept,
  taskAcceptEdit,
  taskQuality,
};

export type BsModeType = keyof typeof pageModes;

(window as any).pageModes = pageModes;

export default pageModes;
