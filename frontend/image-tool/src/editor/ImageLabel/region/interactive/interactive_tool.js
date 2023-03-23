import Konva from 'konva';
import axios from 'axios';
import { BaseTool } from '../base/base_tool.js';
import { Interactive } from './interactive_shape.js';
import { Polygon } from '../polygon/polygon_shape.js';
import {
    calculateRectPoints,
    isEqualPoint,
    MODETYPE,
    CONSTANT,
    createAnchor,
    updateShapeScale,
    toImageCord,
    transformPoints,
    CURSOR,
    getMinMaxPoint,
    getInteractivePoint,
} from '../../util';
import { config } from '../../config';
import { StatusType } from '../../../type';
import Event from '../../../config/event';
import { identifyImage } from '/@/business/chengdu/api/aiTools';
import { message } from 'ant-design-vue';
import loadingImg from '/@/assets/loading.png';

export class InteractiveTool extends BaseTool {
    constructor(view) {
        super(view);
        this.poly = null;
        this.polygonPolyList = [];
        this.polygonPoly = null;
        this.name = 'interactive';
        this.first = null;
        this.last = null;
        this.circles = [];
        this.clickCount = 0;
        this.isLoading = false;
        this.clickSeq = [];
        this.defaultClickSeq = [];
        this.type = 'positive';
        this.cancelIdentify = null;
        this.fetchCount = 0;
        this.polygonBackup = new Map();
    }
    back() {
        this?.view?.editor.showMsg('error', 'No record yet');
    }
    cancel() {
        if (this.isLoading) {
            this.cancelIdentify && this.cancelIdentify('Cancel Identify');
        }
        this.clearPoly();
        this.clearPolygon();
        this.reset();
        console.log('Cancel Draw: ', this);
    }
    done() {
        if (this.name == 'interactive' && this.view.mode == MODETYPE.edit) {
            if (this.isLoading) {
                message.error('Please cancel identify first');
                return;
            }
            if (this.polygonPolyList.length == 0) {
                message.error('No results is detected');
                return;
            }
            this.clearPoly();
            this.addPolygon();

            this.reset();
            console.log('Done Draw: ', this);
        }
    }
    clearPoly() {
        if (this.poly) {
            this.offPoly();
            this.poly.clearMaskRect();
            this.poly.destroy();
            this.poly = null;
            this.clickCount = 0;
            this.first = null;
            this.last = null;
            this.circles.forEach((circle) => {
                circle.destroy();
            });
            this.circles = [];
            this.view.editor.state.status = StatusType.Default;
            this.view.emit(Event.DIMENSION_CHANGE_AFTER);
        }
    }
    clearPolygon() {
        this.polygonBackup.clear();
        this.polygonPolyList.forEach((polygon, index) => {
            console.log(polygon);
            this.offPolygon(polygon);
            this.cancelPolygon(polygon);
            this.polygonBackup.set(index, {
                points: polygon.points,
                interior: polygon.interior,
            });
        });
        this.polygonPolyList = [];
    }
    addPolygon() {
        this.polygonPolyList.forEach((polygon) => {
            console.log(polygon);
            polygon.hasAnchor = true;
            polygon && polygon.shape && this.shapelayer.add(polygon.shape);
            this.offPolygon(polygon);
            polygon.selectShape(true);
            this.view.editor.cmdManager.execute('add-object', this.toJSON());
            this.view.editor.emit(Event.SHOW_CLASS_INFO, {
                data: {
                    object: polygon,
                },
            });
        });
        this.polygonPolyList = [];
    }
    reset() {
        this.clearLoading();
        this.fetchCount = 0;
        this.defaultClickSeq = [];
        this.clickSeq = [];
        this.type = 'positive';
        this.cancelIdentify = null;
        this.view.setDrawingState(false);
        this.view.editor.state.helpLineVisible = true;
        this.view.setMode(MODETYPE.draw);
        this.view.editor.state.status = StatusType.Default;
        this.polygonBackup = new Map();
    }
    createShape(point) {
        if (!this.poly) {
            this.poly = new Interactive(this.view, {
                points: [point],
            });
            this.poly._label.getTag().on('click', () => {
                if (this.view.mode === MODETYPE.view) {
                    return;
                }
                if (this.isLoading) {
                    this.cancelIdentify && this.cancelIdentify('Cancel Identify');
                } else {
                    this.clearPolygon();
                    this.getAiResult();
                }
            });
            this.poly.shape.dash([2, 2]);
        }
    }
    createCircle(point, color) {
        let circle = createAnchor({
            radius: CONSTANT.ANCHORRADIUS * this._getScaleFactor(),
            x: point.x,
            y: point.y,
            fill: color,
            name: CONSTANT.HELPNAME + ' ' + CONSTANT.ANCHORNAME,
            stroke: config.defaultCorlor,
            draggable: false,
        });
        circle.on('mousedown', (e) => {
            const anchor = e.target;
            console.log('Mousedown circle', anchor);
            anchor.radius(CONSTANT.ANCHORRADIUS * this._getScaleFactor() * 2);
            this.view.activeAnchor = anchor;
        });
        circle.on('mousemove', () => {
            this.view.updateCursor(CURSOR.move);
        });
        this.helplayer.add(circle);
        this.circles.forEach((item) => item.radius(CONSTANT.ANCHORRADIUS * this._getScaleFactor()));
        this.circles.push(circle);
        updateShapeScale(this.view);
    }
    clearCircle() {
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
            }
            updateShapeScale(this.view);
            this.clickCount++;
            if (this.clickCount === 2) {
                console.log(this.first, this.last);
                let points = calculateRectPoints(this.first, this.last, 0, 0);
                points = getInteractivePoint(points);
                this.poly.setPoints(points);
                this.poly.shape.dash([]);
                this.poly.btnText = 'Cancel';
                this.poly.finishDraw();
                this.getAiResult();
                this.bindPoly();
                // this.poly = null;

                this.clickCount = 0;
                this.first = null;
                this.last = null;
                this.clearCircle();
                // this.view.editor.state.status = StatusType.Default;
                this.view.emit(Event.DIMENSION_CHANGE_AFTER);
            }
        } else if (this.view.mode === MODETYPE.edit) {
            this.poly.shape.draggable(false);
            this.polygonPolyList.forEach((polygon) => {
                polygon.shape.draggable(false);
            });

            const flag = this.circles.some((circle) => isEqualPoint(circle, point));
            if (flag) return;

            const imgPoint = toImageCord(point, this.view.limitBbox);
            this.clickSeq.push({
                x: imgPoint.x,
                y: imgPoint.y,
                type: this.type,
            });

            const color = this.type != 'positive' ? '#ff0000' : '#00ff00';
            this.createCircle(point, color);

            this.type = 'positive';

            this.poly.selectShape(true);
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
        this.poly.handleDrawMask();
    }

    getIdentifyParams() {
        const limitBbox = this.view.limitBbox;
        const points = this.poly.points;

        let { x: minX, y: minY, width: maxX, height: maxY } = limitBbox;
        maxX = minX + maxX;
        maxY = minY + maxY;

        const newPoints = getMinMaxPoint(points, limitBbox);

        const { x: x1, y: y1 } = newPoints[0];
        const { x: x2, y: y2 } = newPoints[1];
        if (x1 >= maxX || y1 >= maxY || x2 <= minX || y2 <= minY) {
            throw new Error('Detection error, please try again');
        }
        console.log(123);
        const leftTop = toImageCord(newPoints[0], limitBbox);
        const rightBottom = toImageCord(newPoints[1], limitBbox);

        const crop = [
            { x: Math.ceil(leftTop.x), y: Math.ceil(leftTop.y) },
            { x: Math.floor(rightBottom.x), y: Math.floor(rightBottom.y) },
        ];
        // END -------------------------

        if (this.clickSeq.length > 0) {
            this.circles.forEach((item, index) => {
                const point = {
                    x: item.attrs.x,
                    y: item.attrs.y,
                };
                const imgPoint = toImageCord(point, limitBbox);
                imgPoint.x = Math.round(imgPoint.x);
                imgPoint.y = Math.round(imgPoint.y);
                this.clickSeq[index] = Object.assign(this.clickSeq[index], imgPoint);
            });
        }
        // END -------------------------

        const state = this.view.editor.state;

        const params = {
            crop: crop,
            clickSeq: [...this.clickSeq],
            imgUrl: state.imageUrl,
        };

        return params;
    }

    async getAiResult() {
        try {
            this.isLoading = true;
            this.poly.btnText = 'Cancel';
            this.poly.updateLabelText();
            this.drawLoading();

            const params = this.getIdentifyParams();

            this.fetchCount++;

            const res = await identifyImage(params, {
                cancelToken: new axios.CancelToken((cancel) => {
                    this.cancelIdentify = cancel;
                }),
            });

            this.getIdentifyResult(res.data);
        } catch (error) {
            message.error('Detection error, please try again');
            this.polygonBackup.forEach((item) => {
                const { points, interior } = item;
                this.createPolygon(points, interior);
            });
            this.view.editor.state.showClassView = false;
            this.poly.selectShape(true);
        }

        if (this.poly) {
            this.poly.btnText = 'Retry detection';
            this.poly.updateLabelText();
        }
        this.clearLoading();
        this.cancelIdentify = null;
    }
    getIdentifyResult(result) {
        if (!this.isLoading) return;

        const { contour, hierarchy, clickSeq } = result;

        if (!contour || !hierarchy || hierarchy.length == 0 || contour.length == 0) {
            throw new Error('Detection error, please try again');
        }
        message.success(`${hierarchy.length} results are detected `);

        const pointsList = contour.map((item) => {
            let pointArr = item.map((point) => {
                return { x: point[0], y: point[1] };
            });
            return transformPoints(pointArr, this.view.limitBbox);
        });

        const indexList = hierarchy.map((item) => item[3]);

        const pointsMap = new Map();
        indexList.forEach((item, index) => {
            if (item == -1) {
                if (pointsMap.has(index)) {
                    pointsMap.get(index).points.push(...pointsList[index]);
                } else {
                    const points = [...pointsList[index]];
                    const interior = [];
                    pointsMap.set(index, { points, interior });
                }
            } else {
                if (pointsMap.has(item)) {
                    pointsMap.get(item).interior.push({ points: [...pointsList[index]] });
                } else {
                    const points = [];
                    const interior = [{ points: [...pointsList[index]] }];
                    pointsMap.set(item, { points, interior });
                }
            }
        });

        pointsMap.forEach((item) => {
            const { points, interior } = item;
            this.createPolygon(points, interior);
        });

        this.view.editor.state.showClassView = false;
        this.poly.selectShape(true);

        if (clickSeq) {
            const imgClickSeq = transformPoints(
                [{ x: clickSeq.x, y: clickSeq.y }],
                this.view.limitBbox,
            );
            this.clickSeq.unshift({
                x: clickSeq.x,
                y: clickSeq.y,
                type: clickSeq.type,
            });
            this.createCircle(imgClickSeq[0], '#00ff00');
        }
    }
    createPolygon(points, interior) {
        const polygonPoly = new Polygon(this.view, {
            points,
            interior,
        });
        this.closePolygon(polygonPoly);
        polygonPoly.hasAnchor = false;
        polygonPoly.selectShape(false);
        this.bindPolygon(polygonPoly);

        this.polygonPolyList.push(polygonPoly);

        this.view.setDrawingState(true);
    }
    bindPoly() {
        this.poly.shape.on('contextmenu', (e) => {
            e.evt.preventDefault();
        });
        this.poly.shape.on('mouseover', () => {
            this.view.updateCursor(CURSOR.positive);
        });
        this.poly.shape.on('mouseout', () => {
            this.view.updateCursor(CURSOR.auto);
        });
    }
    offPoly() {
        if (this.poly) {
            this.poly.shape.off('mouseover');
            this.poly.shape.off('mouseout');
            this.poly.bindDragEvent();
            this.view.updateCursor(CURSOR.auto);
        }
    }
    bindPolygon(polygonPoly) {
        polygonPoly.shape.on('contextmenu', (e) => {
            e.evt.preventDefault();
        });
        polygonPoly.shape.on('mouseover', () => {
            this.view.updateCursor(CURSOR.negative);
        });
        polygonPoly.shape.on('mouseout', () => {
            this.view.updateCursor(CURSOR.auto);
        });
        polygonPoly.shape.on('mousedown', (e) => {
            if (e.evt.button > 0) return;
            this.type = 'negative';
        });
    }
    offPolygon(polygonPoly) {
        if (polygonPoly) {
            polygonPoly.shape.off('mousedown');
            polygonPoly.shape.off('mouseover');
            polygonPoly.shape.off('mouseout');
            polygonPoly.bindDragEvent();
            this.view.updateCursor(CURSOR.auto);
        }
    }
    closePolygon(polygonPoly) {
        if (polygonPoly && polygonPoly.canClose()) {
            polygonPoly.closeShape();
        }
    }
    cancelPolygon(polygonPoly) {
        if (polygonPoly) {
            this.view.emit(Event.DIMENSION_CHANGE_AFTER);
            polygonPoly.destroy();
            polygonPoly = null;
        }
    }
    drawLoading() {
        // this.view.setMode(MODETYPE.view);
        const points = this.poly.points;

        let { x: x1, y: y1 } = points[0];
        let { x: x2, y: y2 } = points?.[2] ?? points[0];

        x1 > x2 && ([x1, x2] = [x2, x1]);
        y1 > y2 && ([y1, y2] = [y2, y1]);

        const width = x2 - x1;
        const height = y2 - y1;

        const loadingWidth = Math.min(Math.min(width, height) / 2, 50);
        const loadingX = (x1 + x2) / 2;
        const loadingY = (y1 + y2) / 2;

        const imageObj = new Image();
        imageObj.src = loadingImg;
        const loadingShape = new Konva.Image({
            name: 'loading',
            x: loadingX,
            y: loadingY,
            width: loadingWidth,
            height: loadingWidth,
            image: imageObj,
            offset: {
                x: loadingWidth / 2,
                y: loadingWidth / 2,
            },
        });

        this.helplayer.add(loadingShape);

        const angularSpeed = 300;
        const anim = new Konva.Animation(function (frame) {
            var angleDiff = (frame.timeDiff * angularSpeed) / 1000;
            loadingShape.rotate(angleDiff);
        }, this.helplayer);

        anim.start();
    }
    clearLoading() {
        this.isLoading = false;
        // this.view.setMode(MODETYPE.draw);

        const loading = this.helplayer.find('.loading');
        loading.length > 0 && loading[0].destroy();
    }
}
