import CmdBase from '../CmdBase';
import * as THREE from 'three';
import * as _ from 'lodash';
import type { ICmdOption } from './index';
import type { AnnotateObject } from 'pc-render';

export default class DeleteObject extends CmdBase<
    ICmdOption['delete-object'],
    {
        object: AnnotateObject[];
        select: AnnotateObject | null;
    }
> {
    redo(): void {
        this.editor.tool?.removeById(this.data.id);
    }
    undo(): void {
        // if (!this.data) return;
        this.editor.tool?.fromJSON(this.data.object);
        // this.editor.tool?.removeById(this.data.id);
    }
}
