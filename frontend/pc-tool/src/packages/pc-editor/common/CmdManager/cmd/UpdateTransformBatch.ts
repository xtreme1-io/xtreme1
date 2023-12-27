import CmdBase from '../CmdBase';
import * as THREE from 'three';
import type { ICmdOption } from './index';
import { ITransform, Box } from 'pc-render';

export interface IUpdateTransformBatchOption {
    objects: Box[];
    transforms: ITransform | ITransform[];
    // rotation?: THREE.Vector3;
}

export default class UpdateTransformBatch extends CmdBase<
    ICmdOption['update-transform-batch'],
    ICmdOption['update-transform-batch']
> {
    redo(): void {
        const { objects, transforms } = this.data;
        const editor = this.editor;
        if (!this.undoData) {
            const undoData = { objects: objects, transforms: [] } as IUpdateTransformBatchOption;
            objects.forEach((object, index) => {
                const transform = Array.isArray(transforms) ? transforms[index] : transforms;

                const copyTransform = {} as ITransform;
                if (transform.position) copyTransform.position = object.position.clone();
                if (transform.scale) copyTransform.scale = object.scale.clone();
                if (transform.rotation) copyTransform.rotation = object.rotation.clone();
                (undoData.transforms as ITransform[]).push(copyTransform);
            });
            this.undoData = undoData;
        }

        editor.dataManager.setAnnotatesTransform(objects, transforms);
    }
    undo(): void {
        if (!this.undoData) return;
        const editor = this.editor;

        editor.dataManager.setAnnotatesTransform(this.undoData.objects, this.undoData.transforms);
    }
}
