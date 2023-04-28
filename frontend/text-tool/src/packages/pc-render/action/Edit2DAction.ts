import * as THREE from 'three';
import Image2DRenderView from '../renderView/Image2DRenderView';
import Action from './Action';
import { ITransform } from '../type';
import { Object2D, Rect, Box2D, Vector2Of4 } from '../objects';
import { Event } from '../config';
import { get } from '../utils/tempVar';
import { Info, RectTool, Box3DTool, ClearHandler, IBoxEvent, IRectEvent } from '../common/BasicSvg';
import { isLeft, isRight } from '../utils';
import * as _ from 'lodash';

let tempV2_1 = new THREE.Vector2();
let tempV2_2 = new THREE.Vector2();

export default class Edit2DAction extends Action {
    static actionName: string = 'edit-2d';
    renderView: Image2DRenderView;
    object: Object2D | null = null;
    rectTool: RectTool;
    boxTool: Box3DTool;
    //
    clearCall: ClearHandler[] = [];

    constructor(renderView: Image2DRenderView) {
        super();
        this.renderView = renderView;
        this.rectTool = new RectTool(renderView.container);
        this.boxTool = new Box3DTool(renderView.container);
        this.rectTool.setOption({
            rotateAble: false,
            circleStyle: {
                opacity: 1,
            },
        });
        this.boxTool.setOption({
            circleStyle: {
                opacity: 1,
            },
        });
    }

    init() {
        this.initRectDrop();
        this.initBoxDrop();
        this.renderView.addEventListener(Event.RENDER_AFTER, () => {
            this.update();
        });

        this.renderView.pointCloud.addEventListener(Event.SELECT, () => {
            let selection = this.renderView.pointCloud.selection;
            if (selection.length === 1 && selection[0] instanceof Object2D) {
                this.object = selection[0];
            } else {
                this.object = null;
            }
        });
    }

    destroy() {
        this.clearCall.forEach((fn) => fn());
        this.rectTool.destroy();
        this.boxTool.destroy();
    }

    initBoxDrop() {
        // let scaleSize = new THREE.Vector2();
        let renderView = this.renderView;
        // const onStart = (data: IBoxEvent) => {
        //     let { imgSize, width, height } = renderView;
        //     scaleSize.set(imgSize.x / width, imgSize.y / height);
        // };
        const onUpdate = _.throttle((data: IBoxEvent) => {
            // console.log('drop', data);
            if (!data.data) return;
            const {
                dir,
                info,
                data: { positions1, positions2 },
            } = data;
            if (!positions1 || !positions2) return;
            if (dir === 'front' || info === 'front-bg') {
                let posMap: Record<number, THREE.Vector2> = {};
                positions1.reduce(
                    (map: Record<number, THREE.Vector2>, pos: THREE.Vector2, index: number) => {
                        let copy = pos.clone();
                        renderView.domToImg(copy);
                        map[index] = copy;
                        return map;
                    },
                    posMap,
                );
                this.updateBox2DData('positions1', posMap);
            } else if (dir === 'back' || info === 'back-bg') {
                let posMap: Record<number, THREE.Vector2> = {};
                positions2.reduce(
                    (map: Record<number, THREE.Vector2>, pos: THREE.Vector2, index: number) => {
                        let copy = pos.clone();
                        renderView.domToImg(copy);
                        map[index] = copy;
                        return map;
                    },
                    posMap,
                );
                this.updateBox2DData('positions2', posMap);
            }
        }, 30);
        // this.boxTool.addEventListener('start', onStart);
        this.boxTool.addEventListener('update', onUpdate);

        // this.boxTool.box2DWrap.addEventListener('dblclick', (e: MouseEvent) => {
        //     if (this.object) {
        //         e.stopPropagation();

        //         this.renderView.pointCloud.dispatchEvent({
        //             type: Event.OBJECT_DBLCLICK,
        //             data: this.object,
        //         });
        //     }
        // });
    }

    validRect(center: THREE.Vector2, size: THREE.Vector2, moveOnly: boolean) {}

    initRectDrop() {
        // const scaleSize = new THREE.Vector2();

        // const onStart = (data: IRectEvent) => {
        //     let { imgSize, width, height } = this.renderView;
        //     scaleSize.set(imgSize.x / width, imgSize.y / height);
        // };
        const onUpdate = _.throttle((data: IRectEvent) => {
            if (!data.data) return;
            const { center, size } = data.data;
            if (!center || !size) return;

            // let { imgSize, width, height } = this.renderView;
            let scale = this.renderView.getScale();
            let newCenter = center.clone();
            let newScale = size.clone().multiplyScalar(1 / scale);
            this.renderView.domToImg(newCenter);
            this.validRect(newCenter, newScale, data.info === 'bg');

            this.updateRectData(newCenter, newScale);
        }, 30);

        // this.rectTool.addEventListener('start', onStart);
        this.rectTool.addEventListener('update', onUpdate);

        // this.rectTool.rectWrap.addEventListener('dblclick', () => {
        //     if (this.object) {
        //         this.renderView.pointCloud.dispatchEvent({
        //             type: Event.OBJECT_DBLCLICK,
        //             data: this.object,
        //         });
        //     }
        // });
    }
    update() {
        if (
            !this.isEnable() ||
            !this.object ||
            !this.renderView.isRenderable(this.object as Object2D)
        ) {
            this.rectTool.hide();
            this.boxTool.hide();
            return;
        }
        if (this.object instanceof Rect) {
            this.rectTool.show();
            this.boxTool.hide();
            this.updateRect();
        } else {
            this.boxTool.show();
            this.rectTool.hide();
            this.updateBox2D();
        }
    }
    updateBox2D() {
        let newPos = get(THREE.Vector2, 1);
        let { positions1, positions2 } = this.object as Box2D;
        // let { imgSize, width, height } = this.renderView;
        // const scaleSize = get(THREE.Vector2, 2).set(width, height).divide(imgSize);
        const circlePositions1: Vector2Of4 = this.boxTool.getEmptyVector2Of4();
        const circlePositions2: Vector2Of4 = this.boxTool.getEmptyVector2Of4();
        positions1.forEach((pos, index) => {
            newPos.copy(pos);
            this.renderView.imgToDom(newPos);
            circlePositions1[index].copy(newPos);
        });
        positions2.forEach((pos, index) => {
            newPos.copy(pos);
            this.renderView.imgToDom(newPos);
            circlePositions2[index].copy(newPos);
        });
        this.boxTool.updateBox2D(circlePositions1, circlePositions2);
    }

    updateRect() {
        let { center, size } = this.object as Rect;
        let scale = this.renderView.getScale();
        let newCenter = tempV2_1.copy(center);
        let newSize = tempV2_2.copy(size).multiplyScalar(scale);

        this.renderView.imgToDom(newCenter);
        this.rectTool.updateRect(newSize, newCenter);
    }

    updateRectData(center: THREE.Vector2, size?: THREE.Vector2) {
        let object = this.object as Rect;
        this.renderView.pointCloud.update2DRect(object, { center, size });
    }
    updateBox2DData(
        positionName: 'positions1' | 'positions2',
        positionMap: Record<number, THREE.Vector2>,
    ) {
        let object = this.object as Box2D;
        let option = {} as any;
        option[positionName] = positionMap;
        this.renderView.pointCloud.update2DBox(object, option);
    }
}
