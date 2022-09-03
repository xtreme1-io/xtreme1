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

// 执行
const execute: IModeConfig<IBsUIType, IBsActionName> = {
    op: OPType.EXECUTE,
    ui: toMap([...executeUI]),
    actions: toMap<IBsActionName>(allActions), // 这里暂时直接把所有方法都作为初始值配置
};

// 查看
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
    // 以下待定，后面在选择左侧工具栏时调用editor.setMode来设置actions
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
