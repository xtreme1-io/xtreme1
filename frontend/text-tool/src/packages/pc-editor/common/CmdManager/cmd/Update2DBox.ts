import CmdBase from '../CmdBase';
import * as THREE from 'three';
import type { ICmdOption } from './index';

export default class Update2DBox extends CmdBase<
    ICmdOption['update-2d-box'],
    Required<ICmdOption['update-2d-box']['option']>
> {
    redo(): void {
        let { object, option } = this.data;
        let editor = this.editor;

        if (!this.undoData) {
            let positions1 = {} as Record<number, THREE.Vector2>;
            object.positions1.forEach((pos, index) => {
                positions1[index] = new THREE.Vector2().copy(pos);
            });

            let positions2 = {} as Record<number, THREE.Vector2>;
            object.positions2.forEach((pos, index) => {
                positions2[index] = new THREE.Vector2().copy(pos);
            });

            this.undoData = { positions1, positions2 };
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
        return cmd instanceof Update2DBox &&
            this.data.object === cmd.data.object &&
            offsetTime < 500
            ? true
            : false;
    }

    merge(cmd: Update2DBox) {
        let currentOption = this.data.option;
        let option = cmd.data.option;
        currentOption.positions1 = currentOption.positions1 || {};
        currentOption.positions2 = currentOption.positions2 || {};

        option.positions1 = option.positions1 || {};
        option.positions2 = option.positions2 || {};

        Object.assign(currentOption.positions1, option.positions1);
        Object.assign(currentOption.positions2, option.positions2);
        this.updateTime = new Date().getTime();
    }
}
