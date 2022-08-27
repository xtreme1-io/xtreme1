import { UIType } from 'pc-editor';

export const BsUIType = {
    ...UIType,
    //
    rumModel: 'rumModel',
    flowSave: 'flowSave',
};
export type IBsUIType = keyof typeof BsUIType;
export const allUI = Object.keys(BsUIType) as IBsUIType[];

export const executeUI = [
    BsUIType.create2dBox,
    BsUIType.create2dRect,
    BsUIType.create3dBox,
    BsUIType.sideViewTool,
    BsUIType.info,
    BsUIType.filter2D,
    BsUIType.project,
    BsUIType.reProject,
    BsUIType.setting,
    BsUIType.track,
    BsUIType.translate,
    BsUIType.rumModel,
    BsUIType.flowSave,
] as IBsUIType[];
