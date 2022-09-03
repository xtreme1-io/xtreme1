import CmdBase from '../CmdBase';
import * as THREE from 'three';
import * as _ from 'lodash';
import type { ICmdOption } from './index';

export default class AddPoint extends CmdBase<ICmdOption['add-point'], any> {
    redo(): void {
        const data = this.data;
        if (!data) return;
        const object = this.editor.tool?.shapes.getItemById(data.uuid);
        object.insertPoint(this.data.point, this.data.index, true);
    }
    undo(): void {
        const data = this.data;
        if (!data) return;
        const object = this.editor.tool?.shapes.getItemById(data.uuid);
        object.removePoint(data.index, true);
    }
}
