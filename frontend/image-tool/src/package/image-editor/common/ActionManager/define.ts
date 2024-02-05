import type Editor from '../../Editor';

export interface IActionOption {
  name?: string;
  end?: (e: Editor, executeCallback: Function, ...args: any[]) => void;
  isContinue?: (e: Editor) => boolean;
  canBlocked?: (e: Editor) => boolean;
  valid?: (e: Editor) => boolean;
  execute: (e: Editor, ...args: any[]) => Promise<any> | void | Error | Function;
  [key: string]: any;
}

export type IAction = Required<IActionOption>;

function noop() {}
const defaultOption: IAction = {
  name: '',
  valid: () => true,
  execute: noop,
  end: noop,
  canBlocked: () => true,
  isContinue: () => false,
};

export function define(option: IActionOption): IAction {
  return Object.assign({}, defaultOption, option);
}
