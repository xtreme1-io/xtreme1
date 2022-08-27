import * as THREE from 'three';
import Render from '../Render';
import PointCloud from '../../PointCloud';
import { Event } from '../../config';
import * as _ from 'lodash';
import View2D from './View2D';
import { AnnotateObject, Box } from '../../objects';

export default class Group2DView extends Render {
    container: HTMLDivElement;
    groupWrap: HTMLDivElement;
    canvas: HTMLCanvasElement;
    // canvas2d: HTMLCanvasElement;
    canvasRect: DOMRect = {} as DOMRect;
    // activeIndex: number = 0;
    pointCloud: PointCloud;
    // renderer: THREE.WebGLRenderer;
    // renderAble: boolean = false;
    // cameraIndex: number = 0;
    context: CanvasRenderingContext2D;
    lineWidth = 1;
    width: number;
    height: number;
    views: View2D[] = [];
    constructor(container: HTMLDivElement, pointCloud: PointCloud, config = {} as any) {
        super(config.name || '');

        this.container = container;
        this.pointCloud = pointCloud;

        let canvas2d = document.createElement('canvas');
        canvas2d.className = 'render-2d-shape';
        canvas2d.style.position = 'absolute';
        canvas2d.style.left = '0px';
        canvas2d.style.top = '0px';
        canvas2d.style.width = '100%';
        canvas2d.style.height = '100%';
        canvas2d.style.pointerEvents = 'none';
        let context = canvas2d.getContext('2d') as CanvasRenderingContext2D;
        this.context = context;

        this.width = canvas2d.clientWidth;
        this.height = canvas2d.clientHeight;

        let wrap = document.createElement('div');
        wrap.className = 'render-container';
        wrap.style.position = 'absolute';
        wrap.style.left = '0px';
        wrap.style.top = '0px';
        wrap.style.width = '100%';
        wrap.style.height = '100%';

        // container.appendChild(canvas);
        container.appendChild(canvas2d);
        container.appendChild(wrap);

        this.groupWrap = wrap;
        this.canvas = canvas2d;
        // this.canvas2d = canvas2d;
    }

    updateSize() {
        let width = this.container.clientWidth || 10;
        let height = this.container.clientHeight || 10;

        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
    }

    renderFrame() {
        if (!this.isEnable()) return;
        this.updateSize();

        console.log('group 2d render');

        this.canvasRect = this.canvas.getBoundingClientRect();

        this.context.fillStyle = 'black';
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.lineWidth = this.lineWidth;

        this.views.forEach((view) => {
            view.render();
        });
    }
}
