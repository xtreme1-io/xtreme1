import Konva from 'konva';
import Editor from '../Editor';
import View from './components/View';
import Actions from './actions';
import { IShapeConfig, AnnotateObject, IStateMap, Vector2 } from './type';
import { Shape, Polygon, Skeleton, Rect, MaskShape, Ellipse, CircleShape, Line } from './shape';
import { Event, defaultStateStyle, Cursor, skeSelectedColor } from '../config';
import {
  ShapeTool,
  allTools,
  IToolName,
  SplineCurveTool,
  PolygonTool,
  LineTool,
} from './shapeTool';
import * as utils from '../utils';
import * as _utils from './utils';
import ShapeRoot from './components/ShapeRoot';
import Background from './components/Background';
import {
  DisplayModeEnum,
  LineDrawModeEnum,
  LoadStatus,
  SelectToolEnum,
  ShareDrawMode,
  ToolModelEnum,
  ToolName,
} from '../types';
import { cloneDeep, throttle } from 'lodash';
import { colord } from 'colord';
import MaskToolManager from './shapeTool/MaskTool/MaskToolManager';
import ShareDraw from './utils/SharedDraw';
import { t } from '@/lang';

export type IFilter = (e: AnnotateObject) => boolean;

export interface IImageViewOption {
  actions?: string[];
}

export default class ImageView extends View {
  static Actions = Actions;
  editor: Editor;
  container: HTMLDivElement;
  stage: Konva.Stage;
  renderLayer: Konva.Layer;
  helpLayer: Konva.Layer;
  shapes: Konva.Group;
  maskGroup: Konva.Group; // 分割工具绘制
  renderFilter: IFilter = () => true;
  // transformer: Transformer;

  // tool
  currentDrawTool?: ShapeTool;
  currentEditTool?: ShapeTool;
  toolMap: Record<string, ShapeTool> = {};
  MaskToolManager: MaskToolManager;
  // editing: boolean = false;
  // drawing: boolean = false;
  // bg
  backgroundWidth = 1;
  backgroundHeight = 1;
  backgroundAsRatio = 1;
  // state style
  statePriority: string[] = ['hover', 'select'];
  stateStyles: Record<string, IShapeConfig> = defaultStateStyle;
  // cursor
  cursor: string = '';
  zoomAnimation?: Konva.Animation;
  curMouseEvent?: MouseEvent;

  constructor(editor: Editor, container: HTMLDivElement, option: IImageViewOption = {}) {
    super();

    const { actions } = option;

    this.editor = editor;
    this.container = container;

    /**
     * 设备像素比率
     * 存在屏幕缩放比率不同时, 渲染的图片与结果稍微错位问题
     * 强制设置 Konva.pixelRatio = 1
     * 暂不知会不会引起其他问题
     * 可能存在将整个canvas导出成图片时, 清晰度相关的问题, 目前没有相关将canvas导出成图片的需求
     * */
    Konva.pixelRatio = 1;
    this.stage = new Konva.Stage({
      container: container,
      width: container.clientWidth,
      height: container.clientHeight,
    });

    const imageSmoothingEnabled = this.editor.state.config.imageSmoothing;
    this.renderLayer = new Konva.Layer({ imageSmoothingEnabled });
    this.helpLayer = new Konva.Layer({ imageSmoothingEnabled });
    this.shapes = new Konva.Group({ sign: 'renderLayer-shapes' });
    this.maskGroup = new Konva.Group({ sign: 'helpLayer-maskgroup' });
    this.MaskToolManager = new MaskToolManager(this);
    Background.getInstance().init(this);
    ShareDraw.getInstance().setView(this);

    // 默认的
    const roots: any[] = [
      new ShapeRoot({ type: ToolModelEnum.INSTANCE }),
      new ShapeRoot({ type: ToolModelEnum.SEGMENTATION }),
    ];
    this.shapes.add(...roots);

    utils.disableContextMenu(this.renderLayer.canvas._canvas);
    utils.disableContextMenu(this.helpLayer.canvas._canvas);

    _utils.hackContext(this, this.renderLayer);
    _utils.hackContext(this, this.helpLayer);

    this.renderLayer.add(this.shapes);
    this.helpLayer.add(this.maskGroup);
    this.stage.add(this.renderLayer, this.helpLayer);
    if (actions && actions.length > 0) this.addActions(actions);

    this.resize = throttle(this.resize.bind(this), 50);
    this.initToolLimit();
    this.initEvent();
  }

  initEvent() {
    _utils.handleDragToCmd(this);
    // draw
    this.renderLayer.on('draw', () => {
      // console.log('renderLayer render');
      this.editor.emit(Event.DRAW);
    });
    this.container.addEventListener('mousemove', (e) => {
      this.curMouseEvent = e;
    });
    this.container.addEventListener('mouseout', () => {
      this.curMouseEvent = void 0;
    });
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

    // 切帧后需要重新执行的渲染
    this.editor.on(Event.FRAME_CHANGE, () => {
      this.currentDrawTool?.clearDraw();
    });
    const ob = new ResizeObserver(this.resize);
    ob.observe(this.container);
    // this.helpLayer.on('draw', () => {
    //     console.log('helpLayer render');
    // });
    // window.addEventListener('resize', this.resize);
  }

  initToolLimit() {
    // test
    this.editor.state.config.limitPosition = true;
    ShapeTool.prototype.isValid = (position: Vector2) => {
      const { state } = this.editor;
      const limitPosition = state.config.limitPosition;
      let valid = true;
      if (limitPosition) {
        const { backgroundHeight, backgroundWidth } = this;
        valid = utils.isPointInRect(
          position.x,
          position.y,
          0,
          0,
          backgroundWidth,
          backgroundHeight,
        );
      }

      return valid;
    };
    ShapeTool.prototype.validPosition = (position: Vector2) => {
      const { backgroundHeight, backgroundWidth } = this;
      return utils.claimPoint2Rect(position.x, position.y, 0, 0, backgroundWidth, backgroundHeight);
    };
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

  draw() {
    this.stage.batchDraw();
  }
  // shaperoot
  getRoot(type?: ToolModelEnum) {
    type = type || this.editor.state.imageToolMode;
    return this.shapes.getChildren((e: ShapeRoot) => {
      return e.type === type;
    })[0] as any as ShapeRoot;
  }
  updateShapeRoot(roots?: ShapeRoot[]) {
    if (!roots) {
      if (!this.shapes.children || this.shapes.children.length < 2) return;
      roots = [this.shapes.children[0], this.shapes.children[1]] as any as ShapeRoot[];
    }
    const { resultTypeFilter, imageToolMode } = this.editor.state;
    const allObjects: AnnotateObject[] = [];
    roots.forEach((root) => {
      root.index = root.type === imageToolMode ? 1 : 0;
      root.listening(root.type === imageToolMode);
      resultTypeFilter.includes(root.type) ? root.show() : root.hide();
      allObjects.push(...root.allObjects);
    });
    roots.sort((root1, root2) => root1.index - root2.index);
    this.shapes.removeChildren();
    this.shapes.add(...(roots as any));
    this.updateStateStyle(allObjects);
    this.draw();
  }
  updateToolStyleByClass() {
    const tool = this.currentEditTool;
    tool && tool.object && tool.edit(tool.object);
  }

  setBackground(image: HTMLImageElement) {
    if (!image || !image.naturalWidth || !image.naturalHeight) {
      const frame = this.editor.getCurrentFrame();
      this.editor.showMsg('error', `load resource: ${frame?.id} error`);
      frame.loadState = LoadStatus.ERROR;
      return;
    }
    this.backgroundWidth = image.naturalWidth;
    this.backgroundHeight = image.naturalHeight;
    this.backgroundAsRatio = this.backgroundWidth / this.backgroundHeight;

    Background.getInstance().updateBackground(image);
    const isSeriesFrame = this.editor.state.isSeriesFrame;
    const scaled = this.stage.scaleX() !== 1;
    this.fitBackgroundAsRatio({
      resetRotation: !isSeriesFrame,
      keepStatus: scaled,
    });
  }
  visibleShapes(visible: boolean) {
    this.shapes.visible(visible);
  }
  clearResource() {
    Background.getInstance().clearBgImage();
    this.shapes.removeChildren();
  }
  // 显示模式
  updateBGDisplayModel() {
    const frame = this.editor.getCurrentFrame();
    const {
      config: { viewType },
      imageToolMode,
    } = this.editor.state;
    const objInstance =
      this.editor.dataManager.getFrameObject(frame.id, ToolModelEnum.INSTANCE) || [];
    const objSegmentation =
      this.editor.dataManager.getFrameObject(frame.id, ToolModelEnum.SEGMENTATION) || [];
    const objectsMap: Record<ToolModelEnum, AnnotateObject[]> = {
      [ToolModelEnum.INSTANCE]: objInstance,
      [ToolModelEnum.SEGMENTATION]: objSegmentation,
    };
    Object.keys(objectsMap).forEach((type: ToolModelEnum) => {
      const objs = objectsMap[type];
      const objArr: any[] = [];
      objs.forEach((e) => {
        if (
          e instanceof Rect ||
          e instanceof Polygon ||
          e instanceof Ellipse ||
          e instanceof CircleShape ||
          e instanceof MaskShape
        ) {
          objArr.push(e);
        } else if (e.isGroup() && e.member.length > 0) {
          e.member.forEach((child) => {
            if (
              child instanceof Rect ||
              child instanceof Polygon ||
              child instanceof Ellipse ||
              child instanceof CircleShape
            )
              objArr.push(child);
          });
        }
      });
      const inCurToolModel = imageToolMode === type;
      this.updateStateStyle(objArr, inCurToolModel ? viewType : DisplayModeEnum.MARK);
    });
  }
  intoSharedMode() {
    const isLineTool =
      this.currentDrawTool instanceof LineTool || this.currentDrawTool?.name === ToolName.line;
    if (!isLineTool) return;
    const { toolConfig } = this.editor.state;
    const isPolygonTool = this.currentDrawTool instanceof PolygonTool;
    if (isPolygonTool && toolConfig.pgsm === ShareDrawMode.edge) {
      this.sharedClipMode();
    } else {
      this.sharedDrawMode();
    }
  }
  checkPolygonShared(mode: ShareDrawMode) {
    const isPolygonTool = this.currentDrawTool?.name === ToolName.polygon;
    const { toolConfig } = this.editor.state;
    return isPolygonTool && toolConfig.pgs && toolConfig.pgsm === mode;
  }
  checkPolylineShared() {
    const isPolylineTool = this.currentDrawTool?.name === ToolName.line;
    const { toolConfig } = this.editor.state;
    return isPolylineTool && toolConfig.pls;
  }
  // 按点共享(限折线工具,多边形工具)
  sharedDrawMode() {
    ShareDraw.getInstance().exitShareMode();
    if (this.checkPolygonShared(ShareDrawMode.point) || this.checkPolylineShared()) {
      ShareDraw.getInstance().updateByPoint();
    }
  }
  // 按边共享(裁剪,限多边形工具)
  sharedClipMode() {
    ShareDraw.getInstance().exitShareMode();
    const isPlus = this.editor.state.config.polygonMaxPoint > 0;
    if (this.checkPolygonShared(ShareDrawMode.edge) && !isPlus) {
      ShareDraw.getInstance().updateByEdge();
    }
  }
  exitToosDrawMode() {
    this.editor.state.toolConfig.lineMode = LineDrawModeEnum.Default;
    ShareDraw.getInstance().exitShareMode();
    this.editor.visibleMessageBox(false);
  }

  // 背景图片自适应当前窗口
  fitBackgroundAsRatio(option?: { resetRotation?: boolean; keepStatus?: boolean }) {
    const { resetRotation = true, keepStatus = false } = option || {};
    if (resetRotation) {
      this.stage.rotation(0);
      this.emit(Event.ROTATE, this.stage.rotation());
    }
    if (keepStatus) return;
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

    // scale = 1;
    this.stage.scale({ x: scale, y: scale });
    this.stage.position({ x: offsetX, y: offsetY });
    this.emit(Event.ZOOM, scale, false);
  }
  fitObject(object?: AnnotateObject) {
    if (!object) return;
    const { x, y, width, height } = object.getBoundRect();
    const transform = this.stage.getAbsoluteTransform();
    const size = this.stage.size();
    const pos = this.stage.position();
    const center = transform.point({ x: x + width / 2, y: y + height / 2 });
    if (center.x < 0 || center.y < 0 || center.x > size.width || center.y > size.height)
      this.stage.position({
        x: size.width / 2 - (center.x - pos.x),
        y: size.height / 2 - (center.y - pos.y),
      });
  }
  rotation() {
    return this.stage.rotation();
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
    const current = rotatePoint(tl, utils.angle2radian(this.stage.rotation()));
    const rotated = rotatePoint(tl, utils.angle2radian(r));
    const dx = (rotated.x - current.x) * stageScale,
      dy = (rotated.y - current.y) * stageScale;
    this.stage.rotation(r);
    this.stage.position({ x: stagePos.x + dx, y: stagePos.y + dy });
    this.emit(Event.ROTATE, r);
  }

  setCursor(cursor: string) {
    this.container.style.cursor = cursor;
  }

  // 缩放居中聚焦
  focusView(position: Vector2, scale: number = 0, time = 1.5) {
    if (this.zoomAnimation) {
      this.zoomAnimation.stop();
    }
    this.zoomAnimation = new Konva.Animation((frame: any) => {
      const ratio = frame.time / 100 / time;

      const curPosition = this.stage.position();
      const curScale = this.stage.scaleX();
      if (0 === scale) scale = curScale;

      const newPos = {
        x: curPosition.x + (position.x - curPosition.x) * ratio,
        y: curPosition.y + (position.y - curPosition.y) * ratio,
      };

      const newScale = curScale + (scale - curScale) * ratio;

      this.stage.position(newPos);
      this.stage.scale({ x: newScale, y: newScale });

      if (ratio > 1) {
        this.zoomAnimation && this.zoomAnimation.stop();
        this.zoomAnimation = undefined;
      }
    }, this.renderLayer);

    this.zoomAnimation.start();
  }
  focusObject(object?: AnnotateObject) {
    object = object || this.editor.selection[0];
    if (!object) return;

    const { position, scale } = this.getFocusData(object);
    this.focusView(position, scale);
  }

  getFocusData(object: AnnotateObject, fitRatio = 0.75) {
    let needScale: boolean = false;
    // let needCenter: boolean = false;
    const containerRect = this.container.getBoundingClientRect();
    const centerX = (containerRect.left + containerRect.width) / 2;
    const centerY = (containerRect.top + containerRect.height) / 2;

    const stageScale = this.stage.scaleX();
    const stagePos = this.stage.position();
    const selfRect = object.getSelfRect() || { x: 0, y: 0, width: 0, height: 0 };
    if (!selfRect.width || !selfRect.height) return { position: stagePos, scale: stageScale };
    const relativePos = object.getAbsolutePosition(this.stage);
    const relCenterX = relativePos.x + selfRect.x + selfRect.width / 2;
    const relCenterY = relativePos.y + selfRect.y + selfRect.height / 2;
    // 以container为参考系的rect
    const rect = {
      // x: (selfRect.x + relativePos.x) * stageScale + stagePos.x,
      // y: (selfRect.y + relativePos.y) * stageScale + stagePos.y,
      width: selfRect.width * stageScale,
      height: selfRect.height * stageScale,
    };

    if (rect.width > containerRect.width || rect.height > containerRect.height) needScale = true;
    // if (
    //     rect.x <= 0 ||
    //     rect.y <= 0 ||
    //     rect.x + rect.width >= containerRect.width ||
    //     rect.y + rect.height >= containerRect.height
    // ) {
    //     needCenter = true;
    // }

    const scaleX = (containerRect.width * fitRatio) / selfRect.width;
    const scaleY = (containerRect.height * fitRatio) / selfRect.height;
    const scale = needScale ? Math.min(scaleX, scaleY) : stageScale;
    // let position = needCenter
    //     ? { x: centerX - relCenterX * scale, y: centerY - relCenterY * scale }
    //     : stagePos;
    const position = { x: centerX - relCenterX * scale, y: centerY - relCenterY * scale };
    return { position, scale };
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

  getStateStyles(object: AnnotateObject) {
    return object.stateStyles || cloneDeep(this.stateStyles);
  }

  getDefaultStyle(object: AnnotateObject, config?: { skePoint?: boolean }) {
    if (config?.skePoint) {
      const { skeletonConfig } = this.editor.state.config;
      const configStyle = { radius: skeletonConfig.radius };
      return Object.assign(object.defaultStyle, configStyle);
    }
    return object.defaultStyle || {};
  }

  getStatePriority(object: AnnotateObject) {
    return object.statePriority || this.statePriority;
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
      const { skipStateStyle, stroke } = object.attrs;
      if (skipStateStyle) return;

      const statePriority = this.getStatePriority(object);
      const stateStyles = this.getStateStyles(object);
      let defaultStyle = this.getDefaultStyle(object);
      const stateMap = object.state;
      if (isMaskMode && ['ellipse', 'shape-circle'].includes(object.className)) {
        defaultStyle = Object.assign({}, defaultStyle, { fill: stroke });
      }
      if (object instanceof Skeleton) {
        if (!object.state.select) object.selectChild = undefined;
        this.updateSkeletonStyle(object);
      } else if (object instanceof Rect || object instanceof Polygon) {
        // 矩形/多边形等闭合图形特殊处理
        const oriStyle = { ...defaultStyle };
        if (isMaskMode) oriStyle.fill = object.stroke();
        const rgba = colord(object.stroke()).toRgb();
        const colorRGBA = `rgba(${rgba.r},${rgba.g},${rgba.b},0)`;
        stateStyles.hover.fill = colorRGBA;
        stateStyles.select.fill = colorRGBA;
        this.updateSubStateStyle(object, stateMap, oriStyle, statePriority, stateStyles);
      } else if (object instanceof MaskShape) {
        // Mask特殊处理
        const maskOriStyle = { ...defaultStyle };
        const rgb = colord(object.fill()).toRgb();
        let colorRGBA = `rgba(${rgb.r},${rgb.g},${rgb.b},0.5)`;
        maskOriStyle.fill = colorRGBA;
        if (isMaskMode) maskOriStyle.fill = `rgba(${rgb.r},${rgb.g},${rgb.b},1)`;
        colorRGBA = `rgba(${rgb.r},${rgb.g},${rgb.b},0.6)`;
        stateStyles.hover.fill = colorRGBA;
        stateStyles.select.fill = colorRGBA;
        this.updateSubStateStyle(object, stateMap, maskOriStyle, statePriority, stateStyles);
      } else if (object.isGroup?.()) {
        // 组特殊处理
        // const group = object as GroupObject;
        // group.showBgRect = Boolean(this.editor.state.config.showGroupStyle || object.state.select);
        // object = group.bgRect;
        // this.updateSubStateStyle(object, stateMap, defaultStyle, statePriority, stateStyles);
      } else {
        this.updateSubStateStyle(object, stateMap, defaultStyle, statePriority, stateStyles);
      }
    });
  }

  updateSubStateStyle(
    object: AnnotateObject,
    stateMap: IStateMap,
    defaultStyle: IShapeConfig,
    statePriority: string[],
    stateStyles: Record<string, IShapeConfig>,
  ) {
    const config = { ...defaultStyle };
    statePriority.forEach((state) => {
      if (stateMap && stateMap[state] && stateStyles && stateStyles[state]) {
        Object.assign(config, stateStyles[state]);
      }
    });
    object.setAttrs(config);
  }
  updateSkeletonStyle(ske: Skeleton) {
    const { hover, select } = ske.state;
    let defaultStyle = {};
    let config: any = {};
    ske.points.forEach((e) => {
      defaultStyle = this.getDefaultStyle(e, { skePoint: true });
      config = { ...defaultStyle };
      if (select || hover) {
        // 当前骨骼对象为select/hover状态
        config.radius += 2;
        if (ske.selectChild?.uuid === e.uuid) {
          config.strokeWidth = config.radius / 2;
          config.stroke = skeSelectedColor;
        } else if (e.state.hover) {
          config.stroke = skeSelectedColor;
        }
      }
      e.setAttrs(config);
    });
    ske.edges.forEach((e) => {
      defaultStyle = this.getDefaultStyle(e, { skePoint: true });
      config = { ...defaultStyle };
      if (e.state.hover) Object.assign(config, e.stateStyles?.hover);
      e.setAttrs(config);
    });
  }

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

  updateSelectToolModel(isChangeModel: boolean) {
    const isInstance = this.editor.state.imageToolMode === ToolModelEnum.INSTANCE;
    if (isChangeModel && isInstance) {
      if (this.editor.state.selectToolMode === SelectToolEnum.FILL) {
        this.editor.state.selectToolMode = SelectToolEnum.CONTOUR;
      } else if (this.editor.state.selectToolMode === SelectToolEnum.CONTOUR) {
        this.editor.state.selectToolMode = SelectToolEnum.FILL;
      }
      this.draw();
    }
  }

  enableDraw(name: IToolName | string) {
    const tool = this.getShapeTool(name as any);
    if (!tool) return;

    // 骨骼工具切换时特殊处理
    const curTool = this.currentDrawTool || this.currentEditTool;
    const curToolIsMaskTool = this.MaskToolManager.isMaskManagerTool(curTool);
    const nextToolIsMaskTool = this.MaskToolManager.isMaskManagerTool(tool);
    // const nextIsSAM = tool.name === ToolName.intellect;
    const flagMask = curToolIsMaskTool && !nextToolIsMaskTool && this.MaskToolManager.toolInit;
    // if ((curTool?.doing() || flagMask) && !nextIsSAM) {
    if (curTool?.doing() || flagMask) {
      return this.editor.showMsg('warning', t('image.resultNotComplete'));
    }

    if (nextToolIsMaskTool) {
      // 分割工具
      this.MaskToolManager.changeTool();
    }
    if (curTool && (!nextToolIsMaskTool || !curToolIsMaskTool)) {
      this.disableDraw();
      this.disableEdit();
    }

    this.currentDrawTool = tool;
    try {
      if (tool instanceof SplineCurveTool) {
        const thisTool = tool as SplineCurveTool;
        thisTool.tension = thisTool.defaultTension;
      }
      tool.draw();
      tool.assignConfig({ stroke: this.editor.state.config.defaultResultColor });
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
    this.intoSharedMode();
  }

  disableDraw() {
    const previousTool = this.currentDrawTool;
    this.cursor = '';
    this.editor.state.activeTool = ToolName.default;
    this.setCursor(Cursor.auto);
    this.exitToosDrawMode();
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

    // console.log('选中需要编辑的shape:', shape);
    if (!this.editor.isCurFrameObject(shape)) return;

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

  updateCurrentDrawTool() {
    if (this.currentDrawTool && this.currentDrawTool.updateTool) {
      this.currentDrawTool.updateTool();
    }
  }
  updateCurrentEditTool() {
    if (this.currentEditTool && this.currentEditTool.updateTool) {
      this.currentEditTool.updateTool();
    }
  }
  // 裁剪(一个裁剪多个), 用cropPoly多边形裁剪多个otherPoly多边形
  clipMultipleByOne(cropPoly: Polygon, otherPoly: Polygon[]): Polygon[] {
    let newPolyArr: Polygon[] = [];
    otherPoly.forEach((cliped) => {
      const shapes = utils.polygonToClip(cliped, cropPoly);
      shapes.forEach((poly) => {
        this.editor.initIDInfo(poly);
        poly.userData.classId = cliped.userData.classId;
        poly.userData.classType = cliped.userData.classType;
        poly.userData.classVersion = cliped.userData.classVersion;
        poly.userData.sourceId = cliped.userData.sourceId;
        this.editor.dataManager.updateObjectByUserData(poly);
      });
      newPolyArr = newPolyArr.concat(shapes);
    });
    return newPolyArr;
  }
  // 裁剪(多个裁剪一个), 参数(被裁剪的polygon, 用于裁剪的polygons)
  clipOneByMultiple(poly: Polygon, polys: Polygon[]) {
    let failed: Polygon[] = [];
    let clipedArr: Polygon[] = [];
    try {
      clipedArr = utils.polygonToClips(poly, polys);
    } catch (error) {
      failed = polys;
    }
    if (failed.length > 0) {
      console.log('==========整体裁剪失败, 进行单个裁剪, 并抛出异常个体');
      clipedArr = [poly];
      failed = [];
      polys.forEach((clipPoly) => {
        try {
          const clipeds = this.clipMultipleByOne(clipPoly, clipedArr);
          if (clipeds.length > 0) clipedArr = clipeds;
        } catch (error) {
          failed.push(clipPoly);
        }
      });
    }
    if (failed.length > 0) {
      this.editor.showMsg(
        'error',
        t('image.shareFailed', {
          polygons: failed.map((e) => `#${e.userData.trackName}`).join(','),
        }),
      );
    }
    if (clipedArr.length === 0) return [poly];
    return clipedArr;
  }
  // 不裁剪第一个
  cropOtherPolygon(polygonList: Polygon[]) {
    const [firstPoly, ...otherPoly] = polygonList;
    const newPolyArr: Polygon[] = this.clipMultipleByOne(firstPoly, otherPoly);
    if (newPolyArr.length === 0) return;
    this.editor.cmdManager.withGroup(() => {
      if (this.editor.state.isSeriesFrame) {
        this.editor.cmdManager.execute('add-track', this.editor.createTrackObj(newPolyArr));
      }
      this.editor.cmdManager.execute('add-object', newPolyArr);
      this.editor.cmdManager.execute('delete-object', otherPoly);
    });
  }
  // 裁剪第一个
  cropFirstPolygon(polygonList: Polygon[]) {
    const [firstPoly, ...otherPoly] = polygonList;
    const clipedArr = this.clipOneByMultiple(firstPoly, otherPoly);
    clipedArr.forEach((poly) => {
      this.editor.initIDInfo(poly);
      poly.userData.classId = firstPoly.userData.classId;
      poly.userData.classType = firstPoly.userData.classType;
      poly.userData.classVersion = firstPoly.userData.classVersion;
      poly.userData.sourceId = firstPoly.userData.sourceId;
      this.editor.dataManager.updateObjectByUserData(poly);
    });
    this.editor.cmdManager.withGroup(() => {
      if (this.editor.state.isSeriesFrame) {
        this.editor.cmdManager.execute('add-track', this.editor.createTrackObj(clipedArr));
      }
      this.editor.cmdManager.execute('add-object', clipedArr);
      this.editor.cmdManager.execute('delete-object', firstPoly);
    });
  }
  getClipPolygon(poly: Polygon): Polygon[] {
    const shapeRoot = this.getRoot(ToolModelEnum.INSTANCE);
    const objs = shapeRoot?.children || [];
    const polys = objs.filter((e) => {
      return shapeRoot.renderFilter(e) && e instanceof Polygon && e.showVisible;
    }) as Polygon[];
    if (polys.length === 0) return [poly];
    return this.clipOneByMultiple(poly, polys);
  }

  holeShape(shape: Polygon, hole: Polygon | Polygon[]) {
    const holes = Array.isArray(hole) ? hole : [hole];
    // let newShape = utils.polygonHole(shape, hole);
    const pos = shape.position();
    const holesPoints = utils.polygonsHollow(shape, holes);
    if (pos.x !== 0 || pos.y !== 0) {
      holesPoints.forEach((inner) => {
        inner.points.forEach((point) => {
          point.x -= pos.x;
          point.y -= pos.y;
        });
      });
    }
    let { innerPoints } = shape.clonePointsData();
    innerPoints = innerPoints.concat(holesPoints);

    this.editor.cmdManager.withGroup(() => {
      this.editor.cmdManager.execute('delete-object', holes);
      this.editor.cmdManager.execute('update-points', {
        object: shape,
        pointsData: { innerPoints },
      });
    });

    this.editor.selectObject(shape, true);
  }

  removeHole(shape: Polygon) {
    const innerShapes: Polygon[] = [];
    const pos = shape.position();
    const { innerPoints } = shape.clonePointsData();
    innerPoints.forEach((inner) => {
      inner.points.forEach((point) => {
        point.x += pos.x;
        point.y += pos.y;
      });
      const newPoly = new Polygon({ ...inner, innerPoints: [] });
      this.editor.initIDInfo(newPoly);
      innerShapes.push(newPoly);
    });
    this.editor.cmdManager.withGroup(() => {
      if (this.editor.state.isSeriesFrame) {
        this.editor.cmdManager.execute('add-track', this.editor.createTrackObj(innerShapes));
      }
      this.editor.cmdManager.execute('add-object', innerShapes);
      this.editor.cmdManager.execute('update-points', {
        object: shape,
        pointsData: { innerPoints: [] },
      });
    });
  }
  splitLine(shape: Line, index: number) {
    const { points, x, y } = shape.attrs;
    if (index === 0 || index + 1 == points.length) return;
    const oriLinePoints: Vector2[] = [];
    const newLinePoints: Vector2[] = [];
    points.forEach((p, i) => {
      if (i < index) {
        oriLinePoints.push(cloneDeep(p));
      } else if (i > index) {
        newLinePoints.push(cloneDeep(p));
      } else if (i === index) {
        oriLinePoints.push(cloneDeep(p));
        newLinePoints.push(cloneDeep(p));
      }
    });
    const newLine = new Line({ points: newLinePoints, x, y });
    this.editor.initIDInfo(newLine);
    const newUserdata = cloneDeep(shape.userData);
    newUserdata.trackId = newLine.userData.trackId;
    newUserdata.trackName = newLine.userData.trackName;
    newLine.userData = newUserdata;
    shape.groups.forEach((g) => g.addObject(newLine));
    this.editor.dataManager.updateObjectByUserData(shape);
    this.editor.cmdManager.withGroup(() => {
      if (this.editor.state.isSeriesFrame) {
        this.editor.cmdManager.execute('add-track', this.editor.createTrackObj(newLine));
      }
      this.editor.cmdManager.execute('add-object', newLine);
      this.editor.cmdManager.execute('update-points', {
        object: shape,
        pointsData: { points: oriLinePoints },
      });
    });
  }
}
