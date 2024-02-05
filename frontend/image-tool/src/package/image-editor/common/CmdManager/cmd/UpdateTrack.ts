import CmdBase from '../CmdBase';
import type { ICmdOption } from './index';
import { IUserData } from '../../../types';
import { cloneDeep } from 'lodash';

interface ITrackItem {
  trackId: string;
  data: Partial<IUserData>;
}

export type IUpdateTrackOption = ITrackItem[];

export default class UpdateTrack extends CmdBase<
  ICmdOption['update-track'],
  ICmdOption['update-track']
> {
  redo(): void {
    const editor = this.editor;

    // let { tracks, objects } = this.data;

    if (!this.undoData) {
      const undoData: ITrackItem[] = [];
      this.data.forEach((data) => {
        let oldData = editor.trackManager.getTrackObject(data.trackId) || {};
        oldData = cloneDeep(oldData);
        undoData.push({ trackId: data.trackId, data: oldData });
      });

      this.undoData = undoData;
    }

    this.data.forEach((data) => {
      editor.trackManager.updateTrackData(data.trackId, data.data);
    });

    const trackIds = this.data.map((e) => e.trackId);
    const objects = editor.trackManager.getObjects(trackIds);
    // test
    (this as any).objects = objects;
    if (objects.length > 0) editor.mainView.updateObjectByUserData(objects);
  }
  undo(): void {
    const editor = this.editor;

    if (!this.undoData) return;

    this.undoData.forEach((data) => {
      editor.trackManager.updateTrackData(data.trackId, data.data);
    });

    const trackIds = this.data.map((e) => e.trackId);
    const objects = editor.trackManager.getObjects(trackIds);

    if (objects.length > 0) editor.mainView.updateObjectByUserData(objects);
  }
}
