import CmdBase from '../CmdBase';
import * as THREE from 'three';
import * as _ from 'lodash';
import type { ICmdOption } from './index';
import { Event } from '../../config/event';
import { isArray } from 'lodash';
import { SourceType } from '../../../business/chengdu/type';

export default class AddObject extends CmdBase<ICmdOption['add-object'], any> {
    redo(): void {
        let data = this.data;
        let editor = this.editor;
        if (!Array.isArray(data)) {
            data = [data];
        }
        data.forEach((d: any) => {
            if (d.userData && !d.userData.sourceId) {
                d.userData.sourceId = editor.state.withoutTaskId;
                d.userData.sourceType = SourceType.DATA_FLOW;
            }
        });
        this.undoData = JSON.parse(JSON.stringify(data));
        this.tool.dataManager.onEditorAdd(data);
        this.tool.loadDataFromManager(true);
    }
    undo(): void {
        const data = this.undoData;
        if (!data) return;
        this.tool.dataManager.onEditorRemove(data);
        this.tool.loadDataFromManager(true);
        // let editor = this.editor;
        // const object = editor.tool?.shapes.getItemById(data.uuid);
        // console.log(editor.tool?.shapes, object);
        // if (!this.data.JSON) {
        //     this.data.JSON = object.toJSON();
        // }
        // editor.tool?.removeById(data.uuid);
    }
}
