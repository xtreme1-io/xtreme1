import Konva from 'konva';
import { SceneContext } from 'konva/lib/Context';
import ImageView from '../index';
import Editor from '../../../image-editor/Editor';
import { Event } from '../../config';
import { Rect, Shape } from '../export';
import { getRotatedRectPoints, getShapeRealPoint } from '../../utils';
import { debounce } from 'lodash';

const clipShapeClassname = ['rect', 'polygon', 'shape-circle'];

/**
 * 背景组件
 * 1: 背景图
 * 2: 背景图等分线
 * 3: 背景图裁剪遮罩
 * 4: 背景图亮度,对比度调节
 */
export default class Background {
  private static _instance: Background;
  public static getInstance() {
    if (!this._instance) this._instance = new Background();
    return this._instance;
  }

  view!: ImageView;
  editor!: Editor;

  group: Konva.Group;

  bgImg: Konva.Image; // 背景图
  lines: Konva.Line[] = []; // 背景图等分线
  bgMask: Konva.Image;
  clipGroup: Konva.Group;
  clipImage: Konva.Image; // 当前data的背景图
  constructor() {
    this.group = new Konva.Group({ listening: false, sign: 'renderLayer-bgGroup' });
    this.bgImg = new Konva.Image({ image: undefined });
    this.clipGroup = new Konva.Group({ sign: 'renderLayer-bgGroupMask' });
    this.bgMask = new Konva.Image({ x: 0, y: 0, image: undefined, sign: 'bgGroup-bgMask' });
    this.group.add(this.bgMask);
    this.clipImage = new Konva.Image({ x: 0, y: 0, image: undefined });
    this.clipGroup.add(this.clipImage);
  }
  init(view: ImageView) {
    this.view = view;
    this.editor = this.view.editor;
    this.view.renderLayer.add(this.group);
    this.view.renderLayer.add(this.clipGroup);
    this.initEvent();
    return this.group;
  }
  initEvent() {
    this.editor.on(Event.SELECT, () => {
      this.updateMask();
    });
    this.editor.on(Event.SELECT_RESULT_MASK, () => {
      this.updateMask();
    });
  }
  updateBackground(image?: HTMLImageElement) {
    image && this.setBgImg(image);
    this.updateBackgroundStyle();
    this.updateEquisector();
    this.updateMask();
  }
  /**
   * 设置背景图
   */
  setBgImg(image: HTMLImageElement) {
    this.clearBgImage();

    const width = image.naturalWidth;
    const height = image.naturalHeight;
    this.bgImg = new Konva.Image({
      listening: false,
      image: image,
      x: 0,
      y: 0,
      width: width,
      height: height,
    });
    this.bgImg.cache();
    this.group.add(this.bgImg);
    this.bgImg.moveToBottom();
  }
  clearBgImage() {
    this.bgImg?.remove?.();
    this.bgImg?.destroy?.();
  }
  getBgImg() {
    return this.bgImg;
  }
  getImageUrl(): string {
    return this.bgImg?.attrs?.image?.src;
  }

  /**
   * 等分线
   */
  updateEquisector() {
    if (!this.bgImg) return;
    const { enable, vertical, horizontal, width, color } =
      this.view.editor.state.config.bisectrixLine;
    if (vertical < 2 || vertical > 10 || horizontal < 2 || vertical > 10) return;
    this.clearEquisector();
    if (!enable) return;
    const maxX = this.bgImg.width();
    const maxY = this.bgImg.height();
    const averageX = maxX / vertical;
    const averageY = maxY / horizontal;
    for (let i = 1; i < vertical; i++) {
      const lineX = averageX * i;
      const bline = new Konva.Line({
        points: [lineX, 0, lineX, maxY],
        strokeWidth: width,
        stroke: color,
        hitStrokeWidth: 0,
      });
      this.lines.push(bline);
    }
    for (let i = 1; i < horizontal; i++) {
      const lineY = averageY * i;
      const bline = new Konva.Line({
        points: [0, lineY, maxX, lineY],
        strokeWidth: width,
        stroke: color,
        hitStrokeWidth: 0,
      });
      this.lines.push(bline);
    }
    this.group.add(...this.lines);
  }
  clearEquisector() {
    if (this.lines.length > 0) {
      this.lines.forEach((line) => {
        line.destroy();
      });
    }
    this.lines.length = 0;
  }

  /**
   * 背景mask裁剪
   */
  updateMask() {
    const { showSingleResult, selectedViewType } = this.editor.state.config;
    const { maskColor, showMask } = selectedViewType;
    this.bgMask.setAttrs({
      width: this.view.backgroundWidth,
      height: this.view.backgroundHeight,
      fill: maskColor,
    });
    if (showMask && showSingleResult) this.setClip();
    else this.setClipNone();
  }
  setClip() {
    let selects = this.view.editor.selection;
    selects = selects.filter((e) => clipShapeClassname.includes(e.className));
    if (selects.length > 0) {
      this.setClipMask();
      this.setClipBySelectShape(selects as Shape[]);
    } else {
      this.setClipNone();
    }
  }
  setClipNone() {
    this.clipGroup.hide();
    this.bgMask.hide();
    this.view.visibleShapes(true);
    this.view.helpLayer.show();
  }
  setClipMask() {
    this.clipGroup.show();
    this.bgMask.show();
    this.view.visibleShapes(false);
    this.view.helpLayer.hide();
    this.clipImage.setAttrs({
      width: this.bgImg.width(),
      height: this.bgImg.height(),
      image: this.bgImg.image(),
    });
  }
  setClipBySelectShape(shapes: Shape[]) {
    this.clipGroup.setAttrs({
      clipFunc: (ctx: SceneContext) => {
        ctx.beginPath();
        shapes.forEach((shape) => {
          const { x, y, radius = 0 } = shape.attrs;
          if (shape.className === 'polygon') {
            const realPoints = getShapeRealPoint(shape);
            realPoints.forEach((p, index) => {
              if (index === 0) ctx.moveTo(p.x, p.y);
              else ctx.lineTo(p.x, p.y);
            });
          } else if (shape.className === 'rect') {
            const rectPoints = getRotatedRectPoints(shape as Rect);
            rectPoints.forEach((p, index) => {
              if (index === 0) ctx.moveTo(p.x, p.y);
              else ctx.lineTo(p.x, p.y);
            });
          } else if (shape.className === 'shape-circle') {
            ctx.arc(x, y, radius, 0, Math.PI * 2, false);
          }
          // else if (shape.className === 'ellipse') {
          //   const { x, y, radiusX = 0, radiusY = 0, rotation = 0 } = shape.attrs;
          //   const ellipse = new Konva.Ellipse({ x, y, radiusX, radiusY, rotation });
          //   ellipse._sceneFunc = () => {
          //     ctx.save();
          //     if (radiusX !== radiusY) ctx.scale(1, radiusY / radiusX);
          //     ctx.arc(x, y, radiusX, 0, Math.PI * 2, false);
          //     ctx.restore();
          //   };
          // }
        });
        ctx.closePath();
      },
    });
  }

  /**
   * 亮度,对比度设置更新
   */
  updateBackgroundStyle = debounce(() => {
    if (!this.editor) return;
    const { brightness, contrast } = this.editor.state.config;
    const _brightness = this.bgImg.brightness();
    const _contrast = this.bgImg.contrast();
    // if(!this.bgImg.isCached()) this.bgImg.cache();
    if (Math.abs(_brightness - brightness / 100) < 1e-4 && Math.abs(_contrast - contrast) < 1e-4) {
      return;
    }
    const filters = this.bgImg.filters();
    if (!filters) this.bgImg.filters([Konva.Filters.Brighten, Konva.Filters.Contrast]);
    this.bgImg.brightness(brightness / 100);
    this.bgImg.contrast(contrast);
  }, 200);
}
