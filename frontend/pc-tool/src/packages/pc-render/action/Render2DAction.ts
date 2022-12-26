import * as THREE from 'three';
import Image2DRenderView from '../renderView/Image2DRenderView';
import { Event } from '../config';
import Action from './Action';
import { Object2D, Rect, Box2D } from '../objects';
import { renderBox2D, renderRect } from '../utils';

export default class Render2DAction extends Action {
    static actionName: string = 'render-2d-shape';
    renderView: Image2DRenderView;
    constructor(renderView: Image2DRenderView) {
        super();

        this.renderView = renderView;
        this.onRender = this.onRender.bind(this);
    }

    init() {
        this.renderView.addEventListener(Event.RENDER_AFTER, this.onRender);
    }
    destroy() {
        this.renderView.removeEventListener(Event.RENDER_AFTER, this.onRender);
    }

    renderRect(obj: Rect, lineWidth: number) {
        let pointCloud = this.renderView.pointCloud;
        let { selectionMap } = pointCloud;
        let { context } = this.renderView.proxy;
        let selectColor = `#${pointCloud.selectColor.getHexString()}`;
        let color = selectionMap[obj.uuid] ? selectColor : obj.color;
        let highFlag = this.renderView.isHighlight(obj);
        color = highFlag ? selectColor : color;

        renderRect(context, obj, { lineWidth: lineWidth, color });
    }

    renderBox2D(obj: Box2D, lineWidth: number) {
        let pointCloud = this.renderView.pointCloud;
        let { selectionMap } = pointCloud;
        let { context } = this.renderView.proxy;
        let selectColor = `#${pointCloud.selectColor.getHexString()}`;
        let color = selectionMap[obj.uuid] ? selectColor : obj.color;
        let highFlag = this.renderView.isHighlight(obj);
        color = highFlag ? selectColor : color;

        renderBox2D(context, obj, { lineWidth: lineWidth, color });
    }

    getLineWidth() {
        let size = 1 / this.renderView.getScale();
        return size;
        // return Math.min(2, Math.max(0.5, size));
    }

    onRender() {
        let objects = this.renderView.get2DObject();
        let lineWidth = this.getLineWidth();

        this.renderView.setContextTransform();
        objects.forEach((obj) => {
            if (this.renderView.isRenderable(obj)) {
                if (obj instanceof Rect) {
                    this.renderRect(obj, lineWidth);
                } else {
                    this.renderBox2D(obj as Box2D, lineWidth);
                }
            }
        });
    }
}
