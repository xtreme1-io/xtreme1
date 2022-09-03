import CmdBase from '../CmdBase';
import * as THREE from 'three';
import * as _ from 'lodash';
import type { ICmdOption } from './index';
import { Event } from '../../config/event';
import { isArray } from 'lodash';
import { xytoArr } from 'editor/ImageLabel/util';

export default class ClipPolygon extends CmdBase<ICmdOption['clip-ploygon'], any> {
    active = false;
    redo(): void {
        let data = this.data;
        // let editor = this.editor;
        if (!data) return;
        if (!this.active) return;
        console.log(this.data.diff);
        this.data.diff.add.map((item) => {
            this.editor.tool?.fromJSON([item]);
        });
        this.data.diff.removed.map((item) => {
            this.editor.tool?.removeById(item.uuid);
        });
    }
    undo(): void {
        let data = this.data;
        if (!data) return;
        this.data.diff.removed.map((item) => {
            this.editor.tool?.fromJSON([item]);
        });
        this.data.diff.add.map((item) => {
            this.editor.tool?.removeById(item.uuid);
        });
        this.active = true;
    }
}
