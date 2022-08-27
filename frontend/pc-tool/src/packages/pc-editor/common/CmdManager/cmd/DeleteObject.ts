import CmdBase from '../CmdBase';
import * as THREE from 'three';
import * as _ from 'lodash';
import type { ICmdOption } from './index';
import type { AnnotateObject } from 'pc-render';
import { IFrame } from '../../../type';

export interface IDeleteObjectItem {
    objects: AnnotateObject | AnnotateObject[];
    frame?: IFrame;
}

export type IDeleteObjectOption = IDeleteObjectItem[] | AnnotateObject | AnnotateObject[];

export default class DeleteObject extends CmdBase<
    ICmdOption['delete-object'],
    ICmdOption['delete-object']
> {
    redo(): void {
        let editor = this.editor;
        let { frameIndex, frames } = this.editor.state;
        // let selection = editor.pc.selection;

        if (!Array.isArray(this.data) || !(this.data[0] as any).objects) {
            let objects = Array.isArray(this.data) ? this.data : [this.data];
            let data: IDeleteObjectItem[] = [{ objects: objects as AnnotateObject[] }];
            this.data = data;
        }

        // this.undoData = this.data;
        let data = this.data as IDeleteObjectItem[];

        data.forEach((data) => {
            if (!data.frame) data.frame = editor.getCurrentFrame();
            editor.dataManager.removeAnnotates(data.objects, data.frame, false);
        });
        editor.dataManager.loadDataFromManager();

        // editor.pc.removeObject(this.data);
    }
    undo(): void {
        let editor = this.editor;
        let { frames } = this.editor.state;

        let data = this.data as IDeleteObjectItem[];
        data.forEach((data) => {
            editor.dataManager.addAnnotates(data.objects, data.frame, false);
        });
        editor.dataManager.loadDataFromManager();
    }
}
