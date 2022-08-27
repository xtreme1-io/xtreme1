import CmdBase from '../CmdBase';
import * as THREE from 'three';
import * as _ from 'lodash';
import type { ICmdOption } from './index';
import { AnnotateObject } from 'pc-render';

export default class SelectObject extends CmdBase<ICmdOption['select-object'], AnnotateObject[]> {
    redo(): void {
        // let data = this.data;
        let editor = this.editor;

        if (!this.undoData) {
            this.undoData = editor.pc.selection;
        }

        editor.selectObject(this.data);
    }
    undo(): void {
        if (!this.undoData) return;

        let editor = this.editor;
        editor.selectObject(this.undoData);
    }
}
