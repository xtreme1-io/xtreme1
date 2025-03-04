import Konva from 'konva';
import type ImageView from '..';
import Editor from '../../../image-editor/Editor';
import { Circle, Line, LineTool, Polygon, PolygonTool, SelectHoverAction } from '../export';
import { Event, sharedColor } from './../../config';
import { Vector2 } from '../type';
import { getPointOnLine } from './common';
import { t } from '@/lang';

interface ISharedAnchorConfig {
  position: Vector2;
  referObject: string;
  referIndex: number;
  referTypeIndex: number;
}
const key_L = ['l', 'L', 'KeyL', 76];
/**
 * 共享边绘制工具类, 全局单例
 */
export default class ShareDraw {
  private static _instance: ShareDraw;
  public static getInstance() {
    if (!this._instance) {
      this._instance = new ShareDraw();
    }
    return this._instance;
  }
  constructor() {
    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onClick = this.onClick.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this.exitShareMode = this.exitShareMode.bind(this);
  }

  view!: ImageView;
  editor!: Editor;
  drawTool!: PolygonTool | LineTool;
  originFilter?: (e: any) => boolean;
  countIdxs: number[] = [0, 0];
  sharedPolygon?: Polygon | Line; // 被共享的多边形
  hoverShape?: Polygon | Line;
  setView(mainView: ImageView) {
    this.view = mainView;
    this.editor = this.view.editor;
  }
  canShared(e: any): Polygon | Line | undefined {
    if ((this.view.currentEditTool?.object?.uuid || 'noObject') === e.uuid) return undefined;
    if (e.attrs?.opacity === 0) return undefined;
    if (
      e instanceof Line ||
      e instanceof Polygon ||
      (this.hoverShape && e.attrs?.shareObjectId === this.hoverShape?.uuid)
    ) {
      return e;
    }
    return undefined;
  }
  onMouseOut(e: Konva.KonvaEventObject<MouseEvent>) {
    this.clearObjectData();
  }
  onMouseOver(e: Konva.KonvaEventObject<MouseEvent>) {
    const target = this.canShared(e.target);
    if (!target) {
      this.clearObjectData();
      return;
    }
    const hoverUUID = this.hoverShape?.uuid || '';
    if (hoverUUID === target.uuid || hoverUUID === target.attrs.shareObjectId) return;
    this.hoverShape = target;
    this.updateObjectData();
  }
  onClick(e: Konva.KonvaEventObject<MouseEvent>) {
    if (!this.hoverShape || e.target.attrs.shareObjectId !== this.hoverShape?.uuid) return;
    if (this.drawTool instanceof PolygonTool && this.drawTool.checkPolygonPoints()) return;
    const target = e.target;
    if (target instanceof Circle) {
      this.checkSharedPoints(target, target.position());
    } else if (target instanceof Line) {
      // 点击线段
      const clickPos = this.view.stage.getRelativePointerPosition() || { x: 0, y: 0 };
      const pos = getPointOnLine(clickPos, target.attrs.points[0], target.attrs.points[1]);
      this.checkSharedPoints(target, pos);
    }
  }
  _onKeyDown(e: KeyboardEvent) {
    if (key_L.includes(e.key) || key_L.includes(e.code)) {
      this.changeSharedLines();
      return;
    }
  }
  // 共享点
  updateByPoint() {
    this.editor.visibleMessageBox(true, t('image.sharedByPoints'));
    this.drawTool = this.view.currentDrawTool as LineTool;
    this.drawTool.drawGroup.zIndex(1);
    this.drawTool.helpGroup.zIndex(0);
    this.drawTool.helpGroup.show();
    const act = this.view.getAction('select-hover') as SelectHoverAction;
    this.originFilter = act.filter;
    act.filter = () => false;
    this.view.renderLayer.listening(true);
    this.initObjectEvent();
  }
  // 共享边
  updateByEdge() {
    this.editor.visibleMessageBox(true, t('image.sharedByEdges'));
  }
  updateObjectData() {
    if (!this.hoverShape) {
      this.clearObjectData();
      return;
    }
    this.drawTool.helpGroup.destroyChildren();
    const closed = this.hoverShape instanceof Polygon;
    const { points, x, y } = this.hoverShape.attrs;
    const anchors: Circle[] = [];
    const lines: Line[] = [];
    points.forEach((p, i) => {
      const px = p.x + x;
      const py = p.y + y;
      const anchor = new Circle({
        x: px,
        y: py,
        radius: 4,
        stroke: this.hoverShape?.stroke(),
        draggable: false,
        selfIndex: i,
        typeIndex: -1,
        shareObjectId: this.hoverShape?.uuid,
      });
      anchors.push(anchor);
      if (!closed && i === points.length - 1) return;
      const nextP = points[(i + 1) % points.length];
      const line = new Line({
        stroke: this.hoverShape?.stroke(),
        strokeWidth: 3,
        hitStrokeWidth: 6,
        draggable: false,
        points: [
          { x: px, y: py },
          { x: x + nextP.x, y: y + nextP.y },
        ],
        opacity: 1,
        selfIndex: i + 0.5,
        typeIndex: -1,
        shareObjectId: this.hoverShape?.uuid,
      });
      lines.push(line);
    });
    const newShape = this.hoverShape.cloneThisShape();
    newShape.setAttrs({
      x: newShape.x(),
      y: newShape.y(),
      draggable: false,
      shareObjectId: this.hoverShape?.uuid,
    });
    this.drawTool.helpGroup.add(newShape, ...lines, ...anchors);
  }
  getDrawToolLastAnchor(deleteLast?: boolean) {
    if (!this.drawTool) return;
    // 先删除drawTool最后绘制的锚点
    const anchorChildre = this.drawTool.anchors.children || [];
    let lastIdx = anchorChildre.length - 1;
    if (deleteLast) {
      this.drawTool.points.pop();
      anchorChildre[lastIdx]?.destroy();
      lastIdx--;
    }
    return anchorChildre[lastIdx];
  }
  resetPointPos(configs: ISharedAnchorConfig[]) {
    if (!this.drawTool) return;
    // 将共享点添加
    configs.forEach((e) => {
      this.drawTool.points.push({ ...e.position });
      const anc = new Circle({ ...e, stroke: sharedColor, fill: '#ffffff' });
      this.drawTool.anchors.add(anc);
    });
    this.drawTool.updateHolder();
  }
  checkSharedPoints(target: Circle | Line, position: Vector2) {
    const lastAnchor = this.getDrawToolLastAnchor(true);
    const { referObject, referIndex, referTypeIndex } = lastAnchor?.attrs || {};
    const { shareObjectId, selfIndex, typeIndex } = target.attrs;
    const isSame = referObject === shareObjectId && referTypeIndex === typeIndex;
    const lastConfig = {
      position,
      referObject: shareObjectId,
      referIndex: selfIndex,
      referTypeIndex: typeIndex,
    };
    if (isSame) {
      // 计算共享
      this.sharedPolygon = this.hoverShape;
      const step = referIndex < selfIndex ? 0.5 : -0.5;
      const addPoints = this.countSharePoints({
        start: referIndex,
        end: selfIndex,
        step,
        typeIndex,
      });
      addPoints.push(lastConfig);
      this.resetPointPos(addPoints);
    } else {
      this.sharedPolygon = undefined;
      this.resetPointPos([lastConfig]);
    }
  }
  changeSharedLines() {
    if (!this.drawTool || !this.sharedPolygon || this.sharedPolygon instanceof Line) return;
    const anchors = this.drawTool.anchors.children || [];
    const len = anchors.length;
    const lastAnchor = anchors[len - 1];
    if (!lastAnchor) return;
    const { referObject, referIndex, referTypeIndex } = lastAnchor.attrs;
    if (referObject !== this.sharedPolygon?.uuid) return;

    const sharedAnchors = [lastAnchor];
    for (let i = len - 2; i >= 0; i--) {
      if (
        anchors[i].attrs.referObject !== referObject ||
        anchors[i].attrs.referTypeIndex !== referTypeIndex
      ) {
        break;
      }
      anchors[i].attrs.pointIndex = i;
      sharedAnchors.unshift(anchors[i]);
    }
    const objPointsLen = this.sharedPolygon.attrs.points.length;
    if (sharedAnchors.length <= 1 || sharedAnchors.length > objPointsLen + 2) return;
    const start = sharedAnchors[0].attrs.referIndex;
    const next = sharedAnchors[1].attrs.referIndex;
    const deriction = (start + 1) % objPointsLen == next || (start + 0.5) % objPointsLen == next;
    let nowStep = deriction ? 0.5 : -0.5;
    if (start === referIndex && start != Math.floor(start)) {
      nowStep = start === next ? -0.5 : 0.5;
    }
    const addPoints = this.countSharePoints({
      start,
      end: referIndex,
      step: -nowStep,
      typeIndex: referTypeIndex,
    });
    addPoints.push({
      position: lastAnchor.position(),
      referObject,
      referIndex,
      referTypeIndex,
    });
    // 删除之前的
    this.drawTool.points.splice(sharedAnchors[0].attrs.pointIndex + 1, sharedAnchors.length - 1);
    sharedAnchors.shift();
    sharedAnchors.forEach((a) => a.destroy());
    this.resetPointPos(addPoints);
  }
  countSharePoints(param: { start: number; end: number; step: number; typeIndex: number }) {
    const { start, end, typeIndex } = param;
    let step = param.step;
    const pList: ISharedAnchorConfig[] = [];
    if (!this.sharedPolygon) return pList;
    const { points, innerPoints, x, y } = this.sharedPolygon.attrs;
    const pArr: Vector2[] = typeIndex === -1 ? points : innerPoints[typeIndex]?.points;
    const len = pArr.length;
    if (!pArr || len == 0) return pList;
    if (start === end && step < 0) return pList;
    if (start === end && step > 0 && start != Math.floor(start)) {
      const objP1 = pArr[Math.floor(start)];
      const objP2 = pArr[Math.ceil(start)];
      const toolP1 = this.drawTool.points[this.drawTool.points.length - 2];
      const toolP2 = this.drawTool.points[this.drawTool.points.length - 1];
      const dx = (objP2.x - objP1.x) * (toolP2.x - toolP1.x);
      const dy = (objP2.y - objP1.y) * (toolP2.y - toolP1.y);
      const isSameDr = dx > 0 || dy > 0;
      step = isSameDr ? -0.5 : 0.5;
    }
    let i = (start + len + step) % len;
    while (i != end) {
      if (pArr[i]) {
        pList.push({
          position: { x: pArr[i].x + x, y: pArr[i].y + y },
          referObject: this.sharedPolygon.uuid,
          referIndex: i,
          referTypeIndex: typeIndex,
        });
      }
      i = (i + len + step) % len;
    }
    return pList;
  }
  clearObjectData() {
    this.hoverShape = undefined;
    this.drawTool?.helpGroup.destroyChildren();
  }
  // 退出共享模式
  exitShareMode() {
    this.editor.visibleMessageBox(false);
    const renderListening = !this.view.currentDrawTool;
    this.view.renderLayer.listening(renderListening);
    if (this.originFilter) {
      const act = this.view.getAction('select-hover') as SelectHoverAction;
      act.filter = this.originFilter;
    }
    this.clear();
  }
  initObjectEvent() {
    this.view.stage.on(Event.MOUSE_OVER, this.onMouseOver);
    this.drawTool.helpGroup.on(Event.MOUSE_OUT, this.onMouseOut);
    this.drawTool.helpGroup.on(Event.CLICK, this.onClick);
    this.editor.on(Event.ANNOTATE_DISABLED_DRAW, this.exitShareMode);
    document.addEventListener('keydown', this._onKeyDown);
  }
  clearObjectEvent() {
    this.view.stage.off(Event.MOUSE_OVER, this.onMouseOver);
    this.drawTool.helpGroup.off(Event.MOUSE_OUT, this.onMouseOut);
    this.drawTool.helpGroup.off(Event.CLICK, this.onClick);
    this.editor.off(Event.ANNOTATE_DISABLED_DRAW, this.exitShareMode);
    document.removeEventListener('keydown', this._onKeyDown);
  }
  clear() {
    if (!this.drawTool) return;
    this.drawTool.helpGroup.destroyChildren();
    this.clearObjectEvent();
    this.originFilter = undefined;
  }
}
