import { IActionName, AllActions as editorActions } from 'pc-editor';
import * as BsActions from '../actions';

export type IBsActionName = keyof typeof BsActions | IActionName;
export const allActions = [...editorActions, ...Object.keys(BsActions)] as IBsActionName[];

export const viewHelperActions: IBsActionName[] = [
    'toggleViewNegX',
    'toggleViewNegY',
    'toggleViewPosX',
    'toggleViewPosY',
    'toggleViewPosZ',
];

export const sideActions: IBsActionName[] = [
    'translateXMinus',
    'translateXPlus',
    'translateYMinus',
    'translateYPlus',
    'translateZMinus',
    'translateZPlus',
    'rotationZRight90',
    'rotationZLeft',
    'rotationZRight',
];

export const generalActions: IBsActionName[] = [
    'nextFrame',
    'preFrame',
    'toggleClassView',
    'toggleShowAnnotation',
    'toggleShowLabel',
    'toggleShowMeasure',
    'pickObject',
    'resultExpandToggle',
    // 'filter2DByTrack',
];

export const executeActions: IBsActionName[] = [
    ...sideActions,
    ...generalActions,
    ...viewHelperActions,
    'create2DBox',
    'create2DRect',
    'createObjectWith3',
    'copyBackWard',
    'copyForward',
    'undo',
    'redo',
    'deleteObject',
    'focusObject',
    'projectObject2D',
    'toggleTranslate',
    'flowSave',
];

export const viewActions: IBsActionName[] = [
    ...generalActions,
    ...viewHelperActions,
    'focusObject',
];
