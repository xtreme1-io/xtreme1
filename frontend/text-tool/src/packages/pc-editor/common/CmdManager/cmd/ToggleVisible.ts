import CmdBase from '../CmdBase';
import * as THREE from 'three';
import * as _ from 'lodash';
import type { ICmdOption } from './index';
import type { AnnotateObject } from 'pc-render';
import { IFrame } from '../../../type';

export interface IToggleVisibleOption {
    objects: AnnotateObject | AnnotateObject[];
    visible: boolean | boolean[];
}

export default class ToggleVisible extends CmdBase<
    ICmdOption['toggle-visible'],
    ICmdOption['toggle-visible']
> {
    redo(): void {
        let editor = this.editor;
        let { objects, visible } = this.data;

        if (!Array.isArray(objects)) objects = [objects];

        if (this.undoData) {
            let visibles = [] as boolean[];
            objects.forEach((object) => {
                visibles.push(object.visible);
            });
            this.undoData = { objects, visible: visibles };
        }

        editor.dataManager.setAnnotatesVisible(objects, visible);
    }
    undo(): void {
        let editor = this.editor;
        if (!this.undoData) return;

        let { objects, visible } = this.undoData;
        editor.dataManager.setAnnotatesVisible(objects, visible);
    }
}
