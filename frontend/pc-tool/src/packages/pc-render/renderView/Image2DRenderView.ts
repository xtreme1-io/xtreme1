import * as THREE from 'three';
import Render from './Render';
import PointCloud from '../PointCloud';
import PointsMaterial, { IUniformOption } from '../material/PointsMaterial';
import * as _ from 'lodash';
import { Object2D, Box, Rect, Vector2Of4, Box2D, AnnotateObject } from '../objects';
import { IRenderViewConfig, ICameraInternal } from '../type';
import { createMatrixFromCameraInternal, getMaxMinV2, reformProjectPoints } from '../utils';
import { get } from '../utils/tempVar';
import Image2DRenderProxy from './Image2DRenderProxy';
import { Event } from '../config/';

const defaultActions: string[] = [
    'select',
    'render-2d-shape',
    'create-obj',
    'edit-2d',
    'transform-2d',
];
// const defaultActions: string[] = ['select-2d'];

type ActionType = 'select' | 'render-2d-shape' | 'create-obj' | 'edit-2d' | 'transform-2d';

interface IOption {
    cameraInternal: ICameraInternal;
    cameraExternal: Array<number>;
    imgSize?: [number, number];
    imgUrl?: string;
    imgObject: HTMLImageElement;
}

let positionsFrontV3 = [...Array(4)].map((e) => new THREE.Vector3());
let positionsBackV3 = [...Array(4)].map((e) => new THREE.Vector3());

let positionsFrontV2 = [...Array(4)].map((e) => new THREE.Vector2());
let positionsBackV2 = [...Array(4)].map((e) => new THREE.Vector2());

let rotate180 = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), Math.PI);

export default class Image2DRenderView extends Render {
    container: HTMLDivElement;
    // matrix
    // proxy offset matrix
    proxyOffset: THREE.Vector2 = new THREE.Vector2();
    proxyTransformMatrix: THREE.Matrix4 = new THREE.Matrix4();
    // local matrix
    containerMatrix: THREE.Matrix4 = new THREE.Matrix4();
    fitMatrix: THREE.Matrix4 = new THREE.Matrix4();
    transformMatrix: THREE.Matrix4 = new THREE.Matrix4();
    pointCloud: PointCloud;
    width: number;
    height: number;
    // proxy
    proxy: Image2DRenderProxy;
    clientRect: DOMRect = {} as DOMRect;
    // 2d
    // canvas?: HTMLCanvasElement;
    // context?: CanvasRenderingContext2D;
    // 3d renderer
    // renderer?: THREE.WebGLRenderer;
    clipCamera: THREE.PerspectiveCamera;
    camera: THREE.PerspectiveCamera;
    cameraHelper: THREE.CameraHelper;
    option: IOption = {} as IOption;
    group: THREE.Group;
    // project matrix
    matrixExternal: THREE.Matrix4 = new THREE.Matrix4();
    matrixInternal: THREE.Matrix4 = new THREE.Matrix4();
    matrix: THREE.Matrix4 = new THREE.Matrix4();
    // img
    img: HTMLImageElement | null = null;
    imgSize: THREE.Vector2 = new THREE.Vector2(1, 1);
    imgAspectRatio: number = 1;
    // color
    // selectColor: THREE.Color = new THREE.Color(1, 0, 0);
    // selectColorCSS: string = '#FF0000';
    // highlightColor: THREE.Color = new THREE.Color(1, 0, 0);
    // box filter matrix
    boxInvertMatrix: THREE.Matrix4 = new THREE.Matrix4();
    // render flag
    renderBox: boolean = true;
    renderPoints: boolean = false;
    renderRect: boolean = true;
    renderBox2D: boolean = true;
    // render config
    lineWidth: number = 1;

    constructor(
        container: HTMLDivElement,
        pointCloud: PointCloud,
        config: IRenderViewConfig<ActionType> & { proxy?: Image2DRenderProxy } = {},
    ) {
        super(config.name || '');

        this.container = container;
        this.pointCloud = pointCloud;

        this.width = this.container.clientWidth || 10;
        this.height = this.container.clientHeight || 10;

        let group = new THREE.Group();
        this.pointCloud.scene.add(group);
        this.group = group;

        if (config.proxy) {
            this.proxy = config.proxy;
        } else {
            this.proxy = new Image2DRenderProxy(pointCloud);
            this.proxy.attach(this.container);
        }
        this.proxy.addView(this);

        this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 1, 1000);
        // this.camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.001, 1000);
        this.group.add(this.camera);

        const helper = new THREE.CameraHelper(this.camera);
        helper.visible = false;
        this.group.add(helper);
        // @ts-ignore
        this.cameraHelper = helper;

        // clip
        this.clipCamera = new THREE.PerspectiveCamera(100, this.width / this.height, 0.01, 100);
        // let clipHelper = new THREE.CameraHelper(this.clipCamera);
        // this.group.add(clipHelper);

        this.setActions(config.actions || defaultActions);

        // @ts-ignore
        window.imgView = this;
    }

    init(): void {}

    destroy(): void {
        // this.renderer.dispose();
        // this.pointCloud.scene.remove(this.group);
        // this.cameraHelper.dispose();
    }

    updateSize() {
        let width = this.container.clientWidth || 100;
        let height = this.container.clientHeight || 100;

        if (width !== this.width || height !== this.height) {
            this.width = width;
            this.height = height;
            this.updateAspectRatioConfig();
        }
    }

    updateAspectRatioConfig() {
        let { imgSize, width, height, img } = this;

        if (!img) return;

        let scaleX = imgSize.x / width;
        let scaleY = imgSize.y / height;

        let scale = 1;
        let offsetX = 0;
        let offsetY = 0;
        if (scaleX > scaleY) {
            scale = 1 / scaleX;
            offsetY = (height - imgSize.y * scale) / 2;
        } else {
            scale = 1 / scaleY;
            offsetX = (width - imgSize.x * scale) / 2;
        }
        this.fitMatrix.makeScale(scale, scale, 1);

        let translate = get(THREE.Matrix4);
        translate.makeTranslation(offsetX, offsetY, 0);
        this.fitMatrix.premultiply(translate);
    }

    setOptions(option: IOption) {
        this.option = option;

        let imgObject = option.imgObject;

        this.img = imgObject;

        this.imgSize.set(imgObject.naturalWidth, imgObject.naturalHeight);
        this.imgAspectRatio = this.imgSize.x / this.imgSize.y;
        this.updateAspectRatioConfig();

        this.matrixInternal.copy(
            createMatrixFromCameraInternal(option.cameraInternal, this.imgSize.x, this.imgSize.y),
        );

        // @ts-ignore
        this.matrixExternal.set(...option.cameraExternal);

        // @ts-ignore
        let matrix = new THREE.Matrix4().set(...option.cameraExternal);
        matrix.premultiply(new THREE.Matrix4().makeScale(1, -1, -1));
        matrix.invert();
        matrix.decompose(this.camera.position, this.camera.quaternion, this.camera.scale);
        this.camera.updateMatrixWorld();

        this.matrix.copy(this.matrixInternal).multiply(this.camera.matrixWorldInverse);

        this.camera.projectionMatrix.copy(this.matrixInternal);
        this.camera.projectionMatrixInverse.copy(this.camera.projectionMatrix).invert();
        // @ts-ignore
        this.cameraHelper.update();

        // clip
        this.clipCamera.position.copy(this.camera.position);
        this.clipCamera.quaternion.copy(this.camera.quaternion);
        this.clipCamera.scale.copy(this.camera.scale);
        this.clipCamera.updateMatrixWorld();
        // this.testFrustum();

        this.render();
    }

    testFrustum() {
        let frustum = new THREE.Frustum();
        frustum.setFromProjectionMatrix(
            this.clipCamera.projectionMatrix.clone().multiply(this.clipCamera.matrixWorldInverse),
        );
        let planeHelper = new THREE.PlaneHelper(frustum.planes[1], 100, 0xcccccc);
        console.log('frustum.planes[1]', frustum.planes[1].normal);

        this.group.add(planeHelper);
    }

    worldToImg(pos: THREE.Vector3, target?: THREE.Vector3) {
        // let domElement = this.renderer.domElement;
        target = target || pos;

        target.copy(pos);

        let matrix = get(THREE.Matrix4);
        matrix.copy(this.camera.projectionMatrix);
        matrix.multiply(this.camera.matrixWorldInverse);

        // pos.applyMatrix4(e.matrixWorld);
        target.applyMatrix4(matrix);
        target.x = ((target.x + 1) / 2) * this.imgSize.x;
        target.y = (-(target.y - 1) / 2) * this.imgSize.y;

        return target;
    }

    projectToImg(pos: THREE.Vector3, target?: THREE.Vector3) {
        // let domElement = this.renderer.domElement;
        target = target || pos;
        pos.x = ((pos.x + 1) / 2) * this.imgSize.x;
        pos.y = (-(pos.y - 1) / 2) * this.imgSize.y;

        return target;
    }

    getBoxRect(object: Box) {
        // let bbox = object.geometry.boundingBox as THREE.Box3;

        let box2dInfo = this.getBox2DBox(object);
        let rectInfo = getMaxMinV2([...box2dInfo.positionsBack, ...box2dInfo.positionsFront]);

        // let matrix = get(THREE.Matrix4);
        // matrix.copy(this.camera.projectionMatrix);
        // matrix.multiply(this.camera.matrixWorldInverse);
        // matrix.multiply(object.matrixWorld);

        // let box = get(THREE.Box3).copy(bbox);
        // box.applyMatrix4(matrix);

        // this.projectToImg(box.max);
        // this.projectToImg(box.min);

        // let rect = new Rect();
        let center = new THREE.Vector2().set(
            (rectInfo.minX + rectInfo.maxX) / 2,
            (rectInfo.minY + rectInfo.maxY) / 2,
        );
        let size = new THREE.Vector2().set(
            Math.abs(rectInfo.maxX - rectInfo.minX),
            Math.abs(rectInfo.maxY - rectInfo.minY),
        );
        return { center, size };
    }

    getBox2DBox(object: Box) {
        let bbox = object.geometry.boundingBox as THREE.Box3;

        // let newBBox = bbox.clone().applyMatrix4(object.matrixWorld);
        getPositions(bbox, positionsFrontV3, positionsBackV3);
        // if (isInCamera(newBBox, this.camera)) {
        //     // console.log('isInCamera');
        // }

        let matrix = get(THREE.Matrix4).identity();
        // matrix.copy(this.camera.projectionMatrix);
        // matrix.multiply(this.camera.matrixWorldInverse);
        matrix.multiply(object.matrixWorld);

        positionsFrontV3.forEach((v) => {
            v.applyMatrix4(matrix);
            // if (v.z > 0) v.applyMatrix4(rotate180);
            // v.applyMatrix4(this.camera.projectionMatrix);
            // this.projectToImg(v);
        });
        positionsBackV3.forEach((v) => {
            v.applyMatrix4(matrix);
            // if (v.z > 0) v.applyMatrix4(rotate180);
            // v.applyMatrix4(this.camera.projectionMatrix);
            // this.projectToImg(v);
        });

        reformProjectPoints(positionsFrontV3, positionsBackV3, this.clipCamera);

        // isInCamera([...positionsFrontV3, ...positionsBackV3], this.camera);

        // if (!checkProjectValidV2(positionsFrontV3, positionsBackV3)) {
        //     console.log('reformProjectPoints');
        // }

        positionsFrontV3.forEach((v) => {
            v.applyMatrix4(this.camera.matrixWorldInverse);
            v.applyMatrix4(this.camera.projectionMatrix);
            this.projectToImg(v);
        });
        positionsBackV3.forEach((v) => {
            v.applyMatrix4(this.camera.matrixWorldInverse);
            v.applyMatrix4(this.camera.projectionMatrix);
            this.projectToImg(v);
        });

        // let points = [...positionsFrontV3, ...positionsBackV3];
        // console.log('z>0', points.filter((e) => e.z > 0).length);

        positionsFrontV2.forEach((v2, index) => {
            let v3 = positionsFrontV3[index];
            v2.set(v3.x, v3.y);
        });
        positionsBackV2.forEach((v2, index) => {
            let v3 = positionsBackV3[index];
            v2.set(v3.x, v3.y);
        });

        return { positionsBack: positionsBackV2, positionsFront: positionsFrontV2 };
    }

    get2DObject() {
        return this.pointCloud.getAnnotate2D();
    }

    get3DObject() {
        return this.pointCloud.getAnnotate3D();
    }

    showMask(obj: AnnotateObject) {
        return false;
    }

    isHighlight(obj: AnnotateObject) {
        return false;
    }

    isRenderable(obj: Object2D) {
        let flag1 = (this.renderId && obj.viewId === this.renderId) || obj.viewId === this.id;

        let flag2 =
            (this.renderRect && obj instanceof Rect) || (this.renderBox2D && obj instanceof Box2D);
        // (this.renderBox && obj instanceof Box);

        return obj.visible && flag1 && flag2;
    }

    imgToDom(imgPos: THREE.Vector2 | THREE.Vector3) {
        let pos = get(THREE.Vector3, 0);
        pos.set(imgPos.x, imgPos.y, 0).applyMatrix4(this.transformMatrix);
        imgPos.x = pos.x;
        imgPos.y = pos.y;
    }

    domToImg(imgPos: THREE.Vector2 | THREE.Vector3) {
        let pos = get(THREE.Vector3, 0);
        let invertMatrix = get(THREE.Matrix4, 0).copy(this.transformMatrix).invert();
        pos.set(imgPos.x, imgPos.y, 0).applyMatrix4(invertMatrix);
        imgPos.x = pos.x;
        imgPos.y = pos.y;
    }

    getScale() {
        return this.transformMatrix.elements[0] || 1;
    }

    setViewport() {
        let { imgSize, height: canvasHeight } = this;
        let { renderer, clientRect, context } = this.proxy;

        // left-bottom corn
        let pos = get(THREE.Vector2, 0).set(0, imgSize.y);
        this.imgToDom(pos);
        pos.y = canvasHeight - pos.y;
        let scale = this.getScale();

        let width = imgSize.x * scale;
        let height = imgSize.y * scale;

        // proxy relative offset
        let top = this.clientRect.top - clientRect.top;
        let left = this.clientRect.left - clientRect.left;
        let bottom = clientRect.bottom - this.clientRect.bottom;

        pos.x += left;
        pos.y += bottom;
        renderer.setViewport(pos.x, pos.y, width, height);
        renderer.setScissor(pos.x, pos.y, width, height);

        // clip view region
        context.beginPath();
        context.rect(left, top, this.clientRect.width, this.clientRect.height);
        context.closePath();
        // context.stroke();
        context.clip();
    }

    render() {
        if (!this.isEnable()) return;
        this.proxy.render();
    }

    isViewRenderable() {
        let { clientRect } = this.proxy;
        let rect = this.container.getBoundingClientRect();
        this.clientRect = rect;

        let needRender =
            rect.bottom >= clientRect.top &&
            rect.top <= clientRect.bottom &&
            rect.left <= clientRect.right &&
            rect.right >= clientRect.left;

        return needRender;
    }

    updateTransform() {
        let { clientRect } = this.proxy;

        const left = this.clientRect.left - clientRect.left;
        const top = this.clientRect.top - clientRect.top;

        this.proxyOffset.set(left, top);
        let offsetMatrix = get(THREE.Matrix4).makeTranslation(left, top, 0);
        this.transformMatrix.copy(this.containerMatrix).multiply(this.fitMatrix);
        this.proxyTransformMatrix.copy(offsetMatrix).multiply(this.transformMatrix);
    }

    renderFrame() {
        // console.log('renderFrame');
        if (!this.isViewRenderable()) return;

        this.dispatchEvent({ type: Event.RENDER_BEFORE });
        this.proxy.renderN++;

        this.updateSize();
        this.updateTransform();
        this.setViewport();

        this.renderImage();
        this.renderObjects();

        this.dispatchEvent({ type: Event.RENDER_AFTER });
    }

    renderObjects() {
        if (!this.renderBox) return;

        let { groupPoints, selection, selectColor } = this.pointCloud;
        let { renderer } = this.proxy;
        let selection3Ds = selection.filter((e) => e instanceof THREE.Object3D);
        let object3Ds = this.get3DObject();

        if (this.renderBox && this.renderPoints && selection3Ds.length > 0) {
            let groupPoint = groupPoints.children[0] as THREE.Points;
            let box = selection[0] as Box;
            box.updateMatrixWorld();
            if (!box.geometry.boundingBox) box.geometry.computeBoundingBox();

            let bbox = box.geometry.boundingBox;
            let material = groupPoint.material as PointsMaterial;
            // groupPoint.material = this.materialPc;

            let oldDepthTest = material.depthTest;
            let oldHasFilterBox = material.getUniforms('hasFilterBox');
            let oldType = material.getUniforms('boxInfo').type;

            material.depthTest = false;
            material.setUniforms({
                hasFilterBox: 1,
                boxInfo: {
                    type: 1,
                    min: bbox?.min,
                    max: bbox?.max,
                    color: selectColor,
                    matrix: this.boxInvertMatrix.copy(box.matrixWorld).invert(),
                },
            });
            renderer.render(groupPoint, this.camera);
            material.setUniforms({ hasFilterBox: oldHasFilterBox, boxInfo: { type: oldType } });
            material.depthTest = oldDepthTest;

            // this.renderer.render(groupPoint, this.camera);
            // groupPoint.material = oldMaterial;
        }

        if (this.renderBox) {
            object3Ds.forEach((box) => {
                this.renderBoxData(box as Box);
            });
            selection3Ds.forEach((box) => {
                this.renderBoxData(box as Box);
            });
        }
    }

    setContextTransform() {
        let { context } = this.proxy;
        let m = this.proxyTransformMatrix.elements;
        // let m = this.transformMatrix.elements;
        // `matrix(${m[0]},${m[1]},${m[4]},${m[5]},${m[12]},${m[13]})`;
        context.setTransform(m[0], m[1], m[4], m[5], m[12], m[13]);
    }
    renderImage() {
        let { width, height, imgSize } = this;
        let { context } = this.proxy;

        if (!this.img) return;

        this.setContextTransform();
        context.drawImage(this.img, 0, 0, imgSize.x, imgSize.y);
    }

    renderBoxData(box: Box) {
        let { selectionMap, selectColor, highlightColor } = this.pointCloud;
        let { renderer } = this.proxy;
        let boxMaterial = box.material as THREE.LineBasicMaterial;

        let color = selectionMap[box.uuid] ? selectColor : box.color;
        let highFlag = this.isHighlight(box);
        color = highFlag ? highlightColor : color;
        // let mask = this.showMask(box);
        // if (mask) {
        //     renderBoxMask(box, this.renderer, this.camera);
        //     color = this.selectColor;
        // }

        if (box.dashed) {
            let dashedMaterial = box.dashedMaterial;
            dashedMaterial.color = color;
            box.material = dashedMaterial;
            renderer.render(box, this.camera);
            box.material = boxMaterial;
        } else {
            let oldColor = boxMaterial.color;
            boxMaterial.color = color;
            renderer.render(box, this.camera);
            boxMaterial.color = oldColor;
        }
    }
}

function getPositions(
    box: THREE.Box3,
    positionsFront: THREE.Vector3[],
    positionsBack: THREE.Vector3[],
) {
    // front
    positionsFront[0].set(box.max.x, box.min.y, box.max.z);
    positionsFront[1].set(box.max.x, box.min.y, box.min.z);
    positionsFront[2].set(box.max.x, box.max.y, box.min.z);
    positionsFront[3].set(box.max.x, box.max.y, box.max.z);

    // back
    positionsBack[0].set(box.min.x, box.min.y, box.max.z);
    positionsBack[1].set(box.min.x, box.min.y, box.min.z);
    positionsBack[2].set(box.min.x, box.max.y, box.min.z);
    positionsBack[3].set(box.min.x, box.max.y, box.max.z);
}
