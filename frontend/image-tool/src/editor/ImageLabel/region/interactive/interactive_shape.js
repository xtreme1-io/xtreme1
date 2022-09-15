import Konva from 'konva';
import { BaseShape } from '../base/base_shape.js';
import { Event } from '../../../config/event';
import {
    CONSTANT,
    CURSOR,
    xytoArr,
    calculateRectPoints,
    sortPolygonPointClockwise,
    fixedPointPositionIfNeed,
    MODETYPE,
    limitInBBoxIfNeed,
    getMinMaxPoint,
} from '../../util';
import { config } from '../../config';
export class Interactive extends BaseShape {
    constructor(view, opt) {
        super(view, opt);
        this.init(opt);
        this.btnText = '';
    }
    init(opt) {
        this.type = 'interactive';
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
        this.maskRect = null;
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
    formatLabelText() {
        return this.btnText;
    }
    updateShapeColor() {
        if (!this.shape) return;
        let color = this._getShapeColor();
        this.shape.stroke(color);
        this.shape.fill(this._getFillColor());
        if (this._label && this.formatLabelText()) {
            let tag = this._label.getTag();
            let tagColor = '#57ccef';
            tag.fill(tagColor);
            tag.stroke(tagColor);
        }
        this.distanceText && this.distanceText.fill(color);
        if (this.edges.length > 0) {
            this.edges.forEach((edge) => {
                edge.stroke(color);
            });
        }
        this.draw();
    }
    createLabel() {
        if (this.view.mode !== MODETYPE.draw) {
            return;
        }
        let poi = this.points[0];
        if (!poi) return;
        let label = new Konva.Label({
            ...poi,
            name: CONSTANT.LABELNAME,
        });
        let tagColor = '#00000000';
        const tag = new Konva.Tag({
            fill: tagColor,
            stroke: tagColor,
            lineJoin: 'round',
            cornerRadius: 4,
        });
        label.add(tag);
        tag.on('mouseover', () => {
            if (this.view.mode === MODETYPE.edit) {
                this.view.updateCursor(CURSOR.pointer);
            }
        });
        tag.on('mouseout', () => {
            if (this.view.mode === MODETYPE.edit) {
                this.view.updateCursor(CURSOR.auto);
            }
        });
        label.add(
            new Konva.Text({
                text: this.formatLabelText(),
                fontSize: CONSTANT.FONTSIZE * this._getScaleFactor(),
                fill: '#ffffff',
                listening: false,
                lineHeight: 1,
                padding: 10,
                // visible: false,
            }),
        );
        this._label = label;
        this._label.owner = this;
        this.helplayer.add(this._label);
        this.updateLabelPosition();
    }
    updateLabelPosition() {
        if (!this._label) return;
        let { x: x1, y: y1 } = this.points[0];
        let { x: x2, y: y2 } = this.points?.[2] ?? this.points[0];
        x1 > x2 && ([x1, x2] = [x2, x1]);
        y1 > y2 && ([y1, y2] = [y2, y1]);
        let poi = { x: x1, y: y1 };

        let rect = this._label.getTag().getSelfRect();
        if (poi) {
            let offsetX = 0;
            let position = {
                x: poi.x + offsetX,
                y: poi.y - rect.height - 2,
            };
            let bbox = this.view.limitBbox;
            position = limitInBBoxIfNeed(position, bbox, rect, config.limitInBackgroud);
            this._label.position(position);
            this._label.visible(this._calcLabelVisible());
        } else {
            this._label.visible(false);
        }
        this.draw();
    }
    onDragMove() {
        // super.onDragMove();
        // this.handleDrawMask();
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
        this.handleDrawMask();
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
        // this.draw();
        this.shapelayer.batchDraw();
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
        this.edges[index - 1].points(xytoArr(points));
        edge.position({ x: 0, y: 0 });
        this.view.emit(Event.DIMENSION_CHANGE_AFTER, {
            data: this,
        });
    }
    moveEdge(index, diff, fixPosition = true) {
        if (this.view.mode == MODETYPE.view) return;
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
        this.handleDrawMask();
    }
    _pointsChange() {
        this.shape.points(xytoArr(this.points));
        this.updateDistanceText();
        this.checkValid();
        this.updateShapeColor();
        this.updateAnchors(this.controlPoints || this.points);
        this.updateLabelPosition();
        this.draw();
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
    handleDrawMask() {
        // if (this.view.mode === MODETYPE.draw) {
        if (this.maskRect) this.clearMaskRect();
        this.getMaskRect();
        this.drawMaskRect();
    }
    getMaskRect() {
        const limitBbox = this.view.limitBbox;
        let { x: minX, y: minY, width: maxX, height: maxY } = limitBbox;
        maxX = minX + maxX;
        maxY = minY + maxY;

        // minX += -999;
        // minY += -999;
        // maxX += 999;
        // maxY += 999;

        const points = getMinMaxPoint(this.points, limitBbox);
        const { x: x1, y: y1 } = points[0];
        const { x: x2, y: y2 } = points[1];

        const maskColor = '#00000080';
        const topMask = new Konva.Rect({
            x: x1,
            y: minY,
            width: x2 - x1,
            height: y1 - minY,
            fill: maskColor,
            strokeWidth: 0,
        });
        const bottomMask = new Konva.Rect({
            x: x1,
            y: y2,
            width: x2 - x1,
            height: maxY - y2,
            fill: maskColor,
            strokeWidth: 0,
        });
        const leftMask = new Konva.Rect({
            x: minX,
            y: minY,
            width: x1 - minX,
            height: maxY - minY,
            fill: maskColor,
            strokeWidth: 0,
        });
        const rightMask = new Konva.Rect({
            x: x2,
            y: minY,
            width: maxX - x2,
            height: maxY - minY,
            fill: maskColor,
            strokeWidth: 0,
        });
        this.maskRect = [topMask, bottomMask, leftMask, rightMask];
    }
    drawMaskRect() {
        this.maskRect.forEach((item) => this.shapelayer.add(item));
        this.view.editor.state.showMask = true;
        this.view.canvasContainer.style.backgroundColor = '#555555';
    }
    clearMaskRect() {
        this.maskRect && this.maskRect.forEach((item) => item.remove());
        this.view.editor.state.showMask = false;
        this.view.canvasContainer.style.backgroundColor = '#aaaaaa';
    }
    finishDraw() {
        this.view.editor.state.helpLineVisible = false;
        this.view.setMode(MODETYPE.edit);
        this.finish = true;
        // this.view.setDrawingState(false);

        this.updateShapeColor();
        // this.view.addShape(this, !this._fromJson);
        this.updateLabelPosition();
        this.updateDistanceText();
        // this._label.visible(false);
        if (!this._fromJson) {
            this.view.unSelectAll();
            this.selectShape(true);
            this.view._clearMulSelection();
            this.view._addMulSelectionItem(this);
        }
        console.log('finish draw :', this);
    }

    removeAnchor(anchor) {
        console.log(anchor);
        // this.helplayer.children.forEach((item) => {
        //     if (item._id == anchor._id) {
        //         item.destroy();
        //     }
        // });
        // const index = this.circles.findIndex((item) => item._id == anchor._id);
        // this.circles[index].destroy();
        // this.circles.splice(index, 1);
        const currentTool = this.view.toolmanager.currentTool;
        const circles = currentTool.circles;
        const index = circles.findIndex((item) => item._id == anchor._id);

        if (index == 0) {
            // this.view.activeAnchor = null;
            return;
        }

        circles[index].destroy();
        circles.splice(index, 1);

        const clickSeq = currentTool.clickSeq;
        clickSeq.splice(index, 1);

        this.view.activeAnchor = null;
    }
}
