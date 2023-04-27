import { Object2D, Rect, Box2D, Vector2Of4 } from '../objects';
import * as THREE from 'three';
import { get } from '../utils/tempVar';
import * as _ from 'lodash';
// type DragHandler = (offsetLocal: THREE.Vector3, offsetCamera: THREE.Vector2) => ITransform | null;
const tempV2_1 = new THREE.Vector2();
export type ClearHandler = () => void;
// svg element attribute 'data-info'
export type Info =
    | 'lt'
    | 'lb'
    | 'rt'
    | 'rb'
    | 'wrap-4'
    | 'wrap-8'
    | 'wrap-front'
    | 'wrap-back'
    | 'wrap-bg'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'front-bg'
    | 'back-bg'
    | 'bg'
    | 'line'
    | 'rotate';
// event type
export type IEvent = 'start' | 'update' | 'end' | 'start-rotate' | 'rotate' | 'end-rotate';
export type IDir = 'front' | 'back' | 'bg';
export interface IBaseEvent extends THREE.Event {
    type: IEvent;
    event: MouseEvent;
    info?: Info;
}

export interface IRectEvent extends IBaseEvent {
    data?: {
        center?: THREE.Vector2;
        size?: THREE.Vector2;
        detailAngle?: number;
        offsetAngle?: number; // -PI ~ PI, inverse + ， clockwise -;
    };
}
export interface IBoxEvent extends IBaseEvent {
    dir: IDir;
    data?: {
        positions1: Vector2Of4;
        positions2: Vector2Of4;
    };
}

// create svg dom

export function createSvg(): SVGElement {
    var ns = 'http://www.w3.org/2000/svg';
    var element = document.createElementNS(ns, 'svg') as SVGElement;
    return element;
}
//
export function createRectTag(
    tag: string,
    info: Info,
    attrsMap: Record<string, string> = {},
): Element {
    var ns = 'http://www.w3.org/2000/svg';
    var element = document.createElementNS(ns, tag);
    Object.keys(attrsMap).forEach((attr) => {
        element.setAttributeNS(null, attr, attrsMap[attr]);
    });
    element.setAttributeNS(null, 'data-info', info);
    if (tag === 'circle' && info !== 'rotate') {
        element.classList.add(`rect-dot`);
    } else if (tag === 'rect' && info !== 'bg') {
        element.classList.add(`rect-line`);
    } else if (tag === 'line') {
        element.classList.add('rect-line', 'line-border');
    }

    element.classList.add(`rect-${info}`);
    return element;
}
export interface IRectOption {
    minSize: THREE.Vector2;
    moveAble: boolean;
    rotateAble: boolean;
    borderAble: boolean;
    circleAble: boolean;
    lineStyle?: {
        'stroke-dasharray'?: number;
        stroke?: string;
        'stroke-width'?: number;
        opacity?: number;
    };
    circleStyle?: {
        fill?: string;
        'stroke-width'?: number;
        stroke?: string;
        opacity?: number;
    };
    rotateStyle?: {
        fill?: string;
        'stroke-width'?: number;
        stroke?: string;
        opacity?: number;
    };
}
export interface IBoxOption {
    moveAble: boolean;
    circleAble: boolean;
    borderAble: boolean;
    lineStyle?: {
        stroke?: string;
        'stroke-width'?: number;
        opacity?: number;
    };
    circleStyle?: {
        fill?: string;
        'stroke-width'?: number;
        stroke?: string;
        opacity?: number;
    };
}
function getDotDir(info: Info, dir: THREE.Vector2) {
    switch (info) {
        case 'lt':
            dir.set(-1, -1);
            break;
        case 'lb':
            dir.set(-1, 1);
            break;
        case 'rt':
            dir.set(1, -1);
            break;
        case 'rb':
            dir.set(1, 1);
            break;
        case 'top':
            dir.set(0, -1);
            break;
        case 'bottom':
            dir.set(0, 1);
            break;
        case 'left':
            dir.set(-1, 0);
            break;
        case 'right':
            dir.set(1, 0);
            break;
    }
}

function getBox2DIndex(info: Info) {
    let index = 0;
    switch (info) {
        case 'lt':
        case 'left':
            index = 0;
            break;
        case 'lb':
        case 'bottom':
            index = 1;
            break;
        case 'rb':
        case 'right':
            index = 2;
            break;
        case 'rt':
        case 'top':
            index = 3;
            break;
    }
    return index;
}

// set svg element css of key-value
function setStyle(
    nodeList: NodeListOf<SVGElement> | SVGElement,
    styleObject: Record<string, number | string>,
) {
    let cssText = '';
    for (let key in styleObject) {
        cssText += `${key}:${styleObject[key]};`;
    }
    if (cssText) {
        (nodeList instanceof NodeList ? nodeList : [nodeList]).forEach((item: SVGElement) => {
            item.style.cssText = cssText;
        });
    }
}
export class BasicSvg<E extends THREE.Event = IBaseEvent> extends THREE.EventDispatcher<E> {
    svg: SVGElement;
    padding = new THREE.Vector2(1000, 1000);
    container: HTMLDivElement;
    clearCall: ClearHandler[] = [];
    constructor(container: HTMLDivElement) {
        super();
        const { x, y } = this.padding;
        const svg = createSvg();
        svg.style.position = 'absolute';
        svg.style.width = `calc(100% + ${x * 2}px)`;
        svg.style.height = `calc(100% + ${y * 2}px)`;
        svg.style.marginTop = `-${x}px`;
        svg.style.marginLeft = `-${y}px`;
        svg.style.pointerEvents = 'none';
        svg.style.width = `calc(100% + ${x * 2}px)`;
        svg.style.left = '0';
        svg.style.top = '0';
        svg.classList.add('edit-2d-wrap');

        container.appendChild(svg);

        this.container = container;
        this.svg = svg;
    }
    getZoom() {
        const matrix = this.container.style.transform.match(/(?<=matrix\()[0-9.]+/);
        const zoom = matrix ? +matrix[0] : 1;
        return zoom;
    }
    isLeft(e: MouseEvent) {
        return e.button === 0;
    }
    isRight(e: MouseEvent) {
        return e.button === 2;
    }
    destroy() {
        this.clearCall.forEach((fn) => fn());
        this.container.removeChild(this.svg);
    }
    show() {
        this.svg.style.display = 'block';
    }
    hide() {
        this.svg.style.display = 'none';
    }
}

export class RectTool extends BasicSvg<IRectEvent> {
    static toolName: string = '2d-rect';
    rectWrap = {} as SVGGElement;
    rotateWrap = {} as SVGGElement;
    rotateCircle = {} as SVGCircleElement;
    lineSize: number = 4;
    rotation = 0;
    option: IRectOption = {
        minSize: new THREE.Vector2(0, 0),
        moveAble: true,
        rotateAble: true,
        borderAble: true,
        circleAble: true,
    };
    center = new THREE.Vector2();
    size = new THREE.Vector2(1, 1);
    constructor(container: HTMLDivElement) {
        super(container);
        this.rectWrap = createRectTag('g', 'wrap-4') as SVGGElement;
        this.init();
    }
    init() {
        let rectWrap = this.rectWrap;
        this.createRectInfo(rectWrap);
        this.svg.appendChild(rectWrap);
        this.initDrag(this.rectWrap);
        this.initRotate();
    }
    setOption(option: Partial<IRectOption>) {
        Object.assign(this.option, option);
        let { circleStyle, lineStyle, rotateStyle } = option;
        if (circleStyle) {
            setStyle(this.rectWrap.querySelectorAll('circle'), circleStyle);
        }
        if (lineStyle) {
            const node = this.rectWrap.querySelector('rect.rect-bg') as SVGRectElement;
            if (node) setStyle(node, lineStyle);
        }
        if (rotateStyle) {
            setStyle(this.rotateCircle, rotateStyle);
        }
        this.checkRotate();
    }
    initRotate() {
        let rotateWrap = createRectTag('g', 'wrap-4') as SVGGElement;
        let rotateCircle = createRectTag('circle', 'rotate', {
            cx: '-2',
            cy: '-2',
            r: '6',
        }) as SVGCircleElement;
        rotateWrap.appendChild(rotateCircle);
        this.svg.appendChild(rotateWrap);
        this.initRotateEvent(rotateCircle);
        this.rotateWrap = rotateWrap;
        this.rotateCircle = rotateCircle;
    }
    createRectInfo(
        rectWrap: SVGGElement,
        config: { border?: boolean; dot?: boolean; bg?: boolean; rotate?: boolean } = {
            border: true,
            dot: true,
            bg: true,
            rotate: true,
        },
    ) {
        if (config.bg) {
            let bg = createRectTag('rect', 'bg', {
                x: '-2',
                y: '-2',
                width: '4',
                height: '4',
            }) as SVGCircleElement;
            rectWrap.appendChild(bg);
        }

        if (config.border) {
            let lineTop = createRectTag('rect', 'top', {
                x: '-2',
                y: '-2',
                width: '4',
                height: '4',
            }) as SVGCircleElement;
            let lineBottom = createRectTag('rect', 'bottom', {
                x: '-2',
                y: '-2',
                width: '4',
                height: '4',
            }) as SVGCircleElement;
            let lineLeft = createRectTag('rect', 'left', {
                x: '-2',
                y: '-2',
                width: '4',
                height: '4',
            }) as SVGCircleElement;
            let lineRight = createRectTag('rect', 'right', {
                x: '-2',
                y: '-2',
                width: '4',
                height: '4',
            }) as SVGCircleElement;

            rectWrap.appendChild(lineTop);
            rectWrap.appendChild(lineBottom);
            rectWrap.appendChild(lineLeft);
            rectWrap.appendChild(lineRight);
        }

        if (config.dot) {
            let dotLT = createRectTag('circle', 'lt', {
                cx: '0',
                cy: '0',
                r: '4',
            }) as SVGCircleElement;

            let dotLB = createRectTag('circle', 'lb', {
                cx: '0',
                cy: '0',
                r: '4',
            }) as SVGCircleElement;

            let dotRT = createRectTag('circle', 'rt', {
                cx: '0',
                cy: '0',
                r: '4',
            }) as SVGCircleElement;

            let dotRB = createRectTag('circle', 'rb', {
                cx: '-2',
                cy: '-2',
                r: '4',
            }) as SVGCircleElement;
            rectWrap.appendChild(dotLT);
            rectWrap.appendChild(dotLB);
            rectWrap.appendChild(dotRB);
            rectWrap.appendChild(dotRT);
        }
    }
    updateRect(size: THREE.Vector2, center: THREE.Vector2) {
        if (isNaN(size.x) || isNaN(size.y) || isNaN(center.x) || isNaN(center.y)) return;
        this.size.copy(size);
        this.center.copy(center);
        let childNodes = this.rectWrap.childNodes;
        let dir = get(THREE.Vector2, 0);
        let newPos = get(THREE.Vector2, 1);
        childNodes.forEach((node) => {
            if (node.nodeName === 'circle') {
                let circle = node as SVGCircleElement;
                let info = circle.getAttributeNS(null, 'data-info') as Info;
                getDotDir(info, dir);
                dir.multiplyScalar(0.5);
                newPos.copy(size).multiply(dir).add(center);
                newPos.add(this.padding);

                // circle.style.transform = `translate(${newPos.x}px, ${newPos.y}px)`;
                circle.setAttributeNS(null, 'cx', newPos.x.toFixed(2));
                circle.setAttributeNS(null, 'cy', newPos.y.toFixed(2));
            } else {
                let rect = node as SVGRectElement;
                let info = rect.getAttributeNS(null, 'data-info') as Info;
                let width = 0;
                let height = 0;

                if (info === 'bg') {
                    dir.set(-0.5, -0.5);
                    newPos.copy(size).multiply(dir).add(center);
                    newPos.add(this.padding);

                    width = size.x;
                    height = size.y;
                } else {
                    getDotDir(info, dir);
                    dir.multiplyScalar(0.5);
                    newPos.copy(size).multiply(dir).add(center);
                    newPos.add(this.padding);

                    if (info === 'top' || info === 'bottom') {
                        width = size.x;
                        height = this.lineSize;
                    } else {
                        width = this.lineSize;
                        height = size.y;
                    }
                    newPos.x -= width / 2;
                    newPos.y -= height / 2;
                }

                rect.setAttributeNS(null, 'x', newPos.x.toFixed(2));
                rect.setAttributeNS(null, 'y', newPos.y.toFixed(2));
                rect.setAttributeNS(null, 'width', width.toFixed(2));
                rect.setAttributeNS(null, 'height', height.toFixed(2));
            }
        });

        const rotatePos = tempV2_1.copy(center).add(this.padding);
        rotatePos.y -= size.y / 2 - 10;
        this.rotateCircle.setAttributeNS(null, 'cx', rotatePos.x.toFixed(2));
        this.rotateCircle.setAttributeNS(null, 'cy', rotatePos.y.toFixed(2));
    }
    checkRotate() {
        if (this.option.rotateAble) {
            this.rotateWrap.style.display = 'block';
            return true;
        } else {
            this.rotateWrap.style.display = 'none';
            return false;
        }
    }
    updateRotation() {
        if (!this.checkRotate()) return;

        const center = this.center;
        const { x, y } = this.padding;
        const rotation = this.rotation;
        this.svg.style.transform = `rotate(${rotation}deg)`;
        this.svg.style.transformOrigin = `${center.x + x}px ${center.y + y}px`;
    }

    initDrag(dom: SVGGElement) {
        let scope = this;

        let currentPos = new THREE.Vector2();
        let startPos = new THREE.Vector2();
        const dir = new THREE.Vector2();
        let offsetPos = new THREE.Vector2();
        let startClient = new THREE.Vector2();
        let lastPos = new THREE.Vector2();
        const posInfo = new THREE.Vector2();
        const center = new THREE.Vector2();
        const size = new THREE.Vector2();
        dom.addEventListener('mousedown', onmousedown);

        function onmousedown(e: MouseEvent) {
            if (scope.isRight(e)) return;

            let target = e.target as SVGElement;
            let minSize = scope.option.minSize;
            let bbox = scope.svg.getBoundingClientRect();
            startClient.set(bbox.x, bbox.y);

            e.preventDefault();
            e.stopPropagation();

            let info = target.getAttributeNS(null, 'data-info') as Info;
            const { rotateAble, moveAble, borderAble, circleAble } = scope.option;
            if (!rotateAble && info === 'rotate') return;
            else if (!moveAble && info === 'bg') return;
            else if (!borderAble && ['left', 'right', 'top', 'bottom'].indexOf(info) >= 0) return;
            if (info === 'bg') {
                posInfo.copy(scope.center);
            } else {
                getDotDir(info, dir);
                posInfo.copy(scope.center).add(dir.multiply(scope.size).multiplyScalar(-0.5));
            }

            startPos.set(e.clientX, e.clientY).sub(startClient);
            lastPos.copy(startPos);
            const zoom = scope.getZoom();
            scope.dispatchEvent({
                type: 'start',
                target,
                event: e,
                info,
            });
            let onDocMove = _.throttle((e: MouseEvent) => {
                currentPos.set(e.clientX, e.clientY).sub(startClient);
                offsetPos.copy(currentPos).sub(startPos).divideScalar(zoom);
                currentPos.divideScalar(zoom).sub(scope.padding);
                if (info === 'top' || info === 'bottom') {
                    size.set(scope.size.x, Math.abs(currentPos.y - posInfo.y));
                    center.set(scope.center.x, (currentPos.y + posInfo.y) / 2);
                } else if (info === 'left' || info === 'right') {
                    center.set((currentPos.x + posInfo.x) / 2, scope.center.y);
                    size.set(Math.abs(currentPos.x - posInfo.x), scope.size.y);
                } else if (info === 'bg') {
                    center.set(offsetPos.x + posInfo.x, posInfo.y + offsetPos.y);
                    size.copy(scope.size);
                } else {
                    center.set((currentPos.x + posInfo.x) / 2, (currentPos.y + posInfo.y) / 2);
                    size.set(
                        Math.abs(currentPos.x - posInfo.x),
                        Math.abs(currentPos.y - posInfo.y),
                    );
                }

                if (size.x < minSize.x) {
                    center.x = scope.center.x;
                    size.x = scope.size.x;
                }
                if (size.y < minSize.y) {
                    center.y = scope.center.y;
                    size.y = scope.size.y;
                }

                scope.dispatchEvent({
                    type: 'update',
                    target,
                    event: e,
                    info,
                    data: {
                        center,
                        size,
                    },
                });
            }, 30);
            function onDocUp(e: MouseEvent) {
                scope.dispatchEvent({ type: 'end', event: e, info: info });
                document.removeEventListener('mousemove', onDocMove);
                document.removeEventListener('mouseup', onDocUp);
            }

            document.addEventListener('mousemove', onDocMove);
            document.addEventListener('mouseup', onDocUp);
        }
    }
    initRotateEvent(circle: SVGCircleElement) {
        const scope = this;
        let startClient = new THREE.Vector2();
        let currentPos = new THREE.Vector2();
        let startPos = new THREE.Vector2();
        let sAngle = 0;
        let lastAngle = 0;
        let eAngle = 0;
        let lastPos = new THREE.Vector2();

        circle.addEventListener('mousedown', onmousedown);

        function onmousedown(e: MouseEvent) {
            if (scope.isRight(e)) return;
            e.preventDefault();
            e.stopPropagation();
            if (!scope.option.rotateAble) return;
            let bbox = scope.svg.getBoundingClientRect();
            const zoom = scope.getZoom();
            const center = scope.center;
            startClient.set(bbox.x, bbox.y);
            startPos
                .set(e.clientX, e.clientY)
                .sub(startClient)
                .divideScalar(zoom)
                .sub(scope.padding);
            lastPos.copy(startPos);
            startPos.sub(center);
            sAngle = Math.atan2(startPos.y, startPos.x);
            lastAngle = sAngle;
            scope.dispatchEvent({
                type: 'start-rotate',
                event: e,
            });

            let onDocMove = (e: MouseEvent) => {
                currentPos
                    .set(e.clientX, e.clientY)
                    .sub(startClient)
                    .divideScalar(zoom)
                    .sub(scope.padding);
                currentPos.sub(center);
                eAngle = Math.atan2(currentPos.y, currentPos.x);
                let angle = sAngle - eAngle;
                if (angle < 0) {
                    angle += Math.PI * 2;
                }
                if (angle > Math.PI) {
                    angle -= Math.PI * 2;
                }
                scope.dispatchEvent({
                    type: 'rotate',
                    event: e,
                    data: {
                        detailAngle: eAngle - lastAngle,
                        offsetAngle: angle,
                    },
                });
                scope.rotation = -(angle * 180) / Math.PI;
                lastAngle = eAngle;
            };

            function onDocUp(e: MouseEvent) {
                scope.dispatchEvent({
                    type: 'end-rotate',
                    event: e,
                });
                document.removeEventListener('mousemove', onDocMove);
                document.removeEventListener('mouseup', onDocUp);
            }

            document.addEventListener('mousemove', onDocMove);
            document.addEventListener('mouseup', onDocUp);
        }
    }
}
export class Box3DTool extends BasicSvg<IBoxEvent> {
    static toolName = '3d-cube';
    box2DWrap: SVGGElement = {} as SVGGElement;
    positions1: Vector2Of4;
    positions2: Vector2Of4;
    option: IBoxOption = {
        moveAble: true,
        circleAble: true,
        borderAble: true,
    };
    constructor(container: HTMLDivElement) {
        super(container);
        this.box2DWrap = createRectTag('g', 'wrap-8') as SVGGElement;
        this.positions1 = this.getEmptyVector2Of4();
        this.positions2 = this.getEmptyVector2Of4();
        this.init();
    }
    getEmptyVector2Of4(): Vector2Of4 {
        return [new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2()];
    }
    copyVector2Of4(target: Vector2Of4, from: Vector2Of4) {
        target.forEach((pos, index) => {
            pos.copy(from[index]);
        });
    }
    setOption(option: Partial<IBoxOption>) {
        Object.assign(this.option, option);
        let { circleStyle, lineStyle } = this.option;
        if (circleStyle) {
            setStyle(this.svg.querySelectorAll('circle'), circleStyle);
        }
        if (lineStyle) {
            setStyle(this.svg.querySelectorAll('line'), lineStyle);
        }
    }
    init() {
        let boxWrap = this.box2DWrap;
        boxWrap.classList.add('wrap-8');

        let bgWrap = createRectTag('g', 'wrap-bg') as SVGGElement;
        let bg1 = createRectTag('polygon', 'front-bg') as SVGPolygonElement;
        let bg2 = createRectTag('polygon', 'back-bg') as SVGPolygonElement;
        bgWrap.append(bg1);
        bgWrap.append(bg2);

        let font = createRectTag('g', 'wrap-front') as SVGGElement;
        this.createRectInfo(font, { dot: true, border: true });

        let back = createRectTag('g', 'wrap-back') as SVGGElement;
        this.createRectInfo(back, { dot: true, border: true });

        boxWrap.appendChild(bgWrap);
        boxWrap.appendChild(font);
        boxWrap.appendChild(back);

        this.box2DWrap = boxWrap;
        this.svg.appendChild(this.box2DWrap);

        this.initBoxDrag(bgWrap, 'bg');
        this.initBoxDrag(font, 'front');
        this.initBoxDrag(back, 'back');
    }
    createRectInfo(
        rectWrap: SVGGElement,
        config: { border?: boolean; dot?: boolean; bg?: boolean } = {
            border: true,
            dot: true,
            bg: true,
        },
    ) {
        if (config.bg) {
            let bg = createRectTag('rect', 'bg', {
                x: '-2',
                y: '-2',
                width: '4',
                height: '4',
            }) as SVGCircleElement;
            rectWrap.appendChild(bg);
        }
        if (config.border) {
            const infos: Info[] = ['left', 'right', 'top', 'bottom'];
            infos.forEach((info) => {
                const tag = createRectTag('line', info, {
                    x1: '-2',
                    x2: '-2',
                    y1: '-2',
                    y2: '-2',
                    stroke: 'red',
                    'stroke-width': '4',
                });
                rectWrap.appendChild(tag);
            });
        }

        if (config.dot) {
            let dotLT = createRectTag('circle', 'lt', {
                cx: '0',
                cy: '0',
                r: '4',
            }) as SVGCircleElement;

            let dotLB = createRectTag('circle', 'lb', {
                cx: '0',
                cy: '0',
                r: '4',
            }) as SVGCircleElement;

            let dotRT = createRectTag('circle', 'rt', {
                cx: '0',
                cy: '0',
                r: '4',
            }) as SVGCircleElement;

            let dotRB = createRectTag('circle', 'rb', {
                cx: '-2',
                cy: '-2',
                r: '4',
            }) as SVGCircleElement;
            rectWrap.appendChild(dotLT);
            rectWrap.appendChild(dotLB);
            rectWrap.appendChild(dotRB);
            rectWrap.appendChild(dotRT);
        }
    }
    initBoxDrag(dom: SVGGElement, dir: IDir) {
        let scope = this;
        let currentPos = new THREE.Vector2();
        let offsetPos = new THREE.Vector2();
        let startPos = new THREE.Vector2();
        let lastPos = new THREE.Vector2();
        let startClient = new THREE.Vector2();
        const positions1 = this.getEmptyVector2Of4();
        const positions2 = this.getEmptyVector2Of4();
        dom.addEventListener('mousedown', onmousedown);

        function onmousedown(e: MouseEvent) {
            if (scope.isRight(e)) return;
            e.preventDefault();
            e.stopPropagation();
            let target = e.target as SVGCircleElement | SVGLineElement;

            let bbox = scope.svg.getBoundingClientRect();
            startClient.set(bbox.x, bbox.y);

            const zoom = scope.getZoom();
            let info = target.getAttributeNS(null, 'data-info') as Info;

            let { moveAble, circleAble, borderAble } = scope.option;
            if (!borderAble && target.nodeName === 'line') return;
            else if (!circleAble && target.nodeName === 'circle') return;
            else if (!moveAble && info === 'bg') return;

            startPos.set(e.clientX, e.clientY).sub(startClient);
            lastPos.copy(startPos);
            const eventStart: IBoxEvent = {
                dir,
                type: 'start',
                target,
                event: e,
                info,
            };
            const posIndex = getBox2DIndex(info);
            scope.dispatchEvent(eventStart);
            let onDocMove = _.throttle((e: MouseEvent) => {
                scope.copyVector2Of4(positions1, scope.positions1);
                scope.copyVector2Of4(positions2, scope.positions2);
                currentPos.set(e.clientX, e.clientY).sub(startClient);
                offsetPos.copy(currentPos).sub(lastPos).divideScalar(zoom);
                if (info === 'front-bg') {
                    positions1.forEach((pos) => pos.add(offsetPos));
                } else if (info === 'back-bg') {
                    positions2.forEach((pos) => pos.add(offsetPos));
                } else if (dir === 'front') {
                    positions1[posIndex].add(offsetPos);
                    if (target.nodeName === 'line') {
                        let posIndex1 = (posIndex + 1) % 4;
                        positions1[posIndex1].add(offsetPos);
                    }
                } else if (dir === 'back') {
                    positions2[posIndex].add(offsetPos);
                    if (target.nodeName === 'line') {
                        let posIndex1 = (posIndex + 1) % 4;
                        positions1[posIndex1].add(offsetPos);
                    }
                }
                const event: IBoxEvent = {
                    type: 'update',
                    target,
                    event: e,
                    dir,
                    info,
                    data: {
                        positions1,
                        positions2,
                    },
                };
                lastPos.copy(currentPos);
                scope.dispatchEvent(event);
            }, 30);
            function onDocUp(e: MouseEvent) {
                scope.dispatchEvent({ type: 'end', event: e, dir, info: info });
                document.removeEventListener('mousemove', onDocMove);
                document.removeEventListener('mouseup', onDocUp);
            }

            document.addEventListener('mousemove', onDocMove);
            document.addEventListener('mouseup', onDocUp);
        }
    }
    updateBox2D(positions1: Vector2Of4, positions2: Vector2Of4) {
        let childNodes = this.box2DWrap.childNodes;
        this.copyVector2Of4(this.positions1, positions1);
        this.copyVector2Of4(this.positions2, positions2);

        this.updateBox2DRect(childNodes.item(0));
        this.updateBox2DRect(childNodes.item(1));
        this.updateBox2DRect(childNodes.item(2));
    }
    updateBox2DRect(wrap: ChildNode) {
        let newPos = get(THREE.Vector2, 1);

        let childNodes = wrap.childNodes;
        let positions;
        let wrapInfo = (wrap as SVGElement).getAttributeNS(null, 'data-info') as Info;
        childNodes.forEach((e) => {
            let node = e as SVGElement;
            let info = node.getAttributeNS(null, 'data-info') as Info;

            if (node.nodeName === 'circle') {
                positions = wrapInfo === 'wrap-front' ? this.positions1 : this.positions2;
                let index = getBox2DIndex(info);
                let pos = positions[index];
                newPos.copy(pos).add(this.padding);

                node.setAttributeNS(null, 'cx', newPos.x.toFixed(2));
                node.setAttributeNS(null, 'cy', newPos.y.toFixed(2));
            } else if (node.nodeName === 'line') {
                positions = wrapInfo === 'wrap-front' ? this.positions1 : this.positions2;
                let sIndex = getBox2DIndex(info);
                let eIndex = (sIndex + 1) % 4;
                const sPos = positions[sIndex];
                const ePos = positions[eIndex];
                newPos.copy(sPos).add(this.padding);
                node.setAttributeNS(null, 'x1', newPos.x.toFixed(2));
                node.setAttributeNS(null, 'y1', newPos.y.toFixed(2));
                newPos.copy(ePos).add(this.padding);
                node.setAttributeNS(null, 'x2', newPos.x.toFixed(2));
                node.setAttributeNS(null, 'y2', newPos.y.toFixed(2));
            } else {
                positions = info === 'front-bg' ? this.positions1 : this.positions2;
                let points = this.getPointsStr(positions);
                node.setAttributeNS(null, 'points', points);
            }
        });
    }
    getPointsStr(positions: THREE.Vector2[]) {
        let str = '';
        let { x, y } = this.padding;
        positions.forEach((pos) => {
            str += `${(pos.x + x).toFixed(2)},${(pos.y + y).toFixed(2)} `;
        });
        return str;
    }
}
