import * as THREE from 'three';
import Box from '../objects/Box';
import Render from './Render';
import PointCloud from '../PointCloud';
import { Event } from '../config';
import PointsMaterial from '../material/PointsMaterial';
import * as _ from 'lodash';

export let axisUpInfo = {
    x: {
        yAxis: { axis: 'z', dir: new THREE.Vector3(0, 0, 1) },
        xAxis: { axis: 'y', dir: new THREE.Vector3(0, 1, 0) },
    },
    '-x': {
        yAxis: { axis: 'z', dir: new THREE.Vector3(0, 0, 1) },
        xAxis: { axis: 'y', dir: new THREE.Vector3(0, -1, 0) },
    },
    z: {
        yAxis: { axis: 'x', dir: new THREE.Vector3(1, 0, 0) },
        xAxis: { axis: 'y', dir: new THREE.Vector3(0, -1, 0) },
    },
    // '-z': {
    //     yAxis: { axis: 'y', dir: new THREE.Vector3(0, 1, 0) },
    //     xAxis: { axis: 'x', dir: new THREE.Vector3(-1, 0, 0) },
    // },
    y: {
        yAxis: { axis: 'z', dir: new THREE.Vector3(0, 0, 1) },
        xAxis: { axis: 'x', dir: new THREE.Vector3(-1, 0, 0) },
    },
    '-y': {
        yAxis: { axis: 'z', dir: new THREE.Vector3(0, 0, 1) },
        xAxis: { axis: 'x', dir: new THREE.Vector3(1, 0, 0) },
    },
};

export type axisType = keyof typeof axisUpInfo;
// export type axisType = 'x' | 'y' | 'z' | '-x' | '-y';

// const defaultActions: string[] = [];
const defaultActions = ['resize-translate'];

export default class SideRenderView extends Render {
    container: HTMLDivElement;
    pointCloud: PointCloud;
    width: number;
    height: number;
    renderer: THREE.WebGLRenderer;
    camera: THREE.OrthographicCamera;
    cameraHelper?: THREE.CameraHelper;
    object: Box | null;
    projectRect: THREE.Box3;
    axis: axisType;
    alignAxis: THREE.Vector3;
    paddingPercent: number;
    needFit: boolean = true;
    enableFit: boolean = true;
    // material: THREE.ShaderMaterial;
    selectColor: THREE.Color = new THREE.Color(0, 1, 0);
    boxInvertMatrix: THREE.Matrix4 = new THREE.Matrix4();
    zoom: number = 1;
    cameraOffset: THREE.Vector3 = new THREE.Vector3();

    constructor(container: HTMLDivElement, pointCloud: PointCloud, config = {} as any) {
        super(config.name || '');

        let { axis = 'z', paddingPercent = 1 } = config;

        this.container = container;
        this.pointCloud = pointCloud;

        this.object = null;
        this.projectRect = new THREE.Box3();
        this.axis = axis;
        this.alignAxis = new THREE.Vector3();
        this.setAxis(axis);

        // this.resizing = false;
        this.paddingPercent = paddingPercent;

        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        // renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.autoClear = false;
        this.renderer.sortObjects = false;
        this.renderer.setPixelRatio(pointCloud.pixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0, 10);
        this.pointCloud.scene.add(this.camera);
        // this.camera.position.set(-0, 0, -100);
        // this.camera.up.set(0, 1, 0);

        // helper
        let camera = this.camera;
        // camera.lookAt(0, 0, 0);
        const helper = new THREE.CameraHelper(camera);
        // this.pointCloud.scene.add(helper);
        this.cameraHelper = helper;

        // this.renderer.setClearColor(new THREE.Color(0.1, 0.1, 0.1));
        this.setActions(config.actions || defaultActions);
        this.initEvent();
        // this.material = this.createMaterial();
        // this.initDom();

        // @ts-ignore
        window.subView = this;
    }

    initEvent() {
        this.pointCloud.addEventListener(Event.SELECT, () => {
            let object = this.pointCloud.selection.find((annotate) => annotate instanceof Box);
            if (object) {
                this.enableFit = true;
                this.zoom = 1;
                this.fitObject(object as Box);
            } else {
                this.object = null;
            }
            this.render();
        });

        this.pointCloud.addEventListener(Event.OBJECT_TRANSFORM, (e) => {
            let object = e.data.object;
            if (
                object &&
                object instanceof THREE.Object3D &&
                object === this.object &&
                this.needFit &&
                this.enableFit
            ) {
                this.fitObject();
                this.render();
            }
        });
    }

    setAxis(axis: axisType) {
        this.axis = axis;
        this.alignAxis.set(0, 0, 0);

        let axisValue = this.axis.length === 2 ? this.axis[1] : this.axis[0];
        let isInverse = this.axis.length === 2;
        this.alignAxis[axisValue as 'x' | 'y' | 'z'] = isInverse ? -0.5 : 0.5;

        if (this.object) this.fitObject();

        this.render();
    }

    cameraToCanvas(pos: THREE.Vector3) {
        pos.applyMatrix4(this.camera.projectionMatrix);
        pos.x = ((pos.x + 1) / 2) * this.width;
        pos.y = (-(pos.y - 1) / 2) * this.height;
        return pos;
    }

    canvasToCamera(pos: THREE.Vector3) {
        // pos.applyMatrix4(this.camera.projectionMatrix.clone().invert());
        pos.x = (pos.x / this.width) * 2 - 1;
        pos.y = ((-1 * pos.y) / this.height) * 2 + 1;

        pos.x *= this.camera.right - this.camera.left;
        pos.y *= this.camera.top - this.camera.bottom;
        return pos;
    }

    updateProjectRect() {
        if (!this.object) return;

        let { axis, object, camera } = this;

        camera.updateMatrixWorld();
        object.updateMatrixWorld();

        if (!object.geometry.boundingBox) object.geometry.computeBoundingBox();
        let bbox = object.geometry.boundingBox as any as THREE.Box3;

        let minProject = new THREE.Vector3().copy(bbox.min);
        let maxProject = new THREE.Vector3().copy(bbox.max);

        minProject.applyMatrix4(object.matrixWorld).applyMatrix4(camera.matrixWorldInverse);
        maxProject.applyMatrix4(object.matrixWorld).applyMatrix4(camera.matrixWorldInverse);

        let min = new THREE.Vector3();
        let max = new THREE.Vector3();

        let xMin = Math.min(minProject.x, maxProject.x);
        let xMax = Math.max(minProject.x, maxProject.x);
        let yMin = Math.min(minProject.y, maxProject.y);
        let yMax = Math.max(minProject.y, maxProject.y);
        let zMin = Math.min(minProject.z, maxProject.z);
        let zMax = Math.max(minProject.z, maxProject.z);

        min.set(xMin, yMin, zMin);
        max.set(xMax, yMax, zMax);

        this.projectRect.min.copy(min);
        this.projectRect.max.copy(max);
        //  = { min, max };
        // return ;
    }

    fitObject(object?: Box) {
        // console.log('fitObject');
        if (object) this.object = object;

        object = this.object as Box;
        if (!object) return;

        object.updateMatrixWorld();

        let temp = new THREE.Vector3();
        temp.copy(this.alignAxis);
        temp.applyMatrix4(object.matrixWorld);
        this.camera.position.copy(temp);

        temp.copy(axisUpInfo[this.axis].yAxis.dir)
            .applyMatrix4(object.matrixWorld)
            .sub(new THREE.Vector3().applyMatrix4(object.matrixWorld));
        this.camera.up.copy(temp);

        temp.set(0, 0, 0);
        temp.applyMatrix4(object.matrixWorld);
        this.camera.lookAt(temp);

        this.updateProjectRect();
        this.updateCameraProject();
        // this._render();
        // this.updateDom();
        // this.render();
    }

    updateCameraProject() {
        let { projectRect } = this;
        let rectWidth = projectRect.max.x - projectRect.min.x;
        let rectHeight = projectRect.max.y - projectRect.min.y;
        let aspect = this.width / this.height;

        // debugger
        let cameraW, cameraH;
        let padding = Math.min(rectWidth, rectHeight) * this.paddingPercent;
        // let padding = (200 * rectWidth) / this.width;
        cameraW = Math.max(rectWidth + padding, (rectHeight + padding) * aspect);
        cameraH = Math.max(rectHeight + padding, (rectWidth + padding) / aspect);

        this.camera.left = (-cameraW / 2) * this.zoom;
        this.camera.right = (cameraW / 2) * this.zoom;
        this.camera.top = (cameraH / 2) * this.zoom;
        this.camera.bottom = (-cameraH / 2) * this.zoom;
        // debugger
        this.camera.far = projectRect.max.z - projectRect.min.z;
        this.camera.updateProjectionMatrix();

        // this.camera.position.add(this.cameraOffset);
        // this.camera.updateMatrixWorld();
        // this.camera.far = 0;
        this.cameraHelper?.update();
    }

    updateSize() {
        let width = this.container.clientWidth || 10;
        let height = this.container.clientHeight || 10;

        if (width !== this.width || height !== this.height) {
            this.width = width;
            this.height = height;
            this.renderer.setSize(this.width, this.height);
            // this.camera.aspect = this.width / this.height;
            // this.camera.updateProjectionMatrix();
        }
    }

    // render
    renderFrame() {
        // console.log('renderFrame');
        let { groupPoints, scene, selection } = this.pointCloud;

        this.updateSize();
        // if(this.renderTimer) return;
        this.renderer.clear(true, true, true);

        if (groupPoints.children.length === 0) return;

        let hasObject3D = selection.find((e) => e instanceof THREE.Object3D);

        if (selection.length > 0 && hasObject3D) {
            // render points
            let groupPoint = groupPoints.children[0] as THREE.Points;
            let box = hasObject3D as Box;
            box.updateMatrixWorld();
            // if (!box.geometry.boundingBox) box.geometry.computeBoundingBox();

            let bbox = box.geometry.boundingBox as THREE.Box3;
            let material = groupPoint.material as PointsMaterial;

            let oldDepthTest = material.depthTest;
            let oldHasFilterBox = material.getUniforms('hasFilterBox');
            let oldType = material.getUniforms('boxInfo').type;

            material.depthTest = false;
            material.setUniforms({
                hasFilterBox: 1,
                boxInfo: {
                    type: 0,
                    min: bbox.min,
                    max: bbox.max,
                    color: this.selectColor,
                    matrix: this.boxInvertMatrix.copy(box.matrixWorld).invert(),
                },
            });
            this.renderer.render(groupPoint, this.camera);

            material.setUniforms({ hasFilterBox: oldHasFilterBox, boxInfo: { type: oldType } });
            material.depthTest = oldDepthTest;

            // render box
            selection.forEach((object) => {
                if (object instanceof THREE.Object3D) {
                    this.renderer.render(object, this.camera);
                }
            });
        } else {
            this.renderer.render(groupPoints, this.camera);
        }

        this.updateProjectRect();
        // console.log('renderFrame');
        // this.updateDom();
    }
}
