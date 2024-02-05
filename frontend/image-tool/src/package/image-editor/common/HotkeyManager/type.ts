import type { IActionName } from '../ActionManager';

export interface IHotkeyConfig<T extends string = IActionName> {
  key: string;
  action: T | T[];
  viewType?: any;
  args?: any;
}
