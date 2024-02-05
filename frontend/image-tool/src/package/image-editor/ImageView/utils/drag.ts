import Konva from 'konva';
import ImageView from '../index';
import { AnnotateObject } from '../shape';
import { ITransform } from '../type';
import UpdateTransform from '../../common/CmdManager/cmd/UpdateTransform';

enum EVENT {
  START = 'dragstart',
  DRAG = 'dragmove',
  END = 'dragend',
}
/**
 *  drag
 */
export function handleDragToCmd(view: ImageView) {
  let startTransform: ITransform;
  let object: AnnotateObject;

  view.renderLayer.on(EVENT.START, (e: Konva.KonvaEventObject<MouseEvent>) => {
    object = e.target as AnnotateObject;

    startTransform = {
      x: object.x(),
      y: object.y(),
    };
  });

  view.renderLayer.on(EVENT.DRAG, (e: Konva.KonvaEventObject<MouseEvent>) => {
    object = e.target as AnnotateObject;
    view.editor.dataManager.onAnnotatesChange([object], 'transform');
  });

  view.renderLayer.on(EVENT.END, (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!startTransform || object !== e.target) return;

    const endTransform: ITransform = {
      x: object.x(),
      y: object.y(),
    };
    addDragCmd(view, object, startTransform, endTransform);
  });
}

export function addDragCmd(
  view: ImageView,
  object: AnnotateObject,
  startData: ITransform,
  endData: ITransform,
) {
  const editor = view.editor;
  const cmd = new UpdateTransform(editor, { objects: object, transforms: endData });
  cmd.undoData = {
    objects: [object],
    transforms: [startData],
  };
  editor.cmdManager.addExecuteManually(cmd as any);
}
