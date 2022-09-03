import CmdBase from '../CmdBase';
import * as THREE from 'three';
import * as _ from 'lodash';
import type { ICmdOption } from './index';
import { Event } from '../../config/event';
import { isArray } from 'lodash';
import { xytoArr } from 'editor/ImageLabel/util';

export default class MoveSide extends CmdBase<ICmdOption['move-side'], any> {
    redo(): void {
        let data = this.data;
        if (!data) return;
        const object = this.editor.tool?.shapes.getItemById(data.uuid);
        object.setPoints(data.target);
    }
    undo(): void {
        let data = this.data;
        if (!data) return;
        const object = this.editor.tool?.shapes.getItemById(data.uuid);
        object.setPoints(data.current);
    }
}
