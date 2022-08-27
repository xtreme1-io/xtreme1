import * as THREE from 'three';
import Render from '../Render';
import PointCloud from '../../PointCloud';
import Group3DView from './Group3DView';
import { Event } from '../../config';
import { Box } from '../../objects';
import { ITransform } from '../../type';
import { Points } from '../../points';
import PointsMaterial from '../../material/PointsMaterial';
import ResizeTransAction from '../../action/ResizeTransAction';
import * as _ from 'lodash';
import { axisUpInfo, axisType } from '../SideRenderView';
interface IConfig {
    name?: string;
    axis?: axisType;
    width?: number;
    height?: number;
    // index: number;
    [k: string]: any;
}

export default class View3D extends THREE.EventDispatcher {
    object: Box | null = null;
    points: Points;
    container: HTMLDivElement;
    group: Group3DView;
    camera: THREE.OrthographicCamera;
    // rect: DOMRect = {} as DOMRect;
    axis: axisType = 'z';
    alignAxis: THREE.Vector3;
    projectRect: THREE.Box3;
    paddingPercent: number;

    needFit: boolean = true;
    enableFit: boolean = true;

    // dataId: string;
    // index: number;
    config: IConfig;
    zoom: number = 1;
    resizeAction: ResizeTransAction;

    // clearCall: ClearHandler[] = [];
    enabled: boolean = true;

    boxInvertMatrix: THREE.Matrix4 = new THREE.Matrix4();

    // pointLoaded: boolean = false;
    constructor(group: Group3DView, config = {} as IConfig) {
        // super(config.name || '');
        super();

        let { axis = 'z', width = 200, height = 200 } = config;

        this.group = group;
        this.config = config;
        // this.index = config.index;
        // this.object = config.object;
        this.points = new Points(group.pointCloud.material);

        this.projectRect = new THREE.Box3(
            new THREE.Vector3(-1, -1, 0),
            new THREE.Vector3(1, 1, 10),
        );

        this.paddingPercent = 1;
        this.axis = axis;
        // this.dataId = dataId;
        this.alignAxis = new THREE.Vector3();
        this.setAxis(this.axis);

        this.camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0, 10);
        // this.camera.zoom = 0.5;
        this.camera.position.set(0, 0, 10);
        // this.camera.updateProjectionMatrix();

        let div = document.createElement('div');
        div.className = 'view-3d';
        div.style.height = height + 'px';
        div.style.width = width + 'px';
        div.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        this.container = div;
        this.group.groupWrap.appendChild(div);

        const resizeAction = new ResizeTransAction(this);
        resizeAction.init();
        resizeAction.editConfig.zoom = false;
        this.resizeAction = resizeAction;

        // this.points.addEventListener(Event.POINTS_CHANGE, () => {
        //     this.pointLoaded = true;
        // });
    }

    destroy() {}
    // initDom() {
    //     this.container.style.display = this.enabled && this.object ? 'inline-block' : 'none';
    //     if (this.index === this.group.activeIndex) {
    //         this.container.classList.add('view-active');
    //     } else {
    //         this.container.classList.remove('view-active');
    //     }
    // }
    // setEditAction() {
    //     // const resizeAction = new ResizeTransAction(this);
    //     // resizeAction.init();
    //     // resizeAction.editConfig.zoom = false;
    //     // // resizeAction.rectTool.setOption({
    //     // //     lineStyle:{}
    //     // // })
    //     // this.resizeAction = resizeAction;
    // }
    updateDom() {}
    setAxis(axis: axisType) {
        this.axis = axis;
        this.alignAxis.set(0, 0, 0);

        let axisValue = this.axis.length === 2 ? this.axis[1] : this.axis[0];
        let isInverse = this.axis.length === 2;
        this.alignAxis[axisValue as 'x' | 'y' | 'z'] = isInverse ? -0.5 : 0.5;
    }

    setObject(object: Box) {
        this.object = object;
    }

    fitObject() {
        let object = this.object;
        if (!object) return;
        // this.initDom();
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
    }

    // copyLastCameraInfo() {
    //     const index = this.index - 1;
    //     if (index < 0) return;
    //     const camera = this.group.views[index].camera;
    //     this.camera.position.copy(camera.position);
    //     this.camera.quaternion.copy(camera.quaternion);
    // }

    canvasToCamera(pos: THREE.Vector3) {
        // pos.applyMatrix4(this.camera.projectionMatrix.clone().invert());
        pos.x = (pos.x / this.container.clientWidth) * 2 - 1;
        pos.y = ((-1 * pos.y) / this.container.clientHeight) * 2 + 1;

        pos.x *= this.camera.right - this.camera.left;
        pos.y *= this.camera.top - this.camera.bottom;
        return pos;
    }

    cameraToCanvas(pos: THREE.Vector3) {
        // const canvas = this.renderView.container
        pos.applyMatrix4(this.camera.projectionMatrix);
        pos.x = ((pos.x + 1) / 2) * this.container.clientWidth;
        pos.y = (-(pos.y - 1) / 2) * this.container.clientHeight;
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
    }

    updateObjectTransform(object: THREE.Object3D, option: Partial<ITransform>) {
        //   console.log(scale, position)
        let { scale, position, rotation } = option;

        if (scale) object.scale.copy(scale);
        if (position) object.position.copy(position);
        if (rotation) object.rotation.copy(rotation);
        // const curView = this;
        // this.group.dispatchEvent({
        //     type: Event.OBJECT_TRANSFORM,
        //     curView: curView,
        //     data: { view: curView, object, option},
        // });
        this.group.render();
    }

    updateCameraProject() {
        let { projectRect } = this;
        const rect = this.container.getBoundingClientRect();

        let rectWidth = projectRect.max.x - projectRect.min.x;
        let rectHeight = projectRect.max.y - projectRect.min.y;
        let aspect = rect.width / rect.height;

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
    }

    // render
    render() {
        // this.initDom();
        if (!this.enabled) return;

        let { canvasRect, renderer, canvas } = this.group;
        let { points, object } = this;

        let rect = this.container.getBoundingClientRect();

        if (
            rect.bottom >= canvasRect.top &&
            rect.top <= canvasRect.bottom &&
            rect.left <= canvasRect.right &&
            rect.right >= canvasRect.left
        ) {
            this.dispatchEvent({ type: Event.RENDER_BEFORE });

            this.group.renderN++;

            const width = rect.right - rect.left;
            const height = rect.bottom - rect.top;
            const left = rect.left - canvasRect.left;
            const bottom = canvasRect.bottom - rect.bottom;

            renderer.setViewport(left, bottom, width, height);
            renderer.setScissor(left, bottom, width, height);

            renderer.clear();

            if (object) {
                object.updateMatrixWorld();
                renderer.render(object, this.camera);

                this.updateProjectRect();
            }

            if (points) {
                let material = points.material as PointsMaterial;
                let oldDepthTest = material.depthTest;
                let oldHasFilterBox = material.getUniforms('hasFilterBox');
                let oldType = material.getUniforms('boxInfo').type;

                material.depthTest = false;
                if (object) {
                    let bbox = object.geometry.boundingBox as THREE.Box3;
                    material.setUniforms({
                        hasFilterBox: 1,
                        boxInfo: {
                            type: 0,
                            min: bbox.min,
                            max: bbox.max,
                            color: this.group.selectColor,
                            matrix: this.boxInvertMatrix.copy(object.matrixWorld).invert(),
                        },
                    });
                }

                // material.setUniforms({ pointSize: 2 });

                renderer.render(points, this.camera);
                material.setUniforms({
                    hasFilterBox: oldHasFilterBox,
                    boxInfo: { type: oldType },
                });
                material.depthTest = oldDepthTest;
            }

            this.dispatchEvent({
                type: Event.RENDER_AFTER,
            });
        }
    }
}
