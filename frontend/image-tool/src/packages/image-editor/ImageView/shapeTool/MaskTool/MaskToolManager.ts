import hotkeys from 'hotkeys-js';
import ImageView from '../../index';
import MaskShape from '../../shape/MaskShape';
import * as util from './util';
import constant from './const';
import BrushTool from './BrushTool';
import MaskPolyTool from './MaskPolyTool';
import { Event, defaultMaskColor, defaultMaskRGBA } from '../../../config';
import { SEGMENT_NO, number2rgba, imageData2Masks, getPathByMaskData } from '../../../utils';
import Konva from 'konva';
import { Vector2 } from '../../type';
import ShapeTool from '../ShapeTool';
import MaskFillTool from './MaskFillTool';
import ShapeRoot from '../../components/ShapeRoot';
import { ToolModelEnum, ToolName } from '../../../types';
import { t } from '@/lang';

/**
 * Mask Tool Manager
 */
// canvas缓存池
class canvasPool {
  _pools: HTMLCanvasElement[] = [];

  constructor() {}
  _initPool() {}
  _newCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 0;
    canvas.height = 0;
    return canvas;
  }

  getCanvas(w?: number, h?: number) {
    const canvas = this._pools.shift() || this._newCanvas();
    if (w && h) {
      canvas.width = w;
      canvas.height = h;
    }
    return canvas;
  }
  getCanvasList(num: number = 1) {
    const list: HTMLCanvasElement[] = [];
    for (let i = 0; i < num; i++) {
      list.push(this.getCanvas());
    }
    return list;
  }
  deleteCanvas(obj: HTMLCanvasElement | HTMLCanvasElement[]) {
    if (!obj) return;
    const list = Array.isArray(obj) ? obj : [obj];
    if (list.length === 0) return;
    list.forEach((e) => {
      e.width = 0;
      e.height = 0;
      this._pools.push(e);
    });
  }
}
// 所有的分割工具
type AllMaskTool = BrushTool | MaskPolyTool | MaskFillTool;

const editColor = '#ffffff';
const defaultNoColor = '#000000';
// 分割工具管理器
export default class MaskToolManager {
  // 参数
  canvasPools: canvasPool = new canvasPool();
  view: ImageView;
  bgW: number = 0;
  bgH: number = 0;
  object?: MaskShape;
  root?: ShapeRoot;
  maskMap: Record<string, MaskShape> = {};
  tool!: AllMaskTool;
  // 拆分的canvas list
  dataCanvas: util.ISegmentCanvas[] = [];
  showCanvas: util.ISegmentCanvas[] = [];
  editCanvas: util.ISegmentCanvas[] = [];

  // manager state
  toolInit: boolean = false;
  // style
  color: string = defaultMaskColor;
  rgba: number[] = defaultMaskRGBA;
  NoColor: string = defaultNoColor;
  NoRgba: number[] = [0, 0, 0, 0];
  snapshot: [ImageData, ImageData][] = [];

  constructor(view: ImageView) {
    this.view = view;
    this.init();
  }
  // 绘制时是否覆盖其他已存在mask
  isCover() {
    const { toolConfig } = this.view.editor.state;
    return toolConfig.coverType === 1;
  }
  // 是否擦除
  isEraser() {
    const { toolConfig } = this.view.editor.state;
    return toolConfig.maskDrawType === 1;
  }
  isMaskManagerTool(tool?: ShapeTool) {
    if (!tool) return false;
    if (tool instanceof BrushTool || tool instanceof MaskPolyTool || tool instanceof MaskFillTool)
      return true;
    return false;
  }
  init() {
    this.exitSegmentTool = this.exitSegmentTool.bind(this);
    this.view.editor.on(Event.BEFORE_FRAME_CHANGE, this.exitSegmentTool);
    this.view.editor.on(Event.ANNOTATE_DISABLED_DRAW, this.exitSegmentTool);
    this.view.editor.on(Event.TOOLMODE_CHANGE, this.exitSegmentTool);
  }
  initTool(tool: AllMaskTool) {
    this.tool = tool;
    if (this.toolInit) return;
    this.snapshot = [];
    this.toolInit = true;
    this.view.editor.state.toolConfig.coverType = 0;
    this.view.editor.state.toolConfig.maskDrawType = 0;
    this.view.maskGroup.show();
    this.initCanvas();
    this.updateColorStyle();
    this.root = this.view.getRoot(ToolModelEnum.SEGMENTATION);
    this.root.hide();
    // this.object?.setAttrs({ opacity: 0 });
    this.initEvent();
    tool.updateStatus(true);
    if (!this.object) this.view.editor.selectObject();
  }
  exitSegmentTool() {
    if (!this.toolInit) return;
    this.toolInit = false;
    this.root?.show();
    // this.object?.setAttrs({ opacity: 1 });
    this.view.maskGroup.removeChildren();
    this.view.maskGroup.hide();
    this.clearPreCanvas();
    this.view.disableDraw();
    this.clearEvent();
  }
  changeTool() {
    if (!this.tool) return;
    this.tool.stopDraw();
  }
  updateTool() {
    const { toolConfig } = this.view.editor.state;
    this.editCanvas.forEach((e) => {
      e.context.lineWidth = toolConfig.brushWidth;
    });
  }
  // 计算绘制时涉及的canvas
  involveCanvas(list: util.ISegmentCanvas[], point1: Vector2, point2: Vector2) {
    const reArr: util.ISegmentCanvas[] = [];
    const y0 = Math.min(point1.y, point2.y);
    const y1 = Math.max(point1.y, point2.y);
    list.forEach((e) => {
      if (y0 > e.y2 || y1 < e.y) return;
      reArr.push(e);
    });
    return reArr;
  }
  // 同步绘制: 将editCanvas上的绘制数据同步到showCanvas和dataCanvas
  composeCanvas(canvas: util.ISegmentCanvas[], box: util.IMaskBox) {
    const { x, y, y1, w } = box;
    canvas.forEach((e) => {
      const composeDataCanvas = this.dataCanvas[e.index];
      const composeShowCanvas = this.showCanvas[e.index];
      const startY = Math.max(e.y, y) - e.y;
      const endY = Math.min(e.y2, y1) - e.y;
      const holdH = Math.max(1, endY - startY);
      const data = e.context.getImageData(x, startY, w, holdH).data;
      const dataImgData = composeDataCanvas.context.getImageData(x, startY, w, holdH);
      const showImgData = composeShowCanvas.context.getImageData(x, startY, w, holdH);
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] == 0) continue; // 表示没有绘制到该点
        const isDrawColor =
          dataImgData.data[i] === this.NoRgba[0] &&
          dataImgData.data[i + 1] === this.NoRgba[1] &&
          dataImgData.data[i + 2] === this.NoRgba[2];
        const isEmptyColor = dataImgData.data[i + 3] === 0;
        if (this.isEraser()) {
          // 橡皮擦, 只擦除当前的绘制对象
          if (isDrawColor) {
            this.overrideColor(showImgData, i);
            this.overrideColor(dataImgData, i);
          }
        } else if (this.isCover() || isEmptyColor) {
          this.overrideColor(showImgData, i, this.rgba);
          this.overrideColor(dataImgData, i, this.NoRgba);
        }
      }
      composeShowCanvas.context.putImageData(showImgData, x, startY);
      composeShowCanvas.changed = true;
      composeDataCanvas.context.putImageData(dataImgData, x, startY);
      composeDataCanvas.changed = true;
    });
  }
  overrideColor(imgData: ImageData, index: number, rgba: number[] = [0, 0, 0, 0]) {
    imgData.data[index] = rgba[0];
    imgData.data[index + 1] = rgba[1];
    imgData.data[index + 2] = rgba[2];
    imgData.data[index + 3] = rgba[3];
  }
  completeDraw() {
    let preMasks = Object.values(this.maskMap);
    const imgData = this.dataCanvas[0].context.getImageData(0, 0, this.bgW, this.bgH);
    const data = imageData2Masks(imgData);
    const infos = Object.values(data);
    const newMasks: MaskShape[] = [];
    this.view.editor.cmdManager.withGroup(() => {
      infos.forEach((e) => {
        const no = e.no;
        const preMask = this.maskMap[String(no)];
        const pathArray = getPathByMaskData(e.maskData, e.box);
        if (preMask) {
          // 当前mask是否还存在, 当前mask可能已经被删除了
          const maskExist = this.view.editor.dataManager.hasObject(preMask.uuid);
          if (maskExist && preMask.getArea() !== e.area) {
            this.view.editor.cmdManager.execute('update-mask', {
              object: preMask,
              config: { ...e, pathArray },
            });
          }
          // preMask.updateConfig({ ...e, pathArray });
        } else {
          const shape = new MaskShape({ ...e, pathArray });
          newMasks.push(shape);
        }
        Reflect.deleteProperty(this.maskMap, String(no));
      });
      if (newMasks.length > 0) {
        this.tool.onDraw(newMasks);
        this.view.updateStateStyle(newMasks);
      }
      preMasks = Object.values(this.maskMap);
      if (preMasks.length > 0) {
        this.view.editor.cmdManager.execute('delete-object', preMasks);
      }
    });

    this.exitSegmentTool();
    // if (!this.object && this.tool) {
    //   this.view.editor.once(Event.ACTION_END, () => {
    //     this.view.editor.actionManager.execute('drawTool', this.tool.name);
    //   });
    // }
  }
  initCanvas() {
    this.bgW = this.view.backgroundWidth;
    this.bgH = this.view.backgroundHeight;
    const { imageData, showData, object, maskMap } = this.view.editor.getMaskShapeLayerInfo();
    this.object = object;
    this.maskMap = maskMap;
    const w = this.bgW;
    const h = this.bgH;
    // canvas 分层
    // 清除之前的分层数据
    this.clearPreCanvas();
    // dataCanvas: mask颜色与mask的no值对应
    const dataCanvas = this.canvasPools.getCanvas(this.bgW, this.bgH);
    let context = dataCanvas.getContext('2d', {
      willReadFrequently: true,
    }) as CanvasRenderingContext2D;
    context.putImageData(imageData, 0, 0);
    this.dataCanvas.push({
      canvas: dataCanvas,
      context,
      x: 0,
      y: 0,
      w,
      start: 0,
      h,
      y2: h,
      index: 0,
    });
    // const img1 = new Konva.Image({
    //   image: dataCanvas,
    //   x: 0,
    //   y: 0,
    //   width: w,
    //   height: h,
    //   strokeWidth: 0,
    // });
    // this.view.maskGroup.add(img1);

    // 用于编辑的绘制空白canvas
    const editCanvas = this.canvasPools.getCanvas(w, h);
    context = editCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    context.lineJoin = 'round';
    context.strokeStyle = editColor;
    context.fillStyle = editColor;
    this.editCanvas.push({
      canvas: editCanvas,
      context,
      x: 0,
      y: 0,
      w,
      start: 0,
      h,
      y2: h,
      index: 0,
    });

    // show canvas list
    const showCanvas = this.canvasPools.getCanvas(w, h);
    context = showCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    context.putImageData(showData, 0, 0);
    this.showCanvas.push({
      canvas: showCanvas,
      context,
      x: 0,
      y: 0,
      w,
      start: 0,
      h,
      y2: h,
      index: 0,
    });
    const img = new Konva.Image({
      image: showCanvas,
      x: 0,
      y: 0,
      width: w,
      height: h,
      strokeWidth: 0,
    });
    this.view.maskGroup.add(img);
    // }
  }
  updateColorStyle() {
    const alpha = defaultMaskRGBA[3];
    const no = this.object?.userData.no || SEGMENT_NO - 1;
    this.NoRgba = number2rgba(no);
    this.NoColor = `rgba(${this.NoRgba.join()})`;
    if (this.object) {
      const { r, g, b } = this.object.attrs.fillColorRgba;
      this.color = `rgba(${r},${g},${b},${alpha})`;
      this.rgba = [r, g, b, alpha];
    } else {
      this.color = defaultMaskColor;
      this.rgba = defaultMaskRGBA;
    }
  }
  clearEditCanvas() {
    this.editCanvas.forEach((e) => {
      e.context.clearRect(0, 0, e.w, e.h);
    });
  }
  clearPreCanvas() {
    this.canvasPools.deleteCanvas(
      [...this.dataCanvas, ...this.showCanvas, ...this.editCanvas].map((e) => e.canvas),
    );
    this.dataCanvas.length = 0;
    this.showCanvas.length = 0;
    this.editCanvas.length = 0;
  }
  switchTool() {
    const editor = this.view.editor;
    const toolConfig = editor.state.toolConfig;
    const tools: ToolName[] = [ToolName.brush, ToolName['mask-polygon'], ToolName['mask-fill']];
    const nextToolIndex = (tools.findIndex((e) => e == toolConfig.segmentTool) + 1) % tools.length;
    const nextTool = tools[nextToolIndex];
    if (!this.toolInit) {
      toolConfig.segmentTool = nextTool;
      return;
    }
    if (this.tool.doing()) {
      editor.showMsg('warning', t('image.resultNotComplete'));
    } else {
      editor.state.toolConfig.segmentTool = nextTool;
      editor.actionManager.execute('drawTool', nextTool);
    }
  }
  switchCover() {
    const { toolConfig } = this.view.editor.state;
    toolConfig.coverType = 1 - toolConfig.coverType;
    toolConfig.maskDrawType = 0;
    this.tool?.updateTool();
  }
  switchEraser() {
    const { toolConfig } = this.view.editor.state;
    toolConfig.maskDrawType = 1 - toolConfig.maskDrawType;
    toolConfig.coverType = 0;
    this.tool?.updateTool();
  }
  switchBrushWidth(step: number = 0) {
    if (this.tool && this.tool instanceof BrushTool) {
      const { toolConfig } = this.view.editor.state;
      toolConfig.brushWidth += step;
      this.tool.updateTool();
    }
  }
  initEvent() {
    hotkeys.setScope(constant.HOTKYE_NAMESPACE);
    hotkeys(constant.KEY_2, constant.HOTKYE_NAMESPACE, (event, handler) => {
      event.preventDefault();
      this.switchCover();
    });
    hotkeys(constant.KEY_3, constant.HOTKYE_NAMESPACE, (event, handler) => {
      event.preventDefault();
      this.switchEraser();
    });
    hotkeys(constant.KEY_REDUCE, constant.HOTKYE_NAMESPACE, (event, handler) => {
      event.preventDefault();
      this.switchBrushWidth(-1);
    });
    hotkeys(constant.KEY_ADD, constant.HOTKYE_NAMESPACE, (event, handler) => {
      event.preventDefault();
      this.switchBrushWidth(1);
    });
  }
  undo() {
    const snapshot = this.snapshot.pop();
    if (!snapshot) return;
    const item = this.editCanvas[0];
    if (!item) return;
    const [dImageData, sImageData] = snapshot;
    const dItem = this.dataCanvas[0];
    if (dItem) {
      dItem.context.putImageData(dImageData, 0, 0);
      dItem.changed = true;
    }
    const sItem = this.showCanvas[0];
    if (sItem) {
      sItem.context.putImageData(sImageData, 0, 0);
      sItem.changed = true;
    }
    this.view.draw();
  }
  saveSnapshot() {
    const dItem = this.dataCanvas[0];
    const sItem = this.showCanvas[0];
    if (!dItem || !sItem) return;
    const dImageData = dItem.context.getImageData(0, 0, dItem.canvas.width, dItem.canvas.height);
    const sImageData = sItem.context.getImageData(0, 0, sItem.canvas.width, sItem.canvas.height);
    this.snapshot.push([dImageData, sImageData]);
  }

  clearEvent() {
    hotkeys.deleteScope(constant.HOTKYE_NAMESPACE);
    [constant.KEY_2, constant.KEY_3, constant.KEY_REDUCE, constant.KEY_ADD].forEach((key) => {
      hotkeys.unbind(key, constant.HOTKYE_NAMESPACE);
    });
  }
}
