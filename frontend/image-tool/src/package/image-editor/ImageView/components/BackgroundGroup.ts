import Konva from 'konva';
import ImageView from '../index';
import Editor from '../../Editor';

export default class BackgroundGroup {
  private static _instance: BackgroundGroup;
  public static getInstance() {
    if (!this._instance) this._instance = new BackgroundGroup();
    return this._instance;
  }

  view!: ImageView;
  editor!: Editor;
  group: Konva.Group;
  bgImg: Konva.Image;
  lines: Konva.Line[] = [];

  constructor() {
    this.group = new Konva.Group({ listening: false, sign: 'renderLayer-bgGroup' });
    this.bgImg = new Konva.Image({ image: undefined });
  }
  init(view: ImageView) {
    this.view = view;
    this.editor = this.view.editor;
    this.view.renderLayer.add(this.group);
    this.group.moveToBottom();
    this.initEvent();
    return this.group;
  }
  initEvent() {}
  updateBgImage(image: HTMLImageElement) {
    this.clearBgImage();
    this.bgImg = new Konva.Image({
      image,
      x: 0,
      y: 0,
      width: image.naturalWidth,
      height: image.naturalHeight,
    });
    this.group.add(this.bgImg);
    this.bgImg.moveToBottom();
    this.updateBackgroundStyle();
    this.updateEquisector();
  }
  clearBgImage() {
    this.bgImg?.remove?.();
    this.bgImg?.destroy?.();
  }
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
  updateBackgroundStyle() {
    if (!this.view) return;
    const { brightness, contrast } = this.view.editor.state.config;
    this.bgImg.cache();
    this.bgImg.filters([Konva.Filters.Brighten, Konva.Filters.Contrast]);
    this.bgImg.brightness(brightness / 100);
    this.bgImg.contrast(contrast);
  }
}
