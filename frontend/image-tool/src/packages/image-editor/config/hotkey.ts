import { IHotkeyConfig } from '../types';
import { isMac } from '../lib/ua';

const Ctrl = isMac ? '⌘' : 'ctrl';
const Del = isMac ? 'backspace' : 'del';
const Alt = 'alt';
export const ShiftKey = ['Shift', 'ShiftLeft', 'ShiftRight', 16];
export const CtrlKey = ['Control', 'ControlLeft', 'ControlRight', 17];

// 工具快捷键
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
  { key: 'w', action: 'changeTool' },
  { key: 'e', action: 'changeTool' },
  { key: 'r', action: 'changeTool' },
];
// LineTool 快捷键
export const lineToolHotKey: IHotkeyConfig[] = [
  { key: `a`, action: 'lineToolDrawMode' },
  { key: `${Ctrl}+a`, action: 'lineToolDrawMode' },
];
// SkeletonTool 快捷键
export const skeletonHotKey: IHotkeyConfig[] = [
  { key: `${Ctrl}+m`, action: 'toggleSkeAnchorTag' },
  { key: `${Ctrl}+j`, action: 'toggleSkeAnchorNum' },
  { key: `shift+j`, action: 'toggleSkeComponentNum' },
];
// 标注对象快捷键
export const objectHotKey: IHotkeyConfig[] = [
  { key: `up`, action: 'changeResultListSelect' },
  { key: `down`, action: 'changeResultListSelect' },
  { key: `${Ctrl}+shift+up`, action: 'adjustObject' },
  { key: `${Ctrl}+shift+down`, action: 'adjustObject' },
  { key: `${Ctrl}+shift+left`, action: 'adjustObject' },
  { key: `${Ctrl}+shift+right`, action: 'adjustObject' },
];
// 矩形快捷键
export const rectHotkey: IHotkeyConfig[] = [
  { key: 'shift+up', action: 'adjustRect' },
  { key: 'shift+down', action: 'adjustRect' },
  { key: 'shift+left', action: 'adjustRect' },
  { key: 'shift+right', action: 'adjustRect' },
  { key: `${Ctrl}+up`, action: 'adjustRect' },
  { key: `${Ctrl}+down`, action: 'adjustRect' },
  { key: `${Ctrl}+left`, action: 'adjustRect' },
  { key: `${Ctrl}+right`, action: 'adjustRect' },
];
// 连续帧快捷键
export const seriesFrameHotKey: IHotkeyConfig[] = [
  { key: 'right', action: 'toNextFrame' },
  { key: 'left', action: 'previousFrame' },
  { key: `${Alt}+right`, action: 'copyToNext' },
  { key: `${Alt}+left`, action: 'copyToLast' },
];
// 一些控制UI显示的快捷键
const displayControllerHotkey: IHotkeyConfig[] = [
  { key: 't', action: 'toggleClassView' },
  { key: 'v', action: 'toggleVisibleSelection' },
  { key: 'b', action: 'toggleSizeInfo' },
  { key: 'm', action: 'toggleClassTitle' },
  { key: ',', action: 'toggleAttrsView' },
  { key: 's', action: 'toggleSingleResult' },
  { key: 'shift+c', action: 'toggleSelectedMask' },
  { key: 'j', action: 'toggleResultTrackName' },
  { key: 'n', action: 'toggleComment' },
  { key: 'y', action: 'toggleHelpLine' },
  { key: 'u', action: ['mergePolyline1', 'toggleHelpCircle'] },
  { key: `${Ctrl}+u`, action: 'mergePolyline2' },
  { key: 'i', action: 'toggleBisectrixLine' },
  { key: '.', action: 'switchDisplayMode' },
  { key: 'd', action: 'toggleShowPolygonArrow' },
  { key: '/', action: 'showGroupBox' },
];
// 图片分割相关的快捷键
const segmentHotKeys: IHotkeyConfig[] = [
  { key: `${Alt}+1`, action: 'changeToolMode' },
  { key: `${Alt}+2`, action: 'changeToolMode' },
  { key: 'x', action: 'switchSegmentTool' },
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
  { key: `${Ctrl}+g`, action: 'createGroup' },
  { key: `${Ctrl}+shift+g`, action: 'dissolveGroup' },
  { key: 'k', action: 'sharedDrawingMode' },
  { key: `${Ctrl}+k`, action: 'sharedClipMode' },
  { key: 'z', action: 'resetImageZoom' },
  { key: `${Ctrl}+c`, action: 'copyObject' },
  { key: `${Ctrl}+v`, action: 'pasteObject' },
  { key: `${Ctrl}+d`, action: 'cloneObject' },
  { key: `${Ctrl}+alt+v`, action: 'pasteObjectWithClass' },
  ...displayControllerHotkey,
  ...toolHotKye,
  ...objectHotKey,
  ...segmentHotKeys,
  ...lineToolHotKey,
  ...skeletonHotKey,
];

export default hotkeyConfig;
