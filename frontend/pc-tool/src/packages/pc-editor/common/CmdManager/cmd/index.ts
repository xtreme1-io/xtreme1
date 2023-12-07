import * as THREE from 'three';
import type { ITransform, AnnotateObject, Rect, Box2D } from 'pc-render';
import AddObject, { IAddObjectOption } from './AddObject';
import DeleteObject, { IDeleteObjectOption } from './DeleteObject';
import UpdateTransform from './UpdateTransform';
import Update2DRect from './Update2DRect';
import Update2DBox from './Update2DBox';
import SelectObject from './SelectObject';
import UpdateObjectDataBatch, { IUpdateObjectUserDataOption } from './UpdateObjectUserData';
import ToggleVisible, { IToggleVisibleOption } from './ToggleVisible';
import UpdateTransformBatch, { IUpdateTransformBatchOption } from './UpdateTransformBatch';
import UpdateTrackDataBatch, {
    ITrackOption,
    IUpdateTrackBatchOption,
} from './UpdateTrackDataBatch';
import UpdateTrackData from './UpdateTrackData';
import DeleteTrack, { IDeleteTrackOption } from './DeleteTrack';
import AddTrack, { IAddTrackOption } from './AddTrack';
export interface ICmdOption {
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
    'update-object-user-data': IUpdateObjectUserDataOption;
    'toggle-visible': IToggleVisibleOption;
    'update-transform-batch': IUpdateTransformBatchOption;
    'update-track-data-batch': IUpdateTrackBatchOption;
    'update-track-data': ITrackOption;
    'delete-track': IDeleteTrackOption;
    'add-track': IAddTrackOption;
}

type Name = keyof ICmdOption;

const CMD: Record<Name, any> = {
    'add-object': AddObject,
    'select-object': SelectObject,
    'delete-object': DeleteObject,
    'update-transform': UpdateTransform,
    'update-2d-rect': Update2DRect,
    'update-2d-box': Update2DBox,
    'update-object-user-data': UpdateObjectDataBatch,
    'toggle-visible': ToggleVisible,
    'update-transform-batch': UpdateTransformBatch,
    'update-track-data-batch': UpdateTrackDataBatch,
    'update-track-data': UpdateTrackData,
    'delete-track': DeleteTrack,
    'add-track': AddTrack,
};

export default CMD;
