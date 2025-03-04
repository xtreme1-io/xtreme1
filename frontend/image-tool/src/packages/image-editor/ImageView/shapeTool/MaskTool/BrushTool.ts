import { ToolModelEnum, ToolName, Vector2 } from '../../../types';
import ShapeTool from '../ShapeTool';
import Konva from 'konva';
import ImageView from '../../index';
import { KonvaEventObject } from 'konva/lib/Node';
import MaskShape from '../../shape/MaskShape';
import { defaultMaskColor, defaultMaskRGBA, Cursor } from '../../../config';
import * as util from './util';
import MaskToolManager from './MaskToolManager';

/**
 * 分割刷子
 */
export default class BrushTool extends ShapeTool {
  // 属性
  declare object: MaskShape | undefined;
  name = ToolName.brush;
  toolMode = ToolModelEnum.SEGMENTATION;
  manager: MaskToolManager;

  // 工具参数
  drawing: boolean = false;
  lastPos!: Vector2;
  bgW: number = 0;
  bgH: number = 0;

  // style
  cursor: string = Cursor.none;
  // cursor: string = Cursor.auto;
  cursorCircle: Konva.Circle;
  color: string = defaultMaskColor;
  rgba: number[] = defaultMaskRGBA;

  constructor(view: ImageView) {
    super(view);
    this.manager = view.MaskToolManager;
    const scale = view.stage.scaleX();
    this.cursorCircle = new Konva.Circle({
      fill: '#fff',
      stroke: '#000',
      strokeWidth: 1 / scale,
      opacity: 0.8,
      radius: this.view.editor.state.toolConfig.brushWidth / 2,
    });
    this.roundMousePoint = true;
    this.helpGroup.add(this.cursorCircle);
  }
  doing(): boolean {
    return this.drawing;
  }
  updateTool() {
    const { toolConfig } = this.view.editor.state;
    const scale = this.view.stage.scaleX();
    this.cursorCircle.setAttrs({
      strokeWidth: 1 / scale,
      fill: this.manager.isEraser() ? '' : this.manager.color,
      radius: toolConfig.brushWidth / 2,
    });
    this.manager.updateTool();
  }
  // draw
  draw() {
    console.log('draw');
    this.initEvent();
    this.initDraw();
    this.drawGroup.show();
    this.helpGroup.show();
    this.updateTool();
    // hook
    this.onDrawStart();
  }
  stopDraw() {
    this.mouseDown = false;
    this.drawGroup.hide();
    this.helpGroup.hide();
    this.clearEvent();
    this.onDrawEnd();
  }
  stopCurrentDraw() {
    this.manager.completeDraw();
  }

  clearDraw() {
    this.mouseDown = false;
    this.drawGroup.hide();
    this.helpGroup.hide();
    this.manager.exitSegmentTool();
  }
  isValid(position: Vector2) {
    return true;
  }
  mouseMoveInevitable(e: KonvaEventObject<MouseEvent>, point: Vector2): void {
    const p = this.view.stage.getRelativePointerPosition();
    this.updateCursor(p);
  }
  onMouseUp() {
    this.drawing = false;
    this.manager.clearEditCanvas();
  }
  onMouseOut() {
    this.onMouseUp();
  }
  onMouseDown(e: Konva.KonvaEventObject<MouseEvent>, p: Vector2) {
    const point = this.view.stage.getRelativePointerPosition();
    this.drawing = true;
    this.lastPos = point;
    this.manager.saveSnapshot();
    this.toDrawing({ x: point.x, y: point.y });
    this.updateStatus();
    this.view.draw();
  }
  onMouseMove(e: Konva.KonvaEventObject<MouseEvent>, p: Vector2) {
    if (!this.drawing) return;
    const point = this.view.stage.getRelativePointerPosition();
    this.toDrawing(point);
    this.lastPos = point;
  }
  toDrawing(point: Vector2) {
    const { toolConfig } = this.view.editor.state;
    const box = util.box(this.lastPos, point, toolConfig.brushWidth);
    this.canvasDraw(this.manager.editCanvas, point);
    this.manager.composeCanvas(this.manager.editCanvas, box);
  }
  undoDraw() {
    this.manager.undo();
  }
  canvasDraw(canvas: util.ISegmentCanvas[], point: Vector2) {
    const { toolConfig } = this.view.editor.state;
    canvas.forEach((e) => {
      const p1 = {
        x: this.lastPos.x,
        y: this.lastPos.y - e.y,
      };
      const p2 = {
        x: point.x,
        y: point.y - e.y,
      };
      e.context.beginPath();
      if (p1.x === p2.x && p1.y === p2.y) {
        e.context.arc(p2.x, p2.y, toolConfig.brushWidth / 2, 0, Math.PI * 2);
        e.context.closePath();
        e.context.fill();
      } else {
        e.context.moveTo(p1.x, p1.y);
        e.context.lineTo(p2.x, p2.y);
        e.context.closePath();
        e.context.stroke();
      }
      e.changed = true;
    });
  }
  initDraw() {
    this.view.MaskToolManager.initTool(this);
  }
  updateCursor(point: Vector2) {
    const scale = this.view.stage.scaleX();
    this.cursorCircle.setAttrs({
      ...point,
      strokeWidth: 1 / scale,
    });
  }

  // edit
  edit(object: MaskShape) {}
  stopEdit() {}

  initEditObject() {}

  initEditEvent() {}

  updateEditObject() {}

  onObjectChange() {}
}
