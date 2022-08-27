import { ICameraInternal } from '../type';
import * as THREE from 'three';

let near = 0.01;
let far = 10000;
export function createMatrixFromCameraInternal(
    option: ICameraInternal,
    w: number,
    h: number,
): THREE.Matrix4 {
    let { fx, fy, cy, cx } = option;
    // return new THREE.Matrix4().set(
    //     2*fx / w,       0,                   1 - 2*cx / w,                 0,
    //     0,           2*fy / h,          2*cy / h - 1,                      0,
    //     0,             0,            (near + far) / (near - far),   2*far*near / (near - far),
    //     0,             0,                      -1.0,                       0);

    return new THREE.Matrix4().set(
        (2 * fx) / w,
        0,
        1 - (2 * cx) / w,
        0,
        0,
        (2 * fy) / h,
        (2 * cy) / h - 1,
        0,
        0,
        0,
        (near + far) / (near - far),
        (2 * far * near) / (near - far),
        0,
        0,
        -1,
        0,
    );
}

export function isPointInRect(pos: THREE.Vector2, rect: THREE.Vector2[]) {
    let A = rect[0];
    let B = rect[1];
    let C = rect[2];
    let D = rect[3];
    let a = (B.x - A.x) * (pos.y - A.y) - (B.y - A.y) * (pos.x - A.x);
    let b = (C.x - B.x) * (pos.y - B.y) - (C.y - B.y) * (pos.x - B.x);
    let c = (D.x - C.x) * (pos.y - C.y) - (D.y - C.y) * (pos.x - C.x);
    let d = (A.x - D.x) * (pos.y - D.y) - (A.y - D.y) * (pos.x - D.x);
    if ((a > 0 && b > 0 && c > 0 && d > 0) || (a < 0 && b < 0 && c < 0 && d < 0)) {
        return true;
    }
    return false;
}

export function isLeft(e: MouseEvent) {
    return e.button === 0;
}

export function isRight(e: MouseEvent) {
    return e.button === 2;
}
