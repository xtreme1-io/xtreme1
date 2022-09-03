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
// 接口
import { identifyImage } from '/@/business/chengdu/api/aiTools';
import { message } from 'ant-design-vue';
import loadingImg from '/@/assets/loading.png';

export class InteractiveTool extends BaseTool {
    constructor(view) {
        super(view);
        this.poly = null;
        this.polygonPolyList = [];
        this.polygonPoly = null;
        // 修改名称 name
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
    // 取消绘制
    cancel() {
        // 取消请求
        if (this.isLoading) {
            this.cancelIdentify && this.cancelIdentify('Cancel Identify');
        }
        // 清除 poly
        this.clearPoly();
        // 清除 polygon
        this.clearPolygon();

        // 重置
        this.reset();
        console.log('Cancel Draw: ', this);
    }
    // 完成
    done() {
        if (this.name == 'interactive' && this.view.mode == MODETYPE.edit) {
            // 前置判断
            if (this.isLoading) {
                message.error('Please cancel identify first');
                return;
            }
            if (this.polygonPolyList.length == 0) {
                message.error('No results is detected');
                return;
            }
            // 清除 poly
            this.clearPoly();
            // 完成绘制
            this.addPolygon();
            // // TODO 埋点撤销撤回

            // 重置
            this.reset();
            console.log('Done Draw: ', this);
        }
    }
    // 清除矩形
    clearPoly() {
        if (this.poly) {
            this.offPoly();
            // 先清除 poly　上的　maskRect
            this.poly.clearMaskRect(); // 清除遮罩
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
    // 清除多边形
    clearPolygon() {
        // 清空备份
        this.polygonBackup.clear();
        // 遍历多边形列表
        this.polygonPolyList.forEach((polygon, index) => {
            console.log(polygon);
            // 取消鼠标样式
            this.offPolygon(polygon);
            // 清除多边形
            this.cancelPolygon(polygon);
            // 备份多边形数据
            this.polygonBackup.set(index, {
                points: polygon.points,
                interior: polygon.interior,
            });
        });
        // 然后置空
        this.polygonPolyList = [];
    }
    // 添加多边形
    addPolygon() {
        // 遍历多边形列表
        this.polygonPolyList.forEach((polygon) => {
            console.log(polygon);
            // 恢复 polygon 可拖拽
            polygon.hasAnchor = true;
            // 添加多边形
            polygon && polygon.shape && this.shapelayer.add(polygon.shape);
            // 取消鼠标样式
            this.offPolygon(polygon);
            // 选中
            polygon.selectShape(true);
            // 埋点撤销撤回 -- 先一个个的
            this.view.editor.cmdManager.execute('add-object', {
                uuid: polygon.uuid,
            });
            // // 添加数据
            // this.view.emit(Event.ADD_OBJECT, {
            //     data: {
            //         object: polygon,
            //     },
            // });
            // 弹出当前选中多边形的标签
            this.view.editor.emit(Event.SHOW_CLASS_INFO, {
                data: {
                    object: polygon,
                },
            });
        });
        // 然后置空
        this.polygonPolyList = [];
    }
    // 重置
    reset() {
        // 清除 loading -- 在识别时 -- 还要取消接口调用
        this.clearLoading();
        // 重置请求次数
        this.fetchCount = 0;
        // 重置点击
        this.defaultClickSeq = [];
        this.clickSeq = [];
        this.type = 'positive';
        // 重置取消上传
        this.cancelIdentify = null;
        // 设置为非绘制状态
        this.view.setDrawingState(false);
        // 恢复显示辅助线
        this.view.editor.state.helpLineVisible = true;
        // 设置为绘制模式
        this.view.setMode(MODETYPE.draw);
        // 设置为默认模式
        this.view.editor.state.status = StatusType.Default;
        // 重置 polygonBackup
        this.polygonBackup = new Map();
    }
    createShape(point) {
        if (!this.poly) {
            this.poly = new Interactive(this.view, {
                points: [point],
            });
            // NOTE 手动给 label 添加点击事件
            this.poly._label.getTag().on('click', () => {
                if (this.view.mode === MODETYPE.view) {
                    return;
                }
                if (this.isLoading) {
                    // 取消请求
                    this.cancelIdentify && this.cancelIdentify('Cancel Identify');
                } else {
                    // 先清空
                    this.clearPolygon();
                    // 再重新识别
                    this.getAiResult();
                }
            });
            this.poly.shape.dash([2, 2]);
        }
    }
    // 创建四个角的圆？
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
        // 添加点击事件
        circle.on('mousedown', (e) => {
            const anchor = e.target;
            console.log('Mousedown circle', anchor);
            anchor.radius(CONSTANT.ANCHORRADIUS * this._getScaleFactor() * 2);
            this.view.activeAnchor = anchor;
        });
        // 调整点的鼠标样式
        circle.on('mousemove', () => {
            this.view.updateCursor(CURSOR.move);
        });
        this.helplayer.add(circle);
        this.circles.forEach((item) => item.radius(CONSTANT.ANCHORRADIUS * this._getScaleFactor()));
        this.circles.push(circle);
        updateShapeScale(this.view); // 更新一下形状，防止点有白圈
    }
    // 清除圆点
    clearCircle() {
        this.circles.forEach((circle) => {
            circle.destroy();
        });
        this.circles = [];
    }
    // 鼠标点击
    mousedownHandler(e, point) {
        // 确定是鼠标左键按下
        if (e.evt.button > 0) return;

        // 绘制矩形框
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
                // 如果是同一个点直接返回
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
                // 在这里就要更新标签文字，才能在 finishDraw 里面去更新
                this.poly.btnText = 'Cancel';
                // 结束绘制的一系列操作 -- 这个方法在 base_shape 里
                this.poly.finishDraw();
                // 结束绘制后 调用识别
                this.getAiResult();
                // 设置矩形框的鼠标样式
                this.bindPoly();
                // this.poly = null;
                // 现在不置空了看后面是否可以调整
                // 绘制完矩形后, this.poly 已经被置空
                // 所以无法将创建 mask 的方法写在这个类里
                // 因为后续移动操作还要继续更新 mask

                this.clickCount = 0;
                this.first = null;
                this.last = null;
                this.clearCircle();
                // this.view.editor.state.status = StatusType.Default;
                this.view.emit(Event.DIMENSION_CHANGE_AFTER);
            }
        } else if (this.view.mode === MODETYPE.edit) {
            // 点击添加点逻辑 -- 与矩形框绘制点互斥

            // NOTE 这里将不可拖拽的方法写在点击事件里，防止某些地方导致可拖拽
            // 设置当前 poly 不可拖拽
            this.poly.shape.draggable(false);
            // 遍历多边形列表，禁止 polygonPoly 拖拽
            this.polygonPolyList.forEach((polygon) => {
                polygon.shape.draggable(false);
            });

            // 如果多边形存在，则可点击添加点 this.polygonPolyList.length > 0
            // 调整为判断请求
            // 调整为编辑模式下可点击，去掉了这里判断

            // 遍历判断点击的是否是同一个点
            const flag = this.circles.some((circle) => isEqualPoint(circle, point));
            if (flag) return;

            // 将点击的点转换为图像坐标
            const imgPoint = toImageCord(point, this.view.limitBbox);
            this.clickSeq.push({
                x: imgPoint.x,
                y: imgPoint.y,
                type: this.type,
            });

            // 根据 type 绘制点设置点的颜色
            const color = this.type != 'positive' ? '#ff0000' : '#00ff00';
            this.createCircle(point, color);

            // 重置 type， type 会在点击的时候更新
            this.type = 'positive';

            // 禁止选中多边形，手动将当前选中形状指定为 poly
            this.poly.selectShape(true);
        }
    }
    // 鼠标移动，目前仅用于矩形框绘制
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
        // 改变遮罩
        this.poly.handleDrawMask();
    }

    // 获取传参
    getIdentifyParams() {
        // 更新矩形框坐标 -------------------------
        const limitBbox = this.view.limitBbox;
        const points = this.poly.points;

        let { x: minX, y: minY, width: maxX, height: maxY } = limitBbox;
        maxX = minX + maxX;
        maxY = minY + maxY;

        // 获取矩形框坐标
        const newPoints = getMinMaxPoint(points, limitBbox);

        // 判断新的矩形框坐标范围 -- 超出图像区域报错
        const { x: x1, y: y1 } = newPoints[0];
        const { x: x2, y: y2 } = newPoints[1];
        if (x1 >= maxX || y1 >= maxY || x2 <= minX || y2 <= minY) {
            throw new Error('Detection error, please try again');
        }
        console.log(123);
        // 转换为图形坐标点
        const leftTop = toImageCord(newPoints[0], limitBbox);
        const rightBottom = toImageCord(newPoints[1], limitBbox);

        // 拼接数据
        const crop = [
            // 向上取整 left, 向下取整 right
            { x: Math.ceil(leftTop.x), y: Math.ceil(leftTop.y) },
            { x: Math.floor(rightBottom.x), y: Math.floor(rightBottom.y) },
        ];
        // END -------------------------

        // 更新 clickSeq，将 circles 转换为 clickSeq
        if (this.clickSeq.length > 0) {
            this.circles.forEach((item, index) => {
                const point = {
                    x: item.attrs.x,
                    y: item.attrs.y,
                };
                // 转换为图形坐标点
                const imgPoint = toImageCord(point, limitBbox);
                // 小数处理 -- 四舍五入
                imgPoint.x = Math.round(imgPoint.x);
                imgPoint.y = Math.round(imgPoint.y);
                // 更新点击点
                this.clickSeq[index] = Object.assign(this.clickSeq[index], imgPoint);
            });
        }
        // END -------------------------

        // 获取图像
        const state = this.view.editor.state;

        const params = {
            crop: crop,
            clickSeq: [...this.clickSeq],
            imgUrl: state.imageUrl,
        };

        return params;
    }

    // 获取识别结果
    async getAiResult() {
        try {
            this.isLoading = true;
            this.poly.btnText = 'Cancel';
            this.poly.updateLabelText();
            this.drawLoading();

            const params = this.getIdentifyParams();

            this.fetchCount++; // 请求次数自增，用于判断是否可点击添加点

            const res = await identifyImage(params, {
                // 取消上传
                cancelToken: new axios.CancelToken((cancel) => {
                    this.cancelIdentify = cancel;
                }),
            });

            // // 重新识别之前遍历清除之前的多边形
            // this.polygonPolyList.forEach((polygon) => {
            //     this.cancelPolygon(polygon);
            // });
            // // 然后置空
            // this.polygonPolyList = [];

            // 获取到识别结果
            this.getIdentifyResult(res.data);
        } catch (error) {
            message.error('Detection error, please try again');
            // 识别失败，则将之前的多边形重绘
            // 遍历创建多边形
            this.polygonBackup.forEach((item) => {
                const { points, interior } = item;
                this.createPolygon(points, interior);
            });
            // 创建完后，会显示 classInfo 弹窗，这里屏蔽掉
            this.view.editor.state.showClassView = false;
            // 创建完后，手动将当前选中形状指定为 poly
            this.poly.selectShape(true);
        }

        // 更新标签
        if (this.poly) {
            this.poly.btnText = 'Retry detection';
            this.poly.updateLabelText();
        }
        // 取消 loading
        this.clearLoading();
        // 重置取消上传
        this.cancelIdentify = null;
    }
    // 处理识别返回数据
    getIdentifyResult(result) {
        if (!this.isLoading) return;

        const { contour, hierarchy, clickSeq } = result;

        // 如果没有返回数据， 则抛出错误
        if (!contour || !hierarchy || hierarchy.length == 0 || contour.length == 0) {
            throw new Error('Detection error, please try again');
        }
        message.success(`${hierarchy.length} results are detected `);

        // 处理返回的多边形数据-- 每一项就是一个多边形
        const pointsList = contour.map((item) => {
            // item 是一个二维数组
            let pointArr = item.map((point) => {
                return { x: point[0], y: point[1] };
            });
            // 图片转画布
            return transformPoints(pointArr, this.view.limitBbox);
        });

        // 获取多边形对应的层级，最后一项为父子关系
        const indexList = hierarchy.map((item) => item[3]);

        // 处理为创建多边形需要的数据

        // 用于存放不同层级的多边形
        const pointsMap = new Map();
        // 根据多边形对应的层级 转换点
        indexList.forEach((item, index) => {
            // item 对应 indexList 的下标项
            // -- -1 代表外圈层，其它代表对应下标项为父级
            if (item == -1) {
                if (pointsMap.has(index)) {
                    // 如果有，则取值，更新 point
                    pointsMap.get(index).points.push(...pointsList[index]);
                } else {
                    // 如果没有，则初始化
                    const points = [...pointsList[index]];
                    const interior = [];
                    pointsMap.set(index, { points, interior });
                }
            } else {
                if (pointsMap.has(item)) {
                    // 如果有，则取值，更新 interior
                    pointsMap.get(item).interior.push({ points: [...pointsList[index]] });
                } else {
                    // 如果没有，则初始化
                    const points = [];
                    const interior = [{ points: [...pointsList[index]] }];
                    pointsMap.set(item, { points, interior });
                }
            }
        });
        // console.log('pointsMap', pointsMap);

        // 遍历创建多边形
        pointsMap.forEach((item) => {
            const { points, interior } = item;
            this.createPolygon(points, interior);
        });

        // 创建完后，会显示 classInfo 弹窗，这里屏蔽掉
        this.view.editor.state.showClassView = false;
        // 创建完后，手动将当前选中形状指定为 poly
        this.poly.selectShape(true);

        // 添加默认中点
        if (clickSeq) {
            // 这里的 clickSeq 和 circles 应该是空的
            // 先转换为画布坐标
            const imgClickSeq = transformPoints(
                [{ x: clickSeq.x, y: clickSeq.y }],
                this.view.limitBbox,
            );
            // 第一位
            this.clickSeq.unshift({
                x: clickSeq.x,
                y: clickSeq.y,
                type: clickSeq.type,
            });
            this.createCircle(imgClickSeq[0], '#00ff00');
        }
    }
    // 创建多边形 -- 传入外圈点、内圈点
    createPolygon(points, interior) {
        const polygonPoly = new Polygon(this.view, {
            points,
            interior,
        });
        // 闭合多边形
        this.closePolygon(polygonPoly);
        // 设置当前多边形禁止选中
        polygonPoly.hasAnchor = false;
        // 将默认选中多边形 取消
        polygonPoly.selectShape(false);
        // 设置当前多边形的鼠标样式
        this.bindPolygon(polygonPoly);

        // 创建完后，将多边形推入到多边形列表中
        this.polygonPolyList.push(polygonPoly);

        // 上面创建多边形将当前状态设置为了非绘制状态，所以这里需要手动设置为 绘制状态
        this.view.setDrawingState(true);
    }
    // 矩形框的鼠标样式
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
    // 去掉鼠标样式
    offPoly() {
        if (this.poly) {
            this.poly.shape.off('mouseover');
            this.poly.shape.off('mouseout');
            this.poly.bindDragEvent();
            this.view.updateCursor(CURSOR.auto);
        }
    }
    // 多边形的鼠标样式
    bindPolygon(polygonPoly) {
        polygonPoly.shape.on('contextmenu', (e) => {
            e.evt.preventDefault();
        });
        // 更改鼠标样式
        polygonPoly.shape.on('mouseover', () => {
            this.view.updateCursor(CURSOR.negative);
        });
        polygonPoly.shape.on('mouseout', () => {
            this.view.updateCursor(CURSOR.auto);
        });
        // 点击事件
        polygonPoly.shape.on('mousedown', (e) => {
            // 确定是鼠标左键按下
            if (e.evt.button > 0) return;
            this.type = 'negative';
        });
    }
    // 去掉鼠标样式
    offPolygon(polygonPoly) {
        if (polygonPoly) {
            polygonPoly.shape.off('mousedown');
            polygonPoly.shape.off('mouseover');
            polygonPoly.shape.off('mouseout');
            polygonPoly.bindDragEvent();
            this.view.updateCursor(CURSOR.auto);
        }
    }
    // 传入多边形，结束绘制多边形
    closePolygon(polygonPoly) {
        if (polygonPoly && polygonPoly.canClose()) {
            polygonPoly.closeShape();
            // polygonPoly = null;
        }
    }
    // 传入多边形，清除 -- 方法同 polygon_tool.js 中一致
    cancelPolygon(polygonPoly) {
        if (polygonPoly) {
            this.view.emit(Event.DIMENSION_CHANGE_AFTER);
            polygonPoly.destroy();
            polygonPoly = null;
        }
    }
    // 绘制 loading
    drawLoading() {
        // this.view.setMode(MODETYPE.view);
        const points = this.poly.points;

        // 鼠标坐标、矩形框坐标
        let { x: x1, y: y1 } = points[0]; // 左上角
        let { x: x2, y: y2 } = points?.[2] ?? points[0]; // 右下角

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
    // 清除 loading
    clearLoading() {
        this.isLoading = false;
        // this.view.setMode(MODETYPE.draw);

        const loading = this.helplayer.find('.loading');
        loading.length > 0 && loading[0].destroy();
    }
}
