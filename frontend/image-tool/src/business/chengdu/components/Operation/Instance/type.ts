import { AttrType } from 'editor';
// import { AnnotateType } from 'pc-render';

export interface IItem {
    lineLength?: any;
    type: string;
    id: string;
    name: string;
    annotateType: string; // todo
    visible: boolean;
    isModel: boolean;
    attrs: IItemAttrs;
    width?: number;
    height?: number;
    area?: number;
    filterVisible: boolean;
}
export type IItemAttrs = string[] | string[][];
export interface IInstanceList {
    isModel: boolean;
    classType: string;
    data: IItem[];
    color: string;
    // bgColor: string;
    visible: boolean;
    annotateType: string;
    filterVisible: boolean;
}

export interface IInstanceState {
    activeKey: string[];
    select: string[];
    objectN: number;
    list: IInstanceList[];
    noClassList: IInstanceList;
}

export interface IAttrItem {
    type: AttrType;
    name: string;
    options: { value: any; label: string }[];
    value: any;
}

export enum FilterEnum {
    class = 'Class',
    noClass = 'NoClass',
    predictedClass = 'PredictedClass',
    noPredictedClass = 'NoPredictedClass',
}
