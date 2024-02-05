import { IModeConfig, OPType } from 'image-editor';
import { IBsUIType, BsUIType, baseEditUI, baseViewUI, allUI } from './ui';
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
// execute
const execute: IModeConfig<IBsUIType, IBsActionName> = {
  name: 'execute',
  op: OPType.EDIT,
  ui: toMap([...baseEditUI, BsUIType.flowSave, BsUIType.markValid, BsUIType.skip, BsUIType.submit]),
  actions: toMap<IBsActionName>([...baseEditActions, 'flowSave']), //
};

// view
const view: IModeConfig<IBsUIType, IBsActionName> = {
  name: 'view',
  op: OPType.VIEW,
  ui: toMap([...baseViewUI, BsUIType.modify]),
  actions: toMap<IBsActionName>(baseViewActions),
};

const pageModes = {
  all,
  execute,
  view,
};

export type BsModeType = keyof typeof pageModes;

(window as any).pageModes = pageModes;

export default pageModes;
