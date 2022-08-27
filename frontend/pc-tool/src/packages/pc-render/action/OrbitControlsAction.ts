import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import MainRenderView from '../renderView/MainRenderView';
import * as THREE from 'three';
import Action from './Action';
import { Event } from '../config';
import * as _ from 'lodash';

export default class OrbitControlsAction extends Action {
    static actionName: string = 'orbit-control';
    renderView: MainRenderView;
    control: OrbitControls;
    constructor(renderView: MainRenderView) {
        super();

        this.renderView = renderView;

        this.control = new OrbitControls(renderView.camera, renderView.renderer.domElement);
        this.control.maxDistance = 1000;
        this.control.minDistance = 10;
        // this.control.autoRotate = false;
        // this.control.update();

        this.control.addEventListener('change', this.controlChange.bind(this));

        // this.selectChange = this.selectChange.bind(this);
        // this.transformChange = this.transformChange.bind(this);
        // this.focus = _.throttle(this.focus.bind(this), 100);
    }

    init(): void {
        // this.renderView.pointCloud.addEventListener(Event.SELECT, this.selectChange);
        // this.renderView.pointCloud.addEventListener(Event.OBJECT_TRANSFORM, this.transformChange);
    }

    transformChange(data: any) {
        let object = data.object as THREE.Object3D;
        this.focus(object.position);
    }

    selectChange() {
        let { selection } = this.renderView.pointCloud;
        if (selection.length === 1 || selection[0] instanceof THREE.Object3D) {
            let object = selection[0] as THREE.Object3D;
            this.focus(object.position);
        } else {
            this.focus();
        }
    }

    focus(pos?: THREE.Vector3) {
        if (pos) {
            this.control.target.copy(pos);
        } else {
            this.control.target.set(0, 0, 0);
        }

        // this.control.update();
    }

    toggle(enabled: boolean) {
        this.control.enabled = enabled;
    }

    controlChange() {
        this.renderView.render();
    }
}
