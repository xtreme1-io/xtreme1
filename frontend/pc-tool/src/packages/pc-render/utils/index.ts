import { ICameraInternal } from '../type';
import * as THREE from 'three';
import { Box, Box2D, Rect } from '../objects';
import Image2DRenderView from '../renderView/Image2DRenderView';
import { Lut } from 'three/examples/jsm/math/Lut';
let near = 0.01;
let far = 10000;
const lut = new Lut();
const colorKeyCode = 'PointColor';
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
export function getMaxMinV2(positions: THREE.Vector2[]) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    // let minZ = Infinity;
    // let maxZ = -Infinity;
    positions.forEach((pos) => {
        if (pos.x < minX) minX = pos.x;
        if (pos.x > maxX) maxX = pos.x;
        if (pos.y < minY) minY = pos.y;
        if (pos.y > maxY) maxY = pos.y;
        // if (pos.z < minZ) minZ = pos.z;
        // if (pos.z > maxZ) maxZ = pos.z;
    });
    return { minX, maxX, minY, maxY };
}

let line = new THREE.Line3();
let intersect = new THREE.Vector3();
let dir = new THREE.Vector3();
let frustum = new THREE.Frustum();
export function reformProjectPoints(
    positionsFrontV3: THREE.Vector3[],
    positionsBackV3: THREE.Vector3[],
    camera: THREE.PerspectiveCamera,
) {
    frustum.setFromProjectionMatrix(
        camera.projectionMatrix.clone().multiply(camera.matrixWorldInverse),
    );
    // let n = 0;

    // console.log(JSON.parse(JSON.stringify([...positionsFrontV3, ...positionsBackV3])));

    // console.log('frustum.planes[0]', frustum.planes[0].normal);
    traverseLine(positionsFrontV3, positionsBackV3, (p1, p2) => {
        // if (intersectHandle(p1, p2, frustum.planes[0])) n++;
        intersectHandle(p1, p2, frustum.planes[0]);
    });

    traverseLine(positionsFrontV3, positionsBackV3, (p1, p2) => {
        intersectHandle(p1, p2, frustum.planes[1]);
        // if (intersectHandle(p1, p2, frustum.planes[1])) n++;
    });

    // console.log({ n });
}
function traverseLine(
    positionsFrontV3: THREE.Vector3[],
    positionsBackV3: THREE.Vector3[],
    callback: (p1: THREE.Vector3, p2: THREE.Vector3) => void,
) {
    positionsFrontV3.forEach((front, index) => {
        let back = positionsBackV3[index];
        callback(front, back);
    });

    positionsFrontV3.forEach((p1, index) => {
        let p2 = positionsFrontV3[(index + 1) % 4];
        callback(p1, p2);
    });

    positionsBackV3.forEach((p1, index) => {
        let p2 = positionsBackV3[(index + 1) % 4];
        callback(p1, p2);
    });
}

function intersectHandle(start: THREE.Vector3, end: THREE.Vector3, plane: THREE.Plane) {
    // 同一个平面不处理
    let dotV = dir.copy(end).sub(start).dot(plane.normal);

    // console.log(JSON.parse(JSON.stringify(start)), JSON.parse(JSON.stringify(end)));
    // console.log('dotV:', dotV);
    if (Math.abs(dotV) < 0.000001) return;

    line.start.copy(start);
    line.end.copy(end);

    let flag = plane.intersectLine(line, intersect);
    // console.log('flag', flag);
    if (flag) {
        dir.copy(start).sub(intersect);
        if (dir.dot(plane.normal) < 0) {
            start.copy(intersect);
        }

        dir.copy(end).sub(intersect);
        if (dir.dot(plane.normal) < 0) {
            end.copy(intersect);
        }
    }

    return flag;
}

let v1 = new THREE.Vector3();
let v2 = new THREE.Vector3();
let v3 = new THREE.Vector3();
let v4 = new THREE.Vector3();
let v5 = new THREE.Vector3();
let v6 = new THREE.Vector3();
let v7 = new THREE.Vector3();
let v8 = new THREE.Vector3();
export function isBoxInImage(object: Box, view: Image2DRenderView) {
    let box = object.geometry.boundingBox as THREE.Box3;
    v1.set(box.max.x, box.min.y, box.max.z);
    v2.set(box.max.x, box.min.y, box.min.z);
    v3.set(box.max.x, box.max.y, box.min.z);
    v4.set(box.max.x, box.max.y, box.max.z);

    v5.set(box.min.x, box.min.y, box.max.z);
    v6.set(box.min.x, box.min.y, box.min.z);
    v7.set(box.min.x, box.max.y, box.min.z);
    v8.set(box.min.x, box.max.y, box.max.z);

    let positions = [v1, v2, v3, v4, v5, v6, v7, v8];
    let offset = 10;

    for (let i = 0; i < positions.length; i++) {
        let pos = positions[i];
        pos.applyMatrix4(object.matrixWorld);
        view.worldToImg(pos);
        if (
            pos.x > offset &&
            pos.x < view.imgSize.x &&
            pos.y > offset &&
            pos.y < view.imgSize.y &&
            Math.abs(pos.z) < 1
        ) {
            return true;
        }
    }

    return false;
}

let temp_1 = new THREE.Vector2();
let temp_2 = new THREE.Vector2();
let temp_3 = new THREE.Vector2();

export function renderRect(
    context: CanvasRenderingContext2D,
    obj: Rect,
    option: { lineWidth?: number; color?: string } = {},
) {
    let pos = temp_1;
    let temp = temp_2;
    let size = temp_3;
    let { lineWidth = 1, color = '#FF0000' } = option;

    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.setLineDash(obj.dashed ? [5, 5] : []);

    context.beginPath();
    temp.copy(obj.size).multiplyScalar(0.5);
    pos.copy(obj.center).sub(temp);
    size.copy(obj.size);
    context.strokeRect(pos.x, pos.y, size.x, size.y);
    context.stroke();
}

export function renderBox2D(
    context: CanvasRenderingContext2D,
    obj: Box2D,
    option: { lineWidth?: number; color?: string } = {},
) {
    let { positions1, positions2 } = obj;
    let { lineWidth = 1, color = '#FF0000' } = option;

    context.strokeStyle = color;
    context.lineWidth = lineWidth;

    // back
    context.globalAlpha = 1;
    context.setLineDash([5, 5]);
    let position = positions2;
    let pos = temp_2.copy(position[0]);
    context.beginPath();
    // pos.multiply(scaleSize);
    context.moveTo(pos.x, pos.y);
    position.forEach((e, index) => {
        pos.copy(position[(index + 1) % 4]);
        // pos.multiply(scaleSize);
        context.lineTo(pos.x, pos.y);
    });
    context.closePath();
    context.stroke();

    // front
    context.setLineDash(obj.dashed ? [5, 5] : []);
    position = positions1;
    pos = temp_2.copy(position[0]);
    context.beginPath();
    // pos.multiply(scaleSize);
    context.moveTo(pos.x, pos.y);
    position.forEach((e, index) => {
        pos.copy(position[(index + 1) % 4]);
        // pos.multiply(scaleSize);
        context.lineTo(pos.x, pos.y);
    });
    context.closePath();
    context.stroke();

    // line
    let pos1 = temp_3;
    context.beginPath();
    positions1.forEach((e, index) => {
        pos.copy(positions1[index]);
        pos1.copy(positions2[index]);

        context.moveTo(pos.x, pos.y);
        context.lineTo(pos1.x, pos1.y);
    });
    context.stroke();
}
const tempMap = new Map();

export function get<T>(type: new () => T, index: number = 0): T {
    let tempArr = tempMap.get(type);
    if (!tempArr) {
        tempArr = [];
        tempMap.set(type, tempArr);
    }

    let value = tempArr[index];
    if (!value) {
        tempArr[index] = new type();
        value = tempArr[index];
    }

    return value;
}

export function getColorTable(count = 64, seed?: [string, string]) {
    const colors = getThemeColor(seed);
    const len = colors.length - 1;
    const lookupTable = colors.map((color, index) => {
        return [index / len, color];
    });
    lut.addColorMap(colorKeyCode, lookupTable as any);
    lut.setColorMap(colorKeyCode, count);
    const table = lut.lut.slice(0, count);
    return table;
}
export function getThemeColor(seed?: [string, string]) {
    return ['#00ff00', '#ffff00', '#ff0000'];
}
