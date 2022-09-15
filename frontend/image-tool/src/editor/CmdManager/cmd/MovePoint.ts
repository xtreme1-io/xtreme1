import CmdBase from '../CmdBase';
import * as THREE from 'three';
import * as _ from 'lodash';
import type { ICmdOption } from './index';
import { Event } from '../../config/event';

export default class MovePoint extends CmdBase<ICmdOption['move-point'], any> {
    redo(): void {
        const data = this.data;
        if (!data) return;
        const object = this.editor.tool?.shapes.getItemById(data.uuid);
        object.replacePoint(data.target, data.index);
    }
    undo(): void {
        const data = this.data;
        if (!data) return;
        const object = this.editor.tool?.shapes.getItemById(data.uuid);
        object.replacePoint(data.current, data.index);
    }
}
