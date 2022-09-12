import { BaseTool } from '../base/base_tool.js';
import { Rectangle } from './rectangle_shape.js';
import {
    calculateRectPoints,
    isEqualPoint,
    MODETYPE,
    CONSTANT,
    createAnchor,
    updateShapeScale,
} from '../../util';
import { config } from '../../config';
import { StatusType } from '../../../type';
import Event from '../../../config/event';
export class RectangleTool extends BaseTool {
    constructor(view) {
        super(view);
        this.poly = null;
        this.name = 'rectangle';
        this.first = null;
        this.last = null;
        this.circles = [];
        this.clickCount = 0;
    }
    cancel() {
        if (this.poly) {
            this.poly.destroy();
            this.poly = null;
            this.clickCount = 0;
            this.first = null;
            this.last = null;
            this.circles.forEach((circle) => {
                circle.destroy();
            });
            this.circles = [];
            this.view.setDrawingState(false);
            this.view.editor.state.status = StatusType.Default;
            this.view.emit(Event.DIMENSION_CHANGE_AFTER);
        }
    }
    back() {
        super.back();
        if (this.poly && this.first) {
            this.cancel();
        }
    }
    createShape(point) {
        if (!this.poly) {
            this.poly = new Rectangle(this.view, {
                points: [point],
            });
            this.poly.shape.dash([2, 2]);
        }
    }
    createCircle(point) {
        let circle = createAnchor({
            radius: CONSTANT.ANCHORRADIUS * this._getScaleFactor(),
            x: point.x,
            y: point.y,
            fill: config.defaultCorlor,
            name: CONSTANT.HELPNAME + ' ' + CONSTANT.ANCHORNAME,
            stroke: config.defaultCorlor,
            draggable: false,
        });
        this.helplayer.add(circle);
        this.circles.push(circle);
    }
    clearaCircle() {
        this.circles.forEach((circle) => {
            circle.destroy();
        });
        this.circles = [];
    }
    mousedownHandler(e, point) {
        if (e.evt.button > 0) return;
        if (this.view.mode === MODETYPE.draw) {
            this.view.editor.state.status = StatusType.Create;
            if (this.clickCount === 0) {
                this.first = point;
                this.createShape(point);
                this.createCircle(point);
                this.view.emit(Event.DIMENSION_CHANGE_BEFORE, {
                    data: this.poly,
                });
            } else {
                if (isEqualPoint(this.first, point)) {
                    return;
                }
                this.last = point;
                // this.createCircle(point);
            }
            updateShapeScale(this.view);
            this.clickCount++;
            if (this.clickCount === 2) {
                let points = calculateRectPoints(this.first, this.last, 0, 0);
                this.poly.setPoints(points);
                this.poly.shape.dash([]);
                this.poly.finishDraw();
                this.poly = null;
                this.clickCount = 0;
                this.first = null;
                this.last = null;
                this.clearaCircle();
                this.view.editor.state.status = StatusType.Default;
                this.view.emit(Event.DIMENSION_CHANGE_AFTER);
                // this.config.rectSizeTip.ele.hide();
            }
        }
    }
    mousemoveHandler(e, point) {
        if (!this.poly || this.view.mode !== MODETYPE.draw) {
            return;
        }
        if (this.circles.length < 2) {
            this.createCircle(point);
            updateShapeScale(this.view);
        } else {
            let circle = this.circles[1];
            circle.position(point);
        }
        let points = calculateRectPoints(this.first, point, 0, 0);
        this.poly.setPoints(points);
    }
}
