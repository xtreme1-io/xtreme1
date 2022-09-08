import { IModeConfig, OPType } from 'editor';
import { BsUIType, IBsUIType, executeUI, verifyUI } from './ui';
import {
    IBsActionName,
    allActions,
    rectActions,
    polygonActions,
    polylineActions,
    interactiveActions,
} from './action';

function toMap<T extends string>(arr: T[]) {
    let map = {} as Record<T, boolean>;
    arr.forEach((e) => (map[e] = true));
    return map;
}

const execute: IModeConfig<IBsUIType, IBsActionName> = {
    op: OPType.EXECUTE,
    ui: toMap([...executeUI]),
    actions: toMap<IBsActionName>(allActions), // For the time being, all methods are directly configured as initial values.
};

const view: IModeConfig<IBsUIType, IBsActionName> = {
    op: OPType.VIEW,
    ui: toMap([...verifyUI]),
    actions: toMap<IBsActionName>([]),
};

const rect: IModeConfig<IBsUIType, IBsActionName> = {
    op: OPType.EXECUTE,
    ui: toMap([...executeUI]),
    actions: toMap<IBsActionName>(rectActions),
};
const polygon: IModeConfig<IBsUIType, IBsActionName> = {
    op: OPType.EXECUTE,
    ui: toMap([...executeUI]),
    actions: toMap<IBsActionName>(polygonActions),
};
const polyline: IModeConfig<IBsUIType, IBsActionName> = {
    op: OPType.EXECUTE,
    ui: toMap([...executeUI]),
    actions: toMap<IBsActionName>(polylineActions),
};
const interactive: IModeConfig<IBsUIType, IBsActionName> = {
    op: OPType.EXECUTE,
    ui: toMap([...executeUI]),
    actions: toMap<IBsActionName>(interactiveActions),
};

let modes = {
    execute,
    view,
    rect,
    polygon,
    polyline,
    interactive,
};

export type IModeType = keyof typeof modes;
export const ModeKeys = Object.keys(modes).filter((e) => e !== 'all') as IModeType[];

Object.keys(modes).forEach((name) => {
    let mode = modes[name as IModeType];
    mode.name = name;
});
export default modes;
