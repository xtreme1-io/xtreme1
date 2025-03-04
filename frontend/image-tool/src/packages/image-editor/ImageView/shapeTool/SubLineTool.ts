import Konva from 'konva';
import ImageView from '../index';
import ShapeTool from './ShapeTool';
import { Line, Circle } from '../shape';
import { Vector2, ToolName, LineDrawModeEnum, ToolAction } from '../../types';
import { Cursor, sharedColor } from '../../config';
import { SelectHoverAction } from '../actions';

export default class SubLineTool extends ShapeTool {
  name = ToolName.line;
  parentTool!: ShapeTool;
  points: Vector2[] = [];
  // 绘制过程中产生的点和线
  anchors: Konva.Group;
  holderLines: Konva.Group;
  holderLastLine: Line;
  autoPointTm: number = 0;
  // other
  startIndex?: number;

  constructor(view: ImageView, tool: ShapeTool) {
    super(view);
    this.parentTool = tool;
    this.holderLastLine = new Line({ dash: [5, 5], strokeWidth: 2 });
    this.currentAnchor = new Circle();
    this.anchors = new Konva.Group();
    this.holderLines = new Konva.Group();
    this.drawGroup.add(this.holderLines, this.holderLastLine, this.anchors, this.currentAnchor);
  }
  // draw
  draw() {
    console.log('SubLineTool draw');
    this.initEvent();
    this.drawGroup.show();
    // hook
    this.onDrawStart();
    this.view.currentDrawTool = this;
    this.switchViewEvent(false);
    this.view.intoSharedMode();
    this.view.setCursor(this.cursor);
    this.view.editor.state.activeTool = ToolName.line;
  }
  stopDraw() {
    this.clearDraw();
  }
  stopCurrentDraw() {}
  undoDraw() {
    if (this.points.length === 1) return;
    this.points.pop();
    const children = this.anchors.children || [];
    const anchor = children[children.length - 1] as Circle;
    anchor?.destroy();

    this.updateHolder();
    this.onDrawChange();
  }
  clearDraw() {
    this.view.currentDrawTool = undefined;
    this.switchViewEvent(true);
    this.view.exitToosDrawMode();
    this.view.setCursor(Cursor.auto);
    this.parentTool.onAction(ToolAction.esc);
    this.view.editor.state.activeTool = ToolName.default;
  }
  destroySelf() {
    this.drawGroup.destroy();
    this.editGroup.destroy();
    this.helpGroup.destroy();
  }

  onMouseDown(e: Konva.KonvaEventObject<MouseEvent>, point: Vector2) {
    // this.currentAnchor.position(point);
    point = this.updateHolderAnchor(point);
    this.addPoint(point);
    this.updateHolder();
  }
  onMouseMove(e: Konva.KonvaEventObject<MouseEvent>, point: Vector2) {
    // this.currentAnchor.position(point);
    this.updateHolderAnchor(point);
    this.updateLastHolderLine();
    this.autoAddPoint(point);
    this.onDrawChange();
  }
  autoAddPoint(point: Vector2) {
    if (!this.mouseDowning) return;
    const { polyAuto, polyAutoTm } = this.view.editor.state.toolConfig;
    if (!polyAuto) return;
    if (Date.now() - this.autoPointTm < polyAutoTm) return;
    this.autoPointTm = Date.now();
    this.addPoint(point);
    this.updateHolder();
  }
  updateHolder() {
    this.holderLines.removeChildren();
    if (this.points.length > 0) {
      this.points.forEach((p, i) => {
        const nextP = this.points[i + 1];
        if (!nextP) return;
        const a = this.anchors.children?.[i] || { attrs: {} };
        const nextAnchor = this.anchors.children?.[i + 1] || { attrs: {} };
        const isShareLine =
          a.attrs.referObject &&
          a.attrs.referObject === nextAnchor.attrs.referObject &&
          a.attrs.referTypeIndex === nextAnchor.attrs.referTypeIndex;
        const newL = new Line({
          points: [p, nextP],
          strokeWidth: 2,
          stroke: isShareLine ? sharedColor : this.drawConfig.stroke,
        });
        this.holderLines.add(newL);
      });
      this.updateHolderAnchor(this.currentAnchor.attrs.originPos);
      this.updateLastHolderLine();
    }
  }
  updateLastHolderLine() {
    const endPos = this.currentAnchor.position();
    this.holderLastLine.setAttrs({
      points: [this.points[this.points.length - 1], endPos],
      ...this.drawConfig,
    });
    this.holderLastLine.show();
    this.currentAnchor.show();
  }
  updateHolderAnchor(pos: Vector2) {
    if (!pos) return { x: 0, y: 0 };
    const mode = this.view.editor.state.toolConfig.lineMode;
    this.currentAnchor.setAttrs({ originPos: pos, ...this.drawConfig });
    const lastPoint = this.points[this.points.length - 1];
    if (mode === LineDrawModeEnum.Horizontal && lastPoint) {
      pos = { x: pos.x, y: lastPoint.y };
    } else if (mode === LineDrawModeEnum.Vertical && lastPoint) {
      pos = { x: lastPoint.x, y: pos.y };
    }
    this.currentAnchor.position(pos);
    return pos;
  }
  addPoint(point: Vector2) {
    this.points.push(point);
    const anchor = new Circle({ x: point.x, y: point.y, ...this.drawConfig });
    if (this.points.length === 1) anchor.setAttrs({ opacity: 0 });
    this.anchors.add(anchor);
  }
  setFirstPoint(point: Vector2, index?: number) {
    this.mouseDown = true;
    this.startIndex = index;
    this.addPoint({ x: point.x, y: point.y });
    const pos = this.view.stage.getRelativePointerPosition() as Vector2;
    this.updateHolderAnchor(pos);
    this.updateHolder();
  }

  // 切换外部stage/renderLayer的事件开关
  switchViewEvent(state: boolean) {
    const action = this.view.getAction('select-hover') as SelectHoverAction;
    if (action) {
      action.selectFlag = state;
    }
  }
}
