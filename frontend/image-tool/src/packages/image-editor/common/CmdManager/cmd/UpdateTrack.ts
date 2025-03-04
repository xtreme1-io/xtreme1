import CmdBase from '../CmdBase';
import * as _ from 'lodash';
import type { ICmdOption } from './index';
import { IUserData, IFrame } from '../../../types';
import * as utils from '../../../utils';

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
    const { frames } = this.editor.state;

    // let { tracks, objects } = this.data;

    if (!this.undoData) {
      const undoData: ITrackItem[] = [];
      this.data.forEach((data) => {
        const attrKeys = Object.keys(data.data);
        let oldData = editor.trackManager.getTrackObject(data.trackId) || {};
        oldData = utils.pickAttrs(oldData, attrKeys);
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
    if (objects.length > 0) editor.dataManager.updateObjectByUserData(objects);
  }
  undo(): void {
    const editor = this.editor;
    const { frames } = this.editor.state;

    if (!this.undoData) return;

    this.undoData.forEach((data) => {
      // 触发change
      editor.trackManager.updateTrackData(data.trackId, data.data);
    });

    const trackIds = this.data.map((e) => e.trackId);
    const objects = editor.trackManager.getObjects(trackIds);

    if (objects.length > 0) editor.dataManager.updateObjectByUserData(objects);
  }
}
