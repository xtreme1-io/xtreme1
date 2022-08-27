import * as THREE from 'three';
import type { ITransform, AnnotateObject, Rect, Box2D } from 'pc-render';
import { IUserData, IObject } from '../../../type';
// import CmdBase from '../CmdBase';

import AddTrack, { IAddTrackOption } from './AddTrack';
import DeleteTrack, { IDeleteTrackOption } from './DeleteTrack';
import AddObject, { IAddObjectOption } from './AddObject';
import DeleteObject, { IDeleteObjectOption } from './DeleteObject';
import UpdateTransform from './UpdateTransform';
import UpdateUserData from './UpdateUserData';
import Update2DRect from './Update2DRect';
import Update2DBox from './Update2DBox';
import SelectObject from './SelectObject';
import UpdateTrackData from './UpdateTrackData';
import UpdateTrackDataBatch, {
    ITrackOption,
    IUpdateTrackBatchOption,
} from './UpdateTrackDataBatch';
import UpdateTransformBatch, { IUpdateTransformBatchOption } from './UpdateTransformBatch';
import UpdateObjectDataBatch, { IUpdateObjectUserDataOption } from './UpdateObjectUserData';
import ToggleVisible, { IToggleVisibleOption } from './ToggleVisible';

export interface ICmdOption {
    'add-track': IAddTrackOption;
    'delete-track': IDeleteTrackOption;
    'add-object': IAddObjectOption;
    'delete-object': IDeleteObjectOption;
    'select-object': AnnotateObject | AnnotateObject[] | undefined;
    'update-transform': {
        object: THREE.Object3D;
        transform: ITransform;
    };
    'update-2d-rect': {
        object: Rect;
        option: { center: THREE.Vector2; size?: THREE.Vector2 };
    };
    'update-2d-box': {
        object: Box2D;
        option: {
            positions1?: Record<number, THREE.Vector2>;
            positions2?: Record<number, THREE.Vector2>;
        };
    };
    // 'update-userData': {
    //     object: AnnotateObject | AnnotateObject[];
    //     userData: IUserData;
    // };
    'update-track-data': ITrackOption;
    'update-track-data-batch': IUpdateTrackBatchOption;
    'update-transform-batch': IUpdateTransformBatchOption;
    'update-object-user-data': IUpdateObjectUserDataOption;
    'toggle-visible': IToggleVisibleOption;
}

type Name = keyof ICmdOption;

const CMD: Record<Name, any> = {
    'delete-track': DeleteTrack,
    'add-track': AddTrack,
    'add-object': AddObject,
    'select-object': SelectObject,
    'delete-object': DeleteObject,
    'update-transform': UpdateTransform,
    // 'update-userData': UpdateUserData,
    'update-2d-rect': Update2DRect,
    'update-2d-box': Update2DBox,
    'update-track-data': UpdateTrackData,
    'update-track-data-batch': UpdateTrackDataBatch,
    'update-transform-batch': UpdateTransformBatch,
    'update-object-user-data': UpdateObjectDataBatch,
    'toggle-visible': ToggleVisible,
};

export default CMD;
