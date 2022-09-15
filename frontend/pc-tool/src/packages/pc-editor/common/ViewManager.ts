import Editor from '../Editor';
import * as THREE from 'three';
import {
    TransformControlsAction,
    RenderView,
    ResizeTransAction,
    SideRenderView,
    Image2DRenderView,
    Edit2DAction,
    MainRenderView,
} from 'pc-render';
import { OPType, IImgViewConfig } from '../type';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import Event from '../config/event';

const trackGeometry = new THREE.RingGeometry(0.998, 1.002, 60);
const trackMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    side: THREE.DoubleSide,
    depthTest: false,
});

export default class ViewManager {
    initResize: boolean = false;
    editor: Editor;

    constructor(editor: Editor) {
        this.editor = editor;
        this.handleWindowResize();

        if (import.meta.env.DEV) {
            this.initStats();
        }
    }
    // Stats
    initStats() {
        let stats = Stats();
        stats.dom.style.bottom = '300px';
        stats.dom.style.left = '10px';
        stats.dom.style.top = 'auto';
        document.body.appendChild(stats.dom);

        let frame = () => {
            stats.update();
            requestAnimationFrame(frame);
        };
        frame();
    }

    handleWindowResize() {
        if (this.initResize) return;
        window.addEventListener('resize', () => {
            this.editor.pc.renderViews.forEach((view) => {
                if (view instanceof SideRenderView) {
                    view.fitObject();
                }
                view.render();
            });
            // this.editor.pc.render();
        });
        this.initResize = true;
    }

    updateViewAction(view: RenderView) {
        let config = this.editor.state.modeConfig;
        if (view instanceof SideRenderView) {
            let action = view.getAction('resize-translate') as ResizeTransAction;
            if (action) {
                // action.toggle(config.op === OPType.EXECUTE);
                if (config.op === OPType.EXECUTE) {
                    action.editConfig.move = true;
                    action.editConfig.moveCanvas = true;
                    action.editConfig.zoom = true;
                    action.editConfig.transform = true;
                } else {
                    action.editConfig.move = false;
                    action.editConfig.moveCanvas = true;
                    action.editConfig.zoom = true;
                    action.editConfig.transform = false;
                }
            }
            view.render();
        }

        if (view instanceof Image2DRenderView) {
            let action = view.getAction('edit-2d') as Edit2DAction;
            if (action) action.toggle(config.op === OPType.EXECUTE);
            view.render();
        }
    }

    updateViewStatus() {
        this.editor.pc.renderViews.forEach((view) => {
            this.updateViewAction(view);
        });
    }

    getMainView() {
        let view = this.editor.pc.renderViews.find(
            (e) => e instanceof MainRenderView,
        ) as MainRenderView;
        return view;
    }

    setImgViews(configs: IImgViewConfig[]) {
        let { state, pc } = this.editor;
        state.imgViews = configs;
        if (state.imgViews.length === 0) {
            state.config.showImgView = false;
        }

        let prefix = state.config.imgViewPrefix;
        let singlePrefix = state.config.singleViewPrefix;
        if (pc.renderViews.length > 0) {
            pc.renderViews.forEach((view) => {
                if (view instanceof Image2DRenderView) {
                    if (view.name.startsWith(prefix)) {
                        let index = +view.name.replace(`${prefix}-`, '');
                        let config = configs[index];
                        if (config) {
                            view.setOptions(config);
                        }
                    }

                    // max view
                    if (state.config.showSingleImgView && view.name === singlePrefix) {
                        let config = configs[state.config.singleImgViewIndex];
                        if (config) {
                            view.setOptions(config);
                        }
                    }
                }
            });
        }
    }

    // view
    showSingleImgView(index: number) {
        let { state, pc } = this.editor;

        state.config.showSingleImgView = true;
        state.config.showImgView = false;
        state.config.singleImgViewIndex = index;

        setTimeout(() => {
            let viewName = `${state.config.imgViewPrefix}-${index}`;
            let imgView = {} as Image2DRenderView;
            let maxView = {} as Image2DRenderView;
            pc.renderViews.forEach((view) => {
                if (view.name === viewName) imgView = view as Image2DRenderView;

                if (view instanceof Image2DRenderView) {
                    if (view.name === state.config.singleViewPrefix) {
                        view.toggle(true);
                        // view.updateSize();
                        maxView = view;
                    } else {
                        view.toggle(false);
                    }
                }
                // else if (view instanceof MainRenderView) {
                //     view.toggle(false);
                // }
            });

            maxView.renderId = imgView.id;
        });
    }

    showClassView(trackIds?: string | string[]) {
        this.editor.state.config.showClassView = true;
        if (trackIds)
            this.editor.dispatchEvent({ type: Event.SHOW_CLASS_INFO, data: { id: trackIds } });
    }

    showImgView() {
        let { state, pc } = this.editor;

        state.config.showImgView = true;
        state.config.showSingleImgView = false;

        setTimeout(() => {
            pc.renderViews.forEach((view) => {
                if (view instanceof Image2DRenderView) {
                    if (view.name === state.config.singleViewPrefix) {
                        view.toggle(false);
                    } else {
                        view.toggle(true);
                    }
                }
                // else if (view instanceof MainRenderView) {
                //     view.toggle(true);
                // }
            });
        });
    }

    // track
    addTrackCircle(
        size: number = 100,
        option: { name?: string; id?: number } = { name: '' },
        position: THREE.Vector3 = new THREE.Vector3(),
    ) {
        const trackCircle = new THREE.Mesh(trackGeometry, trackMaterial);

        trackCircle.scale.set(size, size, 1);
        trackCircle.position.copy(position);
        trackCircle.name = option.name || '';
        trackCircle.userData.id = option.id;

        this.editor.pc.groupTrack.add(trackCircle);
        this.editor.pc.render();
    }

    updateTrackCircle(id: number, size: number) {
        const object = this.editor.pc.groupTrack.children.find(
            (item: THREE.Object3D) => item.userData.id === id,
        );
        if (object) {
            object.scale.set(size, size, 1);
            this.editor.pc.render();
        }
    }
    delTrackCircle(id: number) {
        const index = this.editor.pc.groupTrack.children.findIndex(
            (item: THREE.Object3D) => id === item.userData.id,
        );
        if (typeof index === 'number') {
            this.editor.pc.groupTrack.children.splice(index, 1);
            this.editor.pc.render();
        }
    }
    clearTracks() {
        this.editor.pc.groupTrack.clear();
        this.editor.pc.render();
    }

    updateBackgroundColor(color: string) {
        let { pc } = this.editor;
        let mainRenderView = pc.renderViews.find(
            (view) => view instanceof MainRenderView,
        ) as MainRenderView;
        if (mainRenderView) {
            mainRenderView.setBackgroundColor(new THREE.Color(color));
        }
    }
}
