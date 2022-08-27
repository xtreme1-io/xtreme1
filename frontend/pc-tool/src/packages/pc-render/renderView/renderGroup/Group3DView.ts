import * as THREE from 'three';
import Render from '../Render';
import PointCloud from '../../PointCloud';
import { Event } from '../../config';
import Action from '../../action/Action';
import Actions, { ActionCtr } from '../../action';
import * as _ from 'lodash';
import View3D from './View3D';
import { axisType } from '../SideRenderView';
import { Box } from '../../objects';

export default class Group3DView extends Render {
    container: HTMLDivElement;
    groupWrap: HTMLDivElement;
    canvas: HTMLCanvasElement;
    canvasRect: DOMRect = {} as DOMRect;

    // activeTrackId: string = '';
    // activeIndex: number = 0;
    // renderAble: boolean = false;

    pointCloud: PointCloud;
    renderer: THREE.WebGLRenderer;
    selectColor: THREE.Color = new THREE.Color(0, 1, 0);

    width: number;
    height: number;
    views: View3D[] = [];

    renderN = 0;

    constructor(container: HTMLDivElement, pointCloud: PointCloud, config = {} as any) {
        super(config.name || '');

        this.container = container;
        this.pointCloud = pointCloud;

        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        // renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.autoClear = false;
        this.renderer.sortObjects = false;
        this.renderer.setPixelRatio(pointCloud.pixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.container.appendChild(this.renderer.domElement);

        let canvas = this.renderer.domElement;
        canvas.className = 'render-group';
        canvas.style.position = 'absolute';
        canvas.style.left = '0px';
        canvas.style.top = '0px';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';

        let wrap = document.createElement('div');
        wrap.className = 'render-container';
        wrap.style.position = 'absolute';
        wrap.style.left = '0px';
        wrap.style.top = '0px';
        wrap.style.width = '100%';
        wrap.style.height = '100%';

        container.appendChild(canvas);
        container.appendChild(wrap);

        this.groupWrap = wrap;
        this.canvas = canvas;
    }

    updateSize() {
        let width = this.container.clientWidth || 10;
        let height = this.container.clientHeight || 10;

        if (width !== this.width || height !== this.height) {
            this.width = width;
            this.height = height;
            this.renderer.setSize(this.width, this.height);
            // this.camera.aspect = this.width / this.height;
            // this.camera.updateProjectionMatrix();
        }
    }

    clearViews() {
        this.views.forEach((view) => {
            view.object = null;
            view.resizeAction?.destroy();
        });
    }
    // setPoints() {}
    setAxis(axis: axisType) {
        this.views.forEach((view) => {
            // const action = view.resizeAction;
            // action.rectTool.setOption({ rotatable: true });
            view.setAxis(axis);
            view.fitObject();
        });
        this.render();
    }
    // render
    renderFrame() {
        if (!this.isEnable()) return;

        console.log('group 3d render');

        this.updateSize();

        let renderer = this.renderer;
        this.canvasRect = this.canvas.getBoundingClientRect();
        // if(this.renderTimer) return;
        this.renderer.setClearColor(0x1e1f23);
        this.renderer.setScissorTest(false);
        this.renderer.clear();
        renderer.setClearColor(0x000000);
        renderer.setScissorTest(true);

        this.renderN = 0;
        this.views.forEach((view) => {
            view.render();
        });
        console.log('this.renderN', this.renderN);
    }
}
