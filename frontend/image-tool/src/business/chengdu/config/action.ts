import * as BsActions from '../actions';
import { IActionName, AllActions as editorActions } from 'editor';

export type IBsActionName = keyof typeof BsActions | IActionName;

export const allActions = [...editorActions, ...Object.keys(BsActions)] as IBsActionName[];

export const viewActions: IBsActionName[] = [];

// pending --
export const commonActions: IBsActionName[] = [
    'KeyEscDown',
    'KeyEnterDown',
    'onDelete',
    'onSave',
    'toggleKeyboard',
    'undo',
    'redo',
    'pageUp',
    'pageDown',
];
export const rectActions: IBsActionName[] = [...commonActions];
export const polygonActions: IBsActionName[] = [...commonActions];
export const polylineActions: IBsActionName[] = [...commonActions];
export const interactiveActions: IBsActionName[] = [...commonActions];

// The following is not used for the time being
export const configActions: IBsActionName[] = ['toggleClassView'];
export const sideActions: IBsActionName[] = ['toggleKeyboard'];
export const executeActions: IBsActionName[] = ['undo', 'redo'];
export const verifyActions: IBsActionName[] = [...configActions];
