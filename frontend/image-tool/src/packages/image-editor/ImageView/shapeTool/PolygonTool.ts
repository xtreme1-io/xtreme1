import { Line, Polygon, Shape, Circle, GroupObject } from '../shape';
import { ShareDrawMode, ToolName, Vector2 } from '../../types';
import LineTool from './LineTool';
import Konva from 'konva';
import ImageView from '../index';
import { getPointOnLine } from '../utils/common';
import { checkPolygonInnerPoints, constraintInImage, getArea } from '../../utils';
import { Event } from '../../config';
import { t } from '@/lang';

export default class PolygonTool extends LineTool {
  name = ToolName.polygon;
  _points: any = undefined;
  _minPointNum = 3;
  _innerPoints: any = undefined;
  pointsLimit: number = 0;
  editEdges: Line[] = [];
  constructor(view: ImageView) {
    super(view);

    this.changeEvent = 'absoluteTransformChange pointsChange innerPointsChange';
  }

  addPoint(point: Vector2) {
    if (this.points.length === 0) {
      // 初始化点数限制
      this.pointsLimit = this.view.editor.state.config.polygonMaxPoint;
    }
    if (this.checkPolygonPoints()) {
      this.view.editor.showMsg(
        'warning',
        t('image.polygonPointsExceedsTips', { pointsLimit: this.pointsLimit }),
      );
      return;
    }
    this.points.push(point);
    this.anchors.add(new Circle({ x: point.x, y: point.y, ...this.drawConfig }));
    if (this.checkPolygonPoints()) this.stopCurrentDraw();
  }
  checkPolygonPoints() {
    return this.pointsLimit > 0 && this.points.length >= this.pointsLimit;
  }
  stopCurrentDraw() {
    if (this.points.length <= 2) return;
    if (this.pointsLimit > 0 && this.points.length !== this.pointsLimit) {
      const pointsExceed = this.points.length > this.pointsLimit;
      const editor = this.view.editor;
      if (pointsExceed) {
        editor.showMsg('warning', t('image.polygonPointsExceedsTips'));
        this.onDrawEnd();
        this.clearDraw();
      } else {
        editor.showMsg(
          'warning',
          t('image.polygonPlusDrawTips', { pointsLimit: this.pointsLimit }),
        );
      }
      return;
    }
    const polygon = new Polygon({
      points: this.points.slice(0),
      innerPoints: [],
      pointsLimit: this.pointsLimit,
    });
    let newPoly: Polygon[] = [polygon];
    // 非polygon-plus,开启了按边共享,自动裁剪
    const { toolConfig } = this.view.editor.state;
    if (toolConfig.pgs && toolConfig.pgsm === ShareDrawMode.edge && this.pointsLimit === 0) {
      newPoly = this.view.getClipPolygon(polygon);
    }
    this.onDraw(newPoly);
    this.onDrawEnd();
    this.clearDraw();
  }
  drawInfo() {
    if (this.drawGroup.visible() || this.object) {
      const { points } = this.object?.attrs || this;
      if (points.length < 2) return '';
      const arr = [...points];
      if (this.drawGroup.visible()) arr.push(this.currentAnchor.position());
      const area = getArea(arr);
      return `area:${area.toFixed(0)}`;
    }
    return '';
  }

  // edit
  edit(object: Shape) {
    if (this.object) {
      this.removeChangeEvent();
    }

    this.object = object;
    this.pointsLimit = this.object.userData.pointsLimit || 0;
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
    const object = this.object as Polygon;
    const { points, innerPoints } = object.attrs;
    // clear
    // TODO 重用
    const children = [...(this.editGroup.children || [])];
    children.forEach((e) => e.destroy());
    // this.editGroup.removeChildren();

    //
    this._points = points;
    this._innerPoints = innerPoints;

    // anchors
    this.addEditLines(points, -1);
    if (innerPoints) {
      innerPoints.forEach((e, index) => {
        this.addEditLines(e.points, index);
      });
    }

    this.addEditPoints(points, -1);
    if (innerPoints) {
      innerPoints.forEach((e, index) => {
        this.addEditPoints(e.points, index);
      });
    }
    this.selectAnchorIndex(-1, -1);
  }

  // points: -1,  innerPoints: 0 1 2 3
  addEditPoints(points: Vector2[], typeIndex: number) {
    const object = this.object as Polygon;
    const { x, y } = object.attrs;
    points.forEach((p, index) => {
      const anchor = new Circle({
        pointIndex: index,
        typeIndex,
        x: x + p.x,
        y: y + p.y,
      });
      anchor.on('mouseover', this.onAnchorMouseOver.bind(this));
      anchor.on('mouseout', this.onAnchorMouseOut.bind(this));
      anchor.dragBoundFunc(constraintInImage(anchor, this.view));
      this.editGroup.add(anchor);
    });
  }

  // points: -1,  innerPoints: 0 1 2 3
  addEditLines(points: Vector2[], typeIndex: number) {
    const object = this.object as Polygon;
    const { x, y } = object.attrs;

    const len = points.length;
    points.forEach((p, index) => {
      const nextP = points[(index + 1) % len];
      const line = new Line({
        stroke: '#ff0000',
        perfectDrawEnabled: false,
        typeIndex,
        lineIndex: index,
        hitStrokeWidth: 6,
        draggable: false,
        opacity: 0,
        points: [
          { x: x + p.x, y: y + p.y },
          { x: x + nextP.x, y: y + nextP.y },
        ],
      });
      this.editGroup.add(line);
    });
  }

  initEditEvent() {
    this.editGroup.on(Event.DRAG_START, (e: Konva.KonvaEventObject<MouseEvent>) => {
      this.onEditStart();
    });

    this.editGroup.on(Event.DRAG_MOVE, (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!this.object) return;
      const target = e.target;
      const object = this.object as Polygon;
      if (target instanceof Circle) {
        const { x, y, points, innerPoints } = object.attrs;
        const pointIndex = target.attrs.pointIndex as number;
        const typeIndex = target.attrs.typeIndex as number;
        const anchorX = target.attrs.x as number;
        const anchorY = target.attrs.y as number;

        if (typeIndex === -1) {
          const newPoints = points;
          newPoints[pointIndex].x = anchorX - x;
          newPoints[pointIndex].y = anchorY - y;
          this.object.setAttrs({ points: newPoints });
        } else {
          const newPoints = innerPoints[typeIndex].points;
          newPoints[pointIndex].x = anchorX - x;
          newPoints[pointIndex].y = anchorY - y;
          this.object.setAttrs({ innerPoints });
        }
      }
      this.onEditChange();
    });

    this.editGroup.on(Event.DRAG_END, (e: Konva.KonvaEventObject<MouseEvent>) => {
      // console.log('dragstend');
      this.onEditEnd();
      if (!this.checkPositionWithInterior()) {
        this.view.editor.showMsg('warning', 'Unqualified hollow condition');
        // 撤销此次拖动操作
        this.view.editor.actionManager.execute('undo');
      }
    });

    // line
    this.editGroup.on(Event.CLICK, (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!this.object) return;
      if (e.target instanceof Circle) {
        // select anchor
        this.selectAnchor(e.target);
      } else if (e.target instanceof Line) {
        if (this.pointsLimit === 0) {
          this.onPolygonEdgeEdit(e.target);
        } else {
          if (!e.evt.shiftKey) this.editEdges.length = 0;
          this.editEdges.push(e.target);
          this.onPolygonPlusEdgeEdit(e.target);
        }
      }
    });
  }
  // 选中锚点
  selectAnchor(anchor: Circle) {
    const idx = anchor.attrs.pointIndex;
    const type = anchor.attrs.typeIndex;
    const anchors = this.editGroup.children?.filter((e) => e instanceof Circle) as Circle[];
    if (!anchors || anchors.length === 0) return;
    anchors.forEach((e) => {
      e.state.select = idx === e.attrs.pointIndex && type === e.attrs.typeIndex;
    });
    this.view.updateStateStyle(anchors);
    this.selectAnchorIndex(idx, type);
    this.updateAttrHtml();
  }
  // 多边形编辑边
  onPolygonEdgeEdit(target: Line) {
    const object = this.object as Polygon;
    const { x, y, points, innerPoints } = object.attrs;
    const lineIndex = target.attrs.lineIndex as number;
    const typeIndex = target.attrs.typeIndex as number;
    this._points = undefined;
    this.onEditStart();
    let relPos = this.editGroup.getRelativePointerPosition() || { x: 0, y: 0 };
    relPos = getPointOnLine(relPos, target.attrs.points[0], target.attrs.points[1]);
    if (typeIndex === -1) {
      const newPoints = points;
      newPoints.splice(lineIndex + 1, 0, { x: relPos.x - x, y: relPos.y - y });
      this.updateAttrsInDataManager({ points: newPoints });
    } else {
      const newPoints = innerPoints[typeIndex].points;
      newPoints.splice(lineIndex + 1, 0, { x: relPos.x - x, y: relPos.y - y });
      this.updateAttrsInDataManager({ innerPoints });
    }
    // 重新创建
    this.onEditEnd();
  }
  // 多边形plus编辑边
  onPolygonPlusEdgeEdit(target: Line) {
    target.setAttrs({ opacity: 1 });
    if (this.editEdges.length !== 2) return;
    this.editEdges.length = 0;
  }
  onToolDelete() {
    if (!this.object || this.object.userData.pointsLimit > 0) return;
    const idx = this.selectAnchorIndex();
    const type = this.anchorType();
    const anchor = this.editGroup.children?.find(
      (e) => e.attrs.pointIndex === idx && e.attrs.typeIndex === type,
    );
    if (!anchor) return;

    const { points, innerPoints } = this.object.attrs;
    const arr = type > -1 ? innerPoints[type].points : points;
    if (arr.length <= this._minPointNum) {
      this.view.editor.showMsg('warning', `The polygon has at least ${this._minPointNum} points`);
      return;
    }

    this.onEditStart();
    arr.splice(idx, 1);
    this._points = undefined;
    this.updateAttrsInDataManager({ points, innerPoints });
    this.onEditEnd();
    this.view.editor.once(Event.ACTION_END, () => {
      if (!this.checkPositionWithInterior()) {
        this.view.editor.showMsg('warning', 'Unqualified hollow condition');
        // 撤销此次操作
        this.view.editor.actionManager.execute('undo');
      }
    });
  }

  updateEditObject() {
    if (!this.object) return;

    const object = this.object as Polygon;
    const { points, x, y, innerPoints } = object.attrs;
    const children = this.editGroup.children || [];

    // update parent pos
    const parent = object.parent;
    if (parent && parent instanceof GroupObject) {
      this.editGroup.setAttrs(parent.position());
    } else {
      this.editGroup.setAttrs({ x: 0, y: 0 });
    }

    children.forEach((e) => {
      if (e instanceof Circle) {
        const anchor = e as Circle;
        const pointIndex = anchor.attrs.pointIndex as number;
        const typeIndex = anchor.attrs.typeIndex as number;

        const p = typeIndex === -1 ? points[pointIndex] : innerPoints[typeIndex].points[pointIndex];
        const stroke = p.attr?.color || object.attrs.stroke;
        anchor.setAttrs({ x: x + p.x, y: y + p.y, stroke });
      } else {
        const line = e as Line;
        const lineIndex = line.attrs.lineIndex as number;
        const typeIndex = line.attrs.typeIndex as number;

        const nexIndex =
          typeIndex === -1
            ? (lineIndex + 1) % points.length
            : (lineIndex + 1) % innerPoints[typeIndex].points.length;
        const p1 = typeIndex === -1 ? points[lineIndex] : innerPoints[typeIndex].points[lineIndex];
        const p2 = typeIndex === -1 ? points[nexIndex] : innerPoints[typeIndex].points[nexIndex];

        const linePoints = line.attrs.points;
        linePoints[0].x = x + p1.x;
        linePoints[0].y = y + p1.y;
        linePoints[1].x = x + p2.x;
        linePoints[1].y = y + p2.y;
        line.setAttrs({ points: linePoints, x: 0, y: 0 });
      }
    });
  }

  onObjectChange() {
    if (!this.object) return;

    const object = this.object as Polygon;
    const { points, innerPoints } = object.attrs;

    // undo
    if (this._points !== points || this._innerPoints !== innerPoints) {
      console.log('onObjectChange initEditObject');
      this.initEditObject();
    }
    this.updateEditObject();
  }
  // 锚点/边: 发生拖动后, 检测多边形本身和其内部的镂空, 以及镂空之间的位置关系是否不合规范
  checkPositionWithInterior() {
    if (!this.object) {
      this.view.editor.showMsg('error', 'this Object is not exist');
      return false;
    }
    if (!this.object.attrs.innerPoints || this.object.attrs.innerPoints.length === 0) {
      return true;
    }
    return checkPolygonInnerPoints(this.object as Polygon);
  }
}
