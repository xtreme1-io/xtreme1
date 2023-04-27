import * as THREE from 'three';
import SideRenderView, { axisUpInfo } from '../renderView/SideRenderView';
import Action from './Action';
import { ITransform, AnnotateType } from '../type';
import { Event } from '../config';
import { Box } from '../objects';
import { IRectEvent, RectTool, ClearHandler } from '../common/BasicSvg';

// type DragHandler = (offsetLocal: THREE.Vector3, offsetCamera: THREE.Vector2) => ITransform | null;
// type ClearHandler = () => void;

const tempV2_1 = new THREE.Vector2();
const tempV2_2 = new THREE.Vector2();

const tempV3_1 = new THREE.Vector3();
const tempV3_2 = new THREE.Vector3();
const tempV3_3 = new THREE.Vector3();

const tempM4_1 = new THREE.Matrix4();
const tempM4_2 = new THREE.Matrix4();

interface IEditConfig {
    transform: boolean;
    move: boolean;
    moveCanvas: boolean;
    zoom: boolean;
}

export default class ResizeTransAction extends Action {
    static actionName: string = 'resize-translate';
    //
    // rotatable: boolean = true;
    isRotating: boolean = false;
    rotation: number = 0;
    rectTool: RectTool = {} as RectTool;
    clearCall: ClearHandler[] = [];
    editConfig: IEditConfig = {
        transform: true,
        move: true,
        zoom: true,
        moveCanvas: true,
    };

    renderView: SideRenderView;
    constructor(renderView: SideRenderView) {
        super();
        this.renderView = renderView;
        this.rectTool = new RectTool(renderView.container);
        this.rectTool.setOption({
            lineStyle: {
                stroke: '#ffffff',
                'stroke-dasharray': 0,
            },
            rotateStyle: {
                fill: 'rgba(204,204,204,0.63)',
                stroke: 'rgba(204,204,204,0.63)',
            },
        });
    }
    init() {
        this.initDragResize();
        this.initRotate();
        this.initEvent();
        this.initContainerEvent();
    }

    destroy() {
        this.clearCall.forEach((fn) => fn());
    }

    initEvent() {
        this.renderView.addEventListener(Event.RENDER_AFTER, () => {
            // this.updateDom();
            if (!this.isRotating) {
                this.updateDom();
            } else {
                this.rectTool.updateRotation();
            }
        });
    }

    initDragResize() {
        let { container } = this.renderView;
        const _position = new THREE.Vector3();
        const _scale = new THREE.Vector3();

        const onUpdate = (e: IRectEvent) => {
            const info = e.info;
            const { object } = this.renderView;
            const { center, size } = e.data || {};
            if (!center || !size || !object) return;
            if (info === 'bg') {
                if (!this.editConfig.move) return;
            } else if (!this.editConfig.transform || !object.editConfig.resize) return;

            this.renderView.needFit = false;
            const { left, right } = this.renderView.camera;
            const scaleSize = (right - left) / this.renderView.container.clientWidth;
            const { scale } = object;

            // center.multiplyScalar(scaleSize)
            size.multiplyScalar(scaleSize);
            center.set(
                (center.x / container.clientWidth) * 2 - 1,
                -(center.y / container.clientHeight) * 2 + 1,
            );

            _position.set(center.x, center.y, 0);
            _position.unproject(this.renderView.camera);
            _scale.set(size.x, size.y, 0);
            this.translateToLocalV(_scale);
            let axis = this.renderView.axis;
            switch (axis) {
                case 'z':
                    _scale.set(Math.abs(_scale.x), Math.abs(_scale.y), scale.z);
                    break;
                case 'x':
                case '-x':
                    _scale.set(scale.x, Math.abs(_scale.y), Math.abs(_scale.z));
                    break;
                case 'y':
                case '-y':
                    _scale.set(Math.abs(_scale.x), scale.y, Math.abs(_scale.z));
                    break;
            }
            this.updateChange(
                {
                    position: _position,
                    scale: _scale,
                },
                info === 'bg'
                    ? 'move'
                    : ['rt', 'rb', 'lb', 'lt'].includes(info || '')
                    ? 'corner'
                    : 'side',
            );
        };
        const onEnd = (event: IRectEvent) => {
            this.updateEnd();
            this.renderView.needFit = true;
            this.onResizeEnd(event);
        };
        this.rectTool.addEventListener('start', this.onResizeStart);
        this.rectTool.addEventListener('update', onUpdate);
        this.rectTool.addEventListener('end', onEnd);
    }
    onResizeEnd(event: IRectEvent) {}
    onRotateEnd() {}
    onResizeStart() {}

    isLeft(e: MouseEvent) {
        return e.button === 0;
    }

    isRight(e: MouseEvent) {
        return e.button === 2;
    }
    updateDom() {
        const {
            object,
            axis,
            camera: { left, right },
        } = this.renderView;
        if (!this.isEnable() || !object) {
            this.rectTool.hide();
            this.renderView.container.style.cursor = 'default';
            return;
        }

        const scaleSize = (right - left) / this.renderView.container.clientWidth;
        let scale = object.scale.clone().divideScalar(scaleSize);
        this.renderView.container.style.cursor = 'grab';
        //   debugger
        let rightTop = this.renderView.projectRect.max.clone();
        let leftBottom = this.renderView.projectRect.min.clone();

        rightTop = this.renderView.cameraToCanvas(rightTop);
        leftBottom = this.renderView.cameraToCanvas(leftBottom);

        const center = tempV2_1;
        const size = tempV2_2;
        // console.log(object.scale.x,object.scale.y,object.scale.z)
        center.set((leftBottom.x + rightTop.x) / 2, (leftBottom.y + rightTop.y) / 2);
        switch (axis) {
            case '-x':
            case 'x':
                size.set(scale.y, scale.z);
                break;
            case 'y':
            case '-y':
                size.set(scale.x, scale.z);
                break;
            case 'z':
                size.set(scale.y, scale.x);
                break;
        }

        // size.set(Math.abs(leftBottom.x - rightTop.x), Math.abs(leftBottom.y - rightTop.y));
        this.rectTool.show();
        this.rectTool.updateRect(size, center);
        // this.rectTool.setOption({ rotatable: this.rotatable });

        // this.updateRotation();
    }
    updateRotation() {
        const object = this.renderView.object;
        if (!object) return;
        tempV3_2.setFromMatrixColumn(this.renderView.camera.matrix, 1);
        switch (this.renderView.axis) {
            case '-x':
            case 'x':
                tempV3_3.set(0, 0, 1);
                break;
            case 'y':
            case '-y':
                tempV3_3.set(0, 0, 1);
                break;
            case 'z':
                tempV3_3.set(1, 0, 0);
                break;
        }
        tempV3_3.applyQuaternion(object.quaternion);

        let rotation = (tempV3_2.angleTo(tempV3_3) * 180) / Math.PI;
        if (this.rotation > 0) {
            rotation *= -1;
        }
        this.rectTool.rotation = rotation;
        this.rectTool.updateRotation();
    }
    updateChange(data: ITransform | null, type: 'move' | 'side' | 'corner' | 'rotation') {
        if (!data) return;
        this.renderView.pointCloud.updateObjectTransform(this.renderView.object as any, data);
        this.renderView.updateProjectRect();
    }
    render() {
        this.renderView.pointCloud.render();
    }
    updateEnd() {
        if (this.renderView.enableFit) {
            this.renderView.fitObject();
        }
        this.render();
    }

    initContainerEvent() {
        let _this = this;
        let dom = this.renderView.container;
        let last = new THREE.Vector2();
        let offset = new THREE.Vector2();
        let offsetV3 = new THREE.Vector3();
        let tempV3 = new THREE.Vector3();
        let renderView = this.renderView;
        let camera = renderView.camera;

        dom.style.cursor = 'grab';
        dom.addEventListener('mousedown', onmousedown);
        dom.addEventListener('wheel', onmousewheel);
        function onmousedown(e: MouseEvent) {
            if (!_this.isEnable() || _this.isLeft(e) || !_this.editConfig.moveCanvas) return;
            e.preventDefault();
            e.stopPropagation();
            // console.log('move');

            last.set(e.clientX, e.clientY);

            document.addEventListener('mousemove', onDocMove);
            document.addEventListener('mouseup', onDocUp);

            function onDocMove(e: MouseEvent) {
                let { right, left } = camera;

                offset.set(e.clientX, e.clientY).sub(last);
                offset.multiplyScalar((right - left) / renderView.container.clientWidth);
                offset.y *= -1;

                offsetV3
                    .set(offset.x, offset.y, 0)
                    .applyMatrix4(camera.matrixWorld)
                    .sub(tempV3.set(0, 0, 0).applyMatrix4(camera.matrixWorld));
                // console.log(offset, offsetV3);
                renderView.camera.position.sub(offsetV3);
                renderView.enableFit = false;
                renderView.camera.updateMatrixWorld();
                _this.render();

                last.set(e.clientX, e.clientY);
            }
            function onDocUp() {
                renderView.enableFit = true;
                document.removeEventListener('mousemove', onDocMove);
                document.removeEventListener('mouseup', onDocUp);
            }
        }
        function onmousewheel(e: WheelEvent) {
            e.preventDefault();
            e.stopPropagation();

            let maxZoom = 10;
            let minZoom = 0.2;
            if (e.deltaY === 0 || !_this.editConfig.zoom) return;
            if (e.deltaY > 0) {
                renderView.zoom = renderView.zoom * 1.05;
            } else {
                renderView.zoom = renderView.zoom * 0.95;
            }

            if (renderView.zoom > maxZoom) renderView.zoom = maxZoom;
            if (renderView.zoom < minZoom) renderView.zoom = minZoom;

            renderView.updateCameraProject();
            // renderView.needFit = false;
            _this.render();
            // renderView.fitObject();
        }
    }

    initRotate() {
        let starQuat = new THREE.Quaternion();
        let tempQuat = new THREE.Quaternion();
        let tempEuler = new THREE.Euler();
        // let div = document.createElement('div');
        const onStart = (e: IRectEvent) => {
            const { object } = this.renderView;
            if (!object) return;
            starQuat.setFromEuler(object.rotation);
            this.renderView.needFit = false;
        };
        const onRotate = (e: IRectEvent) => {
            const data = e.data;
            const { object } = this.renderView;
            if (!data || !object || !this.editConfig.transform) return;
            const { offsetAngle } = data;
            if (offsetAngle === undefined) return;
            this.rotation = offsetAngle;
            this.isRotating = true;
            let axisDir = tempV3_1.set(0, 0, 0);
            let axis = this.renderView.axis;
            switch (axis) {
                case 'z':
                    axisDir.z = 1;
                    break;
                case 'x':
                    axisDir.x = 1;
                    break;
                case '-x':
                    axisDir.x = -1;
                    break;
                case 'y':
                    axisDir.y = 1;
                    break;
                case '-y':
                    axisDir.y = -1;
                    break;
            }
            tempQuat.setFromAxisAngle(axisDir, offsetAngle).premultiply(starQuat);
            tempEuler.setFromQuaternion(tempQuat);
            this.updateChange({ rotation: tempEuler.clone() }, 'rotation');
        };
        const onEnd = () => {
            this.renderView.enableFit = true;
            this.renderView.needFit = true;
            this.isRotating = false;
            this.rectTool.rotation = 0;
            this.rectTool.updateRotation();
            this.updateEnd();
            this.onRotateEnd();
        };
        this.rectTool.addEventListener('start-rotate', onStart);
        this.rectTool.addEventListener('rotate', onRotate);
        this.rectTool.addEventListener('end-rotate', onEnd);
    }
    translateToLocalV(offset: THREE.Vector3) {
        // console.log('start',offset)
        let matrix = tempM4_1
            .copy(this.renderView.object?.matrixWorld as any)
            .invert()
            .multiply(this.renderView.camera.matrixWorld);
        let center = tempV3_1.set(0, 0, 0).applyMatrix4(tempM4_1);
        offset
            .applyMatrix4(matrix)
            .sub(center)
            .multiply(this.renderView.object?.scale as any);
        // console.log('end',offset)
    }
    translateToViewV(offset: THREE.Vector3) {
        // console.log('start',offset)
        let matrix = tempM4_1
            .copy(this.renderView.object?.matrixWorld as any)
            .multiply(this.renderView.camera.matrix);
        let center = tempV3_3.set(0, 0, 0).applyMatrix4(tempM4_1);
        offset.applyMatrix4(matrix).sub(center);

        // console.log('end',offset)
    }
}
