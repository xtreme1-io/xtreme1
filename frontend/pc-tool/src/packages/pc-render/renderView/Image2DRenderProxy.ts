import * as THREE from 'three';
import PointCloud from '../PointCloud';
import Image2DRenderView from './Image2DRenderView';
import Render from './Render';

export default class Image2DRenderProxy {
    pointCloud: PointCloud;
    views: Image2DRenderView[] = [];
    // 2d
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    renderer: THREE.WebGLRenderer;
    width = 100;
    height = 100;
    renderN = 0;
    //
    private renderTimer: number = 0;
    clientRect: DOMRect = {} as DOMRect;
    constructor(pointCloud: PointCloud) {
        this.pointCloud = pointCloud;
        // 2d
        let canvas = document.createElement('canvas');
        canvas.className = 'render-2d-proxy';
        canvas.style.position = 'absolute';
        canvas.style.left = '0px';
        canvas.style.top = '0px';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.width = this.width;
        canvas.height = this.height;
        let context = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.canvas = canvas;
        this.context = context;

        // renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(pointCloud.pixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.sortObjects = false;
        this.renderer.autoClear = false;
        this.renderer.setClearColor(new THREE.Color(0, 0, 0), 0);

        Object.assign(this.renderer.domElement.style, {
            position: 'absolute',
            inset: '0px',
            width: '100%',
            height: '100%',
        } as CSSStyleDeclaration);
    }

    addView(view: Image2DRenderView) {
        if (this.views.indexOf(view) >= 0) return;
        this.views.push(view);
    }

    removeView(view: Image2DRenderView) {
        let index = this.views.findIndex((e) => e === view);
        if (index >= 0) {
            this.views.splice(index, 1);
        }
    }

    attach(container: HTMLElement) {
        container.appendChild(this.canvas);
        container.appendChild(this.renderer.domElement);
    }

    needRender() {
        return this.views.filter((e) => e.isEnable()).length > 0;
    }

    updateSize() {
        let width = this.canvas.clientWidth || 100;
        let height = this.canvas.clientHeight || 100;

        if (width !== this.width || height !== this.height) {
            this.width = width;
            this.height = height;

            this.canvas.width = width;
            this.canvas.height = height;

            this.renderer.domElement.width = width;
            this.renderer.domElement.height = height;
        }
    }

    render() {
        if (this.renderTimer) return;
        this.renderTimer = requestAnimationFrame(this.renderFrame.bind(this));
    }

    renderFrame() {
        let { context, renderer } = this;
        this.renderTimer = 0;

        if (!this.needRender()) return;

        // console.log('proxy renderFrame');

        this.updateSize();
        this.clientRect = this.canvas.getBoundingClientRect();
        // info 2d
        // context.fillStyle = 'red';
        context.clearRect(0, 0, this.width, this.height);

        // info 3d
        renderer.setScissorTest(false);
        renderer.clear();
        renderer.setScissorTest(true);

        this.renderN = 0;
        this.views.forEach((view) => {
            context.save();
            view.renderFrame();
            context.restore();
        });
        // console.log('renderN', this.renderN);
    }
}
