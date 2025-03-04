import Konva from 'konva';
import ImageView from '../index';
import { AnnotateObject, Rect } from '../shape';
import { ITransform } from '../type';
import UpdateTransform from '../../common/CmdManager/cmd/UpdateTransform';
import { utils } from '../..';
import { Vector2d } from 'konva/lib/types';
// import { transformOffset } from '../../utils';

enum EVENT {
  START = 'transformstart',
  ROTATE = 'transform',
  END = 'transformend',
}
/**
 *  处理rotate 旋转
 */
export function handleRotateToCmd(view: ImageView, transform: Konva.Transformer) {
  const { state } = view.editor;
  let startTransform: ITransform;
  let object: Rect;

  transform.boundBoxFunc((oldBox, newBox) => {
    if (state.config.limitPosition) {
      const transform = view.stage.getTransform().copy().invert();
      let absPoints: Vector2d[] = [
        { x: newBox.x, y: newBox.y },
        { x: newBox.x + newBox.width, y: newBox.y },
        { x: newBox.x + newBox.width, y: newBox.y + newBox.height },
        { x: newBox.x, y: newBox.y + newBox.height },
      ];
      absPoints = absPoints.map((e) => {
        return utils.countTransformPoint(
          { x: newBox.x, y: newBox.y },
          e,
          Konva.Util.radToDeg(newBox.rotation),
        );
      });

      const relativePos = absPoints.map((p) => {
        return transform.point(p);
      });
      const rect = utils.getPointsBoundRect(relativePos);
      const { backgroundWidth, backgroundHeight } = view;
      if (
        rect.x < 0 ||
        rect.y < 0 ||
        rect.x + rect.width > backgroundWidth ||
        rect.y + rect.height > backgroundHeight
      ) {
        return oldBox;
      }
    }
    return newBox;
  });
  transform.on(EVENT.START, (e: Konva.KonvaEventObject<MouseEvent>) => {
    object = e.target as Rect;
    startTransform = { x: object.x(), y: object.y(), rotation: object.rotation() || 0 };
  });
  transform.on(EVENT.ROTATE, (e: Konva.KonvaEventObject<MouseEvent>) => {
    object = e.target as Rect;
    object.updateGroup();
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
