import Action from './Action';
import ImageView from '../index';
import Konva from 'konva';

const actionName = 'zoom-move';
class ZoomMoveAction extends Action {
  scaleRatio: number = 1.03;
  view: ImageView;
  mouseDown: number = -1;
  startPos?: Konva.Vector2d;
  startStagePos?: Konva.Vector2d;
  startRotation?: number;
  constructor(view: ImageView) {
    super();
    this.view = view;
    this.onMouseWheel = this.onMouseWheel.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
  }
  init() {
    this.view.stage.on('wheel', this.onMouseWheel);
    this.view.stage.on('mousedown', this.onMouseDown);
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('mousemove', this.onMouseMove);
  }

  destroy() {
    this.view.stage.off('wheel', this.onMouseWheel);
    this.view.stage.off('mousedown', this.onMouseDown);
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('mousemove', this.onMouseMove);
  }

  onMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    // 右键
    if (e.evt.button == 0) return;

    this.mouseDown = e.evt.button;
    this.startPos = { x: e.evt.clientX, y: e.evt.clientY };
    this.startStagePos = this.view.stage.getAbsolutePosition();
    this.startRotation = this.view.stage.rotation();
  }
  onMouseUp(e: MouseEvent) {
    this.startPos = undefined;
    this.startStagePos = undefined;
    this.startRotation = undefined;
    this.mouseDown = -1;
  }
  onMouseMove(e: MouseEvent) {
    const stage = this.view.stage;
    if (this.mouseDown < 1 || !this.startPos || !this.startStagePos) return;

    if (this.mouseDown === 1) {
      // rotate
    } else if (this.mouseDown === 2) {
      // drag
      stage.position({
        x: this.startStagePos.x + e.clientX - this.startPos.x,
        y: this.startStagePos.y + e.clientY - this.startPos.y,
      });
    }
  }
  onMouseWheel(e: Konva.KonvaEventObject<WheelEvent>) {
    const oldScale = this.view.stage.scaleX();
    const direction = e.evt.deltaY < 0 ? 1 : -1;
    let newScale = direction > 0 ? oldScale * this.scaleRatio : oldScale / this.scaleRatio;

    if (newScale < 0.01) newScale = 0.01;
    else if (newScale > 50) newScale = 50;

    this.view.zoomTo(newScale);
  }
}

ZoomMoveAction.prototype.actionName = actionName;
export default ZoomMoveAction;
