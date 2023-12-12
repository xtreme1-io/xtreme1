import * as THREE from 'three';
import Box from '../objects/Box';
// import { Event } from '../config';
import Render from './Render';
import PointCloud from '../PointCloud';
import PointsMaterial from '../material/PointsMaterial';
import TWEEN, { Tween } from '@tweenjs/tween.js';
// import Action from '../action/Action';
import OrbitControlsAction from '../action/OrbitControlsAction';

// const defaultActions = ['transform-control', 'select', 'create-obj'];
const defaultActions = [
    'orbit-control',
    'transform-control',
    'select',
    'create-obj',
    'view-helper',
];
export type wayToFocus = 'zTop' | 'auto';

export default class MainRenderView extends Render {
    container: HTMLDivElement;
    pointCloud: PointCloud;
    width: number;
    height: number;
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    raycaster: THREE.Raycaster;
    tween: Tween<THREE.Vector3> | null = null;
    // helper: THREE.BoxHelper;
    // material: PointsMaterial;
    selectColor: THREE.Color = new THREE.Color(1, 0, 0);
    backgroundColor: THREE.Color = new THREE.Color(0, 0, 0);
    boxInvertMatrix: THREE.Matrix4 = new THREE.Matrix4();

    constructor(container: HTMLDivElement, pointCloud: PointCloud, config: any = {}) {
        super(config.name || '');

        this.container = container;
        this.pointCloud = pointCloud;

        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        // renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(pointCloud.pixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(this.backgroundColor);
        this.renderer.sortObjects = false;
        this.renderer.autoClear = false;
        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(35, this.width / this.height, 1, 30000);
        // let aspect = this.width / this.height;
        // let depth = 100;
        // let fov_y = 35;
        // let height_ortho = depth * 2 * Math.atan((fov_y * (Math.PI / 180)) / 2);
        // let width_ortho = height_ortho * aspect;
        // this.camera = new THREE.OrthographicCamera(width_ortho / -2, width_ortho / 2, height_ortho / 2, height_ortho / -2, 0.01, 30000);

        this.pointCloud.scene.add(this.camera);
        this.camera.position.set(0, 0, 100);
        this.camera.up.set(0, 0, 1);
        this.camera.lookAt(0, 0, 0);

        this.raycaster = new THREE.Raycaster();

        this.setActions(config.actions || defaultActions);

        // @ts-ignore
        window.mainview = this;
    }

    getObjectByCanvas(canvasPos: THREE.Vector2): THREE.Object3D | null {
        let { clientHeight: height, clientWidth: width } = this.renderer.domElement;
        let x = (canvasPos.x / width) * 2 - 1;
        let y = (-canvasPos.y / height) * 2 + 1;

        let annotate3D = this.pointCloud.getAnnotate3D();
        this.raycaster.setFromCamera({ x, y }, this.camera);
        const intersects = this.raycaster.intersectObjects(annotate3D);
        return intersects.length > 0 ? intersects[0].object : null;
    }
    getProjectPos(p: { x: number; y: number }, target?: THREE.Vector2) {
        const { clientHeight: height, clientWidth: width } = this.renderer.domElement;
        const x = (p.x / width) * 2 - 1;
        const y = (-p.y / height) * 2 + 1;
        target = target || new THREE.Vector2();
        target.set(x, y);
        return target;
    }
    canvasToWorld(p: THREE.Vector2) {
        let ground = this.pointCloud.ground.plane;
        const { x, y } = this.getProjectPos(p);
        this.raycaster.setFromCamera({ x, y }, this.camera);

        let intersectP = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(ground, intersectP);
        return intersectP;
    }

    focusPositionByZTop(position: THREE.Vector3) {
        if (this.tween) this.tween.stop();

        this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
        let startFocus = new THREE.Vector3();
        let focus = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.pointCloud.ground.plane, startFocus);

        const cameraPos = this.camera.position.clone();
        let pos = new THREE.Vector3();
        // let object = selection[0];
        pos.copy(position);
        pos.z += 70;
        const tween = new TWEEN.Tween(cameraPos)
            .to(pos, 400)
            .onUpdate((obj, elapsed) => {
                if (elapsed === 1) return false;
                let action = this.getAction('orbit-control') as OrbitControlsAction;
                if (action) {
                    focus.copy(position).sub(startFocus).multiplyScalar(elapsed).add(startFocus);
                    action.control.target.copy(focus);
                    this.camera.position.copy(obj);
                    action.control.update();
                }
                this.render();
            })
            .onComplete(() => {
                this.tween = null;
            })
            .start();

        this.tween = tween;
    }
    focusPosition(position: THREE.Vector3, way: wayToFocus = 'zTop') {
        switch (way) {
            default:
            case 'zTop':
                this.focusPositionByZTop(position);
                break;
            case 'auto':
                this.focusPositionByAuto(position);
                break;
        }
    }
    focusPositionByAuto(position: THREE.Vector3) {
        if (this.tween) this.tween.stop();

        this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
        let startFocus = new THREE.Vector3();
        let focus = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.pointCloud.ground.plane, startFocus);

        let pos = new THREE.Vector3();
        // let object = selection[0];
        pos.copy(this.camera.position).sub(position).setLength(30).add(position);
        pos.z = Math.max(10, Math.abs(pos.z));
        // pos.z += 70;
        const tween = new TWEEN.Tween(this.camera.position)
            .to(pos, 400)
            .onUpdate((obj, elapsed) => {
                // if (elapsed === 1) return false;
                let action = this.getAction('orbit-control') as OrbitControlsAction;
                if (action) {
                    focus.copy(position).sub(startFocus).multiplyScalar(elapsed).add(startFocus);
                    action.control.target.copy(focus);
                    action.control.update();
                }
                this.render();
            })
            .onComplete(() => {
                this.tween = null;
            })
            .start();

        this.tween = tween;
    }
    updateSize() {
        let width = this.container.clientWidth || 10;
        let height = this.container.clientHeight || 10;

        if (width !== this.width || height !== this.height) {
            this.width = width;
            this.height = height;
            this.renderer.setSize(this.width, this.height);
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
        }
    }

    renderFrame() {
        // let { scene, groupPoints } = this.pointCloud;
        let { groupPoints, scene, selection, annotate3D, selectionMap } = this.pointCloud;

        this.updateSize();

        this.renderer.clear(true, true, true);

        let object3d = selection.find((item) => item instanceof Box);

        if (object3d && object3d.visible) {
            // render points
            let groupPoint = groupPoints.children[0] as THREE.Points;
            let box = object3d as Box;
            box.updateMatrixWorld();
            // if (!box.geometry.boundingBox) box.geometry.computeBoundingBox();

            let bbox = box.geometry.boundingBox as THREE.Box3;
            let material = groupPoint.material as PointsMaterial;

            let oldHasFilterBox = material.getUniforms('hasFilterBox');
            let oldType = material.getUniforms('boxInfo').type;
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

            annotate3D.visible = false;
            this.renderer.render(scene, this.camera);

            material.setUniforms({ hasFilterBox: oldHasFilterBox, boxInfo: { type: oldType } });

            annotate3D.visible = true;
            annotate3D.children.forEach((box) => {
                if (box === object3d) return;
                this.renderBox(box as Box);
            });

            // render select
            // let select = selection[0];
            this.renderBox(box, this.selectColor);
        } else {
            annotate3D.visible = false;
            this.renderer.render(scene, this.camera);
            annotate3D.visible = true;
            annotate3D.children.forEach((box) => {
                this.renderBox(box as Box, selectionMap[box.uuid] ? this.selectColor : undefined);
            });
        }
    }

    renderBox(box: Box, color?: THREE.Color) {
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

    setBackgroundColor(backgroundColor: THREE.Color) {
        this.backgroundColor = backgroundColor;
        this.renderer.setClearColor(this.backgroundColor);
        this.render();
    }
}
