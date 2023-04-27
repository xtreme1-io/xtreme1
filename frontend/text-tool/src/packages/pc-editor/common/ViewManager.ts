import Editor from '../Editor';
import * as THREE from 'three';
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
    }

    updateViewAction(view: any) {
    }

    updateViewStatus() {
    }

    getMainView() {
    }

    setImgViews(configs: IImgViewConfig[]) {
    }

    // view
    showSingleImgView(index: number) {
    }

    showClassView(trackIds?: string | string[]) {
        this.editor.state.config.showClassView = true;
        if (trackIds)
            this.editor.dispatchEvent({ type: Event.SHOW_CLASS_INFO, data: { id: trackIds } });
    }

    showImgView() {
    }

    // track
    addTrackCircle(
        size: number = 100,
        option: { name?: string; id?: number } = { name: '' },
        position: THREE.Vector3 = new THREE.Vector3(),
    ) {
    }

    updateTrackCircle(id: number, size: number) {
    }
    delTrackCircle(id: number) {
    }
    clearTracks() {
    }

    updateBackgroundColor(color: string) {
    }
}
