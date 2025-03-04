import { IHotkeyConfig, userAgent } from 'image-editor';
import { IBsActionName } from './action';

const isMac = userAgent.isMac;
const Ctrl = isMac ? '⌘' : 'ctrl';
const hotkeyConfig: IHotkeyConfig<IBsActionName>[] = [
  { key: `${Ctrl}+s`, action: 'flowSave' },
  { key: 'shift+m', action: 'flowModify' },
  { key: `shift+s`, action: ['flowSubmit', 'flowPass'] },
  { key: 'shift+r', action: 'flowReject' },
  { key: 'shift+b', action: 'flowSuspend' },
  { key: 'PageUp', action: 'dataFrameLast' },
  { key: 'PageDown', action: 'dataFrameNext' },
  { key: 'o', action: 'changeNameShowType' },
];

export default hotkeyConfig;
