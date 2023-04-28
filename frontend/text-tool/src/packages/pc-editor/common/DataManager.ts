import { ITextItem, IFrame } from '../type';
import Editor from '../Editor';
import { Event as EditorEvent } from 'pc-editor';
// import * as api from '../api';
import * as utils from '../utils';
import { Const, ICmdName, IFilter, IUserData } from '../type';
import Event from '../config/event';
import * as THREE from 'three';

interface ITransform2DBox {
    positions2?: Record<number, THREE.Vector2>;
    positions1?: Record<number, THREE.Vector2>;
}

interface ITransform2DRect {
    center?: THREE.Vector2;
    size?: THREE.Vector2;
}

export type IAnnotateTransform = ITransform2DBox | ITransform2DRect;

export default class DataManager {
    editor: Editor;
    sceneMap: Map<string, IFrame[]> = new Map();
    // <frame_id, <message_id, ITextItem>>
    frameTextMap: Map<string, Map<string, ITextItem>> = new Map();

    //////////////////////////////////////////////
    // object
    dataMap: Map<string, any[]> = new Map();
    hasMap: Map<string, Map<string, any>> = new Map();
    constructor(editor: Editor) {
        this.editor = editor;
        this.initEvent();
    }

    /**
     * scene
     */
    setSceneData(data: IFrame[]) {
        this.clearSceneMap();
        data.forEach((e) => {
            let sceneKey = String(e.sceneId || -1);
            let arr = this.sceneMap.get(sceneKey);
            if (!arr) {
                arr = [];
                this.sceneMap.set(sceneKey, arr);
            }
            arr.push(e);
        });
    }
    getFramesBySceneIndex(index: number) {
      const arr = Array.from(this.sceneMap.values());
      return arr[index] || [];
    }
    getFramesBySceneId(id: string) {
      return this.sceneMap.get(id + '') || [];
    }
    clearSceneMap() {
      this.sceneMap.clear();
    }
    /**
     * 文本内容数据
    */
    setJSONData(data: ITextItem[], frame?: IFrame) {
        let dataFrame = frame || this.editor.getCurrentFrame();
        let textMap = new Map<string, ITextItem>();
        data.forEach((e) => {
            let initItem: ITextItem = {
                ...e,
                uuid: '',
                direction: ''
            }
            textMap.set(e.id, initItem);
        });
        this.frameTextMap.set(String(dataFrame.id), textMap);
    }
    getTextById(id: string, frame?: IFrame) {
        let dataFrame = frame || this.editor.getCurrentFrame();
        let map = this.frameTextMap.get(String(dataFrame.id));
        return map?.get(id) || null;
    }
    getTextItemsByFrame(frame?: IFrame) {
        let dataFrame = frame || this.editor.getCurrentFrame();
        let map = this.frameTextMap.get(String(dataFrame.id));
        return map ? Array.from(map.values()) : [];
    }
    updateTextDataState(data: Record<string, any>) {
        let frameIds = Object.keys(data);
        if (frameIds.length === 0) return;
        frameIds.forEach((id) => {
            let frameData = data[id];
            if (!frameData || frameData.length == 0) return;
            let frame = this.editor.getFrame(id);
            frameData.forEach((e: any) => {
                let item = this.getTextById(e.messageId, frame);
                if (!item) return;
                item.backId = e.backId;
                item.direction = e.direction;
                item.type = e.type;
                item.createdAt = e.createdAt;
                item.createdBy = e.createdBy;
            });
        });
    }
    clearTextMap() {}
    onTextChange(item: ITextItem, direction: '' | 'up' | 'down') {
        item.direction = direction;
        item.needSave = true;
        this.editor.getCurrentFrame().needSave = true;
    }









    /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////

    hasObject(uuid: string, frame?: IFrame): boolean {
        frame = frame || this.editor.getCurrentFrame();
        let frameMap = this.hasMap.get(frame.id);
        return !!frameMap && frameMap.has(uuid);
    }

    setHasMap(uuid: string, object: any, frame?: IFrame) {
        frame = frame || this.editor.getCurrentFrame();
        let frameMap = this.hasMap.get(frame.id);
        if (!frameMap) frameMap = new Map();
        frameMap.set(uuid, object);
    }

    removeHasMap(uuid: string, frame?: IFrame) {
        frame = frame || this.editor.getCurrentFrame();
        let frameMap = this.hasMap.get(frame.id);
        if (frameMap) frameMap.delete(uuid);
    }

    addAnnotates(
        objects: any,
        frame?: IFrame,
        reload: boolean = true,
    ) {
    }

    removeAnnotates(
        objects: any,
        frame?: IFrame,
        reload: boolean = true,
    ) {
    }

    setAnnotatesVisible(
        objects: any,
        visible: boolean | boolean[],
        frame?: IFrame,
    ) {
    }

    setAnnotatesUserData(
        objects: any,
        datas: IUserData | IUserData[],
        frame?: IFrame,
    ) {
    }

    setAnnotatesTransform(
        objects: any,
        datas: IAnnotateTransform | IAnnotateTransform[],
        frame?: IFrame,
    ) {
    }

    initEvent() {}

    clear() {
        this.dataMap.clear();
    }

    onAnnotatesChange(
        objects: any,
        frame?: IFrame,
        data?: { type?: 'userData' | 'transform' | 'visible'; [k: string]: any },
    ) {
        frame = frame || this.editor.getCurrentFrame();
        frame.needSave = true;

        if (data?.type === 'transform') {
            // ANNOTATE_TRANSFORM_CHANGE
            this.editor.dispatchEvent({
                type: Event.ANNOTATE_TRANSFORM_CHANGE,
                data: { ...data, frame, objects },
            });
        } else {
            console.log('onAnnotatesChange', { ...data, frame });
            this.editor.dispatchEvent({
                type: Event.ANNOTATE_CHANGE,
                data: { ...data, frame, objects },
            });
        }
    }

    onAnnotatesAdd(objects: any[], frame?: IFrame) {
        frame = frame || this.editor.getCurrentFrame();
    }

    onAnnotatesRemove(objects: any[], frame?: IFrame) {
    }

    setFrameObject(frameId: string, objects: any[]) {
    }

    getFrameObject(frameId: string) {
        return this.dataMap.get(frameId);
    }

    loadDataFromManager() {
        let frame = this.editor.getCurrentFrame();

        console.log('loadDataFromManager', this.editor.state.frameIndex);

        let objects = this.getFrameObject(frame.id) || [];

        // this.editor.pc.addObject(annotate3D);
        // this.editor.pc.annotate2D = annotate2D;
        // this.editor.pc.annotate3D.children = annotate3D;
        // this.editor.dispatchEvent({ type: Event.ANNOTATE_LOAD });
        // this.editor.pc.render();
        // this.editor.updateIDCounter();
    }

    setFilterFromData() {
        let { frameIndex, frames } = this.editor.state;
        let { FILTER_ALL } = this.editor.state.config;

        // if (this.editor.playManager.playing) {
        //     this.editor.state.filterActive = [FILTER_ALL];
        //     return;
        // }

        let frame = this.editor.getCurrentFrame();
        let objects = this.getFrameObject(frame.id) || [];
        let all: IFilter = { value: FILTER_ALL, label: FILTER_ALL, type: '' };
        let project: IFilter = { label: 'Ground Truth', options: [], type: 'project' };
        let model: IFilter = { label: 'Model Runs', options: [], type: 'model' };

        let projectMap = {};
        let modelMap = {};

        objects.forEach((object) => {
            let userData = object.userData as Required<IUserData>;
            if (userData.modelRun) {
                let id = userData.modelRun || '';
                let label = userData.modelRunLabel || '';
                if (!modelMap[id]) {
                    let option = { value: id, label: label };
                    model.options?.push(option);
                    modelMap[id] = option;
                }
            } else {
                let name = userData.project || '';
                if (!projectMap[name]) {
                    let option = { value: name, label: name || 'No Project' };
                    project.options?.push(option);
                    projectMap[name] = option;
                }
            }
        });

        let filters = [all] as IFilter[];

        if ((project as any).options.length > 0) filters.push(project);
        if ((model as any).options.length > 0) filters.push(model);

        this.editor.state.filters = filters;
        if (this.editor.state.filterActive.length === 0)
            this.editor.state.filterActive = [FILTER_ALL];

        this.editor.needUpdateFilter = false;
    }

    getActiveFilter() {
        let { FILTER_ALL } = this.editor.state.config;
        let { sourceFilters } = this.editor.state;

        let filterMap = {
            all: false,
            source: {},
            // project: {},
            // model: {},
        };
        sourceFilters.forEach((filter) => {
            if (filter === FILTER_ALL) filterMap.all = true;
            else {
                filterMap.source[filter] = true;
            }
        });

        return filterMap;
    }

    getMaxId(frameId?: string) {
        let { frameIndex, frames } = this.editor.state;
        let curFrame = frames[frameIndex];

        let objects = this.getFrameObject(frameId || curFrame.id) || [];
        let maxId = 0;
        objects.forEach((e) => {
            if (!e.userData.trackName) return;
            let id = parseInt(e.userData.trackName);
            if (id > maxId) maxId = id;
        });
        return maxId;
    }

    updateFrameId(frameId?: string) {
        let { frameIndex, frames } = this.editor.state;
        let curFrame = frames[frameIndex];

        frameId = frameId || curFrame.id;
        let objects = this.getFrameObject(frameId) || [];

        let startId = this.getMaxId(frameId) + 1;
        objects.forEach((e) => {
            let userData = e.userData as IUserData;
            userData.id = userData.id || THREE.MathUtils.generateUUID();

            if (userData.trackId) return;

            userData.trackId = this.editor.createTrackId();
            userData.trackName = startId++ + '';
        });

        // if (curFrame && frameId === curFrame.id) this.editor.idCount = startId;
    }

    updateBackId(keyMap: Record<string, Record<string, string>>) {
        Object.keys(keyMap).forEach((dataId) => {
            let dataKeyMap = keyMap[dataId];
            let annotates = this.getFrameObject(dataId) || [];
            annotates.forEach((annotate) => {
                let frontId = annotate.uuid;
                let backId = dataKeyMap[frontId];
                if (!backId) return;
                (annotate.userData as IUserData).backId = backId;
                // annotate.uuid = backId;
            });
        });
    }

    async pollDataModelResult() {}

    // async runModelTrack(
    //     curId: string,
    //     toIds: string[],
    //     direction: 'BACKWARD' | 'FORWARD',
    //     targetObjects: any[],
    //     trackIdName: Record<string, string>,
    //     onComplete?: () => void,
    // ) {}
    // copyForward() {
    //     return this.track({
    //         direction: 'FORWARD',
    //         object: this.editor.pc.selection.length > 0 ? 'select' : 'all',
    //         method: 'copy',
    //         frameN: 1,
    //     });
    // }
    // copyBackWard() {
    //     return this.track({
    //         direction: 'BACKWARD',
    //         object: this.editor.pc.selection.length > 0 ? 'select' : 'all',
    //         method: 'copy',
    //         frameN: 1,
    //     });
    // }
    // async track(option: {
    //     method: 'copy' | 'model';
    //     object: 'select' | 'all';
    //     direction: 'BACKWARD' | 'FORWARD';
    //     frameN: number;
    // }) {
    //     let editor = this.editor;
    //     let { frameIndex, frames } = editor.state;
    //     let curId = frames[frameIndex].id;

    //     const getToDataId = function getToDataId() {
    //         let ids = [] as string[];
    //         let forward = option.direction === 'FORWARD' ? 1 : -1;
    //         let frameN = option.frameN;

    //         if (frameN > 0)
    //             for (let i = 1; i <= frameN; i++) {
    //                 let frame = frames[frameIndex + forward * i];
    //                 if (frame) {
    //                     ids.push(frame.id);
    //                 }
    //             }
    //         return ids;
    //     };
    //     const getObjects = function getObjects() {
    //         let dataId = frames[frameIndex].id;
    //         let objects = editor.dataManager.getFrameObject(dataId) || [];

    //         if (option.object === 'select') {
    //             objects = editor.pc.selection;
    //         }

    //         objects = objects.filter((object) => {
    //             return object instanceof Box && !object.userData.invisibleFlag;
    //         });

    //         return objects as Box[];
    //     };
    //     let ids = getToDataId();
    //     if (ids.length === 0) {
    //         // editor.showMsg('warning', props.state.$$('warnEmptyTarget'));
    //         return;
    //     }

    //     let objects = getObjects();
    //     if (objects.length === 0) {
    //         editor.showMsg('warning', editor.lang('track-no-source'));
    //         return;
    //     }

    //     if (option.method === 'copy') {
    //         utils.copyData(editor, curId, ids, objects);
    //         editor.showMsg('success', editor.lang('track-ok'));
    //         this.gotoNext(ids[0]);
    //     } else {
    //         await this.modelTrack(ids, objects, option.direction);
    //     }
    // }
    // gotoNext(dataId: string) {
    //     let { frames } = this.editor.state;
    //     let index = frames.findIndex((e) => e.id === dataId);
    //     // index = Math.max(0, Math.min(editor.state.frames.length-1, index))
    //     if (index < 0) return;
    //     this.editor.loadFrame(index);
    //     this.editor.dispatchEvent({ type: EditorEvent.UPDATE_TIME_LINE });
    // }
    // async modelTrack(
    //     toIds: string[],
    //     objects: AnnotateObject[],
    //     direction: 'BACKWARD' | 'FORWARD',
    // ) {
    //     let editor = this.editor;
    //     let { frameIndex, frames } = editor.state;
    //     let dataInfo = frames[frameIndex];
    //     let curId = dataInfo.id;
    //     // let direction = iState.trackDirection === 'backward' ? 'BACKWARD' : 'FORWARD';
    //     // let dataIds = dataList.slice(1, 10).map((e) => +e.dataId);

    //     // Partial<IObject>
    //     let trackIdName = {} as Record<string, string>;
    //     let targetObjects = [] as any[];
    //     objects.forEach((object) => {
    //         if (object instanceof Box) {
    //             let userData = object.userData as IUserData;
    //             let { position, scale, rotation } = object;
    //             let center3D = new THREE.Vector3().set(position.x, position.y, position.z);
    //             let rotation3D = new THREE.Vector3().set(rotation.x, rotation.y, rotation.z);
    //             let size3D = new THREE.Vector3().set(scale.x, scale.y, scale.z);

    //             if (!userData.trackId) {
    //                 userData.trackId = editor.createTrackId();
    //             }

    //             trackIdName[userData.trackId] = userData.trackName || '';

    //             targetObjects.push({
    //                 uuid: object.uuid,
    //                 trackingId: userData.trackId,
    //                 objType: '3d',
    //                 modelClass: userData.modelClass || null,
    //                 confidence: userData.confidence || null,
    //                 center3D,
    //                 rotation3D,
    //                 size3D,
    //             });
    //         }
    //     });

    //     this.runModelTrack(curId, toIds, direction as any, targetObjects, trackIdName, () => {
    //         this.gotoNext(toIds[0]);
    //     });
    // }
}
