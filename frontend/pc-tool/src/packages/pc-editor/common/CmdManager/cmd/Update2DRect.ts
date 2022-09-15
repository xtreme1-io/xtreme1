import CmdBase from '../CmdBase';
import * as THREE from 'three';
import type { ICmdOption } from './index';

export default class Update2DRect extends CmdBase<
    ICmdOption['update-2d-rect'],
    Required<ICmdOption['update-2d-rect']['option']>
> {
    redo(): void {
        let { object, option } = this.data;
        let editor = this.editor;

        if (!this.undoData) {
            let center = new THREE.Vector2().copy(object.center);
            let size = new THREE.Vector2().copy(object.size);
            this.undoData = { center, size };
        }

        editor.dataManager.setAnnotatesTransform(object, option);
    }
    undo(): void {
        if (!this.undoData) return;
        let editor = this.editor;
        let { object } = this.data;

        editor.dataManager.setAnnotatesTransform(object, this.undoData);
    }
    canMerge(cmd: CmdBase): boolean {
        let offsetTime = Math.abs(this.updateTime - cmd.updateTime);
        return cmd instanceof Update2DRect &&
            this.data.object === cmd.data.object &&
            offsetTime < 500
            ? true
            : false;
    }

    merge(cmd: Update2DRect) {
        Object.assign(this.data.option, cmd.data.option);
        this.updateTime = new Date().getTime();
    }
}
