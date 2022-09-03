import CmdBase from '../CmdBase';
import * as THREE from 'three';
import type { ICmdOption } from './index';
import * as _ from 'lodash';

export default class UpdateUserData extends CmdBase<
    ICmdOption['update-userData'],
    Required<ICmdOption['update-userData']['userData']>
> {
    redo(): void {
        let { object, userData } = this.data;
        let editor = this.editor;

        let objects = object;
        if (!Array.isArray(objects)) objects = [objects];
        // if (!this.undoData) {
        //     this.undoData = JSON.parse(JSON.stringify(object.userData));
        // }

        editor.pc.setObjectUserData(objects, userData);
    }
    undo(): void {
        // if (!this.undoData) return;
        // let editor = this.editor;
        // let { object } = this.data;
        // editor.pc.setObjectUserData(object, this.undoData);
    }
    canMerge(cmd: UpdateUserData): boolean {
        let offsetTime = Math.abs(this.updateTime - cmd.updateTime);
        let valid =
            cmd instanceof UpdateUserData &&
            this.data.object === cmd.data.object &&
            offsetTime < 2000;

        return valid;
    }

    merge(cmd: UpdateUserData) {
        Object.assign(this.data.userData, cmd.data.userData);
        // _.merge(this.data.userData, cmd.data.userData);
        this.updateTime = new Date().getTime();
    }
}
