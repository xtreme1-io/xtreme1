import {
  ShapeTool,
  ImageView,
  SelectHoverAction,
  defaultHoverConfig,
  IShapeConfig,
  Konva,
} from 'image-editor';
import { Cursor } from '../../config/ui';

const styleConfig: IShapeConfig = {
  ...defaultHoverConfig,
  stroke: 'red',
};

export default class CommentTool extends ShapeTool {
  cursor = Cursor.comment;
  oldHoverStyle!: any;
  constructor(view: ImageView) {
    super(view);

    this.config.disableRenderLayer = false;
    this.onClick = this.onClick.bind(this);
  }

  // draw
  draw() {
    const action = this.view.getAction('select-hover') as SelectHoverAction;
    if (action) {
      // 关闭选中
      action.selectFlag = false;
      // 关闭更新curse
      action.cursorFlag = false;
    }

    this.view.editor.selectObject();

    this.oldHoverStyle = this.view.stateStyles.hovered;
    this.view.stateStyles.hovered = styleConfig;

    this.clearEvent();
    this.initEvent();
  }

  stopDraw() {
    this.clearEvent();

    const action = this.view.getAction('select-hover') as SelectHoverAction;
    if (action) {
      action.selectFlag = true;
      action.cursorFlag = true;
    }

    this.view.stateStyles.hovered = this.oldHoverStyle;
  }

  initEvent() {
    this.view.stage.on('click', this.onClick);
  }

  clearEvent() {
    this.view.stage.off('click', this.onClick);
  }

  onClick(e: Konva.KonvaEventObject<MouseEvent>) {
    if (e.evt.button !== 0) return;

    const target = e.target;
    const point = this.view.stage.getRelativePointerPosition();
    if (target === this.view.stage) {
      this.emit('click', point);
    } else {
      this.emit('click', point, target);
    }
  }
}
