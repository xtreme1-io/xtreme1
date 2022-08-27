import * as THREE from 'three';
import Group2DView from './Group2DView';
import { Event } from '../../config';
import { Object2D, Box, Rect, Box2D, AnnotateObject } from '../../objects';
import * as _ from 'lodash';

let temp_1 = new THREE.Vector2();
let temp_2 = new THREE.Vector2();
let temp_3 = new THREE.Vector2();
let temp_4 = new THREE.Vector2();

interface IRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface IConfig {
    name?: string;
    width?: number;
    height?: number;
    // index: number;
    [k: string]: any;
}

export default class View2D {
    objects: (Box2D | Rect)[] = [];
    container: HTMLDivElement;
    enabled: boolean = true;
    group: Group2DView;
    image: HTMLImageElement | null = null;

    config: IConfig;

    imageRect: IRect = { x: 0, y: 0, height: 0, width: 0 };
    groupRect: IRect = { x: 0, y: 0, height: 0, width: 0 };
    // domOffset = new THREE.Vector2();
    domRect = {} as DOMRect;
    // index: number;
    // dataId: string;
    constructor(group: Group2DView, config = {} as IConfig) {
        // super(config.name || '');

        let { width = 200, height = 200 } = config;
        this.group = group;
        this.config = config;
        // this.dataId = config.dataId;
        // this.index = config.index;
        let div = document.createElement('div');
        div.className = 'check-view-2d';
        div.style.height = height + 'px';
        div.style.width = width + 'px';

        this.container = div;
        this.group.groupWrap.appendChild(div);
    }

    destroy() {}

    renderRect(obj: Rect) {
        let { canvasRect, context } = this.group;
        // let { naturalHeight,naturalWidth } = this.img;

        // debugger;
        let leftTop = temp_1;
        let rightBottom = temp_3;
        let temp = temp_2;

        // context.strokeStyle = 'red';
        context.strokeStyle = obj.color;
        context.setLineDash(obj.dashed ? [5, 5] : []);

        context.beginPath();
        temp.copy(obj.size).multiplyScalar(0.5);
        leftTop.copy(obj.center).sub(temp);
        rightBottom.copy(obj.center).add(temp);

        this.image2canvasGroup(leftTop);
        this.image2canvasGroup(rightBottom);

        context.strokeRect(
            leftTop.x,
            leftTop.y,
            rightBottom.x - leftTop.x,
            rightBottom.y - leftTop.y,
        );
        context.stroke();
    }

    renderBox2D(obj: Box2D) {
        let { canvasRect, context } = this.group;

        let { positions1, positions2 } = obj;

        context.strokeStyle = obj.color;

        // context.strokeStyle = 'red';
        context.setLineDash([5, 5]);

        let position = positions2;
        let pos = temp_2.copy(position[0]);
        context.beginPath();
        this.image2canvasGroup(pos);
        context.moveTo(pos.x, pos.y);
        position.forEach((e, index) => {
            pos.copy(position[(index + 1) % 4]);
            this.image2canvasGroup(pos);
            context.lineTo(pos.x, pos.y);
        });
        context.stroke();
        // clear dashed
        context.setLineDash(obj.dashed ? [5, 5] : []);

        position = positions1;
        pos = temp_2.copy(position[0]);
        context.beginPath();
        this.image2canvasGroup(pos);
        context.moveTo(pos.x, pos.y);
        position.forEach((e, index) => {
            pos.copy(position[(index + 1) % 4]);
            this.image2canvasGroup(pos);
            context.lineTo(pos.x, pos.y);
        });
        context.stroke();

        let pos1 = temp_3;
        context.beginPath();
        positions1.forEach((e, index) => {
            pos.copy(positions1[index]);
            pos1.copy(positions2[index]);

            this.image2canvasGroup(pos);
            this.image2canvasGroup(pos1);

            context.moveTo(pos.x, pos.y);
            context.lineTo(pos1.x, pos1.y);
        });
        context.stroke();
    }

    image2canvasGroup(pos: THREE.Vector2) {
        let { groupRect, imageRect } = this;
        pos.x = groupRect.x + ((pos.x - imageRect.x) / imageRect.width) * groupRect.width;
        pos.y = groupRect.y + ((pos.y - imageRect.y) / imageRect.height) * groupRect.height;
        return pos;
    }

    image2canvasLocal(pos: THREE.Vector2) {}

    canvasLocal2canvasGroup() {}

    renderBg() {
        let { context } = this.group;
        let { groupRect } = this;
        context.fillStyle = '#000000';
        context.fillRect(groupRect.x, groupRect.y, groupRect.width, groupRect.height);
    }

    renderImage() {
        if (!this.image) return;

        let { groupRect, imageRect } = this;
        let { canvasRect, context } = this.group;

        context.drawImage(
            this.image,
            imageRect.x,
            imageRect.y,
            imageRect.width,
            imageRect.height,
            groupRect.x,
            groupRect.y,
            groupRect.width,
            groupRect.height,
        );
    }

    calculateImageRect() {
        let xMin = Infinity;
        let xMax = -Infinity;
        let yMin = Infinity;
        let yMax = -Infinity;
        this.objects.forEach((obj) => {
            if (obj instanceof Rect) {
                let { center, size } = obj;
                if (center.x + size.width / 2 > xMax) xMax = center.x + size.width / 2;
                if (center.x - size.width / 2 < xMin) xMin = center.x - size.width / 2;
                if (center.y + size.height / 2 > yMax) yMax = center.y + size.height / 2;
                if (center.y - size.height / 2 < yMin) yMin = center.y - size.height / 2;
            } else if (obj instanceof Box2D) {
                let { positions1, positions2 } = obj;
                positions1.forEach((pos) => {
                    if (pos.x > xMax) xMax = pos.x;
                    if (pos.x < xMin) xMin = pos.x;
                    if (pos.y > yMax) yMax = pos.y;
                    if (pos.y < yMin) yMin = pos.y;
                });
                positions2.forEach((pos) => {
                    if (pos.x > xMax) xMax = pos.x;
                    if (pos.x < xMin) xMin = pos.x;
                    if (pos.y > yMax) yMax = pos.y;
                    if (pos.y < yMin) yMin = pos.y;
                });
            }
        });

        let padding = Math.max(xMax - xMin, yMax - yMin) * 0.3;

        this.imageRect.x = xMin - padding;
        this.imageRect.y = yMin - padding;
        this.imageRect.width = xMax - xMin + 2 * padding;
        this.imageRect.height = yMax - yMin + 2 * padding;
    }

    updateRectInfo() {
        let { canvasRect, context } = this.group;
        let rect = this.container.getBoundingClientRect();
        this.domRect = rect;

        this.groupRect.width = rect.right - rect.left;
        this.groupRect.height = rect.bottom - rect.top;
        this.groupRect.x = rect.left - canvasRect.left;
        this.groupRect.y = rect.top - canvasRect.top;
    }

    // render
    render() {
        if (!this.enabled) return;

        let { canvasRect, context } = this.group;

        this.updateRectInfo();

        let rect = this.domRect;

        if (
            rect.bottom >= canvasRect.top &&
            rect.top <= canvasRect.bottom &&
            rect.left <= canvasRect.right &&
            rect.right >= canvasRect.left
        ) {
            this.renderBg();
            if (this.objects.length > 0) {
                this.calculateImageRect();
                this.renderImage();
                this.objects.forEach((item) => {
                    if (item instanceof Rect) {
                        this.renderRect(item);
                    } else if (item instanceof Box2D) {
                        this.renderBox2D(item);
                    }
                });
            }
        }
        //  TODO render
    }
}
