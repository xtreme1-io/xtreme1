import { IHotkeyConfig } from '../types';
import { isMac } from '../lib/ua';

const Ctrl = isMac ? '⌘' : 'ctrl';
const Del = 'backspace,del';
const Alt = 'alt';

// tool
const toolHotKye: IHotkeyConfig[] = [
  { key: '1', action: 'changeTool' },
  { key: '2', action: 'changeTool' },
  { key: '3', action: 'changeTool' },
  { key: '4', action: 'changeTool' },
  { key: '5', action: 'changeTool' },
  { key: '6', action: 'changeTool' },
  { key: '7', action: 'changeTool' },
  { key: '8', action: 'changeTool' },
  { key: '9', action: 'changeTool' },
  { key: '0', action: 'changeTool' },
  { key: 'q', action: 'selectTool' },
  // { key: 'e', action: 'changeTool' },
];
// LineTool
export const lineToolHotKey: IHotkeyConfig[] = [
  { key: `a`, action: 'lineToolDrawMode' },
  { key: `${Ctrl}+a`, action: 'lineToolDrawMode' },
];

export const objectHotKey: IHotkeyConfig[] = [
  { key: `${Ctrl}+shift+up`, action: 'adjustObject' },
  { key: `${Ctrl}+shift+down`, action: 'adjustObject' },
  { key: `${Ctrl}+shift+left`, action: 'adjustObject' },
  { key: `${Ctrl}+shift+right`, action: 'adjustObject' },
];

export const seriesFrameHotKey: IHotkeyConfig[] = [
  { key: 'right', action: 'toNextFrame' },
  { key: 'left', action: 'previousFrame' },
  { key: `${Alt}+right`, action: 'copyToNext' },
  { key: `${Alt}+left`, action: 'copyToLast' },
];
// ui
const displayControllerHotkey: IHotkeyConfig[] = [
  { key: 't', action: 'toggleClassView' },
  { key: 'm', action: 'toggleClassTitle' },
  { key: 'y', action: 'toggleHelpLine' },
  { key: 'b', action: 'toggleSizeInfo' },
  // { key: 'd', action: 'toggleShowPolygonArrow' },
];

const hotkeyConfig: IHotkeyConfig[] = [
  { key: `${Ctrl}+z`, action: 'undo' },
  { key: `${Ctrl}+shift+z`, action: 'redo' },
  { key: 'Space', action: 'stopCurrentDraw' },
  { key: 'enter', action: 'stopCurrentDraw' },
  { key: Del, action: 'deleteSelection' },
  { key: 'h', action: 'holeSelection' },
  { key: 'c', action: 'cutSelectionOther' },
  { key: `${Ctrl}+c`, action: 'cutSelectionFirst' },
  ...displayControllerHotkey,
  ...toolHotKye,
  ...objectHotKey,
  ...lineToolHotKey,
];

export default hotkeyConfig;
