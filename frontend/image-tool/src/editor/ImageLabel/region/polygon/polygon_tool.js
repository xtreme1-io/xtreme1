import { BaseTool } from '../base/base_tool.js';
import { Polygon } from './polygon_shape.js';
import {
    MODETYPE,
    CONSTANT,
    xytoArr,
    getDistance,
    getScaleFactor,
    HELPNAME,
    ANCHORNAME,
} from '../../util';
import Konva from 'konva';
import { config } from '../../config';
import { StatusType } from '../../../type';
import Event from '../../../config/event';
export class PolygonTool extends BaseTool {
    constructor(view) {
        super(view);
        this.poly = null;
        this.name = 'polygon';
        this.lastLine = null;
        this.backPoint = [];
    }
    createShape(point) {
        if (!this.poly) {
            this.poly = new Polygon(this.view, {
                points: [point],
            });
            this.poly.updateAnchors();
        } else {
            this.poly.pushPoint(point);
        }
    }
    cancel() {
        if (this.poly) {
            this.poly.destroy();
            this.poly = null;
            this.lastLine.destroy();
            this.lastLine = null;
            this.view.setDrawingState(false);
            this.view.editor.state.status = StatusType.Default;
            this.view.emit(Event.DIMENSION_CHANGE_AFTER);
        }
    }
    back() {
        console.log(this);
        super.back();

        if (this.poly) {
            let points = this.poly.points;
            // let length = points.length;
            this.backPoint.push(points[points.length - 1]);
            this.poly.removePoint({ index: points.length - 1, interiorIndex: -1 });
            if (points.length === 0) {
                this.cancel();
                return;
            }
        }
    }
    forward() {
        super.forward();

        if (this.poly && this.backPoint.length > 0) {
            this.poly.insertPoint(
                this.backPoint[this.backPoint.length - 1],
                this.poly.points.length,
            );
            this.backPoint.splice(this.backPoint.length - 1, 1);
        }
    }
    done() {
        if (this.poly && this.poly.canClose()) {
            this.poly.closeShape();
            this.poly = null;
            this.lastLine.destroy();
            this.lastLine = null;
            this.view.editor.state.status = StatusType.Default;
            this.view.emit(Event.DIMENSION_CHANGE_AFTER);
        } else {
            this.view.editor.showMsg('warning', 'Draw at least 3 key points in a polygon.');
        }
    }
    mousedownHandler(e, point) {
        if (e.evt.button > 0) return;

        if (this.view.mode === MODETYPE.draw) {
            this.view.editor.state.status = StatusType.Create;
            if (this.backPoint.length > 0) {
                this.backPoint = [];
            }
            if (e.target.hasName(ANCHORNAME) && e.target.idx === 0) {
                this.done();
                return;
            }
            this.createShape(point);
            if (!this.lastLine) {
                this.view.emit(Event.DIMENSION_CHANGE_BEFORE, {
                    data: this.poly,
                });
                let points = this.poly.points.slice(-1);
                this.lastLine = new Konva.Line({
                    points: xytoArr(points),
                    closed: false,
                    stroke: '#fff',
                    strokeWidth: CONSTANT.STROKEWIDTH * this._getScaleFactor(),
                    draggable: false,
                    dash: [2, 2],
                    name: HELPNAME,
                });
                this.helplayer.add(this.lastLine);
            }
        }
    }
    mousemoveHandler(e, point) {
        if (!this.poly || this.view.mode !== MODETYPE.draw) {
            return;
        }
        let points = this.poly.points.slice(-1);
        points.push(point);
        this.lastLine.points(xytoArr(points));
        this.lastLine.draw();
        this.poly.updateDistanceText(point);
        this.view.emit(Event.DIMENSION_CHANGE, {
            data: this.poly,
        });
    }
}
