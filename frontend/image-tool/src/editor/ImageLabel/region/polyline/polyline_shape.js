import Konva from 'konva';
import { BaseShape } from '../base/base_shape.js';
import { Event } from '../../../config/event';
// import updateRectSizeTips from '../../helper/rectsizetips.js';
import {
    CONSTANT,
    MODETYPE,
    CURSOR,
    xytoArr,
    calculateRectPoints,
    sortPolygonPointClockwise,
    fixedPointPositionIfNeed,
    toImageCord,
    transformPoint,
    updateShapeScale,
    getLineLength,
    KeyCodeMap,
    onSegment,
    isEqualPoint,
    //
} from '../../util';
import { cloneDeep } from 'lodash';
import { config } from '../../config';
export class Polyline extends BaseShape {
    constructor(view, opt) {
        super(view, opt);
        this.init(opt);
    }
    init(opt) {
        this.type = 'polyline';
        this.hasAnchor = true;
        this.needMidAnchor = false;
        this.edges = null;
        // this.showAnchor = false;
        this.rotatable = true;
        this.edges = [];
        this.createShape(xytoArr(this.points));
        // this.bindDomEvent();
        this.createLabel();
        if (this.finish) {
            this.updateLabelPosition();
            this.finishDraw();
        }
    }
    createShape(points) {
        console.log(points);
        this.shape = new Konva.Line({
            points: points,
            closed: false,
            stroke: this.stroke,
            strokeWidth: CONSTANT.STROKEWIDTH * this._getScaleFactor(),
            hitStrokeWidth: CONSTANT.HITSTROKEWIDTH * this._getScaleFactor(),
            draggable: false,
        });
        // this.edge = new Konva.Line({
        //     points: points,
        //     closed: false,
        //     stroke: this.stroke,
        //     strokeWidth: CONSTANT.STROKEWIDTH * this._getScaleFactor(),
        //     draggable: false,
        //     dragDistance: 0,
        // });
        // this.shape.on('click', (e) => {
        //     let startPointIndex = null;
        //     const pointEvt = {
        //         x: e.evt.layerX,
        //         y: e.evt.layerY,
        //     };
        //     // const point = transformPoint(pointEvt, this.view.limitBbox);
        //     const point = pointEvt;
        //     console.log(point);
        //     this.points.forEach((item, index) => {
        //         if (index !== 0) {
        //             if (onSegment(this.points[index - 1], this.points[index], point) !== null) {
        //                 startPointIndex = index;
        //             }
        //         }
        //     });
        //     // if (startPointIndex !== null) {
        //     // console.log(startPointIndex);
        //     this.points.splice(startPointIndex, 0, point);
        //     // console.log(this.points);
        //     this.updateAnchors(this.points);
        //     // updateShapeScale(this.view);
        //     // }
        // });
        // this.edges.push(this.edge);
        this.bindDragEvent();
        this.checkValid();
        this.updateShapeColor();
        this.shapelayer.add(this.shape);
        this.draw();
        super.createShape();
    }

    removeAnchor(anchor) {
        if (this.view.mode === MODETYPE.edit) {
            if (this.points.length <= 2) return;
            // this.removePoint({ index: anchor.idx, interiorIndex: anchor.interiorIndex });
            this.removePoint(anchor.idx);
        }
    }
    _pointsChange() {
        this.shape.points(xytoArr(this.points));
        if (this.selected && this.view.mode === MODETYPE.edit) {
            this.initEdgeEdit();
        }
        this.updateDistanceText();
        this.checkValid();
        this.updateShapeColor();
        this.updateAnchors();
        this.updateLabelPosition();
        this.draw();
        this.view.emit(Event.DIMENSION_CHANGE, {
            data: this,
        });
    }
    updateAnchors() {
        if (this.hasAnchor) {
            let visible = this.shape.isVisible() && this.showAnchor;
            let total = this.points.length;
            this.interior.reduce((pre, cur) => {
                total = pre + cur.points.length;
                return total;
            }, total);
            if (visible) {
                this.anchors.splice(total).forEach((anchor) => {
                    anchor.off();
                    anchor.destroy();
                    anchor = null;
                });
                let anchors = [];
                let index = 0;
                anchors = this.points.map((p, i) => {
                    let anchor = this.anchors[index] || this._createAnchor(p, i, -1);
                    anchor.visible(visible);
                    anchor.draggable(this.selected);
                    anchor.position(p);
                    index++;
                    return anchor;
                });
                // this.interior.forEach((ring, interiorIndex) => {
                //     let interiorAnchors = ring.points.map((p, i) => {
                //         let anchor = this.anchors[index] || this._createAnchor(p, i, interiorIndex);
                //         anchor.visible(visible);
                //         anchor.draggable(this.selected);
                //         anchor.position(p);
                //         index++;
                //         return anchor;
                //     });
                //     anchors = anchors.concat(interiorAnchors);
                // });
                this.anchors = anchors;
                this.draw();
            }
        }
    }
    initEdgeEdit() {
        if (this.points.length < 2) return;
        let interiorIndex = -1;
        let index = 0;
        let points = this.points.slice();
        // points.push(points[0]);
        points.reduce((pre, cur, i) => {
            let edge = this.edges[index];
            if (edge) {
                if (Konva.DD.node !== edge) {
                    edge.points(xytoArr([pre, cur]));
                }
            } else {
                edge = this._createEdge(xytoArr([pre, cur]));
            }
            edge.idx = i;
            edge.interiorIndex = interiorIndex;
            this.edges.splice(index, 1, edge);
            index++;
            return cur;
        });
        // this.interior.forEach((ring, interiorIndex) => {
        //     let points = ring.points.slice();
        //     points.push(points[0]);
        //     points.reduce((pre, cur, i) => {
        //         let edge = this.edges[index];
        //         if (edge) {
        //             edge.points(xytoArr([pre, cur]));
        //         } else {
        //             edge = this._createEdge(xytoArr([pre, cur]));
        //         }
        //         edge.idx = i;
        //         edge.interiorIndex = interiorIndex;
        //         this.edges.splice(index, 1, edge);
        //         index++;
        //         return cur;
        //     });
        // });
        this.edges.splice(index).forEach((edge) => {
            edge.off();
            edge.destroy();
            edge = null;
        });
        this.draw();
    }

    _createEdge(points) {
        let edge = new Konva.Line({
            name: CONSTANT.HELPNAME,
            points,
            closed: false,
            stroke: this.stroke,
            strokeWidth: CONSTANT.STROKEWIDTH * this._getScaleFactor(),
            hitStrokeWidth: CONSTANT.HITSTROKEWIDTH * 2 * this._getScaleFactor(),
            draggable: true,
        });
        edge.on('dragstart', (e) => {
            this.edgeOnDragStart(e);
        });
        edge.on('dragmove', (e) => {
            this.edgeOnDragMove(e);
        });
        edge.on('dragend', (e) => {
            this.edgeOnDragEnd(e);
        });
        edge.on('mouseover', () => {
            this.view.updateCursor(CURSOR.pointer);
            edge.strokeWidth(CONSTANT.STROKEWIDTH * 2 * this._getScaleFactor());
        });
        edge.on('mouseout', () => {
            this.view.updateCursor(CURSOR.auto);
            edge.strokeWidth(CONSTANT.STROKEWIDTH * this._getScaleFactor());
        });
        edge.on('click', (e) => {
            let point = this.view.getRelativePointerPosition();
            this.insertPoint(point, edge.idx);
            // console.log(edge);
        });
        this.helplayer.add(edge);
        return edge;
    }

    // _clacDimension(edgePoint) {
    //     let points = edgePoint;
    //     let length = getLineLength(points);
    //     this.length = length;
    // }
    endEdgeEdit() {
        this.edges.forEach((edge) => {
            edge.off();
            edge.destroy();
        });
        this.edges = [];
    }
    // onDragEnd() {
    //     this.shape.points(this.points);
    //     this.shape.position({ x: 0, y: 0 });
    //     this._pointsChange();
    //     this.view.emit(Event.DIMENSION_CHANGE, {
    //         data: this,
    //     });
    // }
    setPoints(points) {
        this.points = points.slice();
        this._pointsChange();
    }
    updateDistanceText(points) {
        this._clacDimension(points);
    }
    _clacDimension(point) {
        let points = this.points.map((p) => {
            return this._toCoordinate(p);
        });
        let length = 0;
        if (point) {
            length = getLineLength([...points, this._toCoordinate(point)]);
        } else {
            length = getLineLength(points);
        }
        this.length = length;
    }
    // initEdgeEdit() {
    //     this.draw();
    // }
    pushPoint(point) {
        let [last] = this.points.slice(-1);
        if (!(last && isEqualPoint(last, point))) {
            this.points.push(point);
            this._pointsChange();
        }
    }
    edgeOnDragStart(e) {
        this.oldPoints = cloneDeep(this.points);
        this._edgePosition = e.target.position();
        this.view.emit(Event.DIMENSION_CHANGE_BEFORE, {
            data: this,
        });
    }
    edgeOnDragMove(e) {
        let edge = e.target;
        let index = edge.idx;
        let curPosition = edge.position();
        let diff = {
            x: curPosition.x - this._edgePosition.x,
            y: curPosition.y - this._edgePosition.y,
        };
        this._edgePosition = curPosition;
        this.points.map((item) => {
            item.x += diff.x;
            item.y += diff.y;
        });
        this.setPoints(this.points);
        // edge.points(xytoArr([this.points[index - 1], this.points[index]]));
        // edge.position({ x: 0, y: 0 });
        // this._pointsChange();
    }
    edgeOnDragEnd(e) {
        let edge = e.target;
        let index = edge.idx;
        edge.points(xytoArr([this.points[index - 1], this.points[index]]));
        edge.position({ x: 0, y: 0 });
        this.view.editor.cmdManager.execute('move-object', {
            uuid: this.uuid,
            points: cloneDeep(this.points),
            interior: cloneDeep(this.interior),
            oldPoints: cloneDeep(this.oldPoints),
        });
        this.view.emit(Event.DIMENSION_CHANGE_AFTER, {
            data: this,
        });
    }
}
