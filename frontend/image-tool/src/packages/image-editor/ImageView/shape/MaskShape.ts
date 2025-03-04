import Konva from 'konva';
import { v4 as uuid } from 'uuid';
import Shape from './Shape';
import { CacheName, IShapeConfig } from '../type';
import { defaultMaskConfig, defaultMaskStateStyle } from '../../config';
import * as utils from '../../utils';
import { ToolModelEnum, ToolType } from '../../types';

export interface IMaskShapeConfig extends IShapeConfig {
  box: number[];
  pathArray: Int32Array[];
  maskData: number[];
}
export default class MaskShape extends Shape {
  className = 'mask';
  uuid: string = uuid();
  userData: Record<string, any> = {};
  stateStyles?: Record<string, IShapeConfig> = defaultMaskStateStyle;
  defaultStyle: IShapeConfig = defaultMaskConfig;
  annotateType: ToolModelEnum = ToolModelEnum.SEGMENTATION;

  box: number[] = [0, 0, 0, 0];
  pathArray: Int32Array[] = [];
  maskData: number[] = [];

  constructor(config: IMaskShapeConfig) {
    super({ draggable: false, x: config.box[0], y: config.box[1] });
    this.box = config.box;
    this.pathArray = config.pathArray;
    this.maskData = config.maskData;
  }
  downLoad(withColor = true) {
    const [, , width, height] = this.box;
    const imageData = new ImageData(width, height);
    const data = this.maskData;
    let color = [255, 255, 255, 255];
    if (withColor) {
      const fillColor = Konva.Util.colorToRGBA(this.fill());
      if (fillColor) {
        const { r, g, b } = fillColor;
        color = [r, g, b, 255];
      }
    }
    for (let i = 0; i < data.length; i += 2) {
      const start = data[i];
      const end = start + data[i + 1];
      for (let j = start; j < end; j++) {
        imageData.data[j * 4 + 0] = color[0];
        imageData.data[j * 4 + 1] = color[1];
        imageData.data[j * 4 + 2] = color[2];
        imageData.data[j * 4 + 3] = color[3];
      }
    }
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
    ctx.putImageData(imageData, 0, 0);
    canvas.convertToBlob().then((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = this.userData.classType || 'NoClass';
      link.click();
      URL.revokeObjectURL(url);
    });
  }
  _sceneFunc(context: Konva.Context) {
    if (!this.pathArray || this.pathArray.length === 0) return;

    context.beginPath();

    this.pathArray.forEach((points) => {
      if (!points || points.length == 0) return;

      context.moveTo(points[0], points[1]);
      for (let i = 2; i < points.length; i += 2) {
        context.lineTo(points[i], points[i + 1]);
      }
      context.closePath();
    });
    context.fillStrokeShape(this);
  }
  updateConfig(config: IMaskShapeConfig) {
    this.box = config.box;
    this.position({ x: config.box[0], y: config.box[1] });
    this.pathArray = config.pathArray;
    this.maskData = config.maskData;
    this._clearCache('area');
  }
  clonePointsData(): IMaskShapeConfig {
    return {
      box: this.box,
      pathArray: this.pathArray,
      maskData: this.maskData,
    };
  }
  getSelfRect() {
    return {
      x: this.box[0] - this.attrs.x,
      y: this.box[1] - this.attrs.y,
      width: this.box[2],
      height: this.box[3],
    };
  }
  _getTextPosition() {
    return { x: this.box[2] / 2, y: this.box[3] / 2 };
  }
  getArea() {
    return this._getCache('area' as CacheName, this._getArea) as number;
  }
  _getArea() {
    return utils.countMaskPixel(this.maskData);
  }
  get toolType() {
    return ToolType.MASK;
  }
}
