import { ToolModelEnum, ToolName, Vector2 } from '../../../types';
import ImageView from '../../index';
import { Circle, MaskShape } from '../../shape';
import { defaultMaskColor, defaultMaskRGBA } from '../../../config';
import MaskToolManager from './MaskToolManager';
import LineTool from '../LineTool';
import * as util from './util';

/**
 * 分割多边形
 */
export default class MaskPolyTool extends LineTool {
  // 属性
  declare object: MaskShape | undefined;
  name = ToolName['mask-polygon'];
  toolMode = ToolModelEnum.SEGMENTATION;
  manager: MaskToolManager;

  // 工具参数

  // style
  color: string = defaultMaskColor;
  rgba: number[] = defaultMaskRGBA;

  constructor(view: ImageView) {
    super(view);
    this.manager = view.MaskToolManager;
  }
  doing(): boolean {
    return false;
  }
  // draw
  draw() {
    console.log('draw');
    this.initEvent();
    this.initDraw();
    this.updateTool();
    this.drawGroup.show();
    // hook
    this.onDrawStart();
  }
  updateTool() {
    this.manager.updateTool();
  }
  addPoint(point: Vector2) {
    point = { x: Math.round(point.x), y: Math.round(point.y) };
    this.points.push(point);
    this.anchors.add(new Circle({ x: point.x, y: point.y }));
  }
  undoDraw(): void {
    if (this.points.length === 0) {
      this.manager.undo();
    } else {
      this.points.pop();
      const children = this.anchors.children || [];
      const anchor = children[children.length - 1] as Circle;
      anchor?.remove();
      anchor?.destroy();
      if (this.points.length <= 0) {
        super.clearDraw();
      } else {
        this.updateHolder();
      }

      this.onDrawChange();
    }
  }
  stopCurrentDraw() {
    if (this.points.length === 0) {
      this.manager.completeDraw();
    } else if (this.points.length > 2) {
      this.manager.saveSnapshot();
      this.toDrawing();
    }
    this.clearDraw();
    this.updateStatus();
  }
  toDrawing() {
    const box = util.pointsBox(this.points);
    const box_p1 = { x: box.x, y: box.y },
      box_p2 = { x: box.x1, y: box.y1 };
    const cs = this.manager.involveCanvas(this.manager.editCanvas, box_p1, box_p2);
    this.canvasDraw(cs);
    this.manager.composeCanvas(cs, box);
  }
  canvasDraw(canvas: util.ISegmentCanvas[]) {
    canvas.forEach((e) => {
      e.context.beginPath();
      e.context.moveTo(this.points[0].x, this.points[0].y);
      for (let i = 1; i < this.points.length; i++) {
        const p = this.points[i];
        e.context.lineTo(p.x, p.y);
      }
      e.context.closePath();
      e.context.fill();
      e.changed = true;
    });
  }
  stopDraw() {
    this.mouseDown = false;
    this.points = [];
    this.anchors.removeChildren();
    this.holderLines.removeChildren();
    this.drawGroup.hide();
    this.holderLastLine.hide();
    this.currentAnchor.hide();
    this.clearEvent();
    this.onDrawEnd();
  }
  clearDraw() {
    if (this.points.length === 0) this.manager.exitSegmentTool();
    this.mouseDown = false;
    this.points = [];
    this.anchors.removeChildren();
    this.holderLines.removeChildren();
    this.holderLastLine.hide();
    this.currentAnchor.hide();
  }
  initDraw() {
    this.view.MaskToolManager.initTool(this);
  }
  onMouseUp() {
    this.manager.clearEditCanvas();
  }
}
