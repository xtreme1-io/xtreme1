import { IModeConfig, OPType } from 'pc-editor';
import { BsUIType, IBsUIType, executeUI } from './ui';
import { IBsActionName, executeActions, viewActions } from './action';

function toMap<T extends string>(arr: T[]) {
    let map = {} as Record<T, boolean>;
    arr.forEach((e) => (map[e] = true));
    return map;
}

// execute mode
const execute: IModeConfig<IBsUIType, IBsActionName> = {
    name: 'execute',
    op: OPType.EXECUTE,
    ui: toMap([...executeUI]),
    actions: toMap<IBsActionName>([...executeActions]),
};

// view mode
const view: IModeConfig<IBsUIType, IBsActionName> = {
    name: 'view',
    op: OPType.VIEW,
    ui: toMap([BsUIType.setting, BsUIType.info]),
    actions: toMap<IBsActionName>([...viewActions]),
};

let modes = {
    execute,
    view,
};

export type IModeType = keyof typeof modes;
export const ModeKeys = Object.keys(modes).filter((e) => e !== 'all') as IModeType[];

Object.keys(modes).forEach((name) => {
    let mode = modes[name as IModeType];
    mode.name = name;
});

// @ts-ignore
window.modes = modes;
export default modes;
