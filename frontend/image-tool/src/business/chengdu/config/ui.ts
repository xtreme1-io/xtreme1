import { UIType } from 'editor';

export const BsUIType = {
    ...UIType,
    flowSave: 'flowSave',
};
export type IBsUIType = keyof typeof BsUIType;
export const allUI = Object.keys(BsUIType) as IBsUIType[];

export const executeUI = [
    BsUIType.edit,
    BsUIType.rectangle,
    BsUIType.interactive,
    BsUIType.model,
    BsUIType.polygon,
    BsUIType.polyline,
    BsUIType.info,
    BsUIType.setting,
    BsUIType.flowSave,
] as IBsUIType[];

export const verifyUI = [BsUIType.setting, BsUIType.info] as IBsUIType[];
