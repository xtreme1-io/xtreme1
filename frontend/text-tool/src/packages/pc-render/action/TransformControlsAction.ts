import { TransformControls } from '../common/TransformControls';
// import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import MainRenderView from '../renderView/MainRenderView';
import Action from './Action';
import { Event } from '../config';
import Box from '../objects/Box';
import * as THREE from 'three';
import * as _ from 'lodash';

export default class TransformControlsAction extends Action {
    static actionName: string = 'transform-control';
    renderView: MainRenderView;
    // control: TransformControls;
    control: any;
    constructor(renderView: MainRenderView) {
        super();

        this.renderView = renderView;

        this.control = new TransformControls(renderView.camera, renderView.renderer.domElement);
        this.control.space = 'local';
        this.controlChange = this.controlChange.bind(this);
        this.controlObjectChange = this.controlObjectChange.bind(this);
        this.draggingChange = this.draggingChange.bind(this);
        this.selectChange = this.selectChange.bind(this);
    }
    init() {
        this.control.addEventListener('change', this.controlChange);
        this.control.addEventListener('objectChange', this.controlObjectChange);
        this.control.addEventListener('dragging-changed', this.draggingChange);
        this.renderView.pointCloud.scene.add(this.control);
        this.renderView.pointCloud.addEventListener(Event.SELECT, this.selectChange);
    }

    toggle(enabled: boolean) {
        this.control.enabled = enabled;
    }

    selectChange() {
        // debugger
        let { selection } = this.renderView.pointCloud;

        // if (selection.length === 1 && selection[0] instanceof THREE.Object3D) {
        //     this.control.attach(selection[0]);
        // } else {
        //     this.control.detach();
        // }
        if (selection.length === 0 || selection[0] !== this.control.object) {
            this.control.detach();
        }
    }

    draggingChange(event: any) {
        this.renderView.actionMap['orbit-control'].toggle(!event.value);
    }
    controlChange(event: any) {
        // console.log(event);
        // this.updateTransform(event.data);
        this.renderView.pointCloud.render();
    }
    controlObjectChange(event: any) {
        if (event.data && this.control.object) this.updatePosition(event.data);
        this.renderView.pointCloud.render();
    }

    updatePosition(position: THREE.Vector3) {
        this.control.object.position.copy(position);
        this.renderView.pointCloud.dispatchEvent({
            type: Event.OBJECT_TRANSFORM,
            data: { object: this.control.object },
        });
        // this.renderView.pointCloud.render();
    }
}
