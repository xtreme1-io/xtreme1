import { IFrame, IObject, IUserData, IClassType, Const } from '../type';
import { AnnotateObject, Box, ITransform } from 'pc-render';
import Editor from '../Editor';
import Event from '../config/event';
import { IUpdateTrackBatchOption, ITransformOption } from './CmdManager/cmd/UpdateTrackDataBatch';
import { IUpdateObjectUserDataOption } from './CmdManager/cmd/UpdateObjectUserData';

export type IMergeStatus = 'object_repeat' | 'classType_diff' | 'ok';
export interface IMergeCodeData {
    code: IMergeStatus;
    data?: any;
}

export default class TrackManager {
    editor: Editor;
    // track in global
    trackMap: Map<string, Partial<IObject>> = new Map();
    // track in frame
    frameTrackMap: Map<string, Partial<IObject>> = new Map();
    constructor(editor: Editor) {
        this.editor = editor;
    }

    // basic
    hasTrackObject(trackId: string) {
        return !!this.getTrackObject(trackId);
    }
    getTrackObject(trackId: string) {
        // let id = frame ? `${frame.id}-${trackId}` : trackId;
        // if (frame) return this.frameTrackMap.get(id) as IObject;
        return this.trackMap.get(trackId) as IObject;
    }

    removeTrackObject(trackId: string) {
        // let id = frame ? `${frame.id}-${trackId}` : trackId;
        // if (frame) return this.frameTrackMap.delete(id);
        return this.trackMap.delete(trackId);
    }
    addTrackObject(trackId: string, object: Partial<IObject>) {
        // let id = frame ? `${frame.id}-${trackId}` : trackId;
        // if (frame) return this.frameTrackMap.set(id, object);
        return this.trackMap.set(trackId, object);
    }

    updateTrackData(trackId: string, object: Partial<IObject>) {
        // console.log(trackId, object, frame);
        let trackObject = this.getTrackObject(trackId);
        Object.assign(trackObject, object || {});
        this.editor.dispatchEvent({ type: Event.TRACK_OBJECT_CHANGE, data: { trackId } });

        // this.editor.frameChange(frame);
    }

    updateTrackId() {
        let trackMap = this.trackMap;
        trackMap.forEach((track) => {});
    }

    // other
    getTrackObjectMap(trackId: string | string[]): Record<string, AnnotateObject[][]> {
        let { frames, frameIndex } = this.editor.state;

        const trackObjectMap = {};
        frames.forEach((frame) => {
            const trackIdMap = {};
            let objects = this.editor.dataManager.getFrameObject(frame.id) || [];
            objects.forEach((item) => {
                const trackId = item.userData.trackId;
                if (trackId) {
                    if (!trackIdMap[trackId]) {
                        trackIdMap[trackId] = [];
                    }
                    trackIdMap[trackId].push(item);
                }
            });
            trackObjectMap[frame.id] = trackIdMap;
        });

        const trackListMap: Record<string, AnnotateObject[][]> = {};
        const frameCount = frames.length;
        const trackIdArray = trackId instanceof Array ? trackId : [trackId];
        frames.forEach((item, frameIndex) => {
            const dataId = item.id;
            trackIdArray.forEach((trackId: string) => {
                const objects = (trackObjectMap[dataId] || {})[trackId];
                if (objects) {
                    if (!trackListMap[trackId]) {
                        trackListMap[trackId] = Array(frameCount);
                    }
                    trackListMap[trackId][frameIndex] = objects;
                }
            });
        });
        return trackListMap;
    }
    splitTrackObject(config: {
        trackId: string;
        start: number;
        end?: number;
        userData: IUserData;
    }) {
        let { frames, frameIndex } = this.editor.state;

        const targetTrackId = config.userData.trackId || this.editor.createTrackId();
        let trackName = this.editor.getId();
        Object.assign(config.userData, {
            trackId: targetTrackId,
            trackName,
        } as IUserData);

        // const objects: AnnotateObject[] = [];
        let splitFrames = frames.slice(config.start, config.end);
        let splitObject = this.getObjects(config.trackId, splitFrames)[0];
        let splitUserData = splitObject.userData as IUserData;

        let trackObject: Partial<IObject> = {
            trackId: targetTrackId,
            trackName,
            resultType: splitUserData.resultType,
            classType: config.userData.classType,
        };

        this.editor.cmdManager.withGroup(() => {
            this.editor.cmdManager.execute('add-track', trackObject);
            this.setDataByTrackId(
                config.trackId,
                {
                    userData: config.userData,
                },
                splitFrames,
            );
        });
        const selection = this.editor.pc.selection;
        let currentTrack = selection.length > 0 ? selection[0].userData.trackId : null;
        this.editor.setCurrentTrack(currentTrack);
    }
    canSplit(trackId: string, start?: number, end?: number) {
        const objects = this.getTrackObjectMap(trackId)[trackId];
        let frameIndex = typeof start === 'number' ? start : this.editor.state.frameIndex;
        end = end || Infinity;
        let beforeStatus = false;
        let afterStatus = false;

        for (let i = 0; i < objects.length; i++) {
            const items = objects[i];
            if (!items || items.length <= 0) continue;
            if (i < frameIndex) {
                beforeStatus = true;
            } else if (i < end) {
                afterStatus = true;
            }
            if (beforeStatus && afterStatus) break;
        }

        return beforeStatus && afterStatus;
    }
    canMerge(
        trackId: string,
        targetTrackId: string,
        frameIndex?: [number, number],
    ): IMergeCodeData {
        const objectMap = this.getTrackObjectMap([trackId, targetTrackId]);
        const trackObjects = objectMap[trackId];
        const targetObjects = objectMap[targetTrackId];

        const errFrameIndex: number[] = [];

        const check = (a: AnnotateObject[], b: AnnotateObject[]) => {
            if (!a || !b) return false;
            let boxCount = 0;

            a.forEach((item) => {
                if (item instanceof Box) {
                    boxCount++;
                }
            });
            b.forEach((item) => {
                if (item instanceof Box) {
                    boxCount++;
                }
            });

            return boxCount > 1;
        };

        trackObjects.forEach((item, index) => {
            if (frameIndex && (frameIndex[0] > index || frameIndex[1] <= index)) return;
            if (check(item, targetObjects[index])) {
                errFrameIndex.push(index);
            }
        });

        if (errFrameIndex.length > 0) {
            return {
                code: 'object_repeat',
                data: errFrameIndex,
            };
        }

        const checkClassType = () => {
            const aType = (trackObjects.find((item) => !!item) || [])[0]?.userData.classType;
            const bType = (targetObjects.find((item) => !!item) || [])[0]?.userData.classType;
            return aType === bType;
        };

        if (!checkClassType()) {
            return {
                code: 'classType_diff',
            };
        }

        return {
            code: 'ok',
        };
    }
    mergeTrackObject(trackId: string, targetTrackId: string) {
        if (!trackId || !targetTrackId) return;

        let trackObject = this.getTrackObject(targetTrackId);
        const trackName = trackObject.trackName;

        this.editor.cmdManager.withGroup(() => {
            this.setDataByTrackId(trackId, {
                userData: {
                    trackName: trackName,
                    trackId: targetTrackId,
                },
            });

            this.editor.cmdManager.execute('delete-track', trackId);
        });
        this.editor.selectByTrackId(targetTrackId);
    }

    deleteObjectByTrack(
        trackId: string,
        frames: IFrame[],
        validFn: (f: IFrame, e: AnnotateObject) => boolean = () => true,
    ) {
        let objects = this.getObjects(trackId, frames, validFn);
        if (!objects) return;

        let deleteData = [] as { objects: AnnotateObject[]; frame: IFrame }[];
        objects.forEach((obj) => {
            // TODO (obj as any).frame
            deleteData.push({ objects: [obj], frame: (obj as any).frame as IFrame });
        });
        this.editor.cmdManager.execute('delete-object', deleteData);
        this.editor.dispatchEvent({ type: Event.UPDATE_TIME_LINE });
    }

    getObjects(
        trackIds: string | string[],
        frames?: IFrame[],
        filter: (f: IFrame, e: AnnotateObject) => boolean = () => true,
    ) {
        frames = frames || this.editor.state.frames;
        if (!Array.isArray(trackIds)) trackIds = [trackIds];

        let idMap = {};
        trackIds.forEach((e) => (idMap[e] = true));

        let findObjects = [] as AnnotateObject[];
        frames.forEach((frame) => {
            let objects = this.editor.dataManager.getFrameObject(frame.id) || [];
            objects.forEach((obj) => {
                if (idMap[obj.userData.trackId] && filter(frame, obj)) findObjects.push(obj);
            });
        });
        return findObjects;
    }

    // global
    setTrackData(
        trackIds: string | string[],
        option: {
            userData?: Pick<IUserData, 'trackName' | 'resultType' | 'classType'>;
            size3D?: THREE.Vector3;
        } = {},
        filter: (f: IFrame, e: AnnotateObject) => boolean = () => true,
    ) {
        if (!this.editor.state.isSeriesFrame) return;

        if (!Array.isArray(trackIds)) trackIds = [trackIds];

        let objects = this.getObjects(trackIds, undefined, filter);

        this.editor.cmdManager.withGroup(() => {
            if (option.userData) {
                let options: IUpdateTrackBatchOption = {
                    tracks: [],
                    objects: objects,
                };
                (trackIds as string[]).forEach((id) => {
                    options.tracks.push({ trackId: id, data: option.userData as any });
                });
                this.editor.cmdManager.execute('update-track-data-batch', options);
            }

            if (option.size3D) {
                let object3Ds = objects.filter((e) => e instanceof Box);
                let transform = { scale: option.size3D } as ITransform;
                this.editor.cmdManager.execute('update-transform-batch', {
                    objects: object3Ds as any,
                    transforms: transform,
                });
            }
        });
        this.editor.pc.render();
    }

    updateObjectRenderInfo(objects: AnnotateObject[] | AnnotateObject) {
        if (!Array.isArray(objects)) objects = [objects];

        objects.forEach((obj) => {
            let frame = (obj as any).frame as IFrame;
            // TODO
            if (frame) frame.needSave = true;

            let userData = this.editor.getObjectUserData(obj);
            let classType = userData.classType || '';
            let classConfig = this.editor.getClassType(classType);

            if (obj instanceof Box) {
                obj.editConfig.resize = !userData.isStandard && userData.resultType !== Const.Fixed;
                obj.color.setStyle(classConfig ? classConfig.color : '#ffffff');
            } else {
                obj.color = classConfig ? classConfig.color : '#ffffff';
            }

            obj.dashed = !!userData.invisibleFlag;
        });
        this.editor.pc.render();
    }

    setDataByTrackId(
        trackIds: string | string[],
        option: { userData: IUserData; size3D?: THREE.Vector3 } = { userData: {} },
        frames?: IFrame[],
        size3DFilter: (f: IFrame, e: AnnotateObject) => boolean = () => true,
    ) {
        let objects = this.getObjects(trackIds, frames, size3DFilter);
        this.editor.cmdManager.withGroup(() => {
            if (option.userData) {
                let options: IUpdateObjectUserDataOption = {
                    data: option.userData,
                    objects: objects,
                };
                objects.length > 0 &&
                    this.editor.cmdManager.execute('update-object-user-data', options);
            }

            if (option.size3D) {
                let object3Ds = objects.filter((e) => e instanceof Box);
                objects = objects.filter((e) => e instanceof Box);
                let transform = { scale: option.size3D } as ITransform;

                object3Ds.length > 0 &&
                    this.editor.cmdManager.execute('update-transform-batch', {
                        objects: object3Ds as any,
                        transforms: transform,
                    });
            }
        });
        this.editor.pc.render();
    }
}
