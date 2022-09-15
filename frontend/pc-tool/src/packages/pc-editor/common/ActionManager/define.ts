import type Editor from '../../Editor';

export interface IActionOption {
    name?: string;
    // clear?: (e: Editor) => void;
    end?: (e: Editor) => void;
    isContinue?: (e: Editor) => boolean;
    valid?: (e: Editor) => boolean;
    execute: (e: Editor, args: any) => Promise<any> | void | Error;
    [key: string]: any;
}

export type IAction = Required<IActionOption>;

function noop() {}
const defaultOption: IAction = {
    name: '',
    valid: () => true,
    execute: noop,
    // clear: noop,
    end: noop,
    isContinue: () => false,
};

export function define(option: IActionOption): IAction {
    return Object.assign({}, defaultOption, option);
}
