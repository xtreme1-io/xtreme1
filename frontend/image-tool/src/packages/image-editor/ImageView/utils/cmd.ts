import ImageView from '../index';
import { AnnotateObject, Skeleton } from '../shape';
import { ShapeTool, ToolEvent } from '../shapeTool';
import { IPointsData } from '../type';
import UpdatePoints from '../../common/CmdManager/cmd/UpdatePoints';
import { Event } from '../../config';

/**
 * 统一处理shapeTool绘制的结果
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
  if (!shapes) return;
  if (!Array.isArray(shapes)) shapes = [shapes];

  et.initIDInfo(shapes);
  et.setUserDataBySelect(shapes);
  et.cmdManager.withGroup(() => {
    if (et.state.isSeriesFrame) {
      et.cmdManager.execute('add-track', et.createTrackObj(shapes));
    }
    et.cmdManager.execute('add-object', shapes);
  });
  if (shapes.length > 0) {
    const drawTool = viewDraw.currentDrawTool;
    viewDraw.editor.selectObject(shapes);
    et.setCurrentTrack(shapes[0].userData.trackId);
    if (drawTool) viewDraw.editor.actionManager.execute('drawTool', drawTool.name);
    const ske = shapes.find((e) => e instanceof Skeleton);
    if (!ske) et.emit(Event.SHOW_CLASS_INFO, shapes);
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
 * 统一处理shapeTool编辑
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

let startPointsInfo: IPointsData;
let object: AnnotateObject | undefined;
function onEditStart() {
  object = shapeToolEdit.object;
  if (object) {
    startPointsInfo = object.clonePointsData();
  }
  viewEdit.editor.dragging = true;
}
function onEditChange() {
  // console.log('onEditChange');
  viewEdit.editor.dragging = true;
  viewEdit.editor.emit(Event.TOOL_Edit, 'change', shapeToolEdit.object, shapeToolEdit);
  viewEdit.editor.dataManager.onAnnotatesChange([shapeToolEdit.object as any], 'transform');
}
function onEditEnd() {
  viewEdit.editor.dragging = false;
  if (!startPointsInfo || object !== shapeToolEdit.object) return;
  if (object) {
    const endPointsInfo = object.clonePointsData();
    addEditCmd(viewEdit, object, startPointsInfo, endPointsInfo);
  }
  viewEdit.editor.emit(Event.TOOL_Edit, 'end', shapeToolEdit.object, shapeToolEdit);
}

export function handleEditToCmdClear(shapeTool: ShapeTool) {
  // console.log('handleEditToCmdClear');
  shapeTool.off('edit-start' as ToolEvent, onEditStart);
  shapeTool.off('edit-end' as ToolEvent, onEditEnd);
  shapeTool.off('edit-change' as ToolEvent, onEditChange);
}

/**
 *  other cmd utils
 */

export function addEditCmd(
  view: ImageView,
  object: AnnotateObject,
  startData: IPointsData,
  endData: IPointsData,
) {
  const editor = view.editor;
  const cmd = new UpdatePoints(editor, { object, pointsData: endData });
  cmd.undoData = startData;
  editor.cmdManager.addExecuteManually(cmd as any);
}
