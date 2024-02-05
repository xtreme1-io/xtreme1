import { IHotkeyConfig, userAgent } from 'image-editor';
import { IBsActionName } from './action';

const isMac = userAgent.isMac;
const Ctrl = isMac ? '⌘' : 'ctrl';
const hotkeyConfig: IHotkeyConfig<IBsActionName>[] = [
  { key: `${Ctrl}+s`, action: 'flowSave' },
  { key: 'PageUp', action: 'dataFrameLast' },
  { key: 'PageDown', action: 'dataFrameNext' },
];

export default hotkeyConfig;
