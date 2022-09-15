import { BaseShape } from '../base/base_shape.js';
import {
    CONSTANT,
    MODETYPE,
    isEqualPoint,
    createAnchor,
    CURSOR,
    fixedPointPositionIfNeed,
    getBoudingBox,
    getLineLength,
    getArea,
    xytoArr,
} from '../../util';
import { PolygonShape } from './polygon';
import { Event } from '../../../config/event';
import { config } from '../../config';
import { cloneDeep } from 'lodash';
export class Polygon extends BaseShape {
    constructor(view, opt = {}) {
        super(view, opt);
        this.interior = opt.interior || [];
        this.init(opt);
    }
    init(opt) {
        this.type = 'polygon';
        this.hasAnchor = true;
        this.needMidAnchor = true;

        this.createShape({
            points: this.points,
            interior: this.interior,
        });
        this.createLabel();
        if (this.finish) {
            this.closed = true;
            this.shape.closed(true);
            this.finishDraw();
        }
    }
    canClose() {
        return this.points.length >= 3;
    }
    closeShape() {
        this.closed = true;
        this.shape.points(this.points);
        this.shape.closed(true);
        this.finishDraw();
        this.updateAnchors();
        this.draw();
    }
    createShape({ points, interior }) {
        this.shape = new PolygonShape({
            stroke: this.stroke,
            strokeWidth: CONSTANT.STROKEWIDTH * this._getScaleFactor(),
            draggable: false,
            points,
            interior: interior || [],
        });
        // this.shape = new Konva.Line({
        //     points: points,
        //     closed: this.closed,
        //     stroke: this.stroke,
        //     strokeWidth: CONSTANT.STROKEWIDTH * this._getScaleFactor(),
        //     draggable: false,
        //     dragDistance: 0,
        //     sceneFunc: function(context) {
        //         let closed = this.closed();
        //         // let points = this.owner.points;
        //         let outer = [
        //             {
        //                 "x": 428,
        //                 "y": 397
        //             },
        //             {
        //                 "x": 702,
        //                 "y": 472
        //             },
        //             {
        //                 "x": 391,
        //                 "y": 659
        //             },
        //             {
        //                 "x": 250,
        //                 "y": 498
        //             }
        //         ]
        //         let inner = [
        //             {
        //                 "x": 420.0000000833333,
        //                 "y": 438.99999975000003
        //             },
        //             {
        //                 "x": 500.99999991666675,
        //                 "y": 482.0000001666667
        //             },
        //             {
        //                 "x": 425.99999975000003,
        //                 "y": 581.9999999166668
        //             },
        //             {
        //                 "x": 376.00000025,
        //                 "y": 565
        //             },
        //             {
        //                 "x": 322,
        //                 "y": 515.0000001666667
        //             },
        //             {
        //                 "x": 361.0000000833333,
        //                 "y": 467
        //             }
        //         ]
        //         let points = outer;
        //         context.beginPath();
        //         context.moveTo(points[0].x, points[0].y);
        //         for (let i = 1; i < points.length; i++) {
        //             let p = points[i];
        //                 context.lineTo(p.x, p.y);
        //         }
        //         if (closed) {
        //             context.closePath();
        //         }
        //         points = inner;
        //         context.moveTo(points[0].x, points[0].y);
        //         for (let i = 1; i < points.length; i++) {
        //             let p = points[i];
        //             context.lineTo(p.x, p.y);
        //         }
        //         if (closed) {
        //             context.closePath();
        //         }
        //         debugger
        //         context._context.fillStyle = this.fill();
        //         context._context.strokeStyle = this.stroke();
        //         context._context.strokeWidth = this.strokeWidth();
        //         context._context.fill('evenodd');
        //         context.strokeShape(this);
        //     },
        //     hitFunc: function(context) {
        //         let closed = this.closed();
        //         // let points = this.owner.points;

        //         let points = outer;
        //         context.beginPath();
        //         context.moveTo(points[0].x, points[0].y);
        //         for (let i = 1; i < points.length; i++) {
        //             let p = points[i];
        //                 context.lineTo(p.x, p.y);
        //         }
        //         if (closed) {
        //             context.closePath();
        //         }
        //         points = inner;
        //         context.moveTo(points[0].x, points[0].y);
        //         for (let i = 1; i < points.length; i++) {
        //             let p = points[i];
        //             context.lineTo(p.x, p.y);
        //         }
        //         if (closed) {
        //             context.closePath();
        //         }
        //         context.fillStrokeShape(this);
        //     }
        // });
        this.bindDragEvent();
        this.checkValid();
        this.updateShapeColor();
        this.shapelayer.add(this.shape);
        this.draw();
        super.createShape();
    }
    addInterior(interior) {
        if (Array.isArray(interior)) {
            interior.forEach((ring) => {
                this.interior.push({
                    uuid: ring.uuid,
                    points: ring.points,
                });
                ring.destroy();
            });
        } else {
            this.interior.push({
                uuid: interior.uuid,
                points: interior.points,
            });
            interior.destroy();
        }
        this.shape.interior(this.interior);
        this._pointsChange();
    }
    removeInterior() {
        let interior = this.interior;
        interior.forEach((ring) => {
            let polygon = new Polygon(this.view, {
                uuid: ring.uuid,
                points: ring.points,
                closed: true,
                finish: true,
                fromJson: true,
            });
            this.view.emit(Event.ADD_OBJECT, {
                data: {
                    object: polygon,
                },
            });
        });
        this.interior = [];
        this.shape.interior(this.interior);
        this._pointsChange();
        this.view.unSelectAll();
    }
    checkValid() {
        this._valid = true;
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
                this.interior.forEach((ring, interiorIndex) => {
                    let interiorAnchors = ring.points.map((p, i) => {
                        let anchor = this.anchors[index] || this._createAnchor(p, i, interiorIndex);
                        anchor.visible(visible);
                        anchor.draggable(this.selected);
                        anchor.position(p);
                        index++;
                        return anchor;
                    });
                    anchors = anchors.concat(interiorAnchors);
                });
                this.anchors = anchors;
                this.draw();
            }
        }
    }
    _createAnchor(point, index, interiorIndex) {
        let anchorfill = config.defaultCorlor;
        let anchor = createAnchor({
            radius: CONSTANT.ANCHORRADIUS * this._getScaleFactor(),
            x: point.x,
            y: point.y,
            fill: anchorfill,
            name: CONSTANT.HELPNAME + ' ' + CONSTANT.ANCHORNAME,
            hitStrokeWidth: CONSTANT.HITSTROKEWIDTH * this._getScaleFactor(),
            visible: this.shape.isVisible() && this.showAnchor,
            draggable: true,
            dragDistance: 1,
        });
        anchor.perfectDrawEnabled(false);
        anchor.point = point;
        anchor.idx = index;
        anchor.owner = this;
        anchor.interiorIndex = interiorIndex;
        anchor.on('click', (e) => {
            this.anchorOnClick(e);
        });

        // anchor.on('contextmenu', (e) => {
        //     e.evt.preventDefault();
        //     this.anchorOnContextmenu(e);
        // });

        anchor.on('dragstart', () => {
            this.view.emit(Event.DIMENSION_CHANGE_BEFORE, {
                data: this,
            });
            // this.activeAnchor(anchor);
        });
        anchor.on('dragmove', (e) => {
            this.view.updateCursor(CURSOR.none);
            this.anchorOnDragMove(e);
            anchor._moved = true;
        });
        anchor.on('dragend', () => {
            this.view.updateCursor(CURSOR.move);
            // this.activeAnchor(anchor);
            this.anchorOnDragEnd(anchor);
            anchor._moved = false;
        });
        anchor.on('mouseover', () => {
            if (this.view.mode === MODETYPE.edit) {
                this.view.updateCursor(anchor.cursor);
                anchor.radius(CONSTANT.ANCHORHOVERRADIUS * this._getScaleFactor());
                this.draw();
            }
        });
        anchor.on('mouseout', () => {
            if (this.view.mode === MODETYPE.edit) {
                this.view.updateCursor(CURSOR.auto);
                anchor.radius(CONSTANT.ANCHORRADIUS * this._getScaleFactor());
                this.draw();
            }
        });
        this.helplayer.add(anchor);
        return anchor;
    }
    anchorOnContextmenu(e) {
        let anchor = e.target;
        this.removeAnchor(anchor);
    }
    anchorOnDragMove(e) {
        let anchor = e.target;
        let index = anchor.idx;
        let interiorIndex = anchor.interiorIndex;
        let bbox = this.view.limitBbox;
        let limit = config.limitInBackgroud;

        let position = fixedPointPositionIfNeed(anchor.position(), bbox, limit);
        if (interiorIndex < 0) {
            this.replacePoint(position, anchor.idx);
        } else {
            this.interior[interiorIndex].points.splice(index, 1, position);
            this.shape.interior(this.interior);
            this._pointsChange();
        }
        this.updateLabelPosition();
    }
    _createEdge(points) {
        let edge = new Konva.Line({
            name: CONSTANT.HELPNAME,
            points,
            closed: false,
            stroke: this.stroke,
            strokeWidth: CONSTANT.STROKEWIDTH * this._getScaleFactor(),
            hitStrokeWidth: CONSTANT.HITSTROKEWIDTH * 2 * this._getScaleFactor(),
            draggable: false,
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
            if (edge.interiorIndex >= 0) {
                this.interior[edge.interiorIndex].points.splice(edge.idx, 0, point);
                this._pointsChange();
            } else {
                this.insertPoint(point, edge.idx);
            }
            // console.log(edge);
        });
        this.helplayer.add(edge);
        return edge;
    }
    initEdgeEdit() {
        if (this.points.length < 2) return;
        let interiorIndex = -1;
        let index = 0;
        let points = this.points.slice();
        points.push(points[0]);
        points.reduce((pre, cur, i) => {
            let edge = this.edges[index];
            if (edge) {
                edge.points(xytoArr([pre, cur]));
            } else {
                edge = this._createEdge(xytoArr([pre, cur]));
            }
            edge.idx = i;
            edge.interiorIndex = interiorIndex;
            this.edges.splice(index, 1, edge);
            index++;
            return cur;
        });
        this.interior.forEach((ring, interiorIndex) => {
            let points = ring.points.slice();
            points.push(points[0]);
            points.reduce((pre, cur, i) => {
                let edge = this.edges[index];
                if (edge) {
                    edge.points(xytoArr([pre, cur]));
                } else {
                    edge = this._createEdge(xytoArr([pre, cur]));
                }
                edge.idx = i;
                edge.interiorIndex = interiorIndex;
                this.edges.splice(index, 1, edge);
                index++;
                return cur;
            });
        });
        this.edges.splice(index).forEach((edge) => {
            edge.off();
            edge.destroy();
            edge = null;
        });
        this.draw();
    }
    endEdgeEdit() {
        this.edges.forEach((edge) => {
            edge.off();
            edge.destroy();
        });
        this.edges = [];
    }
    onDragEnd() {
        this.shape.points(this.points);
        this.shape.interior(this.interior);
        this.shape.position({ x: 0, y: 0 });
        this._pointsChange();
        this.view.emit(Event.DIMENSION_CHANGE, {
            data: this,
        });

        this.view.editor.cmdManager.execute('move-object', {
            uuid: this.uuid,
            points: cloneDeep(this.points),
            interior: cloneDeep(this.interior),
            oldPoints: cloneDeep(this.oldPoints),
        });
    }
    removeAnchor(anchor) {
        if (this.view.mode === MODETYPE.edit) {
            if (this.points.length <= 3) return;
            this.removePoint({ index: anchor.idx, interiorIndex: anchor.interiorIndex });
        }
    }
    setPoints(points) {
        this.points = points.slice();
        this._pointsChange();
    }
    pushPoint(point) {
        let [last] = this.points.slice(-1);
        if (!(last && isEqualPoint(last, point))) {
            this.points.push(point);
            this._pointsChange();
        }
    }
    insertPoint(point, index) {
        this.points.splice(index, 0, point);
        this._pointsChange();
    }
    removePoint({ index, interiorIndex }) {
        if (this.view.activeAnchor) {
            let activeAnchor = this.view.activeAnchor;
            if (activeAnchor.idx === index && activeAnchor.interiorIndex === interiorIndex) {
                this.activeAnchor(null);
            }
        }
        if (interiorIndex >= 0) {
            this.interior[interiorIndex].points.splice(index, 1);
            this.shape.interior(this.interior);
        } else {
            this.points.splice(index, 1);
        }
        this._pointsChange();
    }
    replacePoint(point, index) {
        let replaced = this.points[index] || {};
        this.points.splice(index, 1, { ...replaced, ...point });
        this._pointsChange();
    }
    _pointsChange() {
        // this.shape.points(xytoArr(this.points));
        this.shape.points(this.points);
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
    setInterior(points) {
        this.interior = points;
        this.shape.interior(points);
        this._pointsChange();
    }
    updateDistanceText(point) {
        this._clacDimension(point);
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
        if (this.finish) {
            let { width, height } = getBoudingBox(points);
            let area = getArea(points);
            this.interior.forEach((ring) => {
                let points = ring.points.map((p) => {
                    return this._toCoordinate(p);
                });
                area -= getArea(points);
            });
            this.width = width;
            this.height = height;
            this.area = area;
        }
        this.length = length;
    }
    toJSON() {
        let ret = super.toJSON();
        this.interior.forEach((ring) => {
            ring.coordinate = ring.points.map((p) => {
                return this._toCoordinate(p);
            });
        });
        ret.interior = this.interior;
        return ret;
    }
}
