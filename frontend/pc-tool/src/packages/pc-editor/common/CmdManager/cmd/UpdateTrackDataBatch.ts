import CmdBase from '../CmdBase';
import * as THREE from 'three';
import * as _ from 'lodash';
import type { ICmdOption } from './index';
import { IObject, IFrame } from '../../../type';
import { ITransform, Box, AnnotateObject } from 'pc-render';

export interface ITrackOption {
    trackId: string;
    frame?: IFrame;
    data: Partial<IObject>;
}

export interface ITransformOption {
    objects: Box[];
    transforms: ITransform | ITransform[];
    // rotation?: THREE.Vector3;
}

export interface IUpdateTrackBatchOption {
    tracks: ITrackOption[];
    objects: AnnotateObject[];
    // transform?: ITransformOption;
}

export default class UpdateTrackDataBatch extends CmdBase<
    ICmdOption['update-track-data-batch'],
    ICmdOption['update-track-data-batch']
> {
    redo(): void {
        let editor = this.editor;
        let { frames } = this.editor.state;

        let { tracks, objects } = this.data;

        if (!this.undoData) {
            let undoData: Required<IUpdateTrackBatchOption> = {
                tracks: [],
                objects: objects,
                // transform: { objects: [], transforms: [] },
            };
            tracks.forEach((data) => {
                let oldData = editor.trackManager.getTrackObject(data.trackId) || {};
                oldData = JSON.parse(JSON.stringify(oldData));
                undoData.tracks.push({ ...data, data: oldData });
            });

            // if (transform) {
            //     let { transforms, objects } = transform;
            //     undoData.transform.objects = objects;
            //     transform.objects.forEach((object, index) => {
            //         let transform = Array.isArray(transforms) ? transforms[index] : transforms;

            //         let copyTransform = {} as ITransform;
            //         if (transform.position) copyTransform.position = object.position.clone();
            //         if (transform.scale) copyTransform.scale = object.scale.clone();
            //         if (transform.rotation) copyTransform.rotation = object.rotation.clone();
            //         (undoData.transform.transforms as ITransform[]).push(copyTransform);
            //     });
            // }

            this.undoData = undoData;
        }

        tracks.forEach((data) => {
            editor.trackManager.updateTrackData(data.trackId, data.data);
        });

        // if (transform && transform.objects.length > 0) {
        //     editor.dataManager.setAnnotatesTransform(transform.objects, transform.transforms);
        // }
        if (objects.length > 0) this.editor.trackManager.updateObjectRenderInfo(objects);
    }
    undo(): void {
        let editor = this.editor;
        let { frames } = this.editor.state;

        if (!this.undoData) return;

        let { tracks, objects } = this.undoData;

        tracks.forEach((data) => {
            editor.trackManager.updateTrackData(data.trackId, data.data);
        });

        if (objects.length > 0) this.editor.trackManager.updateObjectRenderInfo(objects);
        // if (transform && transform.objects.length > 0) {
        //     editor.dataManager.setAnnotatesTransform(transform.objects, transform.transforms);
        // }
    }
}
