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
};

export default CMD;
