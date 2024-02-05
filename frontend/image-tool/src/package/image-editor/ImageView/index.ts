import Konva from 'konva';
import View from './View';
import Editor from '../Editor';
import Actions from './actions';
import * as utils from '../utils';
import * as _utils from './utils';
import { AnnotateObject, Polygon, Rect, Shape } from './shape';
import { IShapeConfig, Vector2 } from './type';
import { Cursor, Event } from '../configs';
import { throttle } from 'lodash';
import { AnnotateModeEnum, DisplayModeEnum, IStateMap, LoadStatus, ToolName } from '../types';
import { allTools, IToolName, ShapeTool } from './shapeTool';
import BackgroundGroup from './components/BackgroundGroup';
import ShapeRoot from './components/ShapeRoot';
import { colord } from 'colord';

_utils.hackOverwriteShape();
export type IFilter = (e: AnnotateObject) => boolean;
export interface IImageViewOption {
  actions?: string[];
}
export * from './shapeTool';
export { ShapeRoot, BackgroundGroup };

export default class ImageView extends View {
  static Actions = Actions;
  editor: Editor;
  container: HTMLDivElement;
  stage: Konva.Stage;
  renderLayer: Konva.Layer;
  helpLayer: Konva.Layer;
  shapes: Konva.Group;
  renderFilter: IFilter = () => true;

  currentDrawTool?: ShapeTool;
  currentEditTool?: ShapeTool;
  toolMap: Record<string, ShapeTool> = {};
  backgroundWidth = 1;
  backgroundHeight = 1;
  backgroundAsRatio = 1;
  cursor: string = '';
  zoomAnimation?: Konva.Animation;

  constructor(editor: Editor, container: HTMLDivElement, option: IImageViewOption = {}) {
    super();
    this.editor = editor;
    this.container = container;
    this.stage = new Konva.Stage({
      container: container,
      width: container.clientWidth,
      height: container.clientHeight,
    });
    const imageSmoothingEnabled = this.editor.state.config.imageSmoothing;
    this.renderLayer = new Konva.Layer({ imageSmoothingEnabled });
    this.helpLayer = new Konva.Layer({ imageSmoothingEnabled });
    this.shapes = new Konva.Group({ sign: 'renderLayer-shapes' });
    BackgroundGroup.getInstance().init(this);
    const roots: any[] = [new ShapeRoot({ type: AnnotateModeEnum.INSTANCE })];
    this.editor.dataManager.setFrameRoot('test001', roots);
    this.shapes.add(...roots);

    utils.disableContextMenu(this.renderLayer.canvas._canvas);
    utils.disableContextMenu(this.helpLayer.canvas._canvas);

    _utils.hackContext(this, this.renderLayer);
    _utils.hackContext(this, this.helpLayer);

    this.renderLayer.add(this.shapes);
    this.stage.add(this.renderLayer, this.helpLayer);
    const { actions } = option;
    if (actions && actions.length > 0) this.addActions(actions);
    this.resize = throttle(this.resize.bind(this), 50);
    this.initEvent();
  }
  draw() {
    this.stage.batchDraw();
  }
  initEvent() {
    _utils.handleDragToCmd(this);
    // draw
    this.renderLayer.on('draw', () => {
      this.editor.emit(Event.DRAW);
    });
    this.editor.on(Event.FRAME_CHANGE, () => {
      this.currentDrawTool?.clearDraw();
      BackgroundGroup.getInstance().updateEquisector();
    });
    window.addEventListener('resize', this.resize);
    // object visible changed
    this.editor.on(Event.ANNOTATE_VISIBLE, (objects) => {
      const curTool = this.currentDrawTool || this.currentEditTool;
      if (!curTool || !curTool.object) return;
      const group = this.currentDrawTool?.drawGroup || this.currentEditTool?.editGroup || undefined;
      if (!group) return;
      const visible = curTool.object.showVisible;
      if (visible) {
        group.show();
      } else {
        group.hide();
      }
    });
  }
  /**
   * renderFrame: background image && annotations
   */
  async renderFrame() {
    try {
      const frame = this.editor.getCurrentFrame();
      if (!frame) throw `render error: the frame does not exist`;
      const resource = this.editor.dataResource.getResourceData(frame);
      const root_ins = this.editor.dataManager.getFrameRoot(frame.id, AnnotateModeEnum.INSTANCE);
      if (!resource || !root_ins) {
        frame.loadState = LoadStatus.ERROR;
        throw `render error: resource(${frame.id}) has not be loaded`;
      }
      this.setBackground(resource.image);
      this.updateShapeRoot([root_ins]);
    } catch (err) {
      throw `render error: ${err}`;
    }
  }
  resize() {
    const bbox = this.container.getBoundingClientRect();
    this.stage.size(bbox);
    this.editor.emit(Event.RESIZE);
  }
  imageSmoothing(val: boolean) {
    this.renderLayer.setAttrs({ imageSmoothingEnabled: val });
    this.helpLayer.setAttrs({ imageSmoothingEnabled: val });
  }
  zoomTo(newScale: number, pointer?: Konva.Vector2d) {
    const stage = this.stage;
    const oldScale = stage.scaleX();
    pointer = pointer || (stage.getPointerPosition() as Konva.Vector2d);
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    stage.scale({ x: newScale, y: newScale });
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    this.emit(Event.ZOOM, newScale);
  }
  setCursor(cursor: string) {
    this.container.style.cursor = cursor;
  }
  // shaperoot
  getRoot(type?: AnnotateModeEnum) {
    type = type || this.editor.state.annotateMode;
    return this.shapes.getChildren((e: ShapeRoot) => {
      return e.type === type;
    })[0] as any as ShapeRoot;
  }
  updateShapeRoot(roots?: ShapeRoot[]) {
    if (!roots) {
      if (!this.shapes.children || this.shapes.children.length < 1) return;
      roots = [this.shapes.children[0], this.shapes.children[1]] as any as ShapeRoot[];
    }
    const { annotateMode } = this.editor.state;
    roots.forEach((root) => {
      root.index = root.type === annotateMode ? 1 : 0;
      root.listening(root.type === annotateMode);
      root.renderFilter = this.editor.getRenderFilter();
      // resultTypeFilter.includes(root.type) ? root.show() : root.hide();
    });
    roots.sort((root1, root2) => root1.index - root2.index);
    this.shapes.removeChildren();
    this.shapes.add(...(roots as any));
    this.draw();
  }
  setBackground(image?: HTMLImageElement) {
    if (!image || !image.naturalWidth || !image.naturalHeight) return;
    this.backgroundWidth = image.naturalWidth;
    this.backgroundHeight = image.naturalHeight;
    this.backgroundAsRatio = this.backgroundWidth / this.backgroundHeight;
    BackgroundGroup.getInstance().updateBgImage(image);
    this.fitBackgroundAsRatio();
  }
  fitBackgroundAsRatio(resetRotation = true) {
    if (resetRotation) this.stage.rotation(0);
    const bgR = this.stage.rotation();
    let bgRect = { x: 0, y: 0, width: this.backgroundWidth, height: this.backgroundHeight };
    const bgPoints = utils.getRectPointsWithRotation(bgRect, bgR);
    bgRect = utils.getPointsBoundRect(bgPoints);

    const width = this.stage.content.clientWidth;
    const height = this.stage.content.clientHeight;

    const scaleX = bgRect.width / width;
    const scaleY = bgRect.height / height;

    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    if (scaleX > scaleY) {
      scale = 1 / scaleX;
      offsetY = (height - bgRect.height * scale) / 2;
    } else {
      scale = 1 / scaleY;
      offsetX = (width - bgRect.width * scale) / 2;
    }
    offsetX -= bgRect.x * scale;
    offsetY -= bgRect.y * scale;

    this.stage.scale({ x: scale, y: scale });
    this.stage.position({ x: offsetX, y: offsetY });
    this.emit(Event.ZOOM, scale, false);
    this.emit(Event.ROTATE, this.stage.rotation());
  }
  rotateAroundCenter(r: number) {
    function rotatePoint({ x, y }: Vector2, r: number) {
      const rcos = Math.cos(r);
      const rsin = Math.sin(r);
      return { x: x * rcos - y * rsin, y: y * rcos + x * rsin };
    }
    const stagePos = this.stage.position();
    const stageScale = this.stage.scaleX();
    const tl = { x: -this.backgroundWidth / 2, y: -this.backgroundHeight / 2 };
    const current = rotatePoint(tl, utils.deg2radian(this.stage.rotation()));
    const rotated = rotatePoint(tl, utils.deg2radian(r));
    const dx = (rotated.x - current.x) * stageScale,
      dy = (rotated.y - current.y) * stageScale;
    this.stage.rotation(r);
    this.stage.position({ x: stagePos.x + dx, y: stagePos.y + dy });
    this.emit(Event.ROTATE, r);
  }
  getStatePriority(object: AnnotateObject) {
    return object.statePriority;
  }
  getStateStyles(object: AnnotateObject) {
    return object.stateStyles;
  }
  getDefaultStyle(object: AnnotateObject) {
    return object.stateStyles?.general || {};
  }
  setState(object: AnnotateObject, config: Partial<Record<keyof IStateMap, boolean>>) {
    Object.assign(object.state || { hover: false, select: false }, config);
    this.updateStateStyle(object);
  }
  updateStateStyle(objects: AnnotateObject | AnnotateObject[], viewType?: DisplayModeEnum) {
    if (!Array.isArray(objects)) objects = [objects];
    viewType = viewType || this.editor.state.config.viewType;
    const isMaskMode = DisplayModeEnum.MASK === viewType;
    objects.forEach((object) => {
      const { skipStateStyle } = object.attrs;
      if (skipStateStyle) return;

      const statePriority = this.getStatePriority(object);
      const stateStyles = this.getStateStyles(object);
      let defaultStyle = this.getDefaultStyle(object);
      if (object instanceof Rect || object instanceof Polygon) {
        defaultStyle = { ...defaultStyle, fill: isMaskMode ? object.stroke() : '' };
        const rgba = colord(object.stroke()).toRgb();
        const colorRGBA = `rgba(${rgba.r},${rgba.g},${rgba.b},0)`;
        stateStyles.hover.fill = colorRGBA;
        stateStyles.select.fill = colorRGBA;
      }
      this.updateStyleByState(object, object.state, statePriority, stateStyles, defaultStyle);
    });
  }
  updateStyleByState(
    object: AnnotateObject,
    states: IStateMap,
    statePriority: string[],
    stateStyle: Record<string, IShapeConfig>,
    defaultStyle: IShapeConfig,
  ) {
    const config = { ...defaultStyle };
    statePriority?.forEach((state) => {
      if (states && states[state] && stateStyle && stateStyle[state]) {
        Object.assign(config, stateStyle[state]);
      }
    });
    object.setAttrs(config);
  }
  updateObjectByUserData(objects: AnnotateObject | AnnotateObject[]) {
    if (!Array.isArray(objects)) objects = [objects];
    objects.forEach((object) => {
      const userData = this.editor.getUserData(object);
      const classConfig = this.editor.getClassType(userData.classId || '');
      let config: IShapeConfig = { stroke: classConfig ? classConfig.color : '#fff' };
      object.setAttrs(config);
      this.setState(object, {});
    });
  }
  updateToolStyleByClass() {
    const tool = this.currentEditTool;
    tool && tool.object && tool.edit(tool.object);
  }
  updateBGDisplayModel() {
    const frame = this.editor.getCurrentFrame();
    const {
      config: { viewType },
      annotateMode,
    } = this.editor.state;
    const objInstance =
      this.editor.dataManager.getFrameObject(frame.id, AnnotateModeEnum.INSTANCE) || [];
    const objSegmentation =
      this.editor.dataManager.getFrameObject(frame.id, AnnotateModeEnum.SEGMENTATION) || [];
    const objectsMap: Record<AnnotateModeEnum, AnnotateObject[]> = {
      [AnnotateModeEnum.INSTANCE]: objInstance,
      [AnnotateModeEnum.SEGMENTATION]: objSegmentation,
    };
    Object.keys(objectsMap).forEach((type: AnnotateModeEnum) => {
      const objs = objectsMap[type];
      const objArr: any[] = objs.filter((e) => e instanceof Rect || e instanceof Polygon);
      const inCurToolModel = annotateMode === type;
      this.updateStateStyle(objArr, inCurToolModel ? viewType : DisplayModeEnum.MARK);
    });
  }
  clearBackground() {
    BackgroundGroup.getInstance().clearBgImage();
  }
  clearAllShape() {
    this.shapes.removeChildren();
  }

  /**
   * tool
   */
  setShapeTool(name: string, tool: ShapeTool) {
    this.toolMap[name] = tool;
  }
  getShapeTool(name: IToolName) {
    if (!this.toolMap[name]) {
      const Ctr = allTools[name];
      if (!Ctr) return;
      const tool = new Ctr(this);
      this.toolMap[name] = tool;
    }
    return this.toolMap[name];
  }
  enableDraw(name: IToolName | string) {
    const tool = this.getShapeTool(name as any);
    if (!tool) return;

    const curTool = this.currentDrawTool || this.currentEditTool;
    if (curTool?.doing()) {
      // return this.editor.showMsg('warning', 'Please finish drawing first');
    }
    if (curTool) {
      this.disableDraw();
      this.disableEdit();
    }

    this.currentDrawTool = tool;
    try {
      tool.draw();
    } catch (error) {
      console.error(error);
    }

    this.cursor = tool.cursor;
    this.setCursor(this.cursor);
    if (tool.config.disableRenderLayer) {
      this.renderLayer.listening(false);
    }

    this.editor.state.activeTool = name as any;
    _utils.handleDrawToCmd(this, this.currentDrawTool);
  }

  disableDraw() {
    const previousTool = this.currentDrawTool;
    this.cursor = '';
    this.editor.state.activeTool = ToolName.default;
    this.setCursor(Cursor.auto);
    this.renderLayer.listening(true);
    this.currentDrawTool = undefined;
    if (previousTool) {
      previousTool.stopDraw();
      _utils.handleDrawToCmdClear(previousTool);
    }
    this.editor.emit(Event.ANNOTATE_DISABLED_DRAW);
  }

  enableEdit(shape: Shape) {
    const name = shape.className;
    const tool = this.getShapeTool(name as any);
    if (!tool) return;

    this.disableEdit();
    this.disableDraw();

    this.currentEditTool = tool;
    try {
      tool.edit(shape);
    } catch (error) {
      console.error(error);
    }
    _utils.handleEditToCmd(this, this.currentEditTool);
  }
  disableEdit() {
    if (!this.currentEditTool) return;
    _utils.handleEditToCmdClear(this.currentEditTool);
    this.currentEditTool.stopEdit();
    this.cursor = '';
    this.setCursor(Cursor.auto);
    this.currentEditTool = undefined;
    this.editor.state.activeTool = ToolName.default;
  }
}
