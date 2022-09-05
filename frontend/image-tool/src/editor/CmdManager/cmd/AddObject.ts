import CmdBase from '../CmdBase';
import * as THREE from 'three';
import * as _ from 'lodash';
import type { ICmdOption } from './index';
import { Event } from '../../config/event';
import { isArray } from 'lodash';

export default class AddObject extends CmdBase<ICmdOption['add-object'], any> {
    redo(): void {
        let data = this.data;
        let editor = this.editor;
        if (this.data && this.data.JSON) {
            if (isArray(this.data.JSON)) {
                editor.tool?.fromJSON(this.data.JSON);
            } else {
                editor.tool?.fromJSON([this.data.JSON]);
            }
        }
    }
    undo(): void {
        const data = this.data;
        if (!data) return;
        let editor = this.editor;
        const object = editor.tool?.shapes.getItemById(data.uuid);
        console.log(editor.tool?.shapes, object);
        if (!this.data.JSON) {
            this.data.JSON = object.toJSON();
        }
        editor.tool?.removeById(data.uuid);
    }
}
