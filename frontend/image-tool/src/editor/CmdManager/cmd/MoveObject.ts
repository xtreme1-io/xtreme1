import CmdBase from '../CmdBase';
import * as THREE from 'three';
import * as _ from 'lodash';
import type { ICmdOption } from './index';
import { Event } from '../../config/event';
import { isArray } from 'lodash';
import { xytoArr } from 'editor/ImageLabel/util';

export default class MoveObject extends CmdBase<ICmdOption['move-object'], any> {
    active = false;
    points = [];
    redo(): void {
        let data = this.data;
        // console.log(data);
        // let editor = this.editor;
        if (!data || !this.active) return;
        const object = this.editor.tool?.shapes.getItemById(data.uuid);
        if (data.interior) {
            object.setInterior(data.interior);
        }
        object.setPoints(data.points);
    }
    undo(): void {
        let data = this.data;
        if (!data) return;
        const object = this.editor.tool?.shapes.getItemById(data.uuid);
        if (data.oldInterior) {
            object.setInterior(data.oldInterior);
        }
        object.setPoints(data.oldPoints);
        this.active = true;
    }
}
