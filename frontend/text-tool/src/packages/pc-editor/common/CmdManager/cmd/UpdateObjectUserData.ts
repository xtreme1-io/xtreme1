import CmdBase from '../CmdBase';
import * as THREE from 'three';
import * as _ from 'lodash';
import type { ICmdOption } from './index';
import { IObject, IFrame, IUserData } from '../../../type';
import { ITransform, Box, AnnotateObject } from 'pc-render';
import * as utils from '../../../utils';

export interface IUpdateObjectUserDataOption {
    objects: AnnotateObject[] | AnnotateObject;
    data: IUserData[] | IUserData;
}

export default class UpdateObjectUserData extends CmdBase<
    ICmdOption['update-object-user-data'],
    ICmdOption['update-object-user-data']
> {
    redo(): void {
        let editor = this.editor;
        let { frames } = this.editor.state;

        let { data, objects } = this.data;

        if (!Array.isArray(objects)) objects = [objects];

        if (!this.undoData) {
            let undoData: IUpdateObjectUserDataOption = {
                objects: objects,
                data: [],
                // transform: { objects: [], transforms: [] },
            };

            let attrKeys = Object.keys(Array.isArray(data) ? data[0] : data);
            objects.forEach((object, index) => {
                // let newData = Array.isArray(data) ? data : data[index];
                let copeData = utils.pickAttrs(object.userData, attrKeys) as IUserData;
                undoData.data.push(copeData);
            });

            this.undoData = undoData;
        }

        editor.dataManager.setAnnotatesUserData(objects, data);
        if (objects.length > 0) this.editor.updateObjectRenderInfo(objects);
    }
    undo(): void {
        let editor = this.editor;
        let { frames } = this.editor.state;

        if (!this.undoData) return;

        let { data, objects } = this.undoData;
        if (!Array.isArray(objects)) objects = [objects];

        editor.dataManager.setAnnotatesUserData(objects, data);

        if (objects.length > 0) this.editor.updateObjectRenderInfo(objects);
    }

    canMerge(cmd: UpdateObjectUserData): boolean {
        let data = this.data;
        let offsetTime = Math.abs(this.updateTime - cmd.updateTime);
        let valid =
            cmd instanceof UpdateObjectUserData &&
            data.objects === data.objects &&
            !Array.isArray(data.data) &&
            offsetTime < 1000;

        return valid;
    }

    merge(cmd: UpdateObjectUserData) {
        Object.assign(this.data.data, cmd.data.data);
        this.updateTime = new Date().getTime();
    }
}
