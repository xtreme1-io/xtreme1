import { ToolName, Vector2 } from '../../types';
import ShapeTool from './ShapeTool';
import ImageView from '../index';
import { KeyPoint } from '../shape';
import Konva from 'konva';

export default class KeyPointTool extends ShapeTool {
  name = ToolName['key-point'];
  points: Vector2[] = [];
  declare object?: KeyPoint;

  constructor(view: ImageView) {
    super(view);
  }

  // draw
  draw() {
    this.clearDraw();
    this.clearEvent();
    this.initEvent();
    this.onDrawStart();
  }
  stopDraw() {
    this.clearDraw();
    this.clearEvent();
    this.onDrawEnd();
  }
  stopCurrentDraw() {
    let keyPoint = undefined;
    if (this.points.length === 1) keyPoint = new KeyPoint({ ...this.points[0] });
    this.onDraw(keyPoint);
    this.clearDraw();
  }
  clearDraw() {
    this.mouseDown = false;
    this.points = [];
    this.onDrawClear();
  }
  onMouseDown(e: Konva.KonvaEventObject<MouseEvent>, point: Vector2) {
    this.addPoint(point);
    this.stopCurrentDraw();
  }
  addPoint(point: Vector2) {
    this.points.push(point);
  }
  edit(object: KeyPoint) {
    this.object = object;
  }
  stopEdit() {
    this.removeChangeEvent();
    this.object = undefined;
  }
}
