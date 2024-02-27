import { IFrame, IUserData, Const, AnnotateObject } from '../types';
import Editor from '../Editor';
import { Event } from '../configs/event';

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
  classChangedTracks: string[] = [];

  constructor(editor: Editor) {
    this.editor = editor;
  }

  clear() {
    this.trackMap.clear();
    // this.trackInfo.clear();
  }

  // basic
  hasTrackObject(trackId: string) {
    return !!this.getTrackObject(trackId);
  }
  getTrackObject(trackId: string) {
    return this.trackMap.get(trackId + '') as IUserData;
  }

  removeTrackObject(trackId: string) {
    return this.trackMap.delete(trackId);
  }
  addTrackObject(trackId: string, object: Partial<IUserData>) {
    return this.trackMap.set(trackId + '', object);
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
    if (!trackObject) {
      console.error('[method updateTrackData error]');
      return;
    }
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
      objects.forEach((obj) => {
        if (idMap[obj.userData.trackId] && filter(frame, obj as any)) findObjects.push(obj as any);
      });
    });
    return findObjects;
  }

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

  getObjectByTrackId(trackId: string | string[], frame?: IFrame) {
    if (!frame) frame = this.editor.getCurrentFrame();
    if (!Array.isArray(trackId)) trackId = [trackId];

    const trackObjs: AnnotateObject[] = [];
    const objects = this.editor.dataManager.getFrameRoot(frame.id)?.allObjects || [];
    objects.forEach((val) => {
      if (trackId.includes(val.userData.trackId)) trackObjs.push(val);
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
}
