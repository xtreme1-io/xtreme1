import * as THREE from 'three';
import { IUserData } from '../../type';
// import CmdBase from '../CmdBase';

import AddObject from './AddObject';
import DeleteObject from './DeleteObject';
// import UpdateTransform from './UpdateTransform';
// import UpdateUserData from './UpdateUserData';
// import Update2DRect from './Update2DRect';
// import Update2DBox from './Update2DBox';
// import SelectObject from './SelectObject';
import MoveObject from './MoveObject';
import AddPoint from './AddPoint';
import AddModelRun from './AddModelRun';
import HotkeyMove from './HotkeyMove';
import MovePoint from './MovePoint';
import MoveSide from './MoveSide';
import ClipPolygon from './ClipPolygon';
import AddInterior from './AddInterior';
import RemoveInterior from './RemoveInterior';

export interface ICmdOption {
    'add-point': any;
    'add-object': any;
    'delete-object': any;
    'move-object': any;
    // 'move-point': AnnotateObject;
    'add-modelRun': any;
    'hotkey-move': any;
    'move-point': any;
    'move-side': any;
    'clip-ploygon': any;
    'add-interior': any;
    'remove-interior': any;
    // 'select-object': AnnotateObject | AnnotateObject[] | undefined;
    // 'delete-object': AnnotateObject | AnnotateObject[];
    // 'update-transform': {
    //     object: THREE.Object3D;
    //     transform: ITransform;
    // };
    // 'update-2d-rect': {
    //     object: Rect;
    //     option: { center: THREE.Vector2; size?: THREE.Vector2 };
    // };
    // 'update-2d-box': {
    //     object: Box2D;
    //     option: {
    //         positions1?: Record<number, THREE.Vector2>;
    //         positions2?: Record<number, THREE.Vector2>;
    //     };
    // };
    // 'update-userData': {
    //     object: AnnotateObject | AnnotateObject[];
    //     userData: IUserData;
    // };
}

type Name = keyof ICmdOption;

const CMD: Record<Name, any> = {
    'add-point': AddPoint,
    'add-object': AddObject,
    'add-modelRun': AddModelRun,
    'delete-object': DeleteObject,
    'move-object': MoveObject,
    'hotkey-move': HotkeyMove,
    'move-point': MovePoint,
    'move-side': MoveSide,
    'clip-ploygon': ClipPolygon,
    'add-interior': AddInterior,
    'remove-interior': RemoveInterior,
    // 'select-object': SelectObject,
    // 'delete-object': DeleteObject,
    // 'update-transform': UpdateTransform,
    // 'update-userData': UpdateUserData,
    // 'update-2d-rect': Update2DRect,
    // 'update-2d-box': Update2DBox,
};

export default CMD;
