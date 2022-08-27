import CmdBase from '../CmdBase';
import * as THREE from 'three';
import * as _ from 'lodash';
import type { ICmdOption } from './index';
import { AnnotateObject } from 'pc-render';
import { IFrame } from '../../../type';

export interface IAddObjectItem {
    objects: AnnotateObject | AnnotateObject[];
    frame?: IFrame;
}

export type IAddObjectOption = IAddObjectItem[] | AnnotateObject | AnnotateObject[];

export default class AddObject3D extends CmdBase<ICmdOption['add-object'], any> {
    redo(): void {
        let editor = this.editor;
        let { frames, frameIndex } = this.editor.state;
        let frame = editor.getCurrentFrame();

        if (!Array.isArray(this.data) || !(this.data[0] as any).objects) {
            let objects = Array.isArray(this.data) ? this.data : [this.data];
            let data: IAddObjectItem[] = [{ objects: objects as AnnotateObject[] }];
            this.data = data;
        }

        let data = this.data as IAddObjectItem[];

        data.forEach((data) => {
            if (!data.frame) data.frame = frame;
            editor.dataManager.addAnnotates(data.objects, data.frame, false);
        });
        editor.dataManager.loadDataFromManager();
    }
    undo(): void {
        let editor = this.editor;
        let { frames } = this.editor.state;

        let data = this.data as IAddObjectItem[];

        data.forEach((data) => {
            editor.dataManager.removeAnnotates(data.objects, data.frame, false);
        });
        editor.dataManager.loadDataFromManager();
    }
}
