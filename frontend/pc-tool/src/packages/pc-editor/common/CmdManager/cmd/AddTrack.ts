import CmdBase from '../CmdBase';
import * as THREE from 'three';
import * as _ from 'lodash';
import type { ICmdOption } from './index';
import { AnnotateObject } from 'pc-render';
import { IObject } from '../../../type';

export type IAddTrackOption = Partial<IObject> | Partial<IObject>[];

export default class AddTrack extends CmdBase<ICmdOption['add-track'], any> {
    redo(): void {
        let editor = this.editor;

        let data = this.data;
        if (!Array.isArray(data)) data = [data];

        data.forEach((e: Partial<IObject>) => {
            if (!e.trackId) e.trackId = editor.createTrackId();
            editor.trackManager.addTrackObject(e.trackId, e);
        });
    }
    undo(): void {
        let editor = this.editor;

        let data = this.data;
        if (!Array.isArray(data)) data = [data];

        data.forEach((e: Partial<IObject>) => {
            editor.trackManager.removeTrackObject(e.trackId as string);
        });
    }
}
