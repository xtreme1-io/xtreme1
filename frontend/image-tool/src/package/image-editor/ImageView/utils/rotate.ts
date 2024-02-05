import Konva from 'konva';
import ImageView from '../index';
import { AnnotateObject, Rect } from '../shape';
import { ITransform } from '../type';
import UpdateTransform from '../../common/CmdManager/cmd/UpdateTransform';

enum EVENT {
  START = 'transformstart',
  ROTATE = 'transform',
  END = 'transformend',
}
/**
 * rotate
 */
export function handleRotateToCmd(view: ImageView, transform: Konva.Transformer) {
  let startTransform: ITransform;
  let object: Rect;

  transform.on(EVENT.START, (e: Konva.KonvaEventObject<MouseEvent>) => {
    object = e.target as Rect;

    startTransform = { x: object.x(), y: object.y(), rotation: object.rotation() || 0 };
  });
  transform.on(EVENT.ROTATE, (e: Konva.KonvaEventObject<MouseEvent>) => {
    object = e.target as Rect;
    view.editor.dataManager.onAnnotatesChange([object], 'transform');
  });
  transform.on(EVENT.END, (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!startTransform || object !== e.target) return;

    const endTransform = { x: object.x(), y: object.y(), rotation: object.rotation() || 0 };
    addRotateCmd(view, object, startTransform, endTransform);
  });
}

export function addRotateCmd(
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
