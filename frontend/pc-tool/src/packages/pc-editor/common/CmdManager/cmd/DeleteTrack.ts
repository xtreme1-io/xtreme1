import CmdBase from '../CmdBase';
import * as THREE from 'three';
import * as _ from 'lodash';
import type { ICmdOption } from './index';
import { AnnotateObject } from 'pc-render';
import { IObject } from '../../../type';

export type IDeleteTrackOption = string | string[];

export default class DeleteTrack extends CmdBase<ICmdOption['delete-track'], IObject[]> {
    redo(): void {
        const editor = this.editor;

        let data = this.data;
        if (!Array.isArray(data)) data = [data];

        if (!this.undoData) {
            this.undoData = data.map((trackId) =>
                editor.trackManager.getTrackObject(trackId),
            ) as IObject[];
        }

        data.forEach((trackId) => {
            editor.trackManager.removeTrackObject(trackId);
        });
    }
    undo(): void {
        const editor = this.editor;

        if (!this.undoData) return;

        const data = this.undoData;
        data.forEach((obj) => {
            editor.trackManager.addTrackObject(obj.trackId as string, obj);
        });
    }
}
