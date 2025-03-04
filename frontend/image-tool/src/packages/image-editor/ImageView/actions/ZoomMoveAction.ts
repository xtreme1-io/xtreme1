import Action from '../Action';
import ImageView from '../index';
import Konva from 'konva';
import { SkeletonTool } from '../shapeTool';

type WheelCallBackParams = { e: WheelEvent; detailY: number };
function useWheel(
  callback: (data: WheelCallBackParams) => void,
  option?: { detailFactor: number; dynamicDampingFactor: number },
) {
  let lastTime = 0;
  const detailFactor = option?.detailFactor ?? 100;
  const dynamicDampingFactor = option?.dynamicDampingFactor ?? 0.2;
  let lastStatus: WheelCallBackParams;
  let animationFrame: any = null;
  function animationUpdate() {
    callback(lastStatus);

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    const nextDetailY = lastStatus.detailY * Math.sqrt(1.0 - dynamicDampingFactor);
    if (Math.abs(nextDetailY) > 1) {
      lastStatus.detailY = nextDetailY;
      animationFrame = requestAnimationFrame(animationUpdate);
    }
  }
  return {
    handleWheel(e: WheelEvent) {
      const now = Date.now();

      const duration = now - lastTime;
      const dir = e.deltaY < 0 ? -1 : 1;
      let deltaY = dir * 8;
      if (duration < 1000 && duration > 0) {
        deltaY = Math.log2(Math.abs((e.deltaY / duration) * detailFactor) + 1) * dir;
      }
      lastStatus = { e, detailY: deltaY };
      lastTime = now;
      animationUpdate();
    },
    mapLinear(x: number, a1: number, a2: number, b1: number, b2: number) {
      return b1 + ((x - a1) * (b2 - b1)) / (a2 - a1);
    },
  };
}

// _lastAngle *= Math.sqrt( 1.0 - scope.dynamicDampingFactor );
const actionName = 'zoom-move';
class ZoomMoveAction extends Action {
  scaleRatio: number = 1.03;
  view: ImageView;
  mouseDown: number = -1; // -1无,0左键;1中间滚轮键;2右键
  startPos?: Konva.Vector2d;
  startStagePos?: Konva.Vector2d;
  startRotation?: number;
  dragging: boolean = false;
  declare wheelUtil: ReturnType<typeof useWheel>;
  constructor(view: ImageView) {
    super();
    this.view = view;
    this.onMouseWheel = this.onMouseWheel.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.wheelUtil = useWheel((data: WheelCallBackParams) => {
      const oldScale = this.view.stage.scaleX();
      const scaleRatio = this.wheelUtil.mapLinear(data.detailY, -100, 100, 0.5, -0.5) + 1;
      const newScale = Math.max(Math.min(oldScale * scaleRatio, 50), 0.01);
      if (newScale == oldScale) return;
      this.view.zoomTo(newScale);
    });
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
    this.startRotation = this.view.rotation();
  }
  onMouseUp(e: MouseEvent) {
    this.startPos = undefined;
    this.startStagePos = undefined;
    this.startRotation = undefined;
    this.dragging = false;
    this.mouseDown = -1;
  }
  onMouseMove(e: MouseEvent) {
    const stage = this.view.stage;
    if (this.mouseDown < 1 || !this.startPos || !this.startStagePos) return;

    if (this.mouseDown === 1) {
      // 计算旋转
    } else if (this.mouseDown === 2) {
      const isSke = this.view.currentDrawTool instanceof SkeletonTool;
      if (isSke && !e.ctrlKey) return;
      this.dragging = true;
      // 计算拖动
      stage.position({
        x: this.startStagePos.x + e.clientX - this.startPos.x,
        y: this.startStagePos.y + e.clientY - this.startPos.y,
      });
    }
  }

  onMouseWheel(e: Konva.KonvaEventObject<WheelEvent>) {
    this.wheelUtil.handleWheel(e.evt);
  }
}

ZoomMoveAction.prototype.actionName = actionName;
export default ZoomMoveAction;
