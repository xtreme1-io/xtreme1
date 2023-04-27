import * as THREE from 'three';
import MainRenderView from '../renderView/MainRenderView';
import { Event } from '../config';
import Action from './Action';

interface Point {
    x: number;
    y: number;
}

export default class LabelAction extends Action {
    static actionName: string = 'label';
    renderView: MainRenderView;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    constructor(renderView: MainRenderView) {
        super();

        this.renderView = renderView;

        let canvas = document.createElement('canvas');
        canvas.className = 'label';
        canvas.style.position = 'absolute';
        canvas.style.left = '0px';
        canvas.style.top = '0px';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        // canvas.style.display = 'none';
        // canvas.style.cursor = 'crosshair';

        let context = canvas.getContext('2d') as CanvasRenderingContext2D;

        this.canvas = canvas;
        this.context = context;

        this.onRender = this.onRender.bind(this);
        // this.onMouseMove = this.onMouseMove.bind(this);
        // this.toggle(false);
    }

    init() {
        let dom = this.renderView.container;
        dom.appendChild(this.canvas);

        this.renderView.addEventListener(Event.RENDER_AFTER, this.onRender);

        // this.start();
    }
    destroy() {
        this.renderView.removeEventListener(Event.RENDER_AFTER, this.onRender);
        this.renderView.container.removeChild(this.canvas);
    }

    onRender() {
        let { camera, pointCloud, width, height } = this.renderView;
        let context = this.context;

        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        context.textAlign = 'center';
        context.font = '12px';
        // context.fillStyle = '#FF0000';
        context.strokeStyle = '#FF0000';

        // let ctx = context;
        // ctx.font = '20px Georgia';
        // ctx.fillText('Hello World!', 100, 50);

        // return;

        let matrix = new THREE.Matrix4();
        matrix.copy(camera.projectionMatrix);
        matrix.multiply(camera.matrixWorldInverse);

        let objects = pointCloud.getAnnotate3D();

        let list = [];
        let pos = new THREE.Vector3();
        let pos1 = new THREE.Vector3();

        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        objects.forEach((e) => {
            if (!e.visible) return;
            let userData = e.userData;
            let classType = userData.classType || '';

            pos.set(0, 0, 0);
            pos.applyMatrix4(e.matrixWorld);
            pos.applyMatrix4(matrix);
            pos.x = ((pos.x + 1) / 2) * width;
            pos.y = (-(pos.y - 1) / 2) * height;
            pos.z = 0;

            pos1.set(1, 0, 0);
            pos1.applyMatrix4(e.matrixWorld);
            pos1.applyMatrix4(matrix);
            pos1.x = ((pos1.x + 1) / 2) * width;
            pos1.y = (-(pos1.y - 1) / 2) * height;
            pos1.z = 0;

            let length = pos1.sub(pos).length();
            length = length / 60;
            let scale = Math.max(0.5, Math.min(1, length));

            let subId = userData.id.slice(-4);
            let name = classType ? `${subId}(${classType})` : subId;
            // debugger;
            // context.fillText(name, pos.x, pos.y);
            // let info = context.measureText(name);
            // let sizeH = 12;
            // let sizeW = info.width;
            // context.fillRect(pos.x - sizeW / 2, pos.y - sizeH / 2, sizeW, sizeH);
            context.strokeText(name, pos.x, pos.y);
            // let obj = { name:  : subId, x: pos.x, y: pos.y, scale };
            // list.push(obj);
        });
    }
}
