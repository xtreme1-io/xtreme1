import Konva from 'konva';
import ShapeTool from '../ShapeTool';
import ImageView from '../../index';
import MaskShape from '../../shape/MaskShape';
import { ToolModelEnum, ToolName, Vector2 } from '../../../types';
import MaskToolManager from './MaskToolManager';
import { Cursor } from '../../../config';
import { fillColorToImageData, floodFillContext, sameColor } from './floodfill';

/**
 * 分割-填充工具
 */
export default class MaskPolyTool extends ShapeTool {
  declare object: MaskShape | undefined;
  name = ToolName['mask-fill'];
  toolMode = ToolModelEnum.SEGMENTATION;
  cursor: string = Cursor.maskfill;
  manager: MaskToolManager;
  clickPosition?: Vector2;

  constructor(view: ImageView) {
    super(view);
    this.manager = view.MaskToolManager;
    this.roundMousePoint = true;
  }
  updateTool() {
    this.manager.updateTool();
  }
  doing(): boolean {
    return false;
  }
  // draw
  draw() {
    console.log('draw');
    this.initEvent();
    this.initDraw();
    this.drawGroup.show();
    this.updateTool();
    // hook
    this.onDrawStart();
  }
  stopDraw() {
    this.mouseDown = false;
    this.drawGroup.hide();
    this.clearEvent();
    this.onDrawEnd();
  }
  stopCurrentDraw() {
    this.manager.completeDraw();
  }
  clearDraw() {
    this.mouseDown = false;
    this.drawGroup.hide();
    this.manager.exitSegmentTool();
  }
  undoDraw(): void {
    this.manager.undo();
  }
  onMouseDown(e: Konva.KonvaEventObject<MouseEvent>, point: Vector2) {
    if (this.clickPosition) return;
    this.clickPosition = point;
    this.manager.saveSnapshot();
    this.checkClickPosition(point);
    this.clickPosition = undefined;
    this.updateStatus();
  }
  onMouseMove(e: Konva.KonvaEventObject<MouseEvent>, point: Vector2) {}
  initDraw() {
    this.view.MaskToolManager.initTool(this);
  }
  checkClickPosition(point: Vector2) {
    const { x, y } = point;
    const target = this.manager.dataCanvas[0];
    const showCanvas = this.manager.showCanvas[0];
    const imageData = target.context.getImageData(0, 0, target.w, target.h);
    const i = (x + y * target.w) * 4;
    // 点击处的color
    const clickColor = [
      imageData.data[i],
      imageData.data[i + 1],
      imageData.data[i + 2],
      imageData.data[i + 3],
    ];
    const targetColor = this.manager.NoRgba; // 当前绘制的数据的color
    const isSameColor = sameColor(clickColor, targetColor, 0); // 点击处与当前绘制颜色是否相同

    const isEraser = this.manager.isEraser(); // 橡皮擦
    const isCover = this.manager.isCover(); // 是否覆盖

    // 橡皮擦模式下, 只有相同色块才进行填充
    const eraserFill = isEraser && isSameColor;
    // 覆盖模式下, 点击处为不同色就填充
    const coverFill = isCover && !isSameColor;
    // 非覆盖模式下, 点击处为透明色才填充
    const discoverFill = !isCover && clickColor[3] === 0;
    if (eraserFill || coverFill || discoverFill) {
      // 填充处理
      let fillColor = isEraser ? [0, 0, 0, 0] : targetColor; // 填充color
      const { mark } = floodFillContext({ imageData, point, fillColor });
      target.context.putImageData(imageData, 0, 0);

      fillColor = isEraser ? [0, 0, 0, 0] : this.manager.rgba;

      const showImageData = showCanvas.context.getImageData(0, 0, showCanvas.w, showCanvas.h);
      fillColorToImageData(showImageData, mark, fillColor);
      showCanvas.context.putImageData(showImageData, 0, 0);
    }
    this.view.draw();
  }
}
