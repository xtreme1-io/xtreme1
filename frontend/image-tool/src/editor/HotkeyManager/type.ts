import type { IActionName } from '../ActionManager/type';

export interface IHotkeyConfig<T extends string = IActionName> {
    key: string;
    action: T | T[];
    upAction?: T | T[];
    viewType?: any;
    args?: any;
}
