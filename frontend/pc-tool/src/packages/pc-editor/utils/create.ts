import * as THREE from 'three';
import Editor from '../Editor';
import { IUserData } from '../type';
import { nanoid } from 'nanoid';
import { Box, Rect, Box2D, Vector2Of4 } from 'pc-render';

export function setIdInfo(editor: Editor, userData: IUserData) {
    if (!userData.id) userData.id = THREE.MathUtils.generateUUID();
    if (!userData.trackId) {
        userData.trackId = nanoid(16);
    }
    if (!userData.trackName) {
        userData.trackName = editor.getId();
    }
}

export function createAnnotate3D(
    editor: Editor,
    position: THREE.Vector3,
    scale: THREE.Vector3,
    rotation: THREE.Euler,
    userData: IUserData = {},
) {
    let object = new Box();
    object.position.copy(position);
    object.scale.copy(scale);
    object.rotation.copy(rotation);
    object.userData = userData;
    object.matrixAutoUpdate = true;
    object.updateMatrixWorld();
    // object.dashed = !!userData.invisibleFlag;
    if (userData.id) {
        object.uuid = userData.id;
    }

    // setIdInfo(editor, userData);
    return object;
}

export function createAnnotateRect(
    editor: Editor,
    center: THREE.Vector2,
    size: THREE.Vector2,
    userData: IUserData = {},
) {
    let object = new Rect(center, size);
    object.userData = userData;
    // object.dashed = !!userData.invisibleFlag;
    // setIdInfo(editor, userData);

    return object;
}

export function createAnnotateBox2D(
    editor: Editor,
    positions1: Vector2Of4,
    positions2: Vector2Of4,
    userData: IUserData = {},
) {
    let object = new Box2D(positions1, positions2);
    object.userData = userData;
    // object.dashed = !!userData.invisibleFlag;
    // setIdInfo(editor, userData);

    return object;
}
