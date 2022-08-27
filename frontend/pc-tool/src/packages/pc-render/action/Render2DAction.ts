import * as THREE from 'three';
import Image2DRenderView from '../renderView/Image2DRenderView';
import { Event } from '../config';
import Action from './Action';
import { Object2D, Rect, Box2D } from '../objects';

interface Point {
    x: number;
    y: number;
}

let temp_1 = new THREE.Vector2();
let temp_2 = new THREE.Vector2();
let temp_3 = new THREE.Vector2();
let temp_4 = new THREE.Vector2();

export default class Render2DAction extends Action {
    static actionName: string = 'render-2d-shape';
    renderView: Image2DRenderView;
    // canvas: HTMLCanvasElement;
    // context: CanvasRenderingContext2D;
    selectColor: string = '#FF0000';
    constructor(renderView: Image2DRenderView) {
        super();

        this.renderView = renderView;

        // let canvas = document.createElement('canvas');
        // canvas.className = 'render-2d-shape';
        // canvas.style.position = 'absolute';
        // canvas.style.left = '0px';
        // canvas.style.top = '0px';
        // canvas.style.width = '100%';
        // canvas.style.height = '100%';
        // canvas.style.pointerEvents = 'none';
        // canvas.style.display = 'none';
        // canvas.style.cursor = 'crosshair';

        // let context = canvas.getContext('2d') as CanvasRenderingContext2D;
        // context.globalAlpha = 1;

        // this.canvas = canvas;
        // this.context = context;

        this.onRender = this.onRender.bind(this);
        // this.onMouseMove = this.onMouseMove.bind(this);
        // this.toggle(false);
    }

    init() {
        // let dom = this.renderView.container;
        // dom.appendChild(this.canvas);

        this.renderView.addEventListener(Event.RENDER_AFTER, this.onRender);

        // this.start();
    }
    destroy() {
        this.renderView.removeEventListener(Event.RENDER_AFTER, this.onRender);
        // this.renderView.container.removeChild(this.canvas);
    }

    // isRenderable(obj: Object2D) {
    //     let flag1 =
    //         (this.renderView.renderId && obj.viewId === this.renderView.renderId) ||
    //         obj.viewId === this.renderView.id;

    //     let flag2 =
    //         (this.renderView.renderRect && obj instanceof Rect) ||
    //         (this.renderView.renderBox2D && obj instanceof Box2D);

    //     return obj.visible && flag1 && flag2;
    // }

    renderRect(obj: Rect) {
        let { imgSize } = this.renderView;
        let { selectionMap } = this.renderView.pointCloud;
        let { context, canvas } = this.renderView;

        let pos = temp_1;
        let temp = temp_2;
        let size = temp_3;
        let canvasSize = temp_4.set(canvas.width, canvas.height);

        if (!selectionMap[obj.uuid]) {
            context.strokeStyle = obj.color;
        } else {
            context.strokeStyle = this.selectColor;
        }

        context.setLineDash(obj.dashed ? [5, 5] : []);

        context.beginPath();
        temp.copy(obj.size).multiplyScalar(0.5);
        pos.copy(obj.center).sub(temp).divide(imgSize).multiply(canvasSize);
        size.copy(obj.size).divide(imgSize).multiply(canvasSize);
        context.strokeRect(pos.x, pos.y, size.x, size.y);
        context.stroke();
    }

    renderBox2D(obj: Box2D) {
        let { imgSize } = this.renderView;
        let { selectionMap } = this.renderView.pointCloud;

        let { context, canvas } = this.renderView;
        let { positions1, positions2 } = obj;

        let scaleSize = temp_1.set(canvas.width, canvas.height).divide(imgSize);

        if (!selectionMap[obj.uuid]) {
            context.strokeStyle = obj.color;
        } else {
            context.strokeStyle = this.selectColor;
        }

        // context.strokeStyle = 'red';
        context.setLineDash([5, 5]);

        let position = positions2;
        let pos = temp_2.copy(position[0]);
        context.beginPath();
        pos.multiply(scaleSize);
        context.moveTo(pos.x, pos.y);
        position.forEach((e, index) => {
            pos.copy(position[(index + 1) % 4]);
            pos.multiply(scaleSize);
            context.lineTo(pos.x, pos.y);
        });
        context.stroke();
        // clear dashed
        context.setLineDash(obj.dashed ? [5, 5] : []);

        position = positions1;
        pos = temp_2.copy(position[0]);
        context.beginPath();
        pos.multiply(scaleSize);
        context.moveTo(pos.x, pos.y);
        position.forEach((e, index) => {
            pos.copy(position[(index + 1) % 4]);
            pos.multiply(scaleSize);
            context.lineTo(pos.x, pos.y);
        });
        context.stroke();

        let pos1 = temp_3;
        context.beginPath();
        positions1.forEach((e, index) => {
            pos.copy(positions1[index]);
            pos1.copy(positions2[index]);

            pos.multiply(scaleSize);
            pos1.multiply(scaleSize);

            context.moveTo(pos.x, pos.y);
            context.lineTo(pos1.x, pos1.y);
        });
        context.stroke();
    }

    onRender() {
        let { camera, pointCloud, imgSize } = this.renderView;
        let { context, canvas } = this.renderView;

        let objects = this.renderView.get2DObject();

        // context.clearRect(0, 0, canvas.width, canvas.height);
        context.lineWidth = this.renderView.lineWidth;

        objects.forEach((obj) => {
            if (this.renderView.isRenderable(obj)) {
                if (obj instanceof Rect) {
                    this.renderRect(obj);
                } else {
                    this.renderBox2D(obj as Box2D);
                }
            }
        });
    }
}
