import CmdBase from '../CmdBase';
import * as THREE from 'three';
import * as _ from 'lodash';
import type { ICmdOption } from './index';

export default class RemoveInterior extends CmdBase<ICmdOption['remove-interior'], any> {
    action = false;
    redo(): void {
        const data = this.data;
        if (!data) return;
        if (!this.action) return;
        this.editor.tool?.removeInterior();
    }
    undo(): void {
        const data = this.data;
        if (!data) return;
        this.editor.tool?.addInteriorToShape();
        this.action = true;
    }
}
