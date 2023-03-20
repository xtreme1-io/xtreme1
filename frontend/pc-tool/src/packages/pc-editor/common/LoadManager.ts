import Editor from '../Editor';
import * as utils from '../utils';
import * as THREE from 'three';
import { IFrame, IObject, IDataResource, IUserData, Const } from '../type';
import { ResourceLoader } from './DataResource';
import { AnnotateObject } from 'pc-render';
import Event from '../config/event';

export default class LoadManager {
    editor: Editor;

    constructor(editor: Editor) {
        this.editor = editor;
    }

    async loadFrame(index: number, showLoading: boolean = true, force: boolean = false) {
        if (index === this.editor.state.frameIndex && !force) return;
        if (index > this.editor.state.frames.length - 1 || index < 0) return;
        // let currentTrack = this.editor.currentTrack;

        this.editor.state.frameIndex = index;

        this.editor.actionManager.stopCurrentAction();

        showLoading && this.editor.showLoading(true);
        try {
            await this.editor.getResultSources();
            await Promise.all([this.loadObjectAndClassification(), this.loadResource()]);
            // if (!this.editor.playManager.playing) this.editor.dataResource.load();
        } catch (error: any) {
            this.editor.handleErr(error);
        }

        // if (currentTrack) this.editor.selectByTrackId(currentTrack);
        this.editor.pc.selectObject();

        showLoading && this.editor.showLoading(false);
        // this.editor.setCurrentTrack(currentTrack);
        this.editor.dispatchEvent({ type: Event.FRAME_CHANGE, data: this.editor.state.frameIndex });
    }

    async loadClassification() {
        let { frameIndex, frames, classifications } = this.editor.state;
        let frame = frames[frameIndex];

        // console.log('loadClassification', this.playManger.playing);

        if (
            classifications.length > 0 &&
            (!frame.classifications || frame.classifications.length === 0)
        ) {
            try {
                // let valueMap = await api.getDataClassification(frame.id);
                let valueMap = await this.editor.businessManager.getFrameClassification(frame);
                let copClassifications = utils.copyClassification(
                    classifications,
                    valueMap[frame.id] || {},
                );

                frame.classifications = copClassifications;
            } catch (error: any) {
                this.editor.handleErr(error, this.editor.lang('load-classification-error'));
            }
        }
    }

    async loadObjectAndClassification() {
        let { frameIndex, frames, classifications } = this.editor.state;
        let frame = frames[frameIndex];

        let objects = this.editor.dataManager.getFrameObject(frame.id);
        if (!objects) {
            try {
                // let data = await api.getDataObject(datInfo.dataId);
                let data = await this.editor.businessManager.getFrameObject(frame);
                frame.queryTime = data.queryTime;
                // this.setTrackData(data.objectsMap);

                frame.classifications = utils.copyClassification(
                    classifications,
                    data.classificationMap[frame.id] || {},
                );

                let objects = data.objectsMap[frame.id] || [];
                let annotates = utils.convertObject2Annotate(objects, this.editor);
                this.editor.dataManager.setFrameObject(frame.id, annotates);
                this.editor.dataManager.updateFrameId(frame.id);
            } catch (error: any) {
                this.editor.handleErr(error, this.editor.lang('load-object-error'));
            }
        }
        // console.log(annotates);

        // this.editor.reset();
        this.editor.state.filterActive = [];
        // this.editor.dataManager.setFilterFromData();
        this.editor.dataManager.loadDataFromManager();
        this.editor.updateIDCounter();
        // this.editor.pc.addObject(annotates);
    }

    async loadAllClassification() {
        let { frames, classifications } = this.editor.state;

        if (frames.length === 0) return;

        try {
            // let valueMap = await api.getDataClassification(ids);
            let valueMap = await this.editor.businessManager.getFrameClassification(frames);

            frames.forEach((frame) => {
                let newClassifications = utils.copyClassification(
                    classifications,
                    valueMap[frame.id] || {},
                );

                frame.classifications = newClassifications;
            });
        } catch (error: any) {
            this.editor.handleErr(error, this.editor.lang('load-classification-error'));
        }
    }

    // SeriesFrame load
    async loadAllObjects() {
        let { frames } = this.editor.state;

        let filterFrames = frames.filter((e) => !this.editor.dataManager.getFrameObject(e.id));

        if (filterFrames.length === 0) return;

        try {
            let data = await this.editor.businessManager.getFrameObject(filterFrames);
            // let data = await api.getDataObject(dataIds);

            // this.setTrackData(data.objectsMap);

            filterFrames.forEach((frame) => {
                let objects = data.objectsMap[frame.id] || [];
                frame.queryTime = data.queryTime;

                let annotates = utils.convertObject2Annotate(objects, this.editor);
                annotates.forEach((obj) => {
                    let userData = obj.userData as IUserData;
                    if (!userData.id) userData.id = THREE.MathUtils.generateUUID();
                });

                this.editor.dataManager.setFrameObject(frame.id, annotates);
                // this.editor.dataManager.updateFrameId(frame.id);
            });
        } catch (error: any) {
            this.editor.handleErr(error, this.editor.lang('load-object-error'));
        }
    }

    // setTrackData(objectsMap: Record<string, IObject[]>) {
    //     // update trackId
    //     Object.keys(objectsMap).forEach((frameId) => {
    //         let objects = objectsMap[frameId] || [];
    //         objects.forEach((obj) => {
    //             if (!obj.trackId) obj.trackId = this.editor.createTrackId();
    //         });
    //     });

    //     let trackInfo = utils.getTrackFromObject(objectsMap);
    //     let objects = Object.keys(trackInfo.globalTrack).map((id) => trackInfo.globalTrack[id]);
    //     // update editor Id
    //     let maxId = getMaxId(objects);
    //     let startId = maxId + 1;
    //     objects.forEach((e) => {
    //         if (!e.trackName) e.trackName = startId++ + '';
    //     });
    //     this.editor.idCount = startId;

    //     Object.keys(trackInfo.globalTrack).forEach((trackId) => {
    //         this.editor.trackManager.addTrackObject(trackId, trackInfo.globalTrack[trackId]);
    //     });

    //     function getMaxId(objects: Partial<IObject>[]) {
    //         let maxId = 0;
    //         objects.forEach((e) => {
    //             if (!e.trackName) return;
    //             let id = parseInt(e.trackName);
    //             if (id > maxId) maxId = id;
    //         });
    //         return maxId;
    //     }
    // }

    async loadResource() {
        let { frames, frameIndex } = this.editor.state;
        let frame = frames[frameIndex];

        let resource = this.editor.dataResource.getResource(frame);
        if (resource instanceof ResourceLoader) {
            console.log('load Resource');
            resource.onProgress = (ratio: number) => {
                let percent = (ratio * 100).toFixed(2);
                this.editor.showLoading({
                    type: 'loading',
                    content: `${this.editor.lang('load-point')}${percent}%`,
                });
            };
            return resource
                .get()
                .then((data) => {
                    this.setResource(data);
                })
                .catch((e) => {
                    this.editor.handleErr(e, this.editor.lang('load-resource-error'));
                });
        } else {
            this.setResource(resource);
        }
    }

    setResource(data: IDataResource) {
        this.editor.viewManager.setImgViews(data.viewConfig);
        // if (!this.playManger.playing) this.editor.setImgViews(data.viewConfig);
        // this.editor.setPointCloudData(data.pointsData, 0);
        this.editor.setPointCloudData(data.pointsData, data.ground || 0, data.intensityRange);
    }
}
