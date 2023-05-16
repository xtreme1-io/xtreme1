import { IAttr, ResultType, ResultStatus, IClassType } from 'pc-editor';
import { AnnotateType } from 'pc-render';

export interface IInstanceItem {
    id: string;
    name: string;
    confidence: number;
    info?: string;
}

export interface IAttrItem extends IAttr {
    value: any;
}

export type MsgType =
    | 'type'
    | 'class'
    | 'class-standard'
    | 'attr-from'
    | 'attr-to'
    | 'merge-to'
    | 'merge-from'
    | 'split'
    | 'delete-all'
    | 'delete-range'
    | 'delete-no-true';

export interface IState {
    activeTab: string[];
    showType: 'select' | 'msg';
    // model
    batchVisible: boolean;
    isBatch: boolean;
    batchTrackIds: string[];
    instances: IInstanceItem[];
    filterInstances: IInstanceItem[];
    modelClass: string;
    confidenceRange: number[];
    //
    isClassStandard: boolean;
    isInvisible: boolean;
    classType: string;
    objectId: string;
    trackId: string;
    trackName: string;
    trackVisible: boolean;
    isStandard: boolean;
    resultType: ResultType | '';
    resultStatus: ResultStatus | '';
    resultInstances: IInstanceItem[];
    annotateType: AnnotateType | '';
    attrs: IAttr[];
    // msgInfo
    showMsgType: MsgType | '';
    //
    // [k: string]: any;
}

export interface IControl {
    needUpdate: () => boolean;
    close: () => void;
    open: () => void;
}
