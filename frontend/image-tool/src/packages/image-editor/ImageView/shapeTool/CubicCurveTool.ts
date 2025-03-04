import { Line, CubicCurve, Circle, Shape, GroupObject } from '../shape';
import { Vector2 } from '../../types';
import ShapeTool from './ShapeTool';
import Konva from 'konva';
import ImageView from '../index';
import * as utils from '../utils';
import fitCurve from 'fit-curve';
import { ICubicControl } from '../type';

export default class CubicCurveTool extends ShapeTool {
  currentAnchor: Circle;
  points: Vector2[] = [];
  holderLine: Line;
  holder: CubicCurve;
  holderLastLine: Line;
  anchors: Konva.Group;
  //
  _points: any = undefined;
  _controls: any = undefined;
  editAnchors: Konva.Group;
  editControls: Konva.Group;
  editLines: Konva.Group;
  constructor(view: ImageView) {
    super(view);

    // draw
    this.holderLine = new Line({ strokeWidth: 2 });
    this.holderLastLine = new Line({ dash: [5, 5], strokeWidth: 2 });
    this.currentAnchor = new Circle();
    this.holder = new CubicCurve();
    this.anchors = new Konva.Group();
    this.drawGroup.add(
      this.holderLine,
      this.anchors,
      this.holderLastLine,
      this.currentAnchor,
      this.holder,
    );

    // edit
    this.changeEvent = 'absoluteTransformChange pointsChange controlsChange';
    this.editAnchors = new Konva.Group();
    this.editControls = new Konva.Group();
    this.editLines = new Konva.Group();
    this.editGroup.add(this.editLines, this.editAnchors, this.editControls);
    this.initEditEvent();
  }
  doing(): boolean {
    return this.points.length > 0;
  }
  // draw
  draw() {
    console.log('draw');
    this.clearDraw();
    this.clearEvent();
    this.initEvent();
    this.drawGroup.show();
    // hook
    this.onDrawStart();
  }
  stopDraw() {
    this.drawGroup.hide();
    this.clearDraw();
    this.clearEvent();
    this.onDrawEnd();
  }
  stopCurrentDraw() {
    const { points, controls } = this.holder.attrs;
    const curve = this.points.length >= 3 ? new CubicCurve({ points, controls }) : undefined;
    this.onDraw(curve);
    this.onDrawEnd();
    this.clearDraw();
  }
  undoDraw() {
    if (this.points.length === 0) return;

    this.points.pop();
    const children = this.anchors.children || [];
    const anchor = children[children.length - 1] as Circle;
    anchor.remove();

    if (this.points.length > 0) {
      this.updateHolder();
      this.updateCurve();
      this.onDrawChange();
    } else {
      this.clearDraw();
    }
  }
  clearDraw() {
    this.mouseDown = false;
    this.points = [];

    this.anchors.removeChildren();

    this.holderLine.hide();
    this.holderLastLine.hide();
    this.currentAnchor.hide();
    this.holder.hide();
    this.onDrawClear();
  }

  onMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    const stage = this.view.stage;
    const point = stage.getRelativePointerPosition();
    this.addPoint(point);
  }
  onMouseMove(e: Konva.KonvaEventObject<MouseEvent>) {
    const stage = this.view.stage;
    const point = stage.getRelativePointerPosition();
    this.currentAnchor.position(point);
    this.updateHolder();
    this.onDrawChange();
  }

  updateCurve() {
    if (this.points.length < 3) return;
    const path = [...this.points].map((e) => [e.x, e.y]);
    const curves = fitCurve(path, 50) as any as number[][][];

    // console.log(path);
    // console.log(curves);
    const points = [] as Vector2[];
    const controls = [] as ICubicControl[];
    const curve = [] as number[][];

    curves.forEach((e, index) => {
      if (index === 0) {
        curve.push(...e);
      } else {
        curve.push(...e.slice(1, 4));
      }
    });
    for (let i = 0; i < curve.length; i += 3) {
      const p = curve[i];
      points.push({ x: p[0], y: p[1] });
      if (i === 0) {
        controls.push([undefined, { x: curve[i + 1][0], y: curve[i + 1][1] }]);
      } else if (i === curve.length - 1) {
        controls.push([{ x: curve[i - 1][0], y: curve[i - 1][1] }, undefined]);
      } else {
        controls.push([
          { x: curve[i - 1][0], y: curve[i - 1][1] },
          { x: curve[i + 1][0], y: curve[i + 1][1] },
        ]);
      }
    }

    // console.log(points, controls);
    this.holder.setAttrs({ points, controls });
  }

  updateHolder() {
    const endPos = this.currentAnchor.position();
    this.holderLine.setAttrs({
      points: this.points,
    });
    this.holderLastLine.setAttrs({
      points: [this.points[this.points.length - 1], endPos],
    });

    this.holderLastLine.show();
    this.currentAnchor.show();
    this.holder.setAttrs({ visible: this.points.length >= 3 });
    this.holderLine.setAttrs({ visible: this.points.length < 3 });
  }

  addPoint(point: Vector2) {
    this.points.push(point);
    this.anchors.add(new Circle({ x: point.x, y: point.y }));
    this.updateCurve();
  }

  // edit
  edit(object: Shape) {
    if (this.object) {
      this.removeChangeEvent();
    }

    this.object = object;
    this.initEditObject();
    this.updateEditObject();
    this.editGroup.show();

    this.addChangEvent();
  }
  stopEdit() {
    if (this.object) {
      this.removeChangeEvent();
    }
    this.object = undefined;
    this.editGroup.hide();
  }

  initEditObject() {
    if (!this.object) return;

    const object = this.object as CubicCurve;
    const { points, controls } = object.attrs;

    // resize
    utils.resizeGroup(this.editAnchors, points.length, () => {
      return new Circle();
    });
    utils.resizeGroup(this.editControls, controls.length * 2 - 2, () => {
      return new Circle();
    });
    utils.resizeGroup(this.editLines, controls.length * 2 - 2, () => {
      return new Line({
        hitStrokeWidth: 6,
        draggable: false,
        points: [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ],
      });
    });

    this._points = points;
  }

  initEditEvent() {
    let startCtrl = {} as ICubicControl;
    let startPos = {} as Vector2;
    this.editAnchors.on('dragstart', (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!this.object) return;

      const target = e.target as Circle;
      const { controls } = (this.object as CubicCurve).attrs;
      const pointIndex = target.attrs.pointIndex as number;
      startCtrl = JSON.parse(JSON.stringify(controls[pointIndex]));
      startPos = JSON.parse(JSON.stringify(target.position()));

      this.onEditStart();
    });

    this.editAnchors.on('dragmove', (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!this.object) return;

      const { controls, x, y, points } = (this.object as CubicCurve).attrs;
      const target = e.target as Circle;

      const pointIndex = target.attrs.pointIndex as number;
      const pos = target.position();
      points[pointIndex].x = pos.x - x;
      points[pointIndex].y = pos.y - y;
      // update control
      const ctrl = controls[pointIndex];
      if (ctrl[0] && startCtrl[0]) {
        ctrl[0].x = startCtrl[0].x + (pos.x - startPos.x);
        ctrl[0].y = startCtrl[0].y + (pos.y - startPos.y);
      }
      if (ctrl[1] && startCtrl[1]) {
        ctrl[1].x = startCtrl[1].x + (pos.x - startPos.x);
        ctrl[1].y = startCtrl[1].y + (pos.y - startPos.y);
      }

      this.object.setAttrs({ points });

      this.onEditChange();
    });

    this.editAnchors.on('dragend', (e: Konva.KonvaEventObject<MouseEvent>) => {
      this.onEditEnd();
    });

    // control points
    this.editControls.on('dragstart', (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!this.object) return;
      this.onEditStart();
    });
    this.editControls.on('dragmove', (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!this.object) return;

      const { controls, x, y } = (this.object as CubicCurve).attrs;
      const target = e.target as Circle;

      const pointIndex = target.attrs.pointIndex as number;
      const ctrlIndex = target.attrs.ctrlIndex as number;
      const ctrPos = controls[pointIndex][ctrlIndex] as Vector2;
      const pos = target.position();
      ctrPos.x = pos.x - x;
      ctrPos.y = pos.y - y;
      this.object.setAttrs({ controls });

      this.onEditChange();
    });
    this.editControls.on('dragend', (e: Konva.KonvaEventObject<MouseEvent>) => {
      this.onEditEnd();
    });
  }

  updateEditObject() {
    if (!this.object) return;
    const { points, controls, x, y, stroke } = (this.object as CubicCurve).attrs;

    // update parent pos
    const parent = this.object.parent;
    if (parent && parent instanceof GroupObject) {
      this.editGroup.setAttrs(parent.position());
    } else {
      this.editGroup.setAttrs({ x: 0, y: 0 });
    }

    const editAnchors = (this.editAnchors.children || []) as Circle[];
    const editControls = (this.editControls.children || []) as Circle[];
    const editLines = (this.editLines.children || []) as Circle[];
    let controlIndex = 0;
    points.forEach((p, index) => {
      const anchor = editAnchors[index];
      // console.log({ stroke });
      anchor.setAttrs({ pointIndex: index, x: x + p.x, y: y + p.y, stroke });

      if (index === 0) {
        update(index, controlIndex++, 1);
      } else if (index === controls.length - 1) {
        update(index, controlIndex++, 0);
      } else {
        update(index, controlIndex++, 0);
        update(index, controlIndex++, 1);
      }
    });

    function update(pointIndex: number, controlIndex: number, ctrlIndex: number) {
      const editCtrl = editControls[controlIndex];
      const ctrl = controls[pointIndex][ctrlIndex] as Vector2;
      editCtrl.setAttrs({
        pointIndex,
        ctrlIndex,
        x: x + ctrl.x,
        y: y + ctrl.y,
      });

      const line = editLines[controlIndex];
      const anchor = editAnchors[pointIndex];

      const linePoints = line.attrs.points;
      linePoints[0].x = anchor.x();
      linePoints[0].y = anchor.y();
      linePoints[1].x = editCtrl.x();
      linePoints[1].y = editCtrl.y();
      line.setAttrs({ points: linePoints, x: 0, y: 0 });
    }
  }

  onObjectChange() {
    if (!this.object) return;

    const object = this.object as CubicCurve;
    const { points } = object.attrs;

    if (this._points !== points) {
      console.log('onObjectChange initEditObject');
      this.initEditObject();
    }
    this.updateEditObject();
  }
}
