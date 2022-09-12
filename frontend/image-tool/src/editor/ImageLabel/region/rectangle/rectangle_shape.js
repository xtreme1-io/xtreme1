import Konva from 'konva';
import { BaseShape } from '../base/base_shape.js';
import { Event } from '../../../config/event';
import {
    CONSTANT,
    CURSOR,
    xytoArr,
    MODETYPE,
    calculateRectPoints,
    sortPolygonPointClockwise,
    fixedPointPositionIfNeed,
    //
} from '../../util';
import * as _ from 'lodash';
import { config } from '../../config';
import { concat } from 'lodash';
export class Rectangle extends BaseShape {
    constructor(view, opt) {
        super(view, opt);
        this.init(opt);
    }
    init(opt) {
        this.type = 'rectangle';
        this.hasAnchor = true;
        this.needMidAnchor = false;
        // this.showAnchor = false;
        this.rotatable = true;
        this.edges = [];
        this.createShape(xytoArr(this.points));
        this.createLabel();
        if (this.finish) {
            this.updateLabelPosition();
            this.finishDraw();
        }
    }
    createShape(points) {
        this.shape = new Konva.Line({
            points: points,
            closed: true,
            stroke: this.stroke,
            strokeWidth: CONSTANT.STROKEWIDTH * this._getScaleFactor(),
            draggable: false,
            dragDistance: 0,
        });
        this.bindDragEvent();
        this.checkValid();
        this.updateShapeColor();
        this.shapelayer.add(this.shape);
        this.draw();
        super.createShape();
    }
    anchorOnDragMove(e) {
        let anchor = e.target;
        let bbox = this.view.limitBbox;
        let limit = config.limitInBackgroud;
        let idx = anchor.idx;
        let points = this.points.slice();
        let position = fixedPointPositionIfNeed(anchor.position(), bbox, limit);
        points = calculateRectPoints(position, points[(idx + 2) % 4], 0, idx);
        let outOfImage = false;
        if (limit) {
            outOfImage = points.some((p) => {
                return !this.view.background.checkInImage(p);
            });
        }
        if (outOfImage) {
            points = calculateRectPoints(anchor.point, points[(idx + 2) % 4], 0, idx);
        }
        // points = sortPolygonPointClockwise(points);
        this.setPoints(points);
        this.initEdgeEdit();
        // updateRectSizeTips(e.evt, this, this.view);
    }
    initEdgeEdit() {
        if (this.points.length < 2) return;
        let points = this.points.slice();
        points.push(points[0]);
        points.reduce((pre, cur, index) => {
            let edge = this.edges[index - 1];
            if (edge) {
                edge.points(xytoArr([pre, cur]));
            } else {
                edge = new Konva.Line({
                    name: CONSTANT.HELPNAME,
                    points: xytoArr([pre, cur]),
                    closed: false,
                    stroke: this.stroke,
                    strokeWidth: CONSTANT.STROKEWIDTH * this._getScaleFactor(),
                    hitStrokeWidth: CONSTANT.HITSTROKEWIDTH * 2 * this._getScaleFactor(),
                    draggable: true,
                    dragDistance: 0,
                    dragBoundFunc: function (pos) {
                        if (this.idx % 2) {
                            return {
                                x: this.getAbsolutePosition().x,
                                y: pos.y,
                            };
                        } else {
                            return {
                                x: pos.x,
                                y: this.getAbsolutePosition().y,
                            };
                        }
                    },
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
                    this.view.updateCursor(edge.idx % 2 ? CURSOR.nsResize : CURSOR.ewResize);
                    edge.strokeWidth(CONSTANT.STROKEWIDTH * 2 * this._getScaleFactor());
                });
                edge.on('mouseout', () => {
                    this.view.updateCursor(CURSOR.auto);
                    edge.strokeWidth(CONSTANT.STROKEWIDTH * this._getScaleFactor());
                });
                this.helplayer.add(edge);
            }
            edge.idx = index;
            this.edges.splice(index - 1, 1, edge);
            return cur;
        });
        this.draw();
    }
    endEdgeEdit() {
        // this.shape.show();
        this.edges.forEach((edge) => {
            edge.off();
            edge.destroy();
        });
        this.edges = [];
    }
    edgeOnDragStart(e) {
        this.oldPoints = _.cloneDeep(this.points);
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
        this.diff = diff;
        this._edgePosition = curPosition;
        this.moveEdge(index - 1, diff, false);
        if (index % 2) {
            this.edges[1].points(xytoArr([this.points[1], this.points[2]]));
            this.edges[3].points(xytoArr([this.points[3], this.points[0]]));
        } else {
            this.edges[0].points(xytoArr([this.points[0], this.points[1]]));
            this.edges[2].points(xytoArr([this.points[2], this.points[3]]));
        }
    }
    edgeOnDragEnd(e) {
        let edge = e.target;
        let index = edge.idx;
        let points = [];
        if (index < 4) {
            points = [this.points[index - 1], this.points[index]];
        } else {
            points = [this.points[3], this.points[0]];
        }
        // switch (index) {
        //     case 1: {
        //         points = [this.points[0], this.points[1]];
        //         break;
        //     }
        //     case 2: {
        //         points = [this.points[1], this.points[2]];
        //         this.points[1].x += diff.x;
        //         this.points[2].x += diff.x;
        //         break;
        //     }
        //     case 3: {
        //         points = [this.points[2], this.points[3]];
        //         break;
        //     }
        //     case 4: {
        //         points = [this.points[3], this.points[0]];
        //         break;
        //     }
        // }
        // console.log(this.startPoints, points);
        this.view.editor.cmdManager.execute('move-side', {
            uuid: this.uuid,
            target: _.cloneDeep(this.points),
            current: this.oldPoints,
        });
        this.edges[index - 1].points(xytoArr(points));
        edge.position({ x: 0, y: 0 });
        this.view.emit(Event.DIMENSION_CHANGE_AFTER, {
            data: this,
        });
    }
    moveEdge(index, diff, fixPosition = true) {
        let edgeIndex = index + 1;
        switch (edgeIndex) {
            case 1: {
                this.points[0].y += diff.y;
                this.points[1].y += diff.y;
                break;
            }
            case 2: {
                this.points[1].x += diff.x;
                this.points[2].x += diff.x;
                break;
            }
            case 3: {
                this.points[2].y += diff.y;
                this.points[3].y += diff.y;
                break;
            }
            case 4: {
                this.points[0].x += diff.x;
                this.points[3].x += diff.x;
                break;
            }
        }
        // this.points = sortPolygonPointClockwise(this.points);
        this._pointsChange();
        if (edgeIndex % 2) {
            this.edges[1].points(xytoArr([this.points[1], this.points[2]]));
            this.edges[3].points(xytoArr([this.points[3], this.points[0]]));
        } else {
            this.edges[0].points(xytoArr([this.points[0], this.points[1]]));
            this.edges[2].points(xytoArr([this.points[2], this.points[3]]));
        }
        if (fixPosition) {
            let points = [];
            if (edgeIndex < 4) {
                points = [this.points[edgeIndex - 1], this.points[edgeIndex]];
            } else {
                points = [this.points[3], this.points[0]];
            }
            let edge = this.edges[edgeIndex - 1];
            edge.points(xytoArr(points));
            edge.position({ x: 0, y: 0 });
        }
    }
    setPoints(points) {
        this.points = points.slice();
        if (this.selected && this.view.mode === MODETYPE.edit) {
            this.initEdgeEdit();
        }
        this._pointsChange();
    }
    toJSON() {
        let ret = super.toJSON();
        ret.coordinate = sortPolygonPointClockwise(ret.coordinate, 0).map((p) => {
            delete p.angle;
            delete p.index;
            return p;
        });
        return {
            ...ret,
        };
    }
}
