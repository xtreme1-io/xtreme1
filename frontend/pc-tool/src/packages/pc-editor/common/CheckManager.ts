import Editor from '../Editor';
import { getColorRange, statisticPositionInfo } from '../utils';
import * as THREE from 'three';
import Event from '../config/event';
import * as _ from 'lodash';
import {
    ITransform,
    AnnotateObject,
    Group2DView,
    Group3DView,
    View2D,
    View3D,
    axisType,
    Box,
    Rect,
    Box2D,
    PointCloud,
    Image2DRenderView,
    Object2D,
    Edit2DAction,
    Event as RenderEvent,
} from 'pc-render';
import { IDataResource, IFrame } from '../type';
import { ResourceLoader } from './DataResource';
import { utils } from 'pc-editor';

export default class CheckManager {
    pc: PointCloud;
    editor: Editor;
    group3DView = {} as Group3DView;
    group2DView = {} as Group2DView;
    imgMaxView = {} as Image2DRenderView;
    frameObjects: Map<string, AnnotateObject[]> = new Map();

    constructor(editor: Editor) {
        this.editor = editor;
        this.pc = new PointCloud();
        this.updateStatus = _.debounce(this.updateStatus.bind(this), 30);
        this.updateView = _.debounce(this.updateView.bind(this), 30);
        this.initEvent();
    }

    initEvent() {
        this.editor.pc.addEventListener(RenderEvent.RENDER_AFTER, () => {
            this.render();
        });
        this.editor.addEventListener(Event.RESOURCE_LOAD_LOADING, () => {
            this.updateStatus();
        });
        this.editor.addEventListener(Event.RESOURCE_LOAD_COMPLETE, () => {
            this.updateStatus();
        });
        this.editor.addEventListener(Event.RESOURCE_LOAD_ERROR, () => {
            this.updateStatus();
        });

        this.editor.addEventListener(Event.ANNOTATE_ADD, () => {
            this.updateView();
        });

        this.editor.addEventListener(Event.ANNOTATE_CHANGE, () => {
            this.updateView();
            this.updateStatus();
        });
        this.editor.addEventListener(Event.ANNOTATE_REMOVE, () => {
            this.updateView();
        });

        this.editor.addEventListener(Event.TRACK_OBJECT_CHANGE, () => {
            this.updateView();
        });

        this.editor.addEventListener(Event.CURRENT_TRACK_CHANGE, () => {
            let { checkConfig, config } = this.editor.state;
            const currentTrack = this.editor.currentTrack;
            if (currentTrack === checkConfig.trackId) return;

            checkConfig.trackId = currentTrack || '';
            if (!currentTrack) checkConfig.showAttr = false;
            this.updateView();
        });

        this.editor.addEventListener(Event.ANNOTATE_TRANSFORM_CHANGE, (data) => {
            let { checkConfig, config } = this.editor.state;
            let objects = data.data.objects as AnnotateObject[];
            if (config.showCheckView && checkConfig.type === '3d') {
                objects.forEach((obj) => {
                    let frame = (obj as any).frame as IFrame;
                    if (!frame) return;

                    let index = this.editor.getFrameIndex(frame.id);
                    let view = this.group3DView.views[index];

                    if (!view) return;
                    if (view.object && view.object === obj && view.needFit && view.enableFit) {
                        console.log('update check view');
                        view.fitObject();
                        this.render();
                    }
                });
            }
        });
    }

    // 3d

    initImageMaxView(container: HTMLDivElement) {
        let imgMaxView = new Image2DRenderView(container, this.pc, {
            name: 'check-img-max-view',
            actions: ['render-2d-shape', 'edit-2d', 'select', 'transform-2d'],
        });

        imgMaxView.renderFrame = () => {
            imgMaxView.updateSize();
            imgMaxView.renderImage();
        };
        imgMaxView.get2DObject = () => {
            let { checkConfig } = this.editor.state;
            let view = this.group2DView.views[checkConfig.imageMaxIndex];
            return view ? view.objects : [];
        };
        imgMaxView.isRenderable = (obj: Object2D) => {
            return obj.visible;
        };

        this.pc.addRenderView(imgMaxView);
        imgMaxView.lineWidth = 2;
        imgMaxView.toggle(false);

        let editAction = imgMaxView.getAction('edit-2d') as Edit2DAction;
        if (editAction) {
            editAction.updateRectData = (center: THREE.Vector2, size?: THREE.Vector2) => {
                let object = editAction.object as Rect;
                this.editor.cmdManager.execute('update-2d-rect', {
                    object,
                    option: { center, size },
                });
            };

            editAction.updateBox2DData = (
                positionName: 'positions1' | 'positions2',
                positionMap: Record<number, THREE.Vector2>,
            ) => {
                let object = editAction.object as Box2D;
                let option = {} as any;
                option[positionName] = positionMap;
                this.editor.cmdManager.execute('update-2d-box', { object, option });
            };
        }

        this.imgMaxView = imgMaxView;
    }

    initView3D(container: HTMLDivElement) {
        this.group3DView = new Group3DView(container, this.editor.pc);
        this.group3DView.toggle(false);
        this.pc.addRenderView(this.group3DView);

        this.group3DView.groupWrap.addEventListener('scroll', () => {
            this.render();
        });
    }

    initView2D(container: HTMLDivElement) {
        this.group2DView = new Group2DView(container, this.editor.pc);
        this.group2DView.toggle(false);
        this.pc.addRenderView(this.group2DView);

        this.group2DView.groupWrap.addEventListener('scroll', () => {
            this.render();
        });
    }

    toggleImgMaxView(visible: boolean) {
        this.editor.state.checkConfig.showImageMax = visible;
        this.imgMaxView.toggle(visible);
    }

    updateImgMaxViewConfig() {
        let { checkConfig, frames } = this.editor.state;
        let frame = frames[checkConfig.imageMaxIndex];
        let resource = this.editor.dataResource.getResource(frame);

        if (resource instanceof ResourceLoader) return;

        this.imgMaxView.setOptions(resource.viewConfig[checkConfig.imageIndex]);
        this.pc.selectObject();
        this.render();
    }

    updateView3DAxis() {
        let axis = this.editor.state.checkConfig.axis;
        this.group3DView.views.forEach((view) => {
            view.setAxis(axis);
            if (view.object) view.fitObject();
        });
        this.render();
    }

    getView3D(config: any) {
        let view = new View3D(this.group3DView, config);
        view.updateObjectTransform = (object: THREE.Object3D, option: Partial<ITransform>) => {
            if (!option) return;
            this.editor.cmdManager.execute('update-transform', {
                object: object,
                transform: option,
            });
            object.userData.pointN = utils.computePointN(
                object as Box,
                view.points.geometry.getAttribute('position') as THREE.BufferAttribute,
            );
            view.updateProjectRect();
            this.render();
        };
        return view;
    }

    render() {
        let { config } = this.editor.state;
        if (!config.showCheckView) return;
        this.pc.render();
    }

    updateView() {
        let { checkConfig, config } = this.editor.state;

        if (!config.showCheckView) return;

        console.log('updateViewInfo', checkConfig.type);

        this.updateFrameObjects();
        this.updateViewRenderInfo();
    }

    updateViewRenderInfo() {
        let { checkConfig, config } = this.editor.state;

        if (checkConfig.type === '2d') {
            this.group2DView.enabled = true;
            this.group3DView.enabled = false;
            this.update2DViewObject();
        } else {
            this.group2DView.enabled = false;
            this.group3DView.enabled = true;
            this.update3DViewObject();
        }

        this.updateStatus();

        if (checkConfig.showImageMax && checkConfig.type === '2d') {
            this.pc.selectObject();
            this.updateImgMaxViewConfig();
        }

        this.editor.dispatchEvent({ type: Event.CHECK_UPDATE_VIEW });
    }

    updateFrameObjects() {
        let { frames, checkConfig } = this.editor.state;

        this.frameObjects.clear();
        frames.forEach((frame) => {
            let objects = this.editor.dataManager.getFrameObject(frame.id) || [];
            let filters = objects.filter((e) => e.userData.trackId === checkConfig.trackId);
            this.frameObjects.set(frame.id, filters);
        });
        this.editor.dispatchEvent({ type: Event.CHECK_UPDATE_FRAME_OBJECT });
    }

    update3DViewObject() {
        let { frames } = this.editor.state;

        this.group3DView.views.forEach((view, index) => {
            let frame = frames[index];
            let objects = this.frameObjects.get(frame.id) || [];
            let box = objects.find((e) => e instanceof Box) as Box;
            view.object = box;
            if (box) {
                view.fitObject();
            }
        });
    }

    update2DViewObject() {
        let { config, frames, checkConfig } = this.editor.state;
        let viewId = `${config.imgViewPrefix}-${checkConfig.imageIndex}`;

        this.group2DView.views.forEach((view, index) => {
            let frame = frames[index];
            let objects = (this.frameObjects.get(frame.id) || []) as (Rect | Box2D)[];
            let filters = objects.filter((e) => {
                return e.viewId === viewId && (e instanceof Rect || e instanceof Box2D);
            });

            view.objects = filters;
        });
    }

    updateViewSize() {
        let { frames, checkConfig } = this.editor.state;

        let width = checkConfig.subViewWidth * checkConfig.subViewScale;
        let height = checkConfig.subViewHeight * checkConfig.subViewScale;
        this.group3DView.views.forEach((view) => {
            view.container.style.width = width + 'px';
            view.container.style.height = height + 'px';
        });

        this.group2DView.views.forEach((view) => {
            view.container.style.width = width + 'px';
            view.container.style.height = height + 'px';
        });

        this.render();
    }

    createViewConfig() {
        let { state } = this.editor;
        let { frames, checkConfig } = state;

        let width = checkConfig.subViewWidth * checkConfig.subViewScale;
        let height = checkConfig.subViewHeight * checkConfig.subViewScale;

        frames.forEach((frame, index) => {
            this.group3DView.views.push(
                this.getView3D({
                    index: index,
                    width,
                    height,
                }),
            );
            state.checkConfig.status3D.push({
                frameIndex: index,
                hasObject: false,
                invisibleFlag: false,
                loadState: '',
            });

            this.group2DView.views.push(
                new View2D(this.group2DView, {
                    index: index,
                    width,
                    height,
                }),
            );
            state.checkConfig.status2D.push({
                frameIndex: index,
                hasObject: false,
                invisibleFlag: false,
                loadState: '',
            });
        });
    }

    updateStatus() {
        console.log('updateStatus');
        let { state } = this.editor;
        let { frames, checkConfig, config } = state;

        if (!checkConfig.trackId || !config.showCheckView) return;

        if (state.checkConfig.type === '3d') {
            state.checkConfig.status3D.forEach((config, index) => {
                let frame = frames[index];
                let view = this.group3DView.views[index];
                config.hasObject = !!view.object;
                config.invisibleFlag = view.object ? !!view.object.userData.invisibleFlag : false;

                if (config.loadState !== 'complete' && frame.loadState === 'complete') {
                    let resource = this.editor.dataResource.getResource(frame) as IDataResource;
                    view.points.updateData(resource.pointsData);
                    if (view.object) {
                        view.object.userData.pointN = utils.computePointN(
                            view.object,
                            view.points.geometry.getAttribute('position') as THREE.BufferAttribute,
                        );
                    }
                }
                config.loadState = frame.loadState;
            });
        }

        if (state.checkConfig.type === '2d') {
            state.checkConfig.status2D.forEach((config, index) => {
                let frame = frames[index];
                let view = this.group2DView.views[index];
                config.hasObject = view.objects.length > 0;
                config.invisibleFlag =
                    view.objects.length > 0 ? view.objects[0].userData.invisibleFlag : false;

                if (frame.loadState === 'complete') {
                    let resource = this.editor.dataResource.getResource(frame) as IDataResource;
                    view.image = resource.viewConfig[state.checkConfig.imageIndex].imgObject;
                } else {
                    view.image = null;
                }

                config.loadState = frame.loadState;
            });
        }
        this.render();
    }
}
