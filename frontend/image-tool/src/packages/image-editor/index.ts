import Editor from './Editor';
import * as utils from './utils';
import userAgent from './lib/ua';
import BSError from './common/BSError';
import { AllActions, IActionName } from './common/ActionManager';
import { define as defineAction } from './common/ActionManager/define';
import LoadManager from './common/LoadManager';
import DataManager from './common/DataManager';

export * from './types';
export * from './configs';
export * from './ImageView/shape';
const __ALL__ = '__ALL__';
const __UNSERIES__ = '__UNSERIES__';
export type { IActionName };
export {
  Editor,
  LoadManager,
  DataManager,
  utils,
  userAgent,
  BSError,
  defineAction,
  AllActions,
  __ALL__,
  __UNSERIES__,
};
