import CmdBase from '../CmdBase';
import * as THREE from 'three';
import type { ICmdOption } from './index';

export default class UpdateTransform extends CmdBase<
    ICmdOption['update-transform'],
    Required<ICmdOption['update-transform']['transform']>
> {
    redo(): void {
        let { object, transform } = this.data;
        let editor = this.editor;

        if (!this.undoData) {
            let position = new THREE.Vector3().copy(object.position);
            let scale = new THREE.Vector3().copy(object.scale);
            let rotation = new THREE.Euler().copy(object.rotation);
            this.undoData = { position, scale, rotation };
        }

        editor.dataManager.setAnnotatesTransform(object as any, transform);
    }
    undo(): void {
        if (!this.undoData) return;
        let editor = this.editor;
        let { object } = this.data;

        editor.dataManager.setAnnotatesTransform(object as any, this.undoData);
    }
    canMerge(cmd: CmdBase): boolean {
        let offsetTime = Math.abs(this.updateTime - cmd.updateTime);
        return cmd instanceof UpdateTransform &&
            this.data.object === cmd.data.object &&
            offsetTime < 500
            ? true
            : false;
    }

    merge(cmd: UpdateTransform) {
        Object.assign(this.data.transform, cmd.data.transform);
        this.updateTime = new Date().getTime();
    }
}
