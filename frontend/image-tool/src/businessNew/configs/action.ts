import * as BsActions from '../actions';
import { IActionName, AllActions as baseActions } from 'image-editor';

export type IBsActionName = keyof typeof BsActions | IActionName;
export const allActions = [...baseActions, ...Object.keys(BsActions)] as IBsActionName[];

export const defaultActions: IBsActionName[] = [
  'dataFrameNext',
  'dataFrameLast',
  'toggleClassView',
  'toggleClassTitle',
  // 'toggleShowPolygonArrow',
  'toggleHelpLine',
  'toggleSizeInfo',
  'selectTool',
  'changeTool',
  'toNextFrame',
  'previousFrame',
];

export const baseEditActions: IBsActionName[] = [
  ...defaultActions,
  'redo',
  'undo',
  'cutSelectionOther',
  'cutSelectionFirst',
  'deleteSelection',
  'adjustObject',
  'drawTool',
  'holeSelection',
  'removeHoleSelection',
  'stopCurrentDraw',
  // 'copyToNext',
  // 'copyToLast',
  // 'toggleSizeInfo',
  'lineToolDrawMode',
];

export const baseViewActions: IBsActionName[] = [...defaultActions];
