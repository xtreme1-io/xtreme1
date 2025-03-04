import CmdBase from '../CmdBase';
import type { ICmdOption } from './index';
import { AnnotateObject } from '../../../types';
import { GroupObject } from '../../../ImageView/export';
import Editor from '../../../Editor';

export interface IMoveObjectIndexOption {
  object: AnnotateObject | AnnotateObject[];
  index: number | number[];
  from?: GroupObject;
  into?: GroupObject;
}

interface IUndo extends IMoveObjectIndexOption {
  delGroup?: GroupObject;
}

export default class MoveObjectIndex extends CmdBase<ICmdOption['move-object-index'], IUndo[]> {
  name: string = 'move-object-index';
  redo(): void {
    const editor = this.editor;
    // let frame = editor.getCurrentFrame();

    let { object, index, from, into } = this.data;

    if (!Array.isArray(object)) object = [object];
    if (!Array.isArray(index)) index = [index];

    if (!this.undoData) {
      const undoData = [] as IUndo[];

      (object as AnnotateObject[]).forEach((e, index) => {
        undoData.push({ object: e, index: findIndex(e, editor, from), from, into });
      });
      this.undoData = undoData;
    }
    // 删除空组
    if (from?.member.length === 1) {
      this.undoData.forEach((e) => (e.delGroup = from));
      editor.dataManager.removeAnnotates(from);
    }

    editor.dataManager.moveObjectIndex(object, index, into, from);
  }
  undo(): void {
    const editor = this.editor;
    if (!this.undoData) return;

    this.undoData.forEach((data) => {
      editor.dataManager.moveObjectIndex(data.object, data.index, data.from, data.into);
      if (data.delGroup) editor.dataManager.addAnnotates(data.delGroup);
    });
  }
}

export function findIndex(object: AnnotateObject, editor: Editor, from?: GroupObject) {
  let index = -1;
  const frame = object.frame;
  if (from) {
    index = from.member.findIndex((e) => e === object);
  } else {
    const root = editor.dataManager.getFrameRoot(frame.id);
    index = root.children.findIndex((e) => e === object);
  }
  return index;
}
