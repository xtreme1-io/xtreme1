import { IPolygonInnerConfig, MsgType, ToolName, Vector2 } from '../../types';
import { Event } from '../../configs';
import ImageView from '../index';
import { Anchor, Line, Polygon, Shape } from '../shape';
import PolylineTool from './PolylineTool';
import * as utils from '../../utils';
import Konva from 'konva';

export default class PolygonTool extends PolylineTool {
  name = ToolName.polygon;
  _minPointNum = 3;
  _innerPoints?: IPolygonInnerConfig[];

  holderFill: Polygon;

  constructor(view: ImageView) {
    super(view);

    this.holderFill = new Polygon({ fill: 'rgba(255,255,255,0.2)', stroke: '' });
    this.drawGroup.add(this.holderFill);
    this.holderFill.moveToBottom();
    this.changeEvent = 'absoluteTransformChange pointsChange innerPointsChange';
  }

  updateLastHolderLine() {
    const endPos = this.currentAnchor.position();
    this.holderFill.show();
    this.holderFill.setAttrs({ points: [...this.points, endPos] });
    super.updateLastHolderLine();
  }
  stopCurrentDraw() {
    if (this.points.length < this._minPointNum) return;
    const poly = new Polygon({ points: this.points.slice(0) });
    this.onDraw(poly);
    this.onDrawEnd();
    this.clearDraw();
  }
  clearDraw() {
    this.holderFill.hide();
    super.clearDraw();
  }
  // edit
  edit(object: Shape) {
    this.removeChangeEvent();
    this.object = object;
    this.initEditObject();
    this.updateEditObject();
    this.editGroup.show();
    this.addChangEvent();
  }
  stopEdit() {
    this.removeChangeEvent();
    this.object = undefined;
    this.editGroup.hide();
  }
  initEditObject() {
    if (!this.object) return;
    const object = this.object as Polygon;
    const { points, innerPoints } = object.attrs;
    // clear
    const children = [...(this.editGroup.children || [])];
    children.forEach((e) => e.destroy());

    this._points = points;
    this._innerPoints = innerPoints;
    const realPoints = utils.getShapeRealPoint(object, points);

    // anchors
    this.addEditLines(realPoints, -1);
    if (innerPoints) {
      innerPoints.forEach((e, index) => {
        this.addEditLines(utils.getShapeRealPoint(object, e.points), index);
      });
    }

    this.addEditPoints(realPoints, -1);
    if (innerPoints) {
      innerPoints.forEach((e, index) => {
        this.addEditPoints(utils.getShapeRealPoint(object, e.points), index);
      });
    }
    this.selectAnchorIndex(-1, -1);
  }

  // points: -1,  innerPoints: 0 1 2 3
  addEditPoints(points: Vector2[], typeIndex: number) {
    points.forEach((p, index) => {
      const anchor = new Anchor({
        pointIndex: index,
        pointType: typeIndex,
        x: p.x,
        y: p.y,
      });
      this.editGroup.add(anchor);
    });
  }
  // points: -1,  innerPoints: 0 1 2 3
  addEditLines(points: Vector2[], typeIndex: number) {
    const len = points.length;
    points.forEach((p, index) => {
      const nextP = points[(index + 1) % len];
      const line = new Line({
        stroke: '#ff0000',
        perfectDrawEnabled: false,
        typeIndex,
        lineIndex: index,
        draggable: false,
        opacity: 0,
        points: [p, nextP],
      });
      this.editGroup.add(line);
    });
  }
  initEditEvent() {
    this.editGroup.on(Event.DRAG_START, () => {
      this.onEditStart();
    });

    this.editGroup.on(Event.DRAG_MOVE, (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!this.object) return;
      const target = e.target;
      const object = this.object as Polygon;
      if (target instanceof Anchor) {
        const { x, y, points, innerPoints } = object.attrs;
        const pointIndex = target.anchorIndex;
        const typeIndex = target.anchorType;
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

    this.editGroup.on(Event.DRAG_END, () => {
      // console.log('dragstend');
      this.onEditEnd();
      if (!this.checkPositionWithInterior()) {
        this.view.editor.showMsg(MsgType.warning, 'Unqualified hollow condition');
        this.view.editor.actionManager.execute('undo');
      }
    });

    // line
    this.editGroup.on(Event.CLICK, (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!this.object) return;
      if (e.target instanceof Anchor) {
        // select anchor
        this.selectAnchor(e.target);
      } else if (e.target instanceof Line) {
        this.onPolygonEdgeEdit(e.target);
      }
    });
  }
  selectAnchor(anchor: Anchor) {
    const { anchorIndex, anchorType } = anchor;
    const anchors = this.editGroup.children?.filter((e) => e instanceof Anchor) as Anchor[];
    if (!anchors || anchors.length === 0) return;
    anchors.forEach((e) => {
      e.state.select = anchorIndex === e.anchorIndex && anchorType === e.anchorType;
    });
    this.view.updateStateStyle(anchors);
    this.selectAnchorIndex(anchorIndex, anchorType);
    this.updateAttrHtml();
  }
  onPolygonEdgeEdit(target: Line) {
    const object = this.object as Polygon;
    const { x, y, points, innerPoints } = object.attrs;
    const lineIndex = target.attrs.lineIndex as number;
    const typeIndex = target.attrs.typeIndex as number;
    this._points = undefined;
    this.onEditStart();
    let relPos = this.editGroup.getRelativePointerPosition() || { x: 0, y: 0 };
    relPos = utils.getPointOnLine(relPos, target.attrs.points[0], target.attrs.points[1]);
    if (typeIndex === -1) {
      const newPoints = points;
      newPoints.splice(lineIndex + 1, 0, { x: relPos.x - x, y: relPos.y - y });
      this.updateAttrsInDataManager({ points: newPoints });
    } else {
      const newPoints = innerPoints[typeIndex].points;
      newPoints.splice(lineIndex + 1, 0, { x: relPos.x - x, y: relPos.y - y });
      this.updateAttrsInDataManager({ innerPoints });
    }
    this.onEditEnd();
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
      this.view.editor.showMsg(
        MsgType.warning,
        `The polygon has at least ${this._minPointNum} points`,
      );
      return;
    }

    this.onEditStart();
    arr.splice(idx, 1);
    this._points = undefined;
    this.updateAttrsInDataManager({ points, innerPoints });
    this.onEditEnd();
    this.view.editor.once(Event.ACTION_END, () => {
      if (!this.checkPositionWithInterior()) {
        this.view.editor.showMsg(MsgType.warning, 'Unqualified hollow condition');
        this.view.editor.actionManager.execute('undo');
      }
    });
  }
  updateEditObject() {
    if (!this.object) return;

    const object = this.object as Polygon;
    const { points, innerPoints } = object.attrs;
    const children = this.editGroup.children || [];
    this.editGroup.setAttrs({ x: 0, y: 0 });
    const realPoints = utils.getShapeRealPoint(object, points);
    const realInners = innerPoints?.map((e) => utils.getShapeRealPoint(object, e.points));

    children.forEach((e) => {
      if (e instanceof Anchor) {
        const anchor = e as Anchor;
        const pointIndex = anchor.anchorIndex;
        const typeIndex = anchor.anchorType;

        const p = typeIndex === -1 ? realPoints[pointIndex] : realInners[typeIndex][pointIndex];
        const fill = object.attrs.stroke as string;
        anchor.updateStateStyles({ general: { fill } });
        anchor.setAttrs({ x: p.x, y: p.y, fill });
      } else {
        const line = e as Line;
        const lineIndex = line.attrs.lineIndex as number;
        const typeIndex = line.attrs.typeIndex as number;

        const nexIndex =
          typeIndex === -1
            ? (lineIndex + 1) % realPoints.length
            : (lineIndex + 1) % realInners[typeIndex].length;
        const p1 = typeIndex === -1 ? realPoints[lineIndex] : realInners[typeIndex][lineIndex];
        const p2 = typeIndex === -1 ? realPoints[nexIndex] : realInners[typeIndex][nexIndex];
        line.setAttrs({ points: [p1, p2], x: 0, y: 0 });
      }
    });
  }
  onObjectChange() {
    if (!this.object) return;
    const object = this.object as Polygon;
    const { points, innerPoints } = object.attrs;
    if (this._points !== points || this._innerPoints !== innerPoints) {
      this.initEditObject();
    }
    this.updateEditObject();
  }
  checkPositionWithInterior() {
    if (!this.object) {
      this.view.editor.showMsg(MsgType.error, 'this Object is not exist');
      return false;
    }
    if (!this.object.attrs.innerPoints || this.object.attrs.innerPoints.length === 0) {
      return true;
    }
    return utils.checkPolygonInnerPoints(this.object as Polygon);
  }
  drawInfo() {
    let nowPoints: Vector2[] = [];
    let nowInner: IPolygonInnerConfig[] = [];
    if (this.object) {
      nowPoints = this.object.attrs.points;
      nowInner = this.object.attrs.innerPoints;
    } else if (this.holder.visible()) {
      nowPoints = [...this.points, this.currentAnchor.position()];
    }
    if (nowPoints.length > 0) {
      const area = utils.getArea(nowPoints, nowInner);
      return `area:${area.toFixed(0)}px`;
    }
    return '';
  }
}
