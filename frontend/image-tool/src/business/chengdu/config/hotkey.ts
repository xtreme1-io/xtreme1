import { IHotkeyConfig } from 'pc-editor';
import { IBsActionName } from './action';

const hotkeyConfig: IHotkeyConfig<IBsActionName>[] = [
    // flow
    { key: 'ctrl+s', action: 'flowSave' },
    { key: 'shift+s', action: 'flowHung' },
    { key: 'shift+d', action: ['flowSubmit', 'flowPass'] },
    { key: 'ctrl+shift+d', action: 'flowSubmitExit' },
    { key: 'shift+r', action: 'flowReject' },
    { key: 'shift+e', action: 'flowEdit' },
];

export default hotkeyConfig;
