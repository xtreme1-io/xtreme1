import CmdBase from '../CmdBase';
import type { ICmdOption } from './index';
import { IUserData } from '../../../types';
import { createUUID } from '../../../utils';

export type IAddTrackOption = Partial<IUserData> | Partial<IUserData>[];

export default class AddTrack extends CmdBase<ICmdOption['add-track'], any> {
  redo(): void {
    const editor = this.editor;

    let data = this.data;
    if (!Array.isArray(data)) data = [data];

    data.forEach((e: Partial<IUserData>) => {
      if (!e.trackId) e.trackId = createUUID();
      editor.trackManager.addTrackObject(e.trackId, e);
    });
  }
  undo(): void {
    const editor = this.editor;

    let data = this.data;
    if (!Array.isArray(data)) data = [data];

    data.forEach((e: Partial<IUserData>) => {
      editor.trackManager.removeTrackObject(e.trackId as string);
    });
  }
}
