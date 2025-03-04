import { IFrame, IUserData, Const, AnnotateObject } from '../types';
import Editor from '../Editor';
import Event from '../config/event';
import * as utils from '../utils';

// 追踪对象不存在 | 追踪对象重叠 | 无class | class不相同 | ok
export type IMergeStatus =
  | 'merge_error_object_not_exist'
  | 'merge_error_object_repeat'
  | 'merge_error_class_none'
  | 'merge_error_class_diff'
  | 'merge_ok';
export interface IMergeCodeData {
  code: IMergeStatus;
  data?: any;
}

export default class TrackManager {
  editor: Editor;
  // track
  trackMap: Map<string, Partial<IUserData>> = new Map();
  // 每个追踪对象的统计信息
  // trackInfo: Map<string, ITrackCount> = new Map();
  // class发生过变化的trackids
  classChangedTracks: string[] = [];

  constructor(editor: Editor) {
    this.editor = editor;
  }
  getTrackMap() {
    return this.trackMap;
  }
  clear() {
    this.getTrackMap().clear();
    // this.trackInfo.clear();
  }

  // basic
  hasTrackObject(trackId: string) {
    return !!this.getTrackObject(trackId);
  }
  trackedAble(trackId: string, obj: AnnotateObject) {
    if (!this.editor.state.isSeriesFrame) return false;
    const track = this.getTrackObject(trackId);
    if (!track) return false;
    const frameObj = this.getObjectByTrackId(trackId);
    if (frameObj?.length > 0) return false;
    const { classId = '' } = track;
    const trackClass = this.editor.getClassType(classId);
    if (!trackClass) return true;
    const isMate = this.editor.checkObjectMate(obj, trackClass);
    return isMate;
  }
  getTrackObject(trackId: string) {
    return this.getTrackMap().get(trackId + '') as IUserData;
  }

  removeTrackObject(trackId: string) {
    return this.getTrackMap().delete(trackId);
  }
  addTrackObject(trackId: string, object: Partial<IUserData>) {
    return this.getTrackMap().set(trackId + '', object);
  }
  addChangedTrack(id: string | string[]) {
    if (Array.isArray(id)) this.classChangedTracks.push(...id);
    else this.classChangedTracks.push(id);
  }
  clearChangedTrack() {
    this.classChangedTracks.length = 0;
  }
  isChanged(id: string) {
    return this.classChangedTracks.indexOf(id) !== -1;
  }

  updateTrackData(trackId: string, object: Partial<IUserData>) {
    const trackObject = this.getTrackObject(trackId);
    Object.assign(trackObject, object || {});
    this.editor.emit(Event.TRACK_OBJECT_CHANGE, trackId);
    // this.editor.frameChange(frame);
  }

  getObjects(
    trackIds: string | string[],
    frames?: IFrame[],
    filter: (f: IFrame, e: AnnotateObject) => boolean = () => true,
  ) {
    frames = frames || this.editor.state.frames;
    if (!Array.isArray(trackIds)) trackIds = [trackIds];

    const idMap: any = {};
    trackIds.forEach((e) => (idMap[e] = true));

    const findObjects = [] as AnnotateObject[];
    frames.forEach((frame) => {
      const objects = this.editor.dataManager.getFrameObject(frame.id) || [];
      utils.traverse(objects, (obj) => {
        if (idMap[obj.userData.trackId] && filter(frame, obj as any)) findObjects.push(obj as any);
      });
    });
    return findObjects;
  }

  // 删除指定帧的对象(未指定表示全部)
  deleteObjectByTrack(trackId: string | string[], frames?: IFrame[]) {
    if (!frames || frames.length === 0) frames = this.editor.state.frames;
    if (!Array.isArray(trackId)) trackId = [trackId];
    const deleteData = [] as { objects: AnnotateObject[]; frame: IFrame }[];
    frames.forEach((frame) => {
      const objects = this.getObjectByTrackId(trackId, frame);
      if (objects.length > 0) deleteData.push({ objects, frame });
    });
    this.editor.cmdManager.withGroup(() => {
      deleteData.forEach((data) => {
        this.editor.cmdManager.execute('delete-object', data as any);
      });
    });
  }
  // 根据trackId删除指定帧的非真值对象(未指定表示全部)
  deleteUntrueObjectByTrack(trackId: string, frames?: IFrame[]) {
    if (!frames || frames.length === 0) frames = this.editor.state.frames;
    const deleteData = [] as { objects: AnnotateObject[]; frame: IFrame }[];
    frames.forEach((frame) => {
      const object = this.getObjectByTrackId(trackId, frame)[0];
      if (object && object.userData.resultStatus != Const.True_Value) {
        deleteData.push({ objects: [object], frame });
      }
    });
    this.editor.cmdManager.withGroup(() => {
      deleteData.forEach((data) => {
        this.editor.cmdManager.execute('delete-object', data as any);
      });
    });
  }

  // 根据trackIds获取某一帧的对象
  getObjectByTrackId(trackId: string | string[], frame?: IFrame) {
    if (!frame) frame = this.editor.getCurrentFrame();
    if (!Array.isArray(trackId)) trackId = [trackId];

    const trackObjs: AnnotateObject[] = [];
    const objects = this.editor.dataManager.getFrameRoot(frame.id)?.allObjects || [];
    objects.forEach((val) => {
      const isTrack = trackId.includes(val.userData.trackId);
      const emptyGroup = val.isGroup() && val.member.length === 0;
      if (isTrack && !emptyGroup) trackObjs.push(val);
    });
    return trackObjs;
  }

  getAllFrameDataByTrack(id: string) {
    const { frames } = this.editor.state;
    const trackList = frames.map((frame) => {
      const objectArr = this.editor.dataManager.getFrameObject(frame.id);
      const trackObj = objectArr?.find((obj) => obj.userData.trackId == id);
      return trackObj;
    });
    return trackList;
  }

  // 追踪对象拆分
  splitTrackObject(config: { trackId: string; start: number; end?: number; userData: IUserData }) {
    const { frames } = this.editor.state;

    const targetTrackId = config.userData.trackId || utils.createTrackId();
    const trackName = this.editor.getId();
    Object.assign(config.userData, {
      trackId: targetTrackId,
      trackName,
    } as IUserData);

    const oriTrack = this.getTrackObject(config.trackId);
    const splitFrames = frames.slice(config.start, config.end);
    const splitObjects = this.getObjects(config.trackId, splitFrames);
    const splitUserData = splitObjects[0].userData as IUserData;

    const trackObject: Partial<IUserData> = {
      trackId: targetTrackId,
      trackName,
      resultType: splitUserData.resultType,
      classType: splitUserData.classType,
      classId: config.userData.classId,
      sourceId: splitUserData.sourceId,
      annotationType: oriTrack.annotationType,
    };

    this.editor.cmdManager.withGroup(() => {
      this.editor.cmdManager.execute('add-track', trackObject);
      this.editor.cmdManager.execute('update-user-data', {
        objects: splitObjects as any,
        data: { ...trackObject, attrs: {} },
      });
    });
    this.editor.updateTrack();
  }
  // 检测两个trackId能否合并
  checkMerge(trackId1: string, trackId2: string): IMergeStatus {
    const track1 = this.getTrackMap().get(trackId1);
    const track2 = this.getTrackMap().get(trackId2);
    if (!track1 || !track2) return 'merge_error_object_not_exist';
    if (!track1.classId || !track2.classId) return 'merge_error_class_none';
    if (track1.classId !== track2.classId) return 'merge_error_class_diff';
    const objList1 = this.getAllFrameDataByTrack(trackId1);
    const objList2 = this.getAllFrameDataByTrack(trackId2);
    const frameNum = this.editor.state.frames.length;
    for (let i = 0; i < frameNum; i++) {
      if (objList1[i] && objList2[i]) return 'merge_error_object_repeat';
    }
    return 'merge_ok';
  }
  // 两个追踪合并 (保留的track, 被合并的track)
  mergeTrackObject(trackId: string, targetTrackId: string) {
    if (!trackId || !targetTrackId) return;

    const mergeObjects = this.getObjects(targetTrackId); // 被合并的结果
    const trackData = this.getTrackObject(trackId); // 保留的track

    this.editor.cmdManager.withGroup(() => {
      this.editor.cmdManager.execute('update-track', [{ trackId, data: trackData }]);
      this.editor.cmdManager.execute('delete-track', targetTrackId);
      this.editor.cmdManager.execute('update-user-data', {
        objects: mergeObjects as any,
        data: trackData,
      });
    });
  }
}
