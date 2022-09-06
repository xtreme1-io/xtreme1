import { BaseTool } from '../base/base_tool.js';
import { Polyline } from './polyline_shape.js';
// import updateRectSizeTips from '../../helper/rectsizetips.js';
import {
    // calculateRectPoints,
    // sortPolygonPointClockwise,
    isEqualPoint,
    MODETYPE,
    CONSTANT,
    createAnchor,
    updateShapeScale,
    xytoArr,
    ANCHORNAME,
    HELPNAME,
    // sortPolygonPointClockwise,
} from '../../util';
import { config } from '../../config';
import { StatusType } from '../../../type';
import Event from '../../../config/event';
export class PolylineTool extends BaseTool {
    constructor(view) {
        super(view);
        this.poly = null;
        // this.dashPoly = null;
        this.name = 'polyline';
        this.first = null;
        this.lastLine = null;
        this.tempPoint = null;
        this.circles = [];
        this.points = [];
        this.backPoint = [];
        this.clickCount = 0;
    }
    cancel() {
        if (this.poly) {
            console.log('????');
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
        super.back();

        if (this.poly) {
            let points = this.poly.points;
            let length = points.length;
            this.backPoint.push(points[points.length - 1]);
            this.poly.removePoint(points.length - 1);
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
        if (this.poly.points.length < 2) return;
        this.lastLine.destroy();
        this.lastLine = null;
        this.view.editor.state.status = StatusType.Default;
        this.view.emit(Event.DIMENSION_CHANGE_AFTER);
        this.poly.setPoints(this.poly.points);
        // this.poly.shape.closed(true);
        this.poly.finishDraw();
        this.poly.updateAnchors();
        this.poly.draw();
        this.poly = null;
    }
    createShape(point) {
        if (!this.poly) {
            this.poly = new Polyline(this.view, {
                points: [point],
            });
            this.poly.updateAnchors();
        } else {
            this.poly.pushPoint(point);
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
        this.view.editor.cmdManager.execute('add-point', {
            data: circle,
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
        // if (e.evt.button > 0) return;
        // if (this.view.mode === MODETYPE.draw) {
        //     this.view.editor.state.status = StatusType.Create;
        //     this.points.push(point);
        //     let points = this.points;
        //     // points = sortPolygonPointClockwise(points);
        //     console.log(this.clickCount);
        //     if (this.clickCount === 0) {
        //         this.first = point;
        //         this.createShape(point);
        //         this.createCircle(point);
        //         this.view.emit(Event.DIMENSION_CHANGE_BEFORE, {
        //             data: this.poly.edge,
        //         });
        //         console.log(this);
        //     } else {
        //         if (isEqualPoint(this.first, point)) {
        //             return;
        //         }
        //         this.tempPoint = point;
        //         this.createShape(points);
        //         this.createCircle(point);
        //     }
        //     console.log(points);
        //     this.poly.setPoints(points);
        //     this.poly.shape.dash([]);
        //     updateShapeScale(this.view);
        //     this.clickCount++;
        //     if (this.clickCount > 2) {
        //         // let points = [this.first, this.last];
        //         // points = sortPolygonPointClockwise(points);
        //         this.poly.setPoints(points);
        //         this.poly.shape.dash([]);
        //         this.poly.finishDraw();
        //         this.poly.endEdgeEdit();
        //         this.points = [];
        //         this.poly = null;
        //         this.clickCount = 0;
        //         this.first = null;
        //         this.tempPoint = null;
        //         this.clearaCircle();
        //         this.view.editor.state.status = StatusType.Default;
        //         this.view.emit(Event.DIMENSION_CHANGE_AFTER);
        //         // this.config.rectSizeTip.ele.hide();
        //     }
        //     // this.poly = null;
        //     // this.clickCount = 0;
        //     // this.first = null;
        //     // this.last = null;
        //     // this.clearaCircle();
        //     // this.view.editor.state.status = StatusType.Default;
        //     // this.view.emit(Event.DIMENSION_CHANGE_AFTER);
        //     // this.config.rectSizeTip.ele.hide();
        //     // if (this.clickCount === 0) {
        //     //     this.first = point;
        //     //     this.createShape(point);
        //     //     this.createCircle(point);
        //     //     this.view.emit(Event.DIMENSION_CHANGE_BEFORE, {
        //     //         data: this.poly,
        //     //     });
        //     // } else {
        //     //     if (isEqualPoint(this.first, point)) {
        //     //         return;
        //     //     }
        //     //     this.last = point;
        //     //     // this.createCircle(point);
        //     // }
        //     // updateShapeScale(this.view);
        // }
        if (this.view.mode === MODETYPE.draw) {
            this.view.editor.state.status = StatusType.Create;
            if (e.target.hasName(ANCHORNAME) && e.target.idx === 0) {
                this.closeShape();
                return;
            }
            if (this.backPoint.length > 0) {
                this.backPoint = [];
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
        // if (!this.poly || this.view.mode !== MODETYPE.draw) {
        //     return;
        // }
        // if (this.circles.length < 2) {
        //     this.createCircle(point);
        //     updateShapeScale(this.view);
        // } else {
        //     // let circle = this.circles[1];
        //     // circle.position(point);
        // }
        // // this.poly.setPoints(this.points);

        // let points = [this.tempPoint || this.first, point];
        // this.poly.drawDash(points);
        // this.poly.updateDistanceText([this.first, point]);
        // this.view.emit(Event.DIMENSION_CHANGE, {
        //     data: this.poly,
        // });
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
