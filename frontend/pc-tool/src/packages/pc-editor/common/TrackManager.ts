import { IFrame, IUserData, ITrackCount, Const, IInfo2D, ObjectType, IBSObject } from '../type';
import { AnnotateObject, Box, ITransform, Rect, Box2D, Object2D } from 'pc-render';
import Editor from '../Editor';
import Event from '../config/event';
import { IUpdateTrackBatchOption, ITransformOption } from './CmdManager/cmd/UpdateTrackDataBatch';
import { IUpdateObjectUserDataOption } from './CmdManager/cmd/UpdateObjectUserData';
import * as utils from '../utils';
import * as _ from 'lodash';

export type IMergeStatus = 'object_repeat' | 'classType_diff' | 'ok';
export interface IMergeCodeData {
    code: IMergeStatus;
    data?: any;
}

export default class TrackManager {
    editor: Editor;
    // track
    trackMap: Map<string, Partial<IUserData>> = new Map();

    trackInfo: Map<string, ITrackCount> = new Map();
    constructor(editor: Editor) {
        this.editor = editor;
    }

    clear() {
        this.trackMap.clear();
        this.trackInfo.clear();
    }

    // basic
    hasTrackObject(trackId: string) {
        return !!this.getTrackObject(trackId);
    }
    getTrackObject(trackId: string) {
        // let id = frame ? `${frame.id}-${trackId}` : trackId;
        // if (frame) return this.frameTrackMap.get(id) as IObject;
        return this.trackMap.get(trackId + '') as IUserData;
    }

    removeTrackObject(trackId: string) {
        return this.trackMap.delete(trackId + '');
    }
    addTrackObject(trackId: string, object: Partial<IUserData>) {
        // let id = frame ? `${frame.id}-${trackId}` : trackId;
        // if (frame) return this.frameTrackMap.set(id, object);
        return this.trackMap.set(trackId + '', object);
    }

    updateTrackData(trackId: string, object: Partial<IUserData>) {
        // console.log(trackId, object, frame);

        const trackObject = this.getTrackObject(trackId);
        // console.log(trackId, trackObject, object);
        Object.assign(trackObject, object || {});
        // this.editor.dispatchEvent({ type: Event.TRACK_OBJECT_CHANGE, data: { trackId } });

        // this.editor.frameChange(frame);
    }

    updateTrackId() {
        const trackMap = this.trackMap;
        trackMap.forEach((track) => {});
    }
    // count

    addTrackCount(objects: AnnotateObject | AnnotateObject[], frame: IFrame) {
        const { isSeriesFrame } = this.editor.state;
        if (!isSeriesFrame) return;

        if (!Array.isArray(objects)) objects = [objects];

        objects.forEach((obj) => {
            const userData = obj.userData as IUserData;
            const trackId = userData.trackId || '';
            if (!this.trackInfo.has(trackId)) {
                this.trackInfo.set(trackId, {
                    object3D: 0,
                    object2D: [],
                    count: 0,
                });
            }
            const info = this.trackInfo.get(trackId) as ITrackCount;
            if (obj instanceof Box) {
                info.object3D++;
            } else {
                const viewIndex = userData.viewIndex as number;
                const type = obj.objectType;
                if (!_.isNumber(viewIndex)) return;

                if (!info.object2D[viewIndex]) info.object2D[viewIndex] = {} as any;
                const inf2d = info.object2D[viewIndex] as IInfo2D;
                if (!inf2d[type]) inf2d[type] = 0;
                inf2d[type]++;
            }

            info.count++;
        });
    }

    removeTrackCount(objects: AnnotateObject | AnnotateObject[], frame: IFrame) {
        const { isSeriesFrame } = this.editor.state;
        if (!isSeriesFrame) return;

        if (!Array.isArray(objects)) objects = [objects];
        objects.forEach((obj) => {
            const userData = obj.userData as IUserData;
            const trackId = userData.trackId || '';
            if (!this.trackInfo.has(trackId)) return;

            const info = this.trackInfo.get(trackId) as ITrackCount;
            if (obj instanceof Box) {
                info.object3D--;
            } else {
                const type = obj.objectType;
                const viewIndex = userData.viewIndex as number;

                if (!_.isNumber(viewIndex)) return;
                const inf2d = info.object2D[viewIndex] as IInfo2D;
                if (!inf2d || !(type in inf2d)) return;

                inf2d[type]--;
                if (inf2d[type] <= 0) {
                    delete (inf2d as any)[type];
                }
                if (Object.keys(inf2d).length === 0) {
                    info.object2D[viewIndex] = undefined as any;
                }
            }

            info.count--;

            if (info.count <= 0) {
                this.trackInfo.delete(trackId);
            }
        });
    }

    // other
    getTrackObjectMap(trackId: string | string[]): Record<string, AnnotateObject[][]> {
        const { frames, frameIndex } = this.editor.state;

        const trackObjectMap = {};
        frames.forEach((frame) => {
            const trackIdMap = {};
            const objects = this.editor.dataManager.getFrameObject(frame.id) || [];
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
        const { frames, frameIndex } = this.editor.state;

        const targetTrackId = config.userData.trackId || this.editor.createTrackId();
        const trackName = this.editor.getId();
        Object.assign(config.userData, {
            trackId: targetTrackId,
            trackName,
        } as IUserData);

        // const objects: AnnotateObject[] = [];
        const splitFrames = frames.slice(config.start, config.end);
        const splitObject = this.getObjects(config.trackId, splitFrames)[0];
        const splitUserData = splitObject.userData as IUserData;

        const trackObject: Partial<IUserData> = {
            trackId: targetTrackId,
            trackName,
            classType: config.userData.classType,
            classId: config.userData.classId,
            sourceId: config.userData.sourceId,
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
        this.editor.selectObject(this.editor.pc.selection);
        // this.editor.updateTrack();
    }
    canSplit(trackId: string, start?: number, end?: number) {
        const objects = this.getTrackObjectMap(trackId)[trackId];
        const frameIndex = typeof start === 'number' ? start : this.editor.state.frameIndex;
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
            return a.length > 0 && b.length > 0;
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

        const trackObject = this.getTrackObject(targetTrackId);
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
        trackId: string | string[],
        frames: IFrame[],
        validFn: (f: IFrame, e: AnnotateObject) => boolean = () => true,
    ) {
        const objects = this.getObjects(trackId, frames, validFn);
        if (!objects) return;

        const deleteData = [] as { objects: AnnotateObject[]; frame: IFrame }[];
        objects.forEach((obj) => {
            // TODO (obj as any).frame
            deleteData.push({ objects: [obj], frame: (obj as any).frame as IFrame });
        });
        this.editor.cmdManager.execute('delete-object', deleteData);
        // this.editor.dispatchEvent({ type: Event.UPDATE_TIME_LINE });
    }
    findTrackResult(trackId: string, objectType?: ObjectType[]) {
        let findItem: AnnotateObject | undefined;
        const frames = this.editor.state.frames;
        const dataManager = this.editor.dataManager;
        for (let i = 0; i < frames.length; i++) {
            const objects = dataManager.getFrameObject(frames[i].id) || [];
            findItem = objects.find((e) => {
                if (objectType) {
                    return e.userData.trackId && objectType.includes(e.objectType);
                }
                return e.userData.trackId;
            });
        }
        this.editor.dataManager.dataMap;
        return;
    }
    getObjects(
        trackIds: string | string[],
        frames?: IFrame[],
        filter: (f: IFrame, e: AnnotateObject) => boolean = () => true,
    ) {
        frames = frames || this.editor.state.frames;
        if (!Array.isArray(trackIds)) trackIds = [trackIds];

        const idMap = {};
        trackIds.forEach((e) => (idMap[e] = true));

        const findObjects = [] as AnnotateObject[];
        frames.forEach((frame) => {
            const objects = this.editor.dataManager.getFrameObject(frame.id) || [];
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
            userData?: Pick<IUserData, 'trackName' | 'classType' | 'classId'>;
            size3D?: THREE.Vector3;
        } = {},
        filter: (f: IFrame, e: AnnotateObject) => boolean = () => true,
    ) {
        if (!this.editor.state.isSeriesFrame) return;

        if (!Array.isArray(trackIds)) trackIds = [trackIds];

        const objects = this.getObjects(trackIds, undefined, filter);

        this.editor.cmdManager.withGroup(() => {
            if (option.userData) {
                const options: IUpdateTrackBatchOption = {
                    tracks: [],
                    objects: objects,
                };
                (trackIds as string[]).forEach((id) => {
                    options.tracks.push({ trackId: id, data: option.userData as any });
                });
                this.editor.cmdManager.execute('update-track-data-batch', options);
            }

            if (option.size3D) {
                const object3Ds = objects.filter((e) => e instanceof Box);
                const transform = { scale: option.size3D } as ITransform;
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
            const bsObject = obj as any as IBSObject;
            const frame = bsObject.frame;
            // TODO
            // if (frame) frame.needSave = true;

            const userData = this.editor.getObjectUserData(obj);
            const classId = userData.classId || '';
            const classConfig = this.editor.getClassType(classId);
            if (obj instanceof Box) {
                // obj.editConfig.resize = !userData.isStandard && userData.resultType !== Const.Fixed;
                obj.color.setStyle(classConfig ? classConfig.color : '#ffffff');
            } else if (obj instanceof Object2D) {
                obj.color = classConfig ? classConfig.color : '#ffffff';
            }

            // obj.dashed = !!userData.invisibleFlag || bsObject.isHolder;
        });
        this.editor.pc.render();
    }

    setDataByTrackId(
        trackIds: string | string[],
        option: { userData: IUserData; size3D?: THREE.Vector3 } = { userData: {} },
        frames?: IFrame[],
        size3DFilter: (f: IFrame, e: AnnotateObject) => boolean = () => true,
        update = false,
    ) {
        let objects = this.getObjects(trackIds, frames, size3DFilter);
        this.editor.cmdManager.withGroup(() => {
            if (option.userData) {
                const options: IUpdateObjectUserDataOption = {
                    data: option.userData,
                    objects: objects,
                };

                objects.length > 0 &&
                    this.editor.cmdManager.execute('update-object-user-data', options);
            }

            if (option.size3D) {
                const object3Ds = objects.filter((e) => e instanceof Box);
                objects = objects.filter((e) => e instanceof Box);
                const transform = { scale: option.size3D } as ITransform;

                object3Ds.length > 0 &&
                    this.editor.cmdManager.execute('update-transform-batch', {
                        objects: object3Ds as any,
                        transforms: transform,
                    });
            }
        });
        this.editor.pc.render();
    }
    updateTransformByTrackId(object: Box, start: ITransform, end: ITransform) {
        const { userData } = object;
        const objects = this.getObjects(
            userData.trackId,
            undefined,
            (f, e) => e instanceof Box && e.uuid !== object.uuid,
        ) as Box[];
        if (objects.length <= 0) return;
        const offsetPos = end.position?.clone();
        if (offsetPos && start.position) {
            offsetPos.x -= start.position.x;
            offsetPos.y -= start.position.y;
            offsetPos.z -= start.position.z;
        }
        const offsetRot = end.rotation?.clone();
        if (offsetRot && start.rotation) {
            offsetRot.x -= start.rotation.x;
            offsetRot.y -= start.rotation.y;
            offsetRot.z -= start.rotation.z;
        }
        function formatRot(r: number) {
            const pi2 = Math.PI * 2;
            if (r < 0) r += pi2;
            else if (r > pi2) r -= pi2;
            return r;
        }
        const transformList: ITransform[] = [];
        objects.forEach((e) => {
            const scale = object.scale.clone();
            const pos = e.position.clone();
            const rot = e.rotation.clone();
            offsetPos && pos.add(offsetPos);
            if (offsetRot) {
                rot.set(
                    formatRot(rot.x + offsetRot.x),
                    formatRot(rot.y + offsetRot.y),
                    formatRot(rot.z + offsetRot.z),
                );
            }
            transformList.push({ scale, position: pos, rotation: rot });
        });
        this.editor.cmdManager.withGroup(() => {
            this.editor.cmdManager.execute('update-transform-batch', {
                objects,
                transforms: transformList,
            });
        });
    }
}
