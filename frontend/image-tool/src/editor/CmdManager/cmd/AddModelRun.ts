import CmdBase from '../CmdBase';
import * as THREE from 'three';
import * as _ from 'lodash';
import type { ICmdOption } from './index';
import { Event } from '../../config/event';
import { convertObject2Annotate } from '../../../business/chengdu/utils/result';
// import Tool from 'src/business/chengdu/common/Tool';

export default class AddModelRun extends CmdBase<ICmdOption['add-modelRun'], any> {
    active = false;
    redo(): void {
        let data = this.data;
        let editor = this.editor;
        if (this.data && this.active) {
            // let oldAnnotate = this.tool.dataManager.getDataObject(this.data.id);
            // let annotates = convertObject2Annotate(this.data.objects, this.editor);
            // this.tool.dataManager.setDataObject(this.data.id, [...oldAnnotate, ...annotates]);
            window.tool.addModelData(true);
            // console.log(editor.tool?.toJSON().filter((item) => item.uuid === data.object.uuid));
            // editor.addObject(
            //     editor.tool?.toJSON().filter((item) => item.uuid === data.object.uuid),
            // );
            // ([window?.tool.dataManager.dataMap[data.object.uuid]]);
        }
    }
    undo(): void {
        console.log(this.data, '23');
        if (!this.data) return;
        let editor = this.editor;
        window.tool.dataManager.modelMap[this.data.id] = this.data.objects;
        console.log(this.data.annotates.map((item) => item.uuid));
        editor.tool?.removeById(this.data.annotates.map((item) => item.uuid));
        this.active = true;
    }
}
