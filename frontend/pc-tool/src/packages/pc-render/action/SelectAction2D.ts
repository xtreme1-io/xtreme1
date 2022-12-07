// import * as THREE from 'three';
// import Image2DRenderView from '../renderView/Image2DRenderView';
// import Action from './Action';
// import { Event } from '../config/index';
// import { get } from '../utils/tempVar';
// import Box from '../objects/Box';

// type IFace = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
// /**
//  * front +X axis，right +Y axis，up +Z axis
//  */
// let faces: IFace[] = ['front', 'back', 'left', 'right', 'top', 'bottom'];
// function getRect(
//     v1: THREE.Vector3,
//     v2: THREE.Vector3,
//     v3: THREE.Vector3,
//     v4: THREE.Vector3,
//     box: THREE.Box3,
//     face: IFace,
// ) {
//     switch (face) {
//         case 'front':
//             v1.set(box.max.x, box.min.y, box.max.z);
//             v2.set(box.max.x, box.min.y, box.min.z);
//             v3.set(box.max.x, box.max.y, box.min.z);
//             v4.set(box.max.x, box.max.y, box.max.z);
//             break;
//         case 'back':
//             v1.set(box.min.x, box.min.y, box.max.z);
//             v2.set(box.min.x, box.min.y, box.min.z);
//             v3.set(box.min.x, box.max.y, box.min.z);
//             v4.set(box.min.x, box.max.y, box.max.z);
//             break;
//         case 'left':
//             v1.set(box.max.x, box.min.y, box.max.z);
//             v2.set(box.max.x, box.min.y, box.min.z);
//             v3.set(box.min.x, box.min.y, box.min.z);
//             v4.set(box.min.x, box.min.y, box.max.z);
//             break;
//         case 'right':
//             v1.set(box.max.x, box.max.y, box.max.z);
//             v2.set(box.max.x, box.max.y, box.min.z);
//             v3.set(box.min.x, box.max.y, box.min.z);
//             v4.set(box.min.x, box.max.y, box.max.z);
//             break;
//         case 'top':
//             v1.set(box.max.x, box.min.y, box.max.z);
//             v2.set(box.max.x, box.max.y, box.max.z);
//             v3.set(box.min.x, box.max.y, box.max.z);
//             v4.set(box.min.x, box.min.y, box.max.z);
//             break;
//         case 'bottom':
//             v1.set(box.max.x, box.min.y, box.min.z);
//             v2.set(box.max.x, box.max.y, box.min.z);
//             v3.set(box.min.x, box.max.y, box.min.z);
//             v4.set(box.min.x, box.min.y, box.min.z);
//             break;
//     }
// }

// export default class Select2DAction extends Action {
//     static actionName: string = 'select-2d';
//     renderView: Image2DRenderView;

//     private _mouseDown: boolean = false;
//     private _mouseDownPos: THREE.Vector2 = new THREE.Vector2();
//     private raycaster: THREE.Raycaster = new THREE.Raycaster();
//     private rotate180: THREE.Matrix4 = new THREE.Matrix4();

//     constructor(renderView: Image2DRenderView) {
//         super();
//         this.renderView = renderView;
//         this.rotate180.makeRotationAxis(new THREE.Vector3(0, 0, 1), Math.PI);

//         this.onMouseDown = this.onMouseDown.bind(this);
//         this.onMouseUp = this.onMouseUp.bind(this);
//     }
//     init() {
//         let dom = this.renderView.renderer.domElement;
//         // this._mouseDown = false;
//         // this._mouseDownPos = new THREE.Vector2();

//         dom.addEventListener('mousedown', this.onMouseDown);
//         dom.addEventListener('mouseup', this.onMouseUp);
//     }

//     get2DCanvasPos(box: THREE.Box3, matrix: THREE.Matrix4, face: IFace): THREE.Vector3[] {
//         let v1 = get(THREE.Vector3, 0);
//         let v2 = get(THREE.Vector3, 1);
//         let v3 = get(THREE.Vector3, 2);
//         let v4 = get(THREE.Vector3, 3);

//         getRect(v1, v2, v3, v4, box, face);

//         let result = [v1, v2, v3, v4];

//         result.forEach((v, index) => {
//             v.applyMatrix4(matrix);
//             this.renderView.worldToCanvas(v);
//             // v.applyMatrix4(this.renderView.matrixExternal);
//             // if (v.z < 0) {
//             //     v.applyMatrix4(this.rotate180);
//             // }
//             // v.applyMatrix4(this.renderView.matrixInternal);
//             // v.x /= v.z;
//             // v.y /= v.z;
//             // points[index].set(v.x, v.y);
//         });
//         return result;
//     }

//     isPointInRect(pos: THREE.Vector2, rect: THREE.Vector3[]) {
//         let A = rect[0];
//         let B = rect[1];
//         let C = rect[2];
//         let D = rect[3];
//         let a = (B.x - A.x) * (pos.y - A.y) - (B.y - A.y) * (pos.x - A.x);
//         let b = (C.x - B.x) * (pos.y - B.y) - (C.y - B.y) * (pos.x - B.x);
//         let c = (D.x - C.x) * (pos.y - C.y) - (D.y - C.y) * (pos.x - C.x);
//         let d = (A.x - D.x) * (pos.y - D.y) - (A.y - D.y) * (pos.x - D.x);
//         if ((a > 0 && b > 0 && c > 0 && d > 0) || (a < 0 && b < 0 && c < 0 && d < 0)) {
//             return true;
//         }
//         return false;
//     }

//     getBoxByPos(pos: THREE.Vector2): Box | null {
//         let { annotate3D } = this.renderView.pointCloud;
//         let matrix = new THREE.Matrix4();

//         for (let i = 0; i < annotate3D.children.length; i++) {
//             let obj = annotate3D.children[i] as Box;
//             if (!obj.visible) continue;

//             if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();

//             let bbox = obj.geometry.boundingBox as THREE.Box3;
//             // matrix.multiplyMatrices(this.renderView.matrix, obj.matrixWorld);

//             for (let j = 0; j < faces.length; j++) {
//                 let face = faces[j];
//                 // let points = [get(THREE.Vector2, 0), get(THREE.Vector2, 1), get(THREE.Vector2, 2), get(THREE.Vector2, 3)];
//                 let points = this.get2DCanvasPos(bbox, obj.matrixWorld, face);
//                 if (points[0].z < 0 && points[1].z < 0 && points[2].z < 0 && points[3].z < 0)
//                     continue;
//                 if (this.isPointInRect(pos, points)) {
//                     // console.log(face, obj);
//                     return obj;
//                 }
//             }
//         }

//         return null;
//     }

//     onMouseDown(event: MouseEvent) {
//         if (!this.enabled) return;

//         this._mouseDown = true;
//         this._mouseDownPos.set(event.offsetX, event.offsetY);
//     }
//     onMouseUp(event: MouseEvent) {
//         if (!this.enabled) return;

//         // let { annotate3D } = this.renderView.pointCloud;
//         let tempVec2 = new THREE.Vector2();
//         let domElement = this.renderView.renderer.domElement;
//         let distance = tempVec2.set(event.offsetX, event.offsetY).distanceTo(this._mouseDownPos);

//         let canvasPos = tempVec2.set(event.offsetX, event.offsetY);
//         // let imagePos = tempVec2.set(event.offsetX / domElement.clientWidth, event.offsetY / domElement.clientHeight).multiply(this.renderView.imgSize);
//         // console.log('distance:',distance)
//         if (this._mouseDown && distance < 0.1) {
//             let obj = this.getBoxByPos(canvasPos);
//             // console.log(obj);
//             if (obj) this.renderView.pointCloud.selectObject(obj);
//             else {
//                 this.renderView.pointCloud.selectObject();
//             }
//         }

//         this._mouseDown = false;
//     }

//     getPrejectPos(event: MouseEvent) {
//         let x = (event.offsetX / this.renderView.width) * 2 - 1;
//         let y = (-event.offsetY / this.renderView.height) * 2 + 1;
//         return { x, y };
//     }
// }
