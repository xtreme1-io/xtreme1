import CmdBase from '../CmdBase';
import * as THREE from 'three';
import * as _ from 'lodash';
import type { ICmdOption } from './index';
import { Event } from '../../config/event';
import { isArray } from 'lodash';
import { xytoArr } from 'editor/ImageLabel/util';

export default class MoveObject extends CmdBase<ICmdOption['hotkey-move'], any> {
    active = false;
    points = [];
    redo(): void {
        let data = this.data;
        // console.log(data);
        // let editor = this.editor;
        if (!data || !this.active) return;
        const object = this.editor.tool?.shapes.getItemById(data.uuid);
        object.setInterior(data.interior);
        object.setPoints(data.points);
    }
    undo(): void {
        let data = this.data;
        if (!data) return;
        const object = this.editor.tool?.shapes.getItemById(data.uuid);
        object.setInterior(data.oldInterior);
        object.setPoints(data.oldPoints);
        this.active = true;
    }
    canMerge(cmd: CmdBase) {
        return cmd instanceof MoveObject ? true : false;
    }
    merge(cmd: CmdBase) {
        let points = cmd.data.points;
        let interior = cmd.data.interior;
        this.data.points = points;
        this.data.interior = interior;
    }
}
