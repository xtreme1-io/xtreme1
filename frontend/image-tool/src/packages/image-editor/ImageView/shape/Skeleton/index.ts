import Konva from 'konva';
import _ from 'lodash';
import SkeletonEdge from './SkeletonEdge';
import Circle from '../Circle';
import Shape from '../Shape';
import GroupObject from '../GroupObject';
import { IShapeConfig, IRectOption, AnnotateObject } from '../../type';
import { ToolType } from '../../../types';
import { Cursor } from '../../../config';
import { skeletonAnchorStates, skeletonEdgeStates, skeletonStates } from '../../../config';

export default class Skeleton extends GroupObject {
  className = 'skeleton';
  edgesGroup: Konva.Group;
  pointsGroup: Konva.Group;
  edges: SkeletonEdge[] = [];
  points: Circle[] = [];
  bgPadding = 4;
  showBgRect = false;
  statePriority: string[] = ['hover', 'select', 'edit'];
  selectChild?: Shape;
  declare attrs: Required<IShapeConfig>;
  constructor(config: IShapeConfig = {}) {
    const _config: IShapeConfig = {
      draggable: true,
      x: 0,
      y: 0,
      cursor: Cursor.pointer,
      selectable: true,
    };
    super(Object.assign(_config, config));

    this.defaultStyle = skeletonStates.default;
    this.stateStyles = skeletonStates;

    this.edgesGroup = new Konva.Group();
    this.pointsGroup = new Konva.Group();
    this.add(this.edgesGroup, this.pointsGroup);
    this.on('xChange yChange', () => {
      this.onPointChange();
    });
    // this.bgRect.remove();
  }

  isGroup() {
    return false;
  }
  // 满足产品的特性化需求, 自定义object的显示控制
  get showVisible() {
    return this.visible();
  }
  set showVisible(val: boolean) {
    this.visible(val);
  }
  get toolType() {
    return ToolType.SKELETON;
  }
  _getBoundRect() {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const offsetX = this.x();
    const offsetY = this.y();
    this.pointsGroup.children.forEach((p) => {
      const rect = p.getClientRect({ skipTransform: true });
      const pos = p.position();
      rect.x = rect.x + pos.x + offsetX;
      rect.y = rect.y + pos.y + offsetY;
      minX = Math.min(minX, rect.x);
      minY = Math.min(minY, rect.y);
      maxX = Math.max(maxX, rect.x + rect.width);
      maxY = Math.max(maxY, rect.y + rect.height);
    });
    minX -= this.bgPadding;
    minY -= this.bgPadding;
    maxX += this.bgPadding;
    maxY += this.bgPadding;
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
  onPointChange() {
    this.edgesGroup.removeChildren();
    this.pointsGroup.removeChildren();
    const validPoints = this.points.filter((e) => e.attrs.valid);
    if (validPoints.length > 0) this.pointsGroup.add(...validPoints);
    const validEdges = this.edges.filter((e) => e.isValid());
    if (validEdges.length > 0) this.edgesGroup.add(...validEdges);
    this._clearCache('boundRect');
    this.updateZIndex();
    this.updateGroup();
    this._requestDraw();
  }

  setData(points: Circle[], edges: SkeletonEdge[], update = true) {
    points.forEach((e) => {
      e.setAttrs({ ...skeletonAnchorStates.default });
      e.object = this;
      e.defaultStyle = skeletonAnchorStates.default;
      e.stateStyles = skeletonAnchorStates;
    });

    this.points = points;

    edges.forEach((e) => {
      e.setAttrs({ ...skeletonEdgeStates.default, draggable: false });
      e.object = this;
      e.defaultStyle = skeletonEdgeStates.default;
      e.stateStyles = skeletonEdgeStates;
    });
    this.edges = edges;
    if (update) this.onPointChange();
  }

  getSelfRect() {
    return this.pointsGroup.getClientRect({
      skipTransform: true,
    });
  }

  _drawChildren(drawMethod: string, canvas: any, top: any) {
    // update bgRect
    this.getBoundRect();
    this.children?.forEach((child) => {
      child[drawMethod as keyof AnnotateObject](canvas, top);
    });
  }
  cloneThisShape() {
    const newSke = this.newShape();
    const newPoints: Circle[] = [];
    const lines: SkeletonEdge[] = [];
    if (this.points && this.points.length > 0) {
      this.points.forEach((e) => {
        newPoints.push(e.cloneThisShape() as Circle);
      });
    }
    if (this.edges && this.edges.length > 0) {
      this.edges.forEach((e) => {
        const sourceIdx = e.source.userData.index;
        const targetIdx = e.target.userData.index;
        const newEdge = new SkeletonEdge(newPoints[sourceIdx], newPoints[targetIdx]);
        newEdge.userData = _.cloneDeep(e.userData);
        newEdge.setAttrs(_.cloneDeep(e.attrs));
        lines.push(newEdge);
      });
    }
    newSke.setData(newPoints, lines);
    newSke.setAttrs(this.cloneProps('attrs'));
    newSke.userData = this.cloneProps('userData');
    return newSke;
  }
  newShape() {
    return new Skeleton();
  }

  // override
  getClientRect(config?: {
    skipTransform?: boolean;
    skipShadow?: boolean;
    skipStroke?: boolean;
    countPosition?: boolean;
    relativeTo?: Konva.Container;
  }): IRectOption {
    const { skipTransform, relativeTo } = config || {};

    let minX = Infinity as any,
      minY = Infinity as any,
      maxX = -Infinity as any,
      maxY = -Infinity as any;
    this.points
      .filter((e) => e.attrs.valid)
      .forEach(function (child) {
        // skip invisible children
        if (!child.visible()) {
          return;
        }
        const rect = child.getBoundRect();
        minX = Math.min(minX, rect.x);
        minY = Math.min(minY, rect.y);
        maxX = Math.max(maxX, rect.x + rect.width);
        maxY = Math.max(maxY, rect.y + rect.height);
      });

    const selfRect = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
    if (
      !isFinite(selfRect.x) ||
      !isFinite(selfRect.y) ||
      !isFinite(selfRect.width) ||
      !isFinite(selfRect.height)
    ) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    if (!skipTransform) {
      return this._transformedRect(selfRect, relativeTo as any);
    }
    return selfRect;
  }
}
