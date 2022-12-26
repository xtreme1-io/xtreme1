import { Quaternion, Euler, Matrix3, Vector3, Matrix4 } from 'three';
type IVec3 = {
  x: number;
  y: number;
  z: number;
};
type IObject = {
  size3D: IVec3;
  rotation3D: IVec3;
  center3D: IVec3;
};
type Info = { bottom: number; right: number; top: number; left: number };
type ISize = { width: number; height: number };

const worldMatrix = new Matrix4();
const _quat = new Quaternion();
const tempCenter = new Vector3();
const tempSize = new Vector3();
const tempEuler = new Euler();
const tempMatrix3 = new Matrix3();
const vertexs = [
  new Vector3(0.5, 0.5, 0.5),
  new Vector3(0.5, 0.5, -0.5),
  new Vector3(0.5, -0.5, 0.5),
  new Vector3(0.5, -0.5, -0.5),
  new Vector3(-0.5, 0.5, 0.5),
  new Vector3(-0.5, 0.5, -0.5),
  new Vector3(-0.5, -0.5, 0.5),
  new Vector3(-0.5, -0.5, -0.5),
];
export interface ICameraInternal {
  fx: number;
  fy: number;
  cx: number;
  cy: number;
}
export interface IImgViewConfig {
  cameraInternal: ICameraInternal;
  cameraExternal: number[];
  imgSize: [number, number];
  imgUrl: string;
  imgObject: HTMLImageElement;
  // rowMajor?: boolean;
  name: string;
}
export function createMatrixFromCameraInternal(
  option: ICameraInternal,
  w: number,
  h: number,
): Matrix4 {
  const { fx, fy, cy, cx } = option;
  const near = 0.01;
  const far = 10000;
  // return new THREE.Matrix4().set(
  //     2*fx / w,       0,                   1 - 2*cx / w,                 0,
  //     0,           2*fy / h,          2*cy / h - 1,                      0,
  //     0,             0,            (near + far) / (near - far),   2*far*near / (near - far),
  //     0,             0,                      -1.0,                       0);

  return new Matrix4().set(
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
export function mapLinear(x: number, a1: number, a2: number, b1: number, b2: number) {
  return b1 + ((x - a1) * (b2 - b1)) / (a2 - a1);
}
export function transformToPc(object: IObject, size: ISize, extraInfo: Info) {
  const { left, right, top, bottom } = extraInfo;
  const cos = Math.cos(Math.PI - object.rotation3D.z);
  const sin = Math.sin(Math.PI - object.rotation3D.z);
  const offsetW = object.size3D.x / 2;
  const offsetH = object.size3D.y / 2;

  const centerX = mapLinear(object.center3D.x, left, right, 0, size.width);
  const centerY = mapLinear(object.center3D.y, bottom, top, size.height, 0);
  const toViewCoordinate = (offsetX: number, offsetY: number) => {
    offsetX = (offsetX * size.width) / Math.abs(right - left);
    offsetY = (offsetY * size.width) / Math.abs(bottom - top);
    return [offsetX * cos - offsetY * sin + centerX, offsetX * sin + offsetY * cos + centerY];
  };
  const point1 = toViewCoordinate(+offsetW, +offsetH);
  const point2 = toViewCoordinate(-offsetW, +offsetH);
  const point3 = toViewCoordinate(-offsetW, -offsetH);
  const point4 = toViewCoordinate(+offsetW, -offsetH);
  return {
    center: [centerX, centerY],
    points: [point1, point2, point3, point4],
  };
}

export const focusTransform = (object: IObject, size: ISize, extraInfo: Info, aspect = 1) => {
  const { left, right, top, bottom } = extraInfo;
  const { center3D, rotation3D, size3D } = object;
  const _center = {
    x: (right + left) / 2,
    y: (bottom + top) / 2,
  };
  const offsetX = ((center3D.x - _center.x) / (left - right)) * size.width;
  const offsetY = ((center3D.y - _center.y) / (top - bottom)) * size.height;
  const scale = Math.floor(((right - left) * aspect) / Math.max(size3D.x, size3D.y)) * 0.4;
  tempMatrix3
    .identity()
    .translate(offsetX, offsetY)
    .scale(scale, scale)
    .rotate(Math.PI / 2 - rotation3D.z);
  const el = tempMatrix3.elements;
  return {
    matrix3Str: `matrix(${el[0]},${el[1]},${el[3]},${el[4]},${el[6]},${el[7]})`,
    scale: scale,
  };
};

export function getCameraMatrix(item: IImgViewConfig) {
  const projectionMatrix = createMatrixFromCameraInternal(
    item.cameraInternal,
    item.imgSize[0],
    item.imgSize[1],
  );
  const ext = item.cameraExternal;
  const matrixWorldInverse = new Matrix4()
    .set(
      ext[0],
      ext[1],
      ext[2],
      ext[3],
      ext[4],
      ext[5],
      ext[6],
      ext[7],
      ext[8],
      ext[9],
      ext[10],
      ext[11],
      ext[12],
      ext[13],
      ext[14],
      ext[15],
    )
    .premultiply(new Matrix4().makeScale(1, -1, -1));
  projectionMatrix.multiply(matrixWorldInverse);
  return projectionMatrix;
}
export function transformToImage(object: IObject, size: ISize, cameraMatrix: Matrix4) {
  const { center3D, rotation3D, size3D } = object;
  tempCenter.set(center3D.x, center3D.y, center3D.z);
  tempEuler.set(rotation3D.x, rotation3D.y, rotation3D.z);
  tempSize.set(size3D.x, size3D.y, size3D.z);
  worldMatrix
    .compose(tempCenter, _quat.setFromEuler(tempEuler, false), tempSize)
    .premultiply(cameraMatrix);

  const _pos = new Vector3();
  const min = new Vector3(Infinity, Infinity, Infinity);
  const max = new Vector3(-Infinity, -Infinity, -Infinity);
  vertexs.forEach((item) => {
    _pos.copy(item);
    _pos.applyMatrix4(worldMatrix);
    _pos.x = ((_pos.x + 1) / 2) * size.width;
    _pos.y = (-(_pos.y - 1) / 2) * size.height;
    min.min(_pos);
    max.max(_pos);
  });
  const isBoxInImage = !(
    min.x >= size.width ||
    max.x <= 0 ||
    min.y >= size.height ||
    max.y <= 0 ||
    Math.abs(max.z) >= 1 ||
    Math.abs(min.z) >= 1
  );
  if (isBoxInImage) {
    return [
      [min.x, min.y],
      [max.x, min.y],
      [max.x, max.y],
      [min.x, max.y],
    ];
  } else {
    return null;
  }
}
export function isMatrixColumnMajor(elements: number[]) {
  const rightZero = elements[3] === 0 && elements[7] === 0 && elements[11] === 0;
  const bottomHasOne = !!elements[12] || !!elements[13] || !!elements[14];
  return rightZero && bottomHasOne;
}
export function translateCameraConfig(info: any) {
  // 兼容
  let cameraExternal = info.cameraExternal || info.camera_external;
  const cameraInternal = info.cameraInternal || info.camera_internal;

  if (!info || !cameraExternal || cameraExternal.length !== 16) return null;

  // 列序转换成行序
  if (info.rowMajor === false || isMatrixColumnMajor(cameraExternal)) {
    const matrix = new Matrix4();
    matrix.elements = cameraExternal;
    matrix.transpose();
    cameraExternal = matrix.elements;
  }

  return { cameraExternal, cameraInternal };
}
export async function xhrGet(url: string, responseType: XMLHttpRequestResponseType = 'json') {
  return new Promise<any>((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.responseType = responseType;
    xhr.setRequestHeader('Cache-Control', 'no-cache');
    xhr.onload = function () {
      if (this.status === 200) {
        resolve(this.response);
      } else {
        resolve(null);
      }
    };
    xhr.onabort = () => {
      resolve(null);
    };
    xhr.onerror = () => {
      resolve(null);
    };
    xhr.send();
  });
}
export async function getCameraConfig(url: string) {
  let result = await xhrGet(url);
  result = result || {};

  const configs = [] as any[];
  Object.keys(result).forEach((name) => {
    const config = result[name];
    const index = +name.replace('3d_img', '') as number;

    const translateInfo = translateCameraConfig(config);

    if (!translateInfo) return;

    configs[index] = {
      imgSize: [config.width || 10, config.height | 10],
      cameraExternal: translateInfo.cameraExternal,
      cameraInternal: translateInfo.cameraInternal,
    };
  });

  return configs;
}
