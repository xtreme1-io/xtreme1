import ImageView from '../index';
import { AnnotateObject } from '../shape';
import { ShapeTool, ToolEvent } from '../shapeTool';
import { ITransform } from '../type';
import UpdateTransform from '../../common/CmdManager/cmd/UpdateTransform';
import { Event } from '../../configs';

/**
 * shapeTool draw
 */
let viewDraw = {} as ImageView;
let shapeToolDraw = {} as ShapeTool;
export function handleDrawToCmd(_view: ImageView, _shapeTool: ShapeTool) {
  viewDraw = _view;
  shapeToolDraw = _shapeTool;
  handleDrawToCmdClear(shapeToolDraw);

  shapeToolDraw.on('object' as ToolEvent, onObject);
  shapeToolDraw.on('draw-change' as ToolEvent, onDrawChange);
  shapeToolDraw.on('draw-clear' as ToolEvent, onDrawClear);
  shapeToolDraw.on('draw-end' as ToolEvent, onDrawEnd);
}

function onObject(shapes: AnnotateObject | AnnotateObject[]) {
  const et = viewDraw.editor;
  console.log(shapes);
  if (!shapes) return;
  if (!Array.isArray(shapes)) shapes = [shapes];
  console.log('created==>>', shapes);

  et.initIDInfo(shapes);
  et.cmdManager.withGroup(() => {
    if (et.state.isSeriesFrame) {
      et.cmdManager.execute('add-track', et.createTrackObj(shapes));
    }
    et.cmdManager.execute('add-object', shapes);
  });
  if (shapes.length > 0) {
    et.setCurrentTrack(shapes[0].userData.trackId);
    et.emit(Event.SHOW_CLASS_INFO, shapes);
  }
  et.emit(Event.TOOL_DRAW, 'end', shapeToolDraw.holder, shapeToolDraw);
  et.emit(Event.ANNOTATE_CREATE, shapes);
}
function onDrawChange() {
  viewDraw.editor.emit(Event.TOOL_DRAW, 'change', shapeToolDraw.holder, shapeToolDraw);
}
function onDrawEnd() {
  viewDraw.editor.emit(Event.TOOL_DRAW, 'end', shapeToolDraw.holder, shapeToolDraw);
}
function onDrawClear() {
  viewDraw.editor.emit(Event.TOOL_DRAW, 'end', shapeToolDraw.holder, shapeToolDraw);
}

export function handleDrawToCmdClear(shapeTool: ShapeTool) {
  shapeTool.off('object' as ToolEvent, onObject);
  shapeTool.off('draw-change' as ToolEvent, onDrawChange);
  shapeTool.off('draw-clear' as ToolEvent, onDrawClear);
  shapeTool.off('draw-end' as ToolEvent, onDrawEnd);
}

/**
 * shapeTool edit
 */
let viewEdit = {} as ImageView;
let shapeToolEdit = {} as ShapeTool;
export function handleEditToCmd(_view: ImageView, _shapeTool: ShapeTool) {
  viewEdit = _view;
  shapeToolEdit = _shapeTool;
  handleEditToCmdClear(shapeToolEdit);

  // console.log('handleEditToCmd');
  shapeToolEdit.on('edit-start' as ToolEvent, onEditStart);
  shapeToolEdit.on('edit-change' as ToolEvent, onEditChange);
  shapeToolEdit.on('edit-end' as ToolEvent, onEditEnd);
}

let startPointsInfo: ITransform;
let object: AnnotateObject | undefined;
function onEditStart() {
  object = shapeToolEdit.object;
  if (object) {
    startPointsInfo = object.clonePointsData();
  }
}
function onEditChange() {
  // console.log('onEditChange');
  viewEdit.editor.emit(Event.TOOL_Edit, 'change', shapeToolEdit.object, shapeToolEdit);
  viewEdit.editor.dataManager.onAnnotatesChange([shapeToolEdit.object as any], 'transform');
}
function onEditEnd() {
  if (!startPointsInfo || object !== shapeToolEdit.object) return;
  if (object) {
    const endPointsInfo = object.clonePointsData();
    addEditCmd(viewEdit, object, startPointsInfo, endPointsInfo);
  }
  viewEdit.editor.emit(Event.TOOL_Edit, 'end', shapeToolEdit.object, shapeToolEdit);
}

export function handleEditToCmdClear(shapeTool: ShapeTool) {
  shapeTool.off('edit-start' as ToolEvent, onEditStart);
  shapeTool.off('edit-end' as ToolEvent, onEditEnd);
  shapeTool.off('edit-change' as ToolEvent, onEditChange);
}

export function addEditCmd(
  view: ImageView,
  object: AnnotateObject,
  startData: ITransform,
  endData: ITransform,
) {
  const editor = view.editor;
  const cmd = new UpdateTransform(editor, { objects: object, transforms: endData });
  cmd.undoData = { objects: object, transforms: startData };
  editor.cmdManager.addExecuteManually(cmd as any);
}
