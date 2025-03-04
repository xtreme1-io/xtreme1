import Konva from 'konva';
import ImageView from '../index';
import { AnnotateObject, GroupObject, Skeleton } from '../shape';
import { ITransform, ISideRect, IRectOption, Vector2 } from '../type';
import UpdateTransform from '../../common/CmdManager/cmd/UpdateTransform';
import { transformOffset } from '../../utils';
import { ToolTypeEnum } from '@basicai/tool-components';

enum EVENT {
  START = 'dragstart',
  DRAG = 'dragmove',
  END = 'dragend',
}
/**
 *  处理drag
 */
export function handleDragToCmd(view: ImageView) {
  const startTransformMap: Record<string, ITransform> = {};
  let dragTransform: { x: number; y: number };
  let object: AnnotateObject;
  let objects: AnnotateObject[]; // 多选一起移动
  let limitRectMap: Record<string, IRectOption> = {};

  view.renderLayer.on(EVENT.START, (e: Konva.KonvaEventObject<MouseEvent>) => {
    view.editor.dragging = true;
    object = e.target as AnnotateObject;
    objects = [];
    limitRectMap = {};
    if (view.editor.selectionMap[object.uuid]) {
      objects = view.editor.selection.filter(
        (e) => e.visible() && e !== object && e.toolType !== ToolTypeEnum.MASK,
      );
    }
    [object, ...objects].forEach(function initDragData(o) {
      if (o.isGroup()) {
        const members = (o as AnnotateObject as GroupObject).getChildrenNotGroup();
        members.forEach(initDragData);
      }
      limitRectMap[o.uuid] = o.getSelfBoundRect();
      startTransformMap[o.uuid] = o.position();
    });
    dragTransform = { ...object.position() };
  });

  view.renderLayer.on(EVENT.DRAG, (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!startTransformMap[object.uuid] || object !== e.target) return;
    limitPositionIfOut(object.position(), object, view, limitRectMap[object.uuid]);
    if (object.isGroup() && (object as AnnotateObject as GroupObject)._updated) return;
    view.editor.dragging = true;
    const pos = object.position();
    const groupObject = object as AnnotateObject as GroupObject;
    const dragX = pos.x - (dragTransform.x ?? 0);
    const dragY = pos.y - (dragTransform.y ?? 0);
    dragTransform = pos;
    const movedMap: Record<string, boolean> = {};
    if (object.isGroup()) {
      const members = groupObject.getChildrenNotGroup();
      members.forEach((e) => {
        if (movedMap[e.uuid]) return;
        movedMap[e.uuid] = true;
        e.setAttrs({ x: e.x() + dragX, y: e.y() + dragY });
        e.onPointChange();
      });
    } else if (object instanceof Skeleton) {
      object.onPointChange();
    }
    objects.forEach((obj) => {
      if (obj.isGroup()) {
        const members = (obj as AnnotateObject as GroupObject).getChildrenNotGroup();
        members.forEach((e) => {
          if (movedMap[e.uuid]) return;
          movedMap[e.uuid] = true;
          limitPositionIfOut({ x: e.x() + dragX, y: e.y() + dragY }, e, view, limitRectMap[e.uuid]);
          e.onPointChange();
        });
      } else {
        if (movedMap[obj.uuid]) return;
        movedMap[obj.uuid] = true;
        limitPositionIfOut(
          { x: obj.x() + dragX, y: obj.y() + dragY },
          obj,
          view,
          limitRectMap[obj.uuid],
        );
        obj.onPointChange();
      }
    });
    view.editor.dataManager.onAnnotatesChange([object], 'transform');
  });

  view.renderLayer.on(EVENT.END, (e: Konva.KonvaEventObject<MouseEvent>) => {
    view.editor.dragging = false;
    if (!startTransformMap[object.uuid] || object !== e.target) return;
    let cmdObjects: AnnotateObject[] = [];
    [object, ...objects].forEach((e) => {
      if (e.isGroup()) {
        const members = (e as AnnotateObject as GroupObject).getChildrenNotGroup();
        cmdObjects.push(...members);
      } else {
        cmdObjects.push(e);
      }
    });
    cmdObjects = Array.from(new Set(cmdObjects));
    addDragCmd(
      view,
      cmdObjects,
      cmdObjects.map((e) => {
        return startTransformMap[e.uuid];
      }),
      cmdObjects.map((e) => {
        return { x: e.x(), y: e.y() };
      }),
    );
  });
}

export function addDragCmd(
  view: ImageView,
  objects: AnnotateObject[],
  startDatas: ITransform[],
  endDatas: ITransform[],
) {
  const editor = view.editor;
  const cmd = new UpdateTransform(editor, { objects: objects, transforms: endDatas });
  cmd.undoData = {
    objects: objects,
    transforms: startDatas,
  };
  editor.cmdManager.addExecuteManually(cmd as any);
}
export function limitPositionIfOut(
  position: Vector2,
  shape: AnnotateObject,
  view: ImageView,
  limitRect?: IRectOption,
) {
  if (view.editor.state.config.limitPosition) {
    limitRect = limitRect || shape.getSelfBoundRect();
    const absPos = view.renderLayer.getTransform().point(position); // shape.getAbsolutePosition(view.stage);
    const imageRect: ISideRect = {
      left: 0,
      top: 0,
      right: view.backgroundWidth,
      bottom: view.backgroundHeight,
    };
    const { offsetX, offsetY } = transformOffset(absPos, limitRect, imageRect);
    position.x += offsetX;
    position.y += offsetY;
  }
  shape.position(position);
}
