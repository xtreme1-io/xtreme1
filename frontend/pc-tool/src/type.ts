import { ObjectType } from 'pc-editor';
import DataManager from './common/DataManager';
import * as THREE from 'three';
import { Vector2Of4 } from 'pc-render';

export interface IUser {
    id: string;
    nickname: string;
    email?: string;
    status?: string;
    username?: string;
    // ....其他属性
}

export interface IBSState {
    query: Record<string, string>;
    // flow
    saving: boolean;
    //流水号
    recordId: string;
    // 数据集
    datasetId: string;
    seriesFrameId?: string;
    //
    user: IUser;
}

export type IAction = 'save' | 'close';

export interface IOption {
    label: string;
    value: string;
}

export interface IPageHandler {
    init: () => void;
    onAction: (e: IAction) => void;
}
