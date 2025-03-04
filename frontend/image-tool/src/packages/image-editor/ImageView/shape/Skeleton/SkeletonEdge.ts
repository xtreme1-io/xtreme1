import Konva from 'konva';
import Shape from '../Shape';
import Circle from '../Circle';
import { IShapeConfig } from '../../type';

export default class SkeletonEdge extends Shape {
  className = 'skeleton-edge';
  source: Circle;
  target: Circle;
  declare attrs: Required<IShapeConfig>;
  constructor(source: Circle, target: Circle, config?: IShapeConfig) {
    super(Object.assign({ points: [], hitStrokeWidth: 4, draggable: false }, config));
    this.source = source;
    this.target = target;
  }

  isValid() {
    return this.source.attrs.valid && this.target.attrs.valid;
  }

  _sceneFunc(context: Konva.Context, shape: Konva.Shape) {
    const { source, target } = this;
    const { skipStageScale, showPointer = true } = this.attrs;

    if (!this.isValid()) return;

    const sPos = source.position();
    const tPos = target.position();
    const PI2 = Math.PI * 2;

    const dx = tPos.x - sPos.x;
    const dy = tPos.y - sPos.y;
    const radians = (Math.atan2(dy, dx) + PI2) % PI2;

    context.beginPath();
    context.moveTo(sPos.x, sPos.y);
    context.lineTo(tPos.x, tPos.y);
    context.closePath();
    context.strokeShape(this);

    // 大小不受stage scale影响

    let scale = 1;
    if (skipStageScale) {
      const stage = this.getStage();
      if (stage) {
        scale = 1 / stage.scaleX();
      }
    }

    const length = 10 * scale;
    const width = 6 * scale;

    // arrow
    if (showPointer) {
      context.beginPath();
      context.translate((tPos.x + sPos.x) / 2, (tPos.y + sPos.y) / 2);
      context.rotate(radians);
      context.moveTo(0, 0);
      context.lineTo(-length, width / 2);
      context.lineTo(-length, -width / 2);
    }
    context.closePath();
    context.fillStrokeShape(this);
  }
}
