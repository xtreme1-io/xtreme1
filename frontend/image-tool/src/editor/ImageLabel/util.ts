import { ImageLabel } from './index';
import { IDim } from './../type';
import { config } from './config';
import Konva from 'konva';
import pointInPolygon from 'point-in-polygon';
import { Polygon } from './region/polygon/polygon_shape';
import positiveImg from '../../assets/positive.svg';
import negativeImg from '../../assets/negative.svg';
// import throttle  from 'lodash.throttle';
// import I18n from './i18n';
// import { difference } from 'polygon-clipping';
import { IPoint } from '../type';
export const SHAPENAME = 'shape';
export const POINTNAME = 'point';
export const POINTNAMESELECTOR = '.point';
export const SHAPESELCTOR = '.shape';
export const HELPNAME = 'help';
export const HELPSELECTOR = '.help';
export const LABELNAME = 'label';
export const LABELSELECTOR = '.label';
export const SHAPELABELHELPNAME = '.shape, .label, .help, .icon';
export const SELECTEDNAME = 'selected';
export const HIGHLIGHTEDNAME = 'highlighted';
export const HIGHLIGHTEDSELECTOR = '.highlighted';
export const SELECTEDSELECTOR = '.selected';
export const ANCHORNAME = 'anchor';
export const ICONNAME = 'icon';
export const ANCHORSELECTOR = '.anchor';
export const SHAPEANCHORSELECTOR = '.shape, .anchor';
export const SOURCETYPE = {
    IMAGE: 'image',
};
export const MODETYPE = {
    draw: 'draw',
    view: 'view',
    edit: 'edit',
    comment: 'comment',
};
export const CURSOR = {
    auto: 'auto',
    move: 'move',
    pointer: 'pointer',
    none: 'none',
    grab: 'garb',
    grabbing: 'grabbing',
    ewResize: 'ew-resize',
    nsResize: 'ns-resize',
    positive: `url(${positiveImg}), auto`,
    negative: `url(${negativeImg}), auto`,
    // comment: `url(${markerCursor}), pointer`,
};
// export const ERRORICONSIZE = 12;
export const ICONSIZE = {
    markerIcon: 18,
    labelIcon: 18,
};
export const ICONTYPE = {
    markerIcon: 'markerIcon',
    labelIcon: 'labelIcon',
};
export const SENCETYPE = {
    execute: 'execute',
    audit: 'audit',
    update: 'update',
    preview: 'preview',
    view: 'view',
};
// export const ANCHORRADIUS = 2;
// export const ANCHORHOVERRADIUS = 3;
// export const STROKEWIDTH = 1.5;
// export const HITSTROKEWIDTH = 3;
// export const INVALIDFILLCOLOR = 'rgb(255, 0, 0)';
// export const SELECTEDCOLOR = 'red';
// export const ANCHORFILL = '#fff000';
// export const MIDANCHORFILL = 'red';
// export const FONTSIZE = 12;

export const CONSTANT = {
    SHAPENAME,
    SHAPESELCTOR,
    HELPNAME,
    HELPSELECTOR,
    LABELNAME,
    LABELSELECTOR,
    SHAPELABELHELPNAME,
    SELECTEDNAME,
    SELECTEDSELECTOR,
    HIGHLIGHTEDNAME,
    HIGHLIGHTEDSELECTOR,
    ANCHORNAME,
    ANCHORSELECTOR,
    SOURCETYPE,
    MODETYPE,
    ANCHORRADIUS: 2.5,
    ANCHORHOVERRADIUS: 3.5,
    STROKEWIDTH: 1,
    HITSTROKEWIDTH: 2,
    INVALIDFILLCOLOR: 'rgb(255, 0, 0)',
    SELECTEDCOLOR: '#ff00e2',
    HIGHLIGHTCOLOR: '#ff00e2',
    ANCHORFILL: '#fff',
    SELECTORANCHORSTROKE: '#fff',
    SELECTORANCHORFILL: '#00a7f0',
    MIDANCHORFILL: 'red',
    FONTSIZE: 12,
};
export const BackgroundColor = '#F2F5FA';
export const ISMAC = /mac/gi.test(navigator.platform);
// window.CONSTANT = CONSTANT;
export const MaskShapeTypes = ['polygon', 'rectangle'];
export const KeyCodeMap = {
    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    COLON_59: 59,
    ESC: 27,
    ALT: 18,
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,
    COLON_186: 186,
    EQUAL: 187,
    MINUS: 189,
    BACKQUOTE: 192,
    Slash: 191,
    BACKSPACE: 8,
    DEL: 46,
    BracketLeft: 219,
    BracketRight: 221,
    TAB: 9,
    CTRL: 17,
    ENTER: 13,
    ZERO: 48,
    ONE: 49,
    TWO: 50,
    THREE: 51,
    FOUR: 52,
    FIVE: 53,
    SIX: 54,
    SEVEN: 55,
    EIGHT: 56,
    NINE: 57,
    NUM_0: 96,
    NUM_1: 97,
    NUM_2: 98,
    NUM_3: 99,
    NUM_4: 100,
    NUM_5: 101,
    NUM_6: 102,
    NUM_7: 103,
    NUM_8: 104,
    NUM_9: 105,
    PAGEUP: 33,
    PAGEDOWN: 34,
};
export function getBoudingBox(points: [IPoint]) {
    let minX = Number.MAX_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;
    let maxX = 0;
    let maxY = 0;
    for (let v of points) {
        minX = Math.min(minX, v.x);
        minY = Math.min(minY, v.y);
        maxX = Math.max(maxX, v.x);
        maxY = Math.max(maxY, v.y);
    }
    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
}
export function getArea(points: IPoint[]) {
    let l = points.length;
    let area = 0;
    points = points.concat(points[0]);
    let s = 0;
    for (var i = 0; i < l; i++) {
        s += points[i].x * points[i + 1].y - points[i].y * points[i + 1].x;
    }
    area = Math.abs(s / 2);
    return area;
}
// 两点间距离，按缩放比例转换到原图上
export function getDistance(p0: IPoint, p1: IPoint, zoom = 1) {
    let dis = Math.sqrt(Math.pow(p0.x - p1.x, 2) + Math.pow(p0.y - p1.y, 2));
    return dis / zoom; //转为图片中的距离
}

// 计算一组点的折线长度
export function getLineLength(points: IPoint[], zoom: number) {
    let ret = 0;
    let length = points.length;
    if (length < 2) return ret;
    for (let i = 1; i < length; i++) {
        ret = ret + getDistance(points[i - 1], points[i], zoom);
    }
    return ret;
}

// 暂时没用
export function getEqualDiversionPoint(points: IPoint[], share: number) {
    let length = getLineLength(points);
    let num = points.length;
    let step = length / share;
    let cur_span = step;
    let result = [points[0]];
    let x1 = points[0].x;
    let y1 = points[0].y;
    for (let i = 1; i < num; i++) {
        let x2 = points[i].x;
        let y2 = points[i].y;
        while (true) {
            let cur_distance = getDistance({ x: x1, y: y1 }, { x: x2, y: y2 });
            if (cur_distance >= cur_span) {
                let x = ((x2 - x1) * cur_span) / cur_distance + x1;
                let y = ((y2 - y1) * cur_span) / cur_distance + y1;
                result.push({
                    x,
                    y,
                });
                x1 = x;
                y1 = y;
                cur_span = step;
            } else {
                x1 = x2;
                y1 = y2;
                cur_span = cur_span - cur_distance;
                break;
            }
        }
    }
    // result.push(points[num - 1]);
    return result;
}

// 旋转一个点
// params 旋转角度，要旋转的点，参考点
export function rotatePoint(alpha: number, point: IPoint, base: IPoint) {
    let cosa = Math.cos(alpha);
    let sina = Math.sin(alpha);
    return {
        x: (point.x - base.x) * cosa - (point.y - base.y) * sina + base.x,
        y: (point.x - base.x) * sina + (point.y - base.y) * cosa + base.y,
    };
}

// 创建drag的点
export function createAnchor(opt: Konva.CircleConfig) {
    return new Konva.Circle({
        ...opt,
    });
}

// 取两点间的中间点
export function getMidPoints(points: IPoint[] = [], boundary: boolean = false) {
    let i = 0,
        len = points.length,
        midPoint = {},
        result = [];
    for (; i < len - 1; i++) {
        midPoint = {
            x: (points[i].x + points[i + 1].x) / 2,
            y: (points[i].y + points[i + 1].y) / 2,
        };
        result.push(midPoint);
    }
    if (boundary) {
        midPoint = {
            x: (points[0].x + points[i].x) / 2,
            y: (points[0].y + points[i].y) / 2,
        };
        result.push(midPoint);
    }
    return result;
}

// 由任意的两个点 生成矩形上的四个点
export function getRectPoints(p1: IPoint, p2: IPoint) {
    let width = Math.abs(p1.x - p2.x);
    let height = Math.abs(p1.y - p2.y);
    let minX = Math.min(p1.x, p2.x);
    let minY = Math.min(p1.y, p2.y);
    return [
        {
            x: minX,
            y: minY,
        },
        {
            x: minX + width,
            y: minY,
        },
        {
            x: minX + width,
            y: minY + height,
        },
        {
            x: minX,
            y: minY + height,
        },
    ];
}
// 有中心点 宽高的矩形四坐标点
export function getRectPointsByCenterAndWH(
    center: IPoint,
    width: number,
    height: number,
    bbox: IDim,
    limit: boolean,
) {
    let halfwidth = width / 2;
    let halfheight = height / 2;
    if (limit) {
        if (center.x - halfwidth < bbox.x) {
            center.x = bbox.x + halfwidth;
        }
        if (center.y - halfheight < bbox.y) {
            center.y = bbox.y + halfheight;
        }
        if (center.x + halfwidth > bbox.width + bbox.x) {
            center.x = bbox.width + bbox.x - halfwidth;
        }
        if (center.y + halfheight > bbox.height + bbox.y) {
            center.y = bbox.height + bbox.y - halfheight;
        }
    }
    return [
        {
            x: center.x - halfwidth,
            y: center.y - halfheight,
        },
        {
            x: center.x + halfwidth,
            y: center.y - halfheight,
        },
        {
            x: center.x + halfwidth,
            y: center.y + halfheight,
        },
        {
            x: center.x - halfwidth,
            y: center.y + halfheight,
        },
    ];
}
// 暂时不关注
export function fixRectsCenter(
    center: IPoint,
    limitBbox: IDim,
    rectWidth: number,
    rectHeight: number,
    limit = true,
) {
    if (!limit) {
        return center;
    }
    let imageWidth = limitBbox.width;
    let imageHeight = limitBbox.height;
    let halfRectWidth = rectWidth / 2;
    let halfRectHeight = rectHeight / 2;
    if (center.x < halfRectWidth) {
        center.x = halfRectWidth;
    } else if (center.x + halfRectWidth - imageWidth > 0) {
        center.x = imageWidth - halfRectWidth;
    }

    if (center.y < halfRectHeight) {
        center.y = halfRectHeight;
    } else if (center.y + halfRectHeight - imageHeight > 0) {
        center.y = imageHeight - halfRectHeight;
    }
    return center;
}
// 限制点在画布区域内，点位格式化方法
export function fixedPointPositionIfNeed(point: IPoint, bbox: IDim, limit = true) {
    if (!limit) return point;
    if (point.x < bbox.x) {
        point.x = bbox.x;
    }
    if (point.y < bbox.y) {
        point.y = bbox.y;
    }
    if (point.x > bbox.width + bbox.x) {
        point.x = bbox.width + bbox.x;
    }
    if (point.y > bbox.height + bbox.y) {
        point.y = bbox.height + bbox.y;
    }
    return point;
}
//by wuhao@basicfinder.com
export function calculateRectPoints(p0: IPoint, p2: IPoint, angle: number, index: number) {
    if (!(p0 && p2)) {
        return;
    }
    let result: IPoint[] = [];
    let w = p2.x - p0.x;
    let h = p2.y - p0.y;
    let cosa = Math.cos((angle / 180) * Math.PI);
    let sina = Math.sin((angle / 180) * Math.PI);
    let p1 = {
        x: w * cosa * cosa + h * sina * cosa + p0.x,
        y: w * cosa * sina + h * sina * sina + p0.y,
    };
    let p3 = {
        x: w * sina * sina - h * sina * cosa + p0.x,
        y: -w * cosa * sina + h * cosa * cosa + p0.y,
    };
    switch (index) {
        case 0:
            result = [p0, p1, p2, p3];
            break;
        case 1:
            result = [p1, p0, p3, p2];
            break;
        case 2:
            result = [p2, p3, p0, p1];
            break;
        case 3:
            result = [p3, p2, p1, p0];
            break;
    }
    return [...result];
}
// 先判断是否是顺时针  如果是逆时针 第二 四个点 对换
// 针对rect 类型
function clockWise(points: IPoint[]) {
    points = points.slice();
    let sum = 0;
    let i, l;
    for (i = 0, l = points.length - 1; i < l; i++) {
        sum += (points[i + 1].x - points[i].x) * (points[i + 1].y + points[i].y);
    }
    sum += (points[0].x - points[i].x) * (points[0].y + points[i].y);
    if (sum > 0) {
        // 逆时针的时候调整顺序
        let last = points[1];
        points[1] = points[3];
        points[3] = last;
    }
    return points;
}
// 暂时不用
export function sortPolygonPointClockwise(pointsArr: IPoint[], angle = 0) {
    // angle 表示倾斜角度 大于0 向右  小于0 向左

    // 排序后的点顺序 见 asset/rect-points-order.png
    let points = pointsArr.slice() as IPoint[];
    let center = getPolygonCenter(points);
    points.forEach((a, i) => {
        a.angle = Math.atan2(a.y - center.y, a.x - center.x);
        a.index = i;
    });
    points.sort((a, b) => {
        return (a.angle as number) - (b.angle as number);
    });
    // 以上顺时针排序
    // 以下找到左上角的坐标
    // 找出最小的
    let minIndex: number | undefined = -1;
    // 向左倾斜 按x坐标 向右倾斜 按y坐标排序
    let pointscopy = points.slice().sort((a, b) => {
        return angle >= 0 ? a.y - b.y : a.x - b.x;
    });

    let minYPoint = pointscopy[0];
    let minYPoint2 = pointscopy[1];
    if (angle >= 0) {
        // 向右倾斜 或非倾斜框
        if (minYPoint.y === minYPoint2.y) {
            if (minYPoint.x < minYPoint2.x) {
                minIndex = minYPoint.index;
            } else {
                minIndex = minYPoint2.index;
            }
        } else {
            minIndex = minYPoint.index;
        }
    } else {
        // 向左倾斜
        if (minYPoint.x === minYPoint2.x) {
            if (minYPoint.y < minYPoint2.y) {
                minIndex = minYPoint.index;
            } else {
                minIndex = minYPoint2.index;
            }
        } else {
            minIndex = minYPoint.index;
        }
    }
    let result = pointsArr.slice(minIndex);
    return clockWise(result.concat(pointsArr.slice(0, minIndex)));
}
// 获取逻辑中心点
export function getPolygonCenter(points: IPoint[]) {
    return {
        x:
            points.reduce(
                (a, b) => {
                    a.x += b.x;
                    return a;
                },
                {
                    x: 0,
                },
            ).x / points.length,
        y:
            points.reduce(
                (a, b) => {
                    a.y += b.y;
                    return a;
                },
                {
                    y: 0,
                },
            ).y / points.length,
    };
}
// 盒子限制区域
export function limitInBBoxIfNeed(
    curPosition: IPoint,
    limitBbox: IDim,
    rect: IDim,
    limit: boolean,
) {
    if (!limit) {
        return curPosition;
    }
    if (rect.x + curPosition.x < limitBbox.x) {
        curPosition.x = limitBbox.x - rect.x;
    }
    if (rect.x + curPosition.x + rect.width > limitBbox.x + limitBbox.width) {
        curPosition.x = limitBbox.x + limitBbox.width - rect.x - rect.width;
    }
    if (rect.y + curPosition.y < limitBbox.y) {
        curPosition.y = limitBbox.y - rect.y;
    }
    if (rect.y + curPosition.y + rect.height > limitBbox.y + limitBbox.height) {
        curPosition.y = limitBbox.y + limitBbox.height - rect.y - rect.height;
    }
    return curPosition;
}
// 是不是同一个点
export function isEqualPoint(p1: IPoint, p2: IPoint) {
    return Math.abs(p1.x - p2.x) < Number.EPSILON && Math.abs(p1.y - p2.y) < Number.EPSILON;
}

export function isEuqalFloatNumber(a: number, b: number) {
    return Math.abs(a - b) < Number.EPSILON;
}
export function isGreatOrEqual(a: number, b: number) {
    return isEuqalFloatNumber(a, b) || a > b;
}
export function isLessOrEqual(a: number, b: number) {
    return isEuqalFloatNumber(a, b) || a < b;
}
// 设置颜色
export function setColorAlpha(color: string, alpha = 1) {
    let colorObj = Konva.Util.getRGB(color);
    return `rgba(${colorObj.r},${colorObj.g},${colorObj.b},${alpha})`;
}
// 获取缩放比例
export function getScaleFactor(view: ImageLabel) {
    return 1 / ((view && view.scalefactor) || 1);
}
// 兼容处理画布上图形的比例
export function updateShapeScale(view: ImageLabel) {
    // 乘以画布缩放的倒数 保持图形和文本在不同的缩放等级保持一致
    let shapes = view.Stage.find(SHAPELABELHELPNAME);
    let scale = getScaleFactor(view);
    shapes.forEach((shape: Konva.Shape) => {
        // 图形
        if (shape.hasName(SHAPENAME) || shape.hasName(HELPNAME)) {
            let strokeWidth = shape.hasName('bisectrixline') ? 1 : CONSTANT.STROKEWIDTH;
            if (shape.hasStroke()) {
                shape.strokeWidth(strokeWidth * scale);
                shape.hitStrokeWidth(CONSTANT.HITSTROKEWIDTH * scale);
            }
            if (shape.hasName(ANCHORNAME) || shape.hasName(POINTNAME)) {
                // 排除 circler 类型
                !shape.hasName('circler') && shape.radius(CONSTANT.ANCHORRADIUS * scale);
                shape.hitStrokeWidth(CONSTANT.HITSTROKEWIDTH * scale);
                if (typeof shape.active !== 'undefined') {
                    shape.active
                        ? shape.strokeWidth(CONSTANT.STROKEWIDTH * scale)
                        : shape.strokeWidth(0);
                }
            }
        }
        // 标签文本
        if (shape.hasName(LABELNAME)) {
            let text = shape.getText();
            let tag = shape.getTag();
            let position = shape.position();
            text.fontSize(CONSTANT.FONTSIZE * scale);
            text.padding(4 * scale);
            tag.cornerRadius(4 * scale);
            let rect = tag.getSelfRect();
            shape.position({
                x: position.x + rect.width - 2 * scale,
                y: position.y - rect.height / 2,
            });
            // shape.getText().fontSize(CONSTANT.FONTSIZE * scale);
            shape.owner.updateLabelPosition();
        }
    });
    view.shapelayer.batchDraw();
    view.helplayer.batchDraw();
}
// 将target等比展示缩放内容到bbox
export function computeScaleDim(target: IDim, bbox: IDim) {
    // 等比例放缩 target 以适应容器大小
    let w = target.width,
        h = target.height,
        a = w / h, // target 宽高比
        w_ = bbox.width,
        h_ = bbox.height,
        a_ = w_ / h_; //bbox 宽高比
    if (Math.abs(a - a_) < 0.00000001) {
        w = w_;
        h = h_;
    } else if (a > a_) {
        w = w_;
        h = w_ / a;
    } else if (a < a_) {
        w = h_ * a;
        h = h_;
    }
    return {
        width: w,
        height: h,
        scale: w / target.width,
    };
}
// [{x,y}] => [[x, y]]
export function xytoArr2(points: IPoint[]) {
    let ret: [number, number][] = [];
    points.forEach((point) => {
        ret.push([point.x, point.y]);
    });
    return ret;
}
// [{x,y}] => [x, y]
export function xytoArr(points: IPoint[]) {
    let ret: number[] = [];
    points.forEach((point) => {
        ret.push(point.x, point.y);
    });
    return ret;
}

// 切换 mask 图显示
export function updateShapeMask(shapelayer: Konva.Layer) {
    let objects = shapelayer.find(SHAPESELCTOR);
    let shapeObject: Konva.Node[] = [];
    objects.forEach((item: Konva.Node) => {
        if (MaskShapeTypes.indexOf(item.owner.type) > -1) {
            shapeObject.push(item);
        }
    });
    shapeObject.forEach((item) => {
        item.owner.updateShapeColor();
    });
}
// show class
export function updateLabelVisibility(view: ImageLabel) {
    let allObjects = view.Stage.find('.label');
    allObjects.forEach((label) => {
        label.owner.updateLabelText();
        let visible = false;
        if (config.soloMode) {
            if (view.currentSoloShape === label.owner) {
                visible = label.owner._calcLabelVisible();
            }
        } else {
            visible = label.owner._calcLabelVisible();
        }
        !label.isDistance && label.visible(visible);
    });
    view.Stage.batchDraw();
}
// 图形显示隐藏
export function updateShapeVisibility(view: ImageLabel, showPoly: boolean) {
    let allObjects = view.Stage.find('.shape');
    // E 键 按下隐藏图形 放开显示 图形  还有看背景是黑色的mask图的情况
    if (config.EisPressed) {
        view.background.show();
    } else {
        if (config.backgroudHide) {
            view.background.hide();
        }
    }
    if (config.soloMode) {
        if (showPoly) {
            view.currentSoloShape && view.currentSoloShape.show();
        } else {
            view.currentSoloShape && view.currentSoloShape.hide();
        }
    } else {
        for (let i = 0, l = allObjects.length; i < l; i++) {
            let obj = allObjects[i];
            if (showPoly) {
                if (obj.owner.invisible && obj.owner.selected) {
                    obj.owner.show();
                }
                if (!obj.owner.invisible) {
                    obj.owner.show();
                }
            } else {
                obj.owner.hide();
            }
        }
    }
    let anchors = view.Stage.find('.anchor');
    anchors.forEach((anchor: Konva.Circle) =>
        anchor.visible(showPoly && (anchor.owner.showAnchor || anchor.hasName('shareside'))),
    );
    let markers = view.Stage.find('.' + ICONTYPE.markerIcon);
    markers.forEach((marker) => {
        showPoly ? marker.owner.show() : marker.owner.hide();
    });
    view.Stage.batchDraw();
}
// 结果去重
export function uniqueArr(arr: any[]) {
    // 此去重方法不通用 适合当前需求而已 后续可以实现满足多种情况的去重
    let temp = arr.slice();
    temp = temp.map((v) => {
        return JSON.stringify(v);
    });
    temp = Array.from(new Set(temp));
    temp = temp.map((v) => {
        return JSON.parse(v);
    });
    return temp;
}
// 把相邻坐标不相同的结果去掉
export function uniqueNexteArr(arr: any[]) {
    let temp = arr.slice();
    let len = temp.length;
    if (len < 2) {
        return temp;
    }
    temp = temp.map((v) => JSON.stringify(v));
    let ret = [];
    for (let i = 0; i < len; i++) {
        let last = ret[ret.length - 1];
        let cur = temp[i];
        if (last !== cur) {
            ret.push(cur);
        }
    }
    return ret.map((v) => JSON.parse(v));
}

export function getRandomId() {
    return Math.random().toString(32).slice(2);
}

export function isUndefined(v) {
    return typeof v === 'undefined';
}
// 画布的图形点转成图片坐标
export function toImageCord(p: IPoint, limitBbox: IDim) {
    return {
        ...p,
        x: +((p.x - limitBbox.x) / limitBbox.scale).toFixed(6),
        y: +((p.y - limitBbox.y) / limitBbox.scale).toFixed(6),
    };
}
// 图片的坐标变换到画布坐标
export function transformPoints(points: IPoint[], dim: IDim) {
    return points.map((p) => {
        return {
            ...p,
            x: p.x * dim.scale + dim.x,
            y: p.y * dim.scale + dim.y,
        };
    });
}
// 图片的坐标变换到画布坐标的单个方法
export function transformPoint(p: IPoint, dim: IDim) {
    return {
        x: p.x * dim.scale + dim.x,
        y: p.y * dim.scale + dim.y,
    };
}

// 获取最大ID
export function getMaxIntId(shapeList) {
    let intIds = [1];
    let len = shapeList.length;
    if (len === 0) return 1;
    for (let i = 0; i < len; i++) {
        let shape = shapeList[i];
        let intId = Number(shape.intId);
        if (!isNaN(intId)) {
            intIds.push(intId || 1);
        } else {
            intIds.push(1);
            delete shape.intId;
        }
    }
    // If no arguments are given, the result is -Infinity.
    return Math.max(...intIds);
}

// 判断某个点是否再线段之间
export function onSegment(p1: IPoint, p2: IPoint, q: IPoint) {
    p1 = { x: p1.x, y: p1.y };
    p2 = { x: p2.x, y: p2.y };
    q = { x: q.x, y: q.y };
    let k1 = ((p2.y - p1.y) / (p2.x - p1.x)).toFixed(3);
    let k2 = ((q.y - p1.y) / (q.x - p1.x)).toFixed(3);
    let error = Math.abs(k2 - k1);
    console.log(k1, k2, error, p1, p2, q);
    if (error - 0.1 <= Number.EPSILON) {
        return [p1, p2];
    } else {
        return null;
    }
    // if (
    //     (Q.x - pi.x) * (pj.y - pi.y) == (pj.x - pi.x) * (Q.y - pi.y) &&
    //     Math.min(pi.x, pj.x) <= Q.x &&
    //     Q.x <= Math.max(pi.x, pj.x) &&
    //     Math.min(pi.y, pj.y) <= Q.y &&
    //     Q.y <= Math.max(pi.y, pj.y)
    // ) {
    //     return true;
    // } else {
    //     return false;
    // }
}

export function onSegment2(p1: IPoint, p2: IPoint, q: IPoint, lineSize = 1) {
    console.log(p1, p2, q);
    const x = q.x;
    const y = q.y;
    const x1 = p1.x;
    const y1 = p1.y;
    const x2 = p2.x;
    const y2 = p2.y;
    // const x = 0;
    // const y = 0;
    // const x1 = -1;
    // const y1 = -1;
    // const x2 = 1;
    // const y2 = 1;
    var A = x - x1;
    var B = y - y1;
    var C = x2 - x1;
    var D = y2 - y1;

    var dot = A * C + B * D;
    var len_sq = C * C + D * D;

    if (dot < 0 || len_sq < 0.1) return false;

    if ((dot * dot) / len_sq > len_sq) return false;

    var param = -1;
    param = dot / len_sq;

    var xx, yy;

    xx = x1 + param * C;
    yy = y1 + param * D;

    var dx = x - xx;
    var dy = y - yy;
    var dis = Math.sqrt(dx * dx + dy * dy);

    return dis <= lineSize;
}
// 检查 target 是否完全包含在 source内部
export function polygonContains(source: Polygon, target: Polygon) {
    // target 必须是 Polygon 实例
    if (!(target instanceof Polygon)) {
        return false;
    }
    // target 的面积 需要小于等于 source的面积
    if (source.area <= target.area) {
        return false;
    }
    let points = source.shape.points();
    let checkPoitns = target.points;
    // target 的 点 全部在 source内部
    for (let i = 0; i < checkPoitns.length; i++) {
        let p = checkPoitns[i];
        if (!pointInPolygon([p.x, p.y], xytoArr(points))) {
            return false;
        }
    }
    return true;
}
// 通过当前工具类确定当前形状类
export function getSelectedShapByCurrentTool(editor: any) {
    const selectedShape = editor?.tool?.selectedShape;
    const currentTool = editor?.tool?.toolmanager?.currentTool;
    if (currentTool) return currentTool.poly;
    else return selectedShape;
}

// 获取AI交互工具矩形框坐标点
export function getInteractivePoint(points: IPoint[]) {
    // 防止用户从其它方向拉去矩形框，确保最小点为左上角
    const { x: x1, y: y1 } = points[0];
    const { x: x2, y: y2 } = points[2];
    // 通过判断大小来调整
    points[0] = { x: Math.min(x1, x2), y: Math.min(y1, y2) };
    points[1] = { x: Math.max(x1, x2), y: Math.min(y1, y2) };
    points[2] = { x: Math.max(x1, x2), y: Math.max(y1, y2) };
    points[3] = { x: Math.min(x1, x2), y: Math.max(y1, y2) };
    return points;
}
// 根据传入的点 获取 X,Y 最大最小坐标点
export function getMinMaxPoint(points: IPoint[], limitBbox: IDim) {
    // 获取矩形框的 关键坐标点
    let { x: x1, y: y1 } = points[0];
    let { x: x2, y: y2 } = points?.[2] ?? points[0];
    // 获取画布区域的 坐标
    let { x: minX, y: minY, width: maxX, height: maxY } = limitBbox;
    maxX = minX + maxX;
    maxY = minY + maxY;
    // 判断边界情况 -- 取三者之间的中间数
    x1 = Math.min(Math.max(x1, minX), maxX);
    x2 = Math.min(Math.max(x2, minX), maxX);
    y1 = Math.min(Math.max(y1, minY), maxY);
    y2 = Math.min(Math.max(y2, minY), maxY);
    // 判断点坐标,确保左上角最小，右下角最大
    x1 > x2 && ([x1, x2] = [x2, x1]);
    y1 > y2 && ([y1, y2] = [y2, y1]);

    return [
        { x: x1, y: y1 },
        { x: x2, y: y2 },
    ];
}
