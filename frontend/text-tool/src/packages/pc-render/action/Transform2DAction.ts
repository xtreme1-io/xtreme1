import * as THREE from 'three';
import Image2DRenderView from '../renderView/Image2DRenderView';
import { Event } from '../config';
import { isLeft, isRight } from '../utils';
import Action from './Action';
import * as _ from 'lodash';

let temp = new THREE.Matrix4();
export default class Transform2DAction extends Action {
    static actionName: string = 'transform-2d';
    renderView: Image2DRenderView;
    container: HTMLDivElement;
    constructor(renderView: Image2DRenderView) {
        super();

        this.renderView = renderView;
        this.onZoom = this.onZoom.bind(this);
        this.onMousedown = this.onMousedown.bind(this);
        this.onRender = this.onRender.bind(this);

        this.container = this.renderView.container.parentNode as HTMLDivElement;
    }

    init() {
        this.container.addEventListener('wheel', this.onZoom);
        this.container.addEventListener('mousedown', this.onMousedown);

        // this.renderView.addEventListener(Event.RENDER_AFTER, this.onRender);
    }

    onRender() {
        // console.log('onRender');
        let { container, containerMatrix } = this.renderView;
        // let m = containerMatrix.elements;
        // container.style.transform = `matrix(${m[0]},${m[1]},${m[4]},${m[5]},${m[12]},${m[13]})`;
        this.renderView.render();
        this.renderView.dispatchEvent({ type: Event.CONTAINER_TRANSFORM });
    }

    onMousedown(e: MouseEvent) {
        if (isLeft(e)) return;

        let { containerMatrix } = this.renderView;
        let startPos = new THREE.Vector2(e.clientX, e.clientY);
        let curPos = new THREE.Vector2();
        let startMatrix = containerMatrix.clone();
        let matrix = new THREE.Matrix4();

        let onDocMove = _.throttle((e: MouseEvent) => {
            curPos.set(e.clientX, e.clientY).sub(startPos);
            matrix.makeTranslation(curPos.x, curPos.y, 0);
            containerMatrix.multiplyMatrices(matrix, startMatrix);
            this.onRender();
        }, 40);
        function onDocUp() {
            document.removeEventListener('mousemove', onDocMove);
            document.removeEventListener('mouseup', onDocUp);
        }

        document.addEventListener('mousemove', onDocMove);
        document.addEventListener('mouseup', onDocUp);
    }

    onZoom(e: WheelEvent) {
        let containerScale = this.renderView.containerMatrix.elements[0] as number;
        let { containerMatrix } = this.renderView;
        const zoom = e.deltaY > 0 ? 0.95 : 1.05;

        let newScale = containerScale * zoom;
        if (newScale < 0.1 || newScale > 10) return;

        let bbox = this.container.getBoundingClientRect();
        let offsetX = e.clientX - bbox.x;
        let offsetY = e.clientY - bbox.y;

        let matrix = temp;

        containerMatrix.premultiply(matrix.makeTranslation(-offsetX, -offsetY, 0));
        containerMatrix.premultiply(matrix.makeScale(zoom, zoom, 1));
        containerMatrix.premultiply(matrix.makeTranslation(offsetX, offsetY, 0));

        this.onRender();
    }

    reset() {
        let { containerMatrix } = this.renderView;
        containerMatrix.identity();
        this.onRender();
    }
    destroy() {}
}
