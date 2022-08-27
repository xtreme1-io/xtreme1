import { IHotkeyConfig } from 'pc-editor';
import { IBsActionName } from './action';

const hotkeyConfig: IHotkeyConfig<IBsActionName>[] = [
    // flow
    { key: 'ctrl+s', action: 'flowSave' },
];

export default hotkeyConfig;
