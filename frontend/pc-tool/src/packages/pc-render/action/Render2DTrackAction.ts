import * as THREE from 'three';
import Image2DRenderView from '../renderView/Image2DRenderView';
import { Event } from '../config';
import Action from './Action';
import { get } from '../utils';

export default class Render2DTrackAction extends Action {
    static actionName: string = 'render-2d-track';
    renderView: Image2DRenderView;
    curMouseEvent?: MouseEvent;
    constructor(renderView: Image2DRenderView) {
        super();

        this.renderView = renderView;
        this.onRender = this.onRender.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
    }
    trackRadius(): number {
        return 50;
    }
    activeTrack(): boolean {
        return false;
    }
    trackLine(): boolean {
        return true;
    }
    trackCircle(): boolean {
        return false;
    }
    init() {
        const container = this.renderView.container;
        container.addEventListener('mousemove', this.onMouseMove);
        container.addEventListener('mouseleave', this.onMouseLeave);
        this.renderView.addEventListener(Event.RENDER_AFTER, this.onRender);
    }
    destroy() {
        const container = this.renderView.container;
        container.removeEventListener('mousemove', this.onMouseMove);
        container.removeEventListener('mouseleave', this.onMouseLeave);
        this.renderView.removeEventListener(Event.RENDER_AFTER, this.onRender);
    }

    getLineWidth() {
        const size = 1 / this.renderView.getScale();
        return size;
        // return Math.min(2, Math.max(0.5, size));
    }
    onMouseMove(event: MouseEvent) {
        this.curMouseEvent = event;
        if (!this.activeTrack()) return;
        this.renderView.render();
    }
    onMouseLeave(event: MouseEvent) {
        this.curMouseEvent = undefined;
        if (!this.activeTrack()) return;
        this.renderView.render();
    }
    drawTrackLine(pos: { x: number; y: number }) {
        if (!this.trackLine()) return;
        const { context } = this.renderView.proxy;
        const { width, height } = this.renderView.proxy.canvas;
        // context.beginPath();
        context.save();
        context.setTransform();
        context.fillStyle = '#fff';
        context.strokeStyle = '#fff';
        context.lineWidth = 1;
        context.beginPath();
        context.setLineDash([2, 2]);

        context.moveTo(0, pos.y);
        context.lineTo(width, pos.y);

        context.moveTo(pos.x, 0);
        context.lineTo(pos.x, height);
        context.stroke();

        context.setLineDash([]);
        context.restore();
    }
    drawTrackCircle(pos: { x: number; y: number }) {
        if (!this.trackCircle()) return;

        let radius = this.trackRadius();
        if (!radius || radius <= 0) return;
        const { context } = this.renderView.proxy;
        context.save();
        context.setTransform();
        const tempVec2 = get(THREE.Vector2, 1);
        tempVec2.set(radius, 0);
        this.renderView.imgToDom(tempVec2);
        radius = tempVec2.x;
        tempVec2.set(0, 0);
        this.renderView.imgToDom(tempVec2);
        radius -= tempVec2.x;
        context.strokeStyle = '#fff';
        context.lineWidth = 1;
        context.beginPath();
        context.arc(pos.x, pos.y, radius, 0, Math.PI * 2, false);
        context.stroke();
        context.restore();
    }
    onRender() {
        if (!this.activeTrack() || !this.curMouseEvent) return;
        const { offsetX, offsetY } = this.curMouseEvent;
        const tempVec2 = get(THREE.Vector2, 1);
        tempVec2.set(offsetX, offsetY);
        // this.renderView.domToImg(tempVec2);
        const pos = { x: offsetX, y: offsetY };
        this.drawTrackCircle(pos);
        this.drawTrackLine(pos);
    }
}
