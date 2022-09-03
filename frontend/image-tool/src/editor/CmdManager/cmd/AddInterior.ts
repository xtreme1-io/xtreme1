import CmdBase from '../CmdBase';
import * as THREE from 'three';
import * as _ from 'lodash';
import type { ICmdOption } from './index';

export default class AddInterior extends CmdBase<ICmdOption['add-interior'], any> {
    action = false;
    redo(): void {
        const data = this.data;
        if (!data) return;
        if (!this.action) return;
        this.editor.tool?.addInteriorToShape();
    }
    undo(): void {
        const data = this.data;
        if (!data) return;
        this.editor.tool?.removeInterior();
        this.action = true;
    }
}
