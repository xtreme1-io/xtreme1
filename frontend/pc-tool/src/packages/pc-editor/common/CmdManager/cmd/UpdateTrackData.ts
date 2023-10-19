import CmdBase from '../CmdBase';
import * as THREE from 'three';
import * as _ from 'lodash';
import type { ICmdOption } from './index';

import { ITrackOption } from './UpdateTrackDataBatch';

export default class UpdateTrackData extends CmdBase<ITrackOption, ITrackOption> {
    redo(): void {
        let editor = this.editor;
        let { frames } = this.editor.state;
        let data = this.data;

        if (!this.undoData) {
            let undoData = {} as ICmdOption['update-track-data'];
            let oldData = editor.trackManager.getTrackObject(data.trackId) || {};
            oldData = JSON.parse(JSON.stringify(oldData));
            undoData = { ...data, data: oldData };
            this.undoData = undoData;
        }

        editor.trackManager.updateTrackData(data.trackId, data.data);
    }
    undo(): void {
        let editor = this.editor;
        let { frames } = this.editor.state;

        if (!this.undoData) return;

        let data = this.undoData;
        editor.trackManager.updateTrackData(data.trackId, data.data);
    }
    canMerge(cmd: UpdateTrackData): boolean {
        let data = this.data;
        let offsetTime = Math.abs(this.updateTime - cmd.updateTime);
        let valid =
            cmd instanceof UpdateTrackData &&
            data.trackId === data.trackId &&
            data.frame === data.frame &&
            offsetTime < 2000;

        return valid;
    }

    merge(cmd: UpdateTrackData) {
        Object.assign(this.data.data, cmd.data.data);
        this.updateTime = new Date().getTime();
    }
}
