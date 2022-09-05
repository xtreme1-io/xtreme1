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
}

export interface IBSState {
    query: Record<string, string>;
    // flow
    saving: boolean;
    validing: boolean;
    submitting: boolean;
    modifying: boolean;
    recordId: string;
    // dataset info
    datasetId: string;
    datasetName: string;
    datasetType: string;
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
