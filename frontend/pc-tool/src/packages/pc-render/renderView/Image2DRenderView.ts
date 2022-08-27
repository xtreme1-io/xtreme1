import * as THREE from 'three';
// import Box from '../objects/Box';
// import { Event } from '../config';
import Render from './Render';
import PointCloud from '../PointCloud';
import PointsMaterial, { IUniformOption } from '../material/PointsMaterial';
import * as _ from 'lodash';
import { Object2D, Box, Rect, Vector2Of4, Box2D } from '../objects';
import { IRenderViewConfig, ICameraInternal } from '../type';
import { createMatrixFromCameraInternal } from '../utils';
import { get } from '../utils/tempVar';
// import Action from '../action/Action';

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
    containerMatrix: THREE.Matrix4 = new THREE.Matrix4();
    pointCloud: PointCloud;
    width: number;
    height: number;
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    cameraHelper: THREE.CameraHelper;
    option: IOption = {} as IOption;
    group: THREE.Group;
    // project info
    matrixExternal: THREE.Matrix4 = new THREE.Matrix4();
    matrixInternal: THREE.Matrix4 = new THREE.Matrix4();
    matrix: THREE.Matrix4 = new THREE.Matrix4();
    img: HTMLImageElement | null = null;
    imgSize: THREE.Vector2 = new THREE.Vector2();
    selectColor: THREE.Color = new THREE.Color(1, 0, 0);
    boxInvertMatrix: THREE.Matrix4 = new THREE.Matrix4();
    // 2d
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
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
        config: IRenderViewConfig<ActionType> = {},
    ) {
        super(config.name || '');

        this.container = container;
        this.pointCloud = pointCloud;

        this.width = this.container.clientWidth || 10;
        this.height = this.container.clientHeight || 10;

        let group = new THREE.Group();
        this.pointCloud.scene.add(group);
        this.group = group;

        // 2d
        let canvas = document.createElement('canvas');
        canvas.className = 'render-2d-shape';
        canvas.style.position = 'absolute';
        canvas.style.left = '0px';
        canvas.style.top = '0px';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.width = this.width;
        canvas.height = this.height;
        this.container.appendChild(canvas);
        let context = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.canvas = canvas;
        this.context = context;

        // renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(pointCloud.pixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.sortObjects = false;
        this.renderer.autoClear = false;
        this.renderer.setClearColor(new THREE.Color(0, 0, 0), 0);

        this.camera = new THREE.PerspectiveCamera(100, this.width / this.height, 1, 1000);
        // this.camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.001, 1000);
        this.group.add(this.camera);

        this.container.style.position = 'relative';
        Object.assign(this.renderer.domElement.style, {
            position: 'absolute',
            inset: '0px',
        } as CSSStyleDeclaration);
        this.container.appendChild(this.renderer.domElement);

        const helper = new THREE.CameraHelper(this.camera);
        helper.visible = false;
        this.group.add(helper);
        // @ts-ignore
        this.cameraHelper = helper;

        this.setActions(config.actions || defaultActions);

        // let img = document.createElement('img') as HTMLImageElement;
        // img.style.width = '100%';
        // img.style.height = '100%';
        // img.onload = () => {
        //     this.render();
        //     this.onImageLoad();
        // };
        // this.container.appendChild(img);

        // this.img = img;
        // this.material = this.createMaterial();
        // this.materialPc = this.createMaterialPc();

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
        let width = this.container.clientWidth || 10;
        let height = this.container.clientHeight || 10;

        if (width !== this.width || height !== this.height) {
            this.width = width;
            this.height = height;
            this.canvas.width = width;
            this.canvas.height = height;
            this.renderer.setSize(this.width, this.height);
        }
        // this.camera.aspect = this.width / this.height;
        // this.camera.updateProjectionMatrix();
    }

    onImageLoad() {
        // console.log('onImageLoad');
    }

    setOptions(option: IOption) {
        this.option = option;

        // let imgUrl = option.imgUrl || '';
        let imgObject = option.imgObject;

        this.img = imgObject;

        // if (!imgSize || !imgSize[0] || !imgSize[1]) return;
        // let imgSize = option.imgSize || [1242, 375];
        this.imgSize.set(imgObject.naturalWidth, imgObject.naturalHeight);

        this.matrixInternal.copy(
            createMatrixFromCameraInternal(option.cameraInternal, this.imgSize.x, this.imgSize.y),
        );

        // @ts-ignore
        this.matrixExternal.set(...option.cameraExternal);

        // @ts-ignore
        let matrix = new THREE.Matrix4().set(...option.cameraExternal);
        // matrix.elements = [...option.cameraExternal];
        matrix.premultiply(new THREE.Matrix4().makeScale(1, -1, -1));
        matrix.invert();
        matrix.decompose(this.camera.position, this.camera.quaternion, this.camera.scale);
        this.camera.updateMatrixWorld();

        this.matrix.copy(this.matrixInternal).multiply(this.camera.matrixWorldInverse);
        // console.log('this.matrix',this.matrix.elements.toLocaleString())

        // this.camera.scale.multiply(new THREE.Vector3(1, -1, -1));
        // debugger
        this.camera.projectionMatrix.copy(this.matrixInternal);
        this.camera.projectionMatrixInverse.copy(this.camera.projectionMatrix).invert();
        // @ts-ignore
        // this.cameraHelper.update();

        this.render();
    }

    worldToCanvas(pos: THREE.Vector3, target?: THREE.Vector3) {
        // let domElement = this.renderer.domElement;
        target = target || pos;

        target.copy(pos);

        let matrix = get(THREE.Matrix4);
        matrix.copy(this.camera.projectionMatrix);
        matrix.multiply(this.camera.matrixWorldInverse);

        // pos.applyMatrix4(e.matrixWorld);
        target.applyMatrix4(matrix);
        target.x = ((target.x + 1) / 2) * this.width;
        target.y = (-(target.y - 1) / 2) * this.height;

        return target;
    }

    projectToCanvas(pos: THREE.Vector3, target?: THREE.Vector3) {
        // let domElement = this.renderer.domElement;
        target = target || pos;
        pos.x = ((pos.x + 1) / 2) * this.width;
        pos.y = (-(pos.y - 1) / 2) * this.height;

        return target;
    }

    getBoxRect(object: Box) {
        let bbox = object.geometry.boundingBox as THREE.Box3;

        let matrix = get(THREE.Matrix4);
        matrix.copy(this.camera.projectionMatrix);
        matrix.multiply(this.camera.matrixWorldInverse);
        matrix.multiply(object.matrixWorld);

        let box = get(THREE.Box3).copy(bbox);
        box.applyMatrix4(matrix);

        this.projectToCanvas(box.max);
        this.projectToCanvas(box.min);

        let domSize = get(THREE.Vector3, 0).set(this.width, this.height, 1);
        let scaleSize = get(THREE.Vector3, 1)
            .set(this.imgSize.x, this.imgSize.y, 1)
            .divide(domSize);
        box.max.multiply(scaleSize);
        box.min.multiply(scaleSize);

        // let rect = new Rect();
        let center = new THREE.Vector2().set(
            (box.min.x + box.max.x) / 2,
            (box.min.y + box.max.y) / 2,
        );
        let size = new THREE.Vector2().set(
            Math.abs(box.min.x - box.max.x),
            Math.abs(box.min.y - box.max.y),
        );
        return { center, size };
    }

    getBox2DBox(object: Box) {
        let bbox = object.geometry.boundingBox as THREE.Box3;

        getPositions(bbox, positionsFrontV3, positionsBackV3);

        let matrix = get(THREE.Matrix4);
        matrix.copy(this.camera.projectionMatrix);
        matrix.multiply(this.camera.matrixWorldInverse);
        matrix.multiply(object.matrixWorld);

        let domSize = get(THREE.Vector3, 0).set(this.width, this.height, 1);
        let scaleSize = get(THREE.Vector3, 1)
            .set(this.imgSize.x, this.imgSize.y, 1)
            .divide(domSize);

        positionsFrontV3.forEach((v) => {
            v.applyMatrix4(matrix);
            this.projectToCanvas(v);
            v.multiply(scaleSize);
        });
        positionsBackV3.forEach((v) => {
            v.applyMatrix4(matrix);
            this.projectToCanvas(v);
            v.multiply(scaleSize);
        });

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

    isRenderable(obj: Object2D) {
        let flag1 = (this.renderId && obj.viewId === this.renderId) || obj.viewId === this.id;

        let flag2 =
            (this.renderRect && obj instanceof Rect) || (this.renderBox2D && obj instanceof Box2D);
        // (this.renderBox && obj instanceof Box);

        return obj.visible && flag1 && flag2;
    }

    renderFrame() {
        // console.log('renderFrame');
        let { groupPoints, annotate3D, selection, selectionMap } = this.pointCloud;
        // // if(this.renderTimer) return;
        // this.renderer.render(scene, this.camera);

        this.updateSize();
        this.renderer.clear(true, true, true);
        this.renderImage();

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
                    color: this.selectColor,
                    matrix: this.boxInvertMatrix.copy(box.matrixWorld).invert(),
                },
            });
            this.renderer.render(groupPoint, this.camera);
            material.setUniforms({ hasFilterBox: oldHasFilterBox, boxInfo: { type: oldType } });
            material.depthTest = oldDepthTest;

            // this.renderer.render(groupPoint, this.camera);
            // groupPoint.material = oldMaterial;
        }

        if (this.renderBox) {
            object3Ds.forEach((box) => {
                this.renderBoxData(
                    box as Box,
                    selectionMap[box.uuid] ? this.selectColor : (box as Box).color,
                );
            });
            selection3Ds.forEach((box) => {
                this.renderBoxData(box as Box, this.selectColor);
            });
        }
    }

    renderImage() {
        let { context, width, height } = this;
        context.clearRect(0, 0, width, height);

        if (!this.img) return;

        context.drawImage(this.img, 0, 0, width, height);
    }

    renderBoxData(box: Box, color?: THREE.Color) {
        let boxMaterial = box.material as THREE.LineBasicMaterial;

        if (box.dashed) {
            let dashedMaterial = box.dashedMaterial;
            dashedMaterial.color = color || box.color;
            box.material = dashedMaterial;
            this.renderer.render(box, this.camera);
            box.material = boxMaterial;
        } else {
            let oldColor = boxMaterial.color;
            boxMaterial.color = color || box.color;
            this.renderer.render(box, this.camera);
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
