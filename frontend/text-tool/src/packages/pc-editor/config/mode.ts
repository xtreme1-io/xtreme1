import { IModeConfig, OPType } from './type';
import type { IActionName } from '../common/ActionManager/type';
import { AllActions } from '../common/ActionManager';
import * as _ from 'lodash';

function toMap<T extends string>(arr: T[]) {
    let map = {} as Record<T, boolean>;
    arr.forEach((e) => (map[e] = true));
    return map;
}

export const UIType = {
    // ****** left tool**********
    create3dBox: 'create3dBox',
    create2dRect: 'create2dRect',
    create2dBox: 'create2dBox',
    translate: 'translate',
    annotate: 'annotate',
    project: 'project',
    reProject: 'reProject',
    track: 'track',
    filter2D: 'filter2D',
    setting: 'setting',
    info: 'info',

    // *******side view**********
    sideViewTool: 'sideViewTool',

    rumModel: 'rumModel',
    flowSave: 'flowSave',
};

export type IUIType = keyof typeof UIType;

let allUI = Object.keys(UIType) as IUIType[];

// test mode
const all: IModeConfig<IUIType, IActionName> = {
    name: 'all',
    op: OPType.EXECUTE,
    ui: toMap(allUI),
    actions: toMap(AllActions),
};

// test mode
const empty: IModeConfig<IUIType, IActionName> = {
    name: 'empty',
    op: OPType.VIEW,
    ui: toMap([] as IUIType[]),
    actions: toMap([] as IActionName[]),
};

let modes = {
    empty,
    all,
};

export type IModeType = keyof typeof modes;

export const ModeKeys = Object.keys(modes).filter((e) => e !== 'all') as IModeType[];

export default modes;
