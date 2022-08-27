import * as THREE from 'three';
import MainRenderView from '../renderView/MainRenderView';
import Image2DRenderView from '../renderView/Image2DRenderView';
import { Rect, Box2D, Object2D, AnnotateObject } from '../objects';
import { Event } from '../config';
import Action from './Action';
import { get } from '../utils/tempVar';
import * as _ from 'lodash';

export default class SelectAction extends Action {
    static actionName: string = 'select';
    renderView: MainRenderView | Image2DRenderView;

    private _time: number = 0;
    private _mouseDown: boolean = false;
    private _clickValid: boolean = false;
    private _mouseDownPos: THREE.Vector2 = new THREE.Vector2();
    private raycaster: THREE.Raycaster = new THREE.Raycaster();

    constructor(renderView: MainRenderView | Image2DRenderView) {
        super();
        this.renderView = renderView;
        this.enabled = true;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onDBLClick = this.onDBLClick.bind(this);
        this.onClick = _.debounce(this.onClick.bind(this), 500, { leading: true, trailing: false });
        // this.onDBLClick = _.debounce(this.onDBLClick.bind(this), 55);
    }
    init() {
        let dom = this.renderView.renderer.domElement;
        this._mouseDown = false;
        this._mouseDownPos = new THREE.Vector2();

        dom.addEventListener('mousedown', this.onMouseDown);
        dom.addEventListener('mouseup', this.onMouseUp);
        dom.addEventListener('dblclick', this.onDBLClick);
        dom.addEventListener('click', this.onClick);
    }

    onDBLClick(event: MouseEvent) {
        let object = this.getObject(event);
        if (object) {
            this.renderView.pointCloud.dispatchEvent({
                type: Event.OBJECT_DBLCLICK,
                data: object,
            });
        }
        // console.log('onDBLClick');
    }
    onSelect() {}
    onClick(event: MouseEvent) {
        if (!this.enabled || !this._clickValid) return;

        // console.log('onClick');
        let object = this.getObject(event);
        if (object) {
            this.selectObject(object as any);
            this.onSelect();
        }
    }

    onMouseDown(event: MouseEvent) {
        if (!this.enabled) return;

        this._mouseDown = true;
        this._mouseDownPos.set(event.offsetX, event.offsetY);
    }
    onMouseUp(event: MouseEvent) {
        if (!this.enabled) return;

        let tempVec2 = new THREE.Vector2();
        let distance = tempVec2.set(event.offsetX, event.offsetY).distanceTo(this._mouseDownPos);
        this._clickValid = this._mouseDown && distance < 10;
        this._mouseDown = false;
    }

    getObject(event: MouseEvent) {
        let pos = this.getProjectPos(event);

        let object;
        if (this.renderView instanceof MainRenderView) {
            object = this.checkMainView(pos);
        } else {
            object = this.checkImage2DView(pos);
        }

        return object;
    }

    checkMainView(pos: THREE.Vector2) {
        let annotate3D = this.renderView.pointCloud.getAnnotate3D();

        this.raycaster.setFromCamera(pos, this.renderView.camera);
        const intersects = this.raycaster.intersectObjects(annotate3D);
        // console.log(intersects);
        if (intersects.length > 0) {
            return intersects[0].object;
            // this.selectObject(intersects[0].object as any);
        }
    }

    checkImage2DView(pos: THREE.Vector2) {
        // debugger;
        let renderView = this.renderView as Image2DRenderView;
        let imgSize = renderView.imgSize;

        let findObject;
        let tempPos = get(THREE.Vector2, 0);
        // 转换到图片坐标系
        tempPos.x = ((pos.x + 1) / 2) * imgSize.x;
        tempPos.y = ((-pos.y + 1) / 2) * imgSize.y;

        if (!findObject && (renderView.renderRect || renderView.renderBox2D)) {
            let annotate2D = renderView.get2DObject();
            let obj;
            for (let i = annotate2D.length - 1; i >= 0; i--) {
                obj = annotate2D[i];

                if (renderView.isRenderable(obj) && obj.isContainPosition(tempPos)) {
                    findObject = obj;
                    break;
                }
            }
        }

        if (!findObject && renderView.renderBox) {
            let annotate3D = renderView.get3DObject();
            this.raycaster.setFromCamera(pos, this.renderView.camera);

            let intersects = this.raycaster.intersectObjects(annotate3D);
            findObject = intersects.length > 0 ? intersects[0].object : null;
        }

        return findObject;

        // if (findObject) {
        //     this.selectObject(findObject as any);
        // } else {
        //     // this.renderView.pointCloud.selectObject();
        //     // this.selectObject();
        // }
    }

    selectObject(object?: AnnotateObject) {
        this.renderView.pointCloud.selectObject(object);
    }

    // is2DRenderable(obj: Object2D) {
    //     return (
    //         (this.renderView.renderId && obj.viewId === this.renderView.renderId) ||
    //         obj.viewId === this.renderView.id
    //     );
    // }

    getProjectPos(event: MouseEvent) {
        let x = (event.offsetX / this.renderView.width) * 2 - 1;
        let y = (-event.offsetY / this.renderView.height) * 2 + 1;
        return new THREE.Vector2(x, y);
    }
}
