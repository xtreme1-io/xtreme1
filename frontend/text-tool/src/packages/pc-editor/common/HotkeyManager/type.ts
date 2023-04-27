import type { IActionName } from '../ActionManager/type';

export interface IHotkeyConfig<T extends string = IActionName> {
    key: string;
    action: T | T[];
    viewType?: any;
}
