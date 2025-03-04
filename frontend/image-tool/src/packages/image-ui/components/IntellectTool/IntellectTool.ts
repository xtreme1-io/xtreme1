import {
  Vector2,
  ShapeTool,
  ImageView,
  Konva,
  Cursor,
  MaskShape,
  Circle,
  utils as EditorUtils,
  Const,
  ToolName,
} from '../../../image-editor';
import { IModelInputProps } from './type';
import utils from './utils';

export default class IntellectTool extends ShapeTool {
  EVENT_MOUSEMOVING = 'event_mousemoving';
  EVENT_CLICK = 'event_click';
  EVENT_DRAW = 'draw';

  name = ToolName.intellect;
  cursor = Cursor.pointer;
  maskImg = new Konva.Image({ image: undefined });
  anchors = new Konva.Group();
  // hasCreateMask = false;
  handleMask?: MaskShape;
  maskImageData?: ImageData;
  oriImageData?: ImageData;
  modeLoaded: boolean = false;
  snapshot: [ImageData?, HTMLCanvasElement?][] = [];
  clicks: IModelInputProps[] = [];
  downPos?: Vector2;
  mouseDowning: boolean = false;

  constructor(view: ImageView) {
    super(view);
    this.drawGroup.add(this.maskImg, this.anchors);
  }

  // draw
  draw() {
    console.log('draw');
    this.enable = true;
    // this.clearDrawData();
    // this.clearEditData();
    this.drawGroup.show();
    // draw event
    this.clearEvent();
    this.initEvent();
    this.initOriImageData();

    this.emit(this.EVENT_DRAW);
  }
  initOriImageData() {
    const { selects, others } = this.view.editor.filterMaskShape();
    const masks = [...selects, ...others];
    const { backgroundWidth, backgroundHeight } = this.view;
    this.oriImageData = this.view.editor.utils.masks2ImageData({
      masks,
      width: backgroundWidth,
      height: backgroundHeight,
      useNoRGB: false,
    });
  }
  undoDraw() {
    const data = this.snapshot.pop();
    if (!data) return;
    const [imageData, canvas] = data;
    this.setMaskImageData(imageData);
    if (!imageData) {
      this.maskImg.setAttrs({
        image: undefined,
      });
    } else if (canvas) {
      this.drawMask(canvas);
    }
    this.anchors.children?.pop();
    this.clicks.pop();
  }
  clearDraw() {
    // this.hasCreateMask = false;
    this.maskImg.setAttrs({ image: undefined });
    this.anchors.removeChildren();
    this.maskImageData = undefined;
  }
  get hasCreateMask() {
    return !!this.maskImageData;
  }
  stopCurrentDraw() {
    if (this.hasCreateMask) {
      // 完成绘制, 实例mask
      if (!this.maskImageData) return;
      const canvas = utils.imageDataToCanvas(this.maskImageData);
      const config = EditorUtils.canvas2Mask(canvas);
      if (config?.pathArray?.length > 0) {
        //  生成一个新的maskShape图形
        this.object = new MaskShape(config);
        this.onDraw(this.object);
        this.object.userData.resultStatus = Const.Predicted;
      }
    }
    this.exitTool();
  }
  stopDraw() {
    console.log('stopDraw');
    this.clearDraw();
    this.clearEvent();
    this.drawGroup.hide();
    this.onDrawEnd();
    this.oriImageData = undefined;
  }
  exitTool() {
    this.view.disableDraw();
  }

  drawMask(canvas: HTMLCanvasElement, opacity: number = 0.4) {
    this.maskImg.setAttrs({
      image: canvas,
      width: canvas.width,
      height: canvas.height,
      opacity,
    });
  }
  setMaskImageData(imgData?: ImageData) {
    this.maskImageData = imgData;
  }
  saveSnapshot() {
    const maskData = this.maskImageData;
    const imgData = this.maskImg.attrs.image;
    this.snapshot.push([maskData, imgData]);
  }
  mouseDownInevitable(e: Konva.KonvaEventObject<MouseEvent>, point: Vector2) {
    this.downPos = point;
    this.mouseDowning = true;
  }
  mouseUpInevitable(e: Konva.KonvaEventObject<MouseEvent>, point: Vector2) {
    this.mouseDowning = false;
    if (!this.modeLoaded || !this.downPos || e.evt.button === 1) return;
    const valid = this.isValid(point);
    if (!valid) return;

    const type = e.evt.button === 2 ? -1 : 1;
    this.saveSnapshot();
    this.emit(this.EVENT_CLICK, point, type);
    const anchor = new Circle({
      ...point,
      stroke: '#000000',
      strokeWidth: 1,
      fill: type === 1 ? '#00ff00' : '#ff0000',
      radius: 5,
    });
    this.anchors.add(anchor);
  }
  mouseMoveInevitable(e: Konva.KonvaEventObject<MouseEvent>, point: Vector2) {
    this.downPos = undefined;
    if (!this.modeLoaded || this.hasCreateMask || this.mouseDowning) return;
    const valid = this.isValid(point);
    if (valid) {
      this.emit(this.EVENT_MOUSEMOVING, point);
    } else {
      this.maskImg.setAttrs({
        image: undefined,
      });
    }
  }
}
