import * as BsActions from '../actions';
import { IActionName, AllActions as editorActions } from 'editor';

export type IBsActionName = keyof typeof BsActions | IActionName;

// 所有方法
// -- 这里会将 ActionManager 下面导出的所有方法都获取到
export const allActions = [...editorActions, ...Object.keys(BsActions)] as IBsActionName[];

// 查看状态下的方法
export const viewActions: IBsActionName[] = [];

// 待定 --
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

// 下面的暂时没用到
export const configActions: IBsActionName[] = ['toggleClassView'];
export const sideActions: IBsActionName[] = ['toggleKeyboard'];
export const executeActions: IBsActionName[] = ['undo', 'redo'];
export const verifyActions: IBsActionName[] = [...configActions];
