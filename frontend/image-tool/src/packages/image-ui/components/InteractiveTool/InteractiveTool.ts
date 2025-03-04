import {
  Rect,
  Circle,
  Polygon,
  Line,
  ISideRect,
  Vector2,
  ShapeTool,
  ImageView,
  Cursor,
  utils,
  ToolAction,
} from '../../../image-editor';
import loadingImg from '../../assets/loading.png';
import Konva from 'konva';

export default class InteractiveTool extends ShapeTool {
  enable = false;
  // draw
  currentAnchor: Circle;
  points: Vector2[] = [];
  holderRect: Rect;
  //edit
  rect: Rect;
  polygons: Konva.Group;
  masks: Konva.Group;
  keyPoints: Konva.Group;
  editWrap: Konva.Group;
  loadAnim!: Konva.Animation;
  constructor(view: ImageView) {
    super(view);
    this.name = 'interactive';

    // draw
    this.holderRect = new Rect({
      dash: [5, 5],
      strokeWidth: 2,
    });
    this.currentAnchor = new Circle();
    this.drawGroup.add(this.holderRect, this.currentAnchor);

    // edit
    this.rect = new Rect({ draggable: false, skipStateStyle: true, cursor: Cursor.positive });
    this.polygons = new Konva.Group();
    this.masks = new Konva.Group();
    this.keyPoints = new Konva.Group();
    this.editWrap = new Konva.Group();
    this.editGroup.add(this.rect, this.polygons, this.keyPoints, this.masks, this.editWrap);

    this.initMask();
    this.initEditObject();
    this.initEditEvent();
  }

  initMask() {
    const masks = this.masks;
    const maskRect = new Rect({
      fill: 'rgb(0 0 0 / 50%)',
      cursor: '',
      stroke: undefined,
      skipStateStyle: true,
      draggable: false,
    });

    const imageObj = new Image();
    imageObj.src = loadingImg;
    const loadIcon = new Konva.Image({ name: 'loading', image: imageObj });
    this.loadAnim = new Konva.Animation((frame: any) => {
      const angleDiff = (frame.timeDiff * 300) / 1000;
      loadIcon.rotate(angleDiff);
    }, this);

    masks.add(maskRect, loadIcon);
  }

  // draw
  draw() {
    console.log('draw');
    this.enable = true;
    this.clearDrawData();
    this.clearEditData();
    this.drawGroup.show();
    // draw event
    this.clearEvent();
    this.initEvent();

    this.emit('draw');
  }

  clearDraw() {
    console.log('clearDraw');
    this.draw();
  }

  stopDraw() {
    this.enable = false;
    this.clearDrawData();
    this.clearEvent();
    this.clearEditData();
    this.emit('stopDraw');
  }

  stopCurrentDraw() {
    const children = this.polygons.children as Polygon[];
    if (children && children.length > 0) {
      const polygons = children.map((e) => {
        const { points, innerPoints } = e.attrs;
        return new Polygon({ points, innerPoints });
      });
      this.onDraw(polygons);
    }
    this.clearDraw();
  }

  undoDraw() {
    // TODO
  }

  clearDrawData() {
    this.mouseDown = false;
    this.points = [];
    this.drawGroup.children?.forEach((e) => e.hide());
    this.drawGroup.hide();
  }

  clearEditData() {
    this.keyPoints.removeChildren();
    this.polygons.removeChildren();
    this.editGroup.children?.forEach((e) => e.hide());
    this.editGroup.hide();
  }

  edit() {
    this.clearDrawData();
    this.rect.show();
    this.updateEditObject();
    this.editGroup.show();
    this.hideMasks();
  }

  stopEdit() {
    this.editGroup.hide();
  }
  checkAction(action: ToolAction) {
    return [ToolAction.esc, ToolAction.stop, ToolAction.undo].includes(action);
  }

  onMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    const stage = this.view.stage;
    const point = stage.getRelativePointerPosition();

    this.points.push(point);
    this.currentAnchor.position(point);

    if (this.points.length >= 2) {
      this.onDragEnd();
    }
  }
  onMouseMove(e: Konva.KonvaEventObject<MouseEvent>) {
    const stage = this.view.stage;
    const point = stage.getRelativePointerPosition();

    this.currentAnchor.position(point);
    this.updateHolder();
  }

  updateHolder() {
    const startPos = this.points[0];
    const endPos = this.currentAnchor.position();

    this.holderRect.position(startPos);
    this.holderRect.width(endPos.x - startPos.x);
    this.holderRect.height(endPos.y - startPos.y);

    this.holderRect.show();
    this.currentAnchor.show();
  }

  onDragEnd() {
    if (this.points.length !== 2) return;

    const rectOption = utils.getRectFromPoints(this.points as any);
    this.rect.setAttrs(rectOption);

    this.clearEvent();
    this.currentAnchor.hide();
    this.editGroup.show();
    this.emit('dragEnd');
  }

  // 清除 loading
  hideMasks() {
    this.masks.hide();
    this.loadAnim.stop();
  }
  showMasks() {
    this.masks.show();
    const children = this.masks.children || [];
    let { x, y, width, height } = this.rect.attrs;
    const maskRect = children[0] as Rect;
    maskRect.setAttrs({ x, y, width, height });

    const maskLoading = children[1] as Konva.Image;
    x += width / 2;
    y += height / 2;
    const size = Math.min(width, height) / 3;
    width = size;
    height = size;
    maskLoading.setAttrs({ x, y, width, height, offset: { x: width / 2, y: height / 2 } });
    this.loadAnim.start();
  }

  updateMask(visible: boolean) {
    if (visible) this.showMasks();
    else this.hideMasks();
  }

  // edit
  initEditObject() {
    ['line-top', 'line-bottom', 'line-left', 'line-right'].forEach((id) => {
      const cursor = id === 'line-top' || id === 'line-bottom' ? Cursor.nsResize : Cursor.ewResize;
      const line = new Line({
        id,
        hitStrokeWidth: 6,
        cursor,
        opacity: 0,
        points: [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ],
      });
      this.editWrap.add(line);

      if (id === 'line-top' || id === 'line-bottom') {
        line.dragBoundFunc(utils.constraintY(line));
      } else {
        line.dragBoundFunc(utils.constraintX(line));
      }
    });

    ['anchor-tl', 'anchor-tr', 'anchor-bl', 'anchor-br'].forEach((id) => {
      const cursor =
        id === 'anchor-tl' || id === 'anchor-br' ? Cursor.nwseResize : Cursor.neswResize;
      this.editWrap.add(new Circle({ id, cursor }));
    });
  }

  initEditEvent() {
    let startSide = undefined as ISideRect | undefined;
    this.editWrap.on('dragstart', (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!this.enable) return;

      const rect = this.rect as Rect;
      startSide = utils.getRectSide(rect.attrs);
      // this.onEditStart();
    });

    this.editWrap.on('dragmove', (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!this.enable) return;

      if (!startSide) return;

      const rect = this.rect as Rect;
      const { x, y } = e.target.attrs;
      const id = e.target.attrs.id;
      if (id === 'line-top') {
        startSide.top = y;
      } else if (id === 'line-bottom') {
        startSide.bottom = y;
      } else if (id === 'line-left') {
        startSide.left = x;
      } else if (id === 'line-right') {
        startSide.right = x;
      } else if (id === 'anchor-tl') {
        startSide.top = y;
        startSide.left = x;
      } else if (id === 'anchor-tr') {
        startSide.top = y;
        startSide.right = x;
      } else if (id === 'anchor-bl') {
        startSide.bottom = y;
        startSide.left = x;
      } else if (id === 'anchor-br') {
        startSide.bottom = y;
        startSide.right = x;
      }

      const rectInfo = utils.getRectFromSide(startSide);
      rect.setAttrs(rectInfo);
      this.updateEditObject();
      // this.onEditChange();
    });

    this.editWrap.on('dragend', (e: Konva.KonvaEventObject<MouseEvent>) => {
      // console.log('dragstend');
      // this.onEditEnd();
    });

    this.polygons.on('click', (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!this.enable) return;
      this.addKeyPoints('negative');
      this.emit('addPoints');
    });

    this.rect.on('click', (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!this.enable) return;
      this.addKeyPoints('positive');
      this.emit('addPoints');
    });
  }

  updateEditObject() {
    // show
    this.editWrap.show();

    const { x, y, width, height } = this.rect.attrs;
    const children = this.editWrap.children || [];
    const left = x;
    const top = y;
    const right = x + width;
    const bottom = y + height;
    children.forEach((e) => {
      const id = e.attrs.id as string;
      if (id.startsWith('anchor')) {
        const anchor = e as Circle;
        if (id === 'anchor-tl') {
          anchor.position({ x: left, y: top });
        } else if (id === 'anchor-tr') {
          anchor.position({ x: right, y: top });
        } else if (id === 'anchor-bl') {
          anchor.position({ x: left, y: bottom });
        } else if (id === 'anchor-br') {
          anchor.position({ x: right, y: bottom });
        }
      } else {
        const line = e as Line;
        const point1 = line.attrs.points[1];
        if (id === 'line-top') {
          line.position({ x: left, y: top });
          point1.x = width;
          point1.y = 0;
        } else if (id === 'line-bottom') {
          line.position({ x: left, y: bottom });
          point1.x = width;
          point1.y = 0;
        } else if (id === 'line-left') {
          line.position({ x: left, y: top });
          point1.x = 0;
          point1.y = height;
        } else if (id === 'line-right') {
          line.position({ x: right, y: top });
          point1.x = 0;
          point1.y = height;
        }
      }
    });
  }

  addKeyPoints(type: 'positive' | 'negative', point?: Vector2) {
    // show
    this.keyPoints.show();

    const stage = this.view.stage;
    point = point || stage.getRelativePointerPosition();
    this.keyPoints.add(
      new Circle({
        ...point,
        fill: type === 'positive' ? '#00ff00' : '#ff0000',
        skipStateStyle: true,
        draggable: false,
        pointType: type,
      }),
    );
  }

  updatePolygonData(polygons: Polygon[]) {
    // show
    this.polygons.show();

    const children = this.polygons.children || [];
    this.polygons.removeChildren();
    children.forEach((e) => e.destroy());

    polygons.forEach((e) => {
      e.setAttrs({
        cursor: Cursor.negative,
        draggable: false,
      });
    });
    this.polygons.add(...polygons);
    this.polygons.show();
  }
}
