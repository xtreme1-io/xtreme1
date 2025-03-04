import hotkeys from 'hotkeys-js';
import Konva from 'konva';
import ShapeTool, { ToolEvent } from './ShapeTool';
import {
  IClassType,
  IClassTypeItem,
  ToolAction,
  ToolModelEnum,
  ToolName,
  Vector2,
} from '../../types';
import {
  AnnotateObject,
  Circle,
  ImageView,
  SelectHoverAction,
  Skeleton,
  SkeletonEdge,
  SplineCurve,
  SplineCurveTool,
} from '../export';
import { Cursor, Event, skeletonAnchorStates } from '../../config';
import * as utils from '../../utils';

const subKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

export type SkeletonEvent =
  | 'hotKey'
  | 'init'
  | 'clear'
  | 'change-before'
  | 'change'
  | 'change-end'
  | 'ske-tool-undo'
  | 'ske-graph-label'
  | 'ske-graph-size';

type changeType = 'anchor' | 'skeleton'; // 变化对象(骨骼点, 骨骼对象)
export enum Type {
  Draw = 'draw',
  Edit = 'edit',
  Tool = 'tool',
}

export default class SkeletonTool extends ShapeTool {
  name = ToolName.skeleton;
  // cursor = Cursor.auto;
  classConfig: IClassType | undefined = undefined;
  currentAnchor: Circle;
  // 源对象
  oriObject: Skeleton | undefined = undefined;
  // 绘制/编辑对象
  object: Skeleton;
  // 骨骼工具形成结果的标记
  isOnDraw: boolean = false;
  isChanged: boolean = false;
  // 模式(新建绘制/选中结果编辑)
  mode: Type.Edit | Type.Draw = Type.Edit;
  // 操作类型(新建绘制/选中未完成结果继续绘制都视为draw类型, 拖拽点为edit类型, 使用等分工具为tool类型)
  opType: Type = Type.Edit;
  lastType: Type = Type.Edit;
  pointsN = 0;
  // tool
  drawTool: ShapeTool | undefined = undefined;
  editTool: ShapeTool | undefined = undefined;
  currentIndex = -1;
  nextIndex = -1;
  cursorMap: Record<Type, string> = {
    [Type.Draw]: Cursor.crosshair,
    [Type.Edit]: Cursor.auto,
    [Type.Tool]: Cursor.pointer,
  };
  clickType: number = 0;
  constructor(view: ImageView) {
    super(view);

    this.config.disableRenderLayer = false;
    this.object = new Skeleton({ draggable: false, edit: true });
    // this.initObjectEvent();

    this.currentAnchor = new Circle();
    // this.drawGroup.add(this.object as any);
    this.onClick = this.onClick.bind(this);
  }

  // draw
  draw() {
    // console.log('draw');
    this.mode = Type.Draw;
    this.oriObject = undefined;
    this.object = new Skeleton({ draggable: false, edit: true });
    this.object.editable = false;
    this.isOnDraw = false;
    this.initData();
  }
  // 重新开始绘制
  resetDraw() {
    this.clearState('reset draw');
    this.draw();
  }

  stopDraw() {
    this.clearState('stopDraw');
  }
  clearDraw(): void {
    this.resetDraw();
  }

  // edit
  edit(object: Skeleton) {
    this.mode = Type.Edit;
    this.object = object;
    this.isOnDraw = true;
    this.isChanged = false;
    this.stagingOriobject();
    this.initData();
    this.updateIndexState();
  }

  stopEdit() {
    this.clearState('stopEdit');
  }
  // 退出骨骼工具
  clearState(state: string) {
    // console.log('exit-skeleton:', state);
    this.clearData();
  }

  clearData() {
    // console.log('clearData');

    // this.drawGroup.hide();
    this.object?.points?.forEach((e) => (e.userData.activeIndex = -1));
    this.isOnDraw = false;
    this.isChanged = false;
    this.clearEditEvent();
    this.clearTool();
    this.switchViewEvent(true);
    // this.view.editor.selectObject();

    this.emit<SkeletonEvent>('clear');
  }

  // copy一份暂存下来,以便取消复原或者回退
  stagingOriobject() {
    if (!this.object) return;
    this.oriObject = this.object.cloneThisShape();
    this.oriObject.frame = this.object.frame;
    this.oriObject.uuid = this.object.uuid;
  }
  initData() {
    if (!this.object) return;

    // console.log('initData');

    // 禁用 drag
    // this.drawGroup.show();
    this.clearEditEvent();
    this.initEditEvent();
    // this.view.renderLayer.listening(false);

    // let action = this.view.getAction('select-hover') as SelectHoverAction;
    // if (action) action.selectFlag = false;

    this.emit<SkeletonEvent>('init');
  }

  onChangeBefore(data: { type: changeType; [key: string]: any }) {
    this.emit<SkeletonEvent>('change-before', data);
  }
  onChange() {
    this.emit<SkeletonEvent>('change');
    if (this.object) {
      this.isChanged = true;
      this.view.editor.dataManager.onAnnotatesChange([this.object], 'other');
    }
  }
  onChangeEnd() {
    this.emit<SkeletonEvent>('change-end');
  }
  updateCurrentAnchor(index: number = -1) {
    if (index > -1) this.currentIndex = index;
    const anchor = this.object.points?.[this.currentIndex];
    if (!anchor) return;
    this.object.selectChild = anchor;
    this.view.updateStateStyle(this.object);
  }

  initClassConfig(classConfig: IClassType) {
    this.clearTool();

    const { pointList } = (classConfig as IClassTypeItem).getToolOptions().skeletonConfig;

    this.classConfig = classConfig;
    if (this.object.userData.classId !== classConfig.id) {
      this.pointsN = pointList.length;
      const editor = this.view.editor;
      let data: { classId: string; classType: string; skeletonName?: string; attrs?: any };

      if (this.isOnDraw) {
        if (editor.state.isSeriesFrame) {
          data = { classId: classConfig.id, classType: classConfig.name };
          editor.trackManager.updateTrackData(this.object.userData.trackId, data);
        }
      }
      data = {
        classId: classConfig.id,
        classType: classConfig.name,
        skeletonName: classConfig.name,
        attrs: this.view.editor.getAttrsDefaultValue(classConfig),
      };
      editor.dataManager.setAnnotatesUserData(this.object, data);
      this.createSkeletonData(classConfig);
      this.updateIndexState();
      this.onChange();
    }
  }

  updateIndexState() {
    // if (!this.object) return;
    // 还有没有创建的点
    const editable = this.view.editor.editable;
    if (editable && this.object.points.filter((e) => !e.attrs.valid).length > 0) {
      this.setToolMode(Type.Draw);
      this.view.editor.state.activeTool = ToolName.skeleton;
      const existIndex = this.object.points.findIndex((e) => !e.attrs.valid);
      this.currentIndex = existIndex - 1;
      this.updateNextIndex();
    } else {
      this.setToolMode(Type.Edit);
      this.currentIndex = 0;
      this.nextIndex = -1;
      this.view.editor.state.activeTool = ToolName.default;
    }

    // 高亮选中的点
    if (this.object.selectChild) {
      const existIndex = this.object.points.findIndex((e) => e === this.object.selectChild);
      if (existIndex >= 0) this.currentIndex = existIndex;
    }

    this.updateCurrentAnchor();
    // this.onChange();
  }

  clearTool() {
    if (this.drawTool) {
      this.drawTool.stopDraw();
      this.drawTool = undefined;
    }
    if (this.editTool) {
      this.editTool.stopEdit();
      this.editTool = undefined;
    }
  }

  checkAction(action: ToolAction) {
    return [ToolAction.esc, ToolAction.stop, ToolAction.undo, ToolAction.del].includes(action);
  }

  onAction(action: ToolAction) {
    // console.log('action', action);
    switch (action) {
      case ToolAction.esc:
        if (this.drawTool) {
          this.drawTool.stopDraw();
          this.drawTool = undefined;
          this.setToolMode(this.lastType);
        } else {
          this.exitByESC();
          this.exitTool();
        }
        break;
      case ToolAction.del:
        this.delCurrentPoint();
        break;
      case ToolAction.stop:
        this.stopCurrentDraw();
        break;
      case ToolAction.undo:
        this.emit<SkeletonEvent>('ske-tool-undo');
        this.onChange();
        break;
    }
  }

  // esc退出骨骼工具
  exitByESC() {
    // 取消绘制/编辑, 将skeleton复原, 删除修改过的object, 将初始的oriObject&&trackData复原
    if (!this.object || !this.isChanged) return;
    this.isOnDraw = false;
    const editor = this.view.editor;
    if (this.oriObject) {
      // 回到编辑前的状态, 还原初始数据
      Object.assign(this.object.attrs, this.oriObject.attrs);
      Object.assign(this.object.userData, this.oriObject.userData);
      this.object.setData(this.oriObject.points, this.oriObject.edges);
      this.oriObject = undefined;
      editor.selectObject();
    } else {
      // 删除新增的骨骼点
      editor.dataManager.removeAnnotates(this.object, this.object.frame);
    }
  }
  exitTool() {
    this.isOnDraw = false;
    this.switchViewEvent(true);
    this.view.disableDraw();
  }

  stopCurrentDraw(exit: boolean = true) {
    if (this.drawTool) {
      this.drawTool.stopCurrentDraw();
      if (this.nextIndex < 0) this.lastType = Type.Edit;
      this.setToolMode(this.lastType);
    } else {
      if (exit) {
        this.object.points.forEach((e) => (e.userData.activeIndex = -1));
        this.exitTool();
      }
    }
  }

  delCurrentPoint() {
    const currentIndex = this.currentIndex;
    if (!this.object.points[currentIndex] || this.opType === Type.Tool) return;

    this.onChangeBefore({ type: 'anchor', anchors: [currentIndex] });
    this.object.points[currentIndex].setAttrs({ valid: false });
    this.object.onPointChange();
    this.currentIndex = -1;
    this.nextIndex = currentIndex;
    // if (this.nextIndex === -1) {
    //   this.updateNextIndex();
    // }
    this.setToolMode(Type.Draw);
    this.onChange();
  }

  onClick(e: Konva.KonvaEventObject<MouseEvent>) {
    if (!this.object) return;
    if (!this.view.editor.editable) return;
    const stage = this.view.stage;
    this.clickType = e.evt.button;
    if (this.clickType !== 0 && this.clickType !== 2) return;
    if (this.clickType === 2 && this.view.getAction('zoom-move')?.dragging) return;

    const target = e.target as Circle;

    // 绘制模式
    if (this.opType === Type.Draw && this.nextIndex >= 0) {
      const stagePos = stage.getRelativePointerPosition() as Vector2;
      const valid = this.isValid(stagePos);
      if (!valid) {
        this.view.editor.showMsg('warning', 'Invalid Position');
        return;
      }

      this.drawObjectToMainview();
      this.onChangeBefore({ type: 'anchor', anchors: [this.nextIndex] });
      const point = this.object.getRelativePointerPosition() as Vector2;
      this.addPoint(point);
      this.onChange();

      if (this.nextIndex < 0) {
        this.autoCompleteDraw();
      }
    } else if (this.opType === Type.Edit && target instanceof Circle) {
      // 编辑模式
      const index = this.object.points.findIndex((e) => e === target);
      this.currentIndex = index;
      // this.onChange();
    }
  }
  // 自动完成绘制
  autoCompleteDraw() {
    const { skeletonConfig } = this.view.editor.state.config;
    if (skeletonConfig.creation) {
      // 绘制完成,但不退出,需要继续进行标注
      this.view.editor.showMsg('success', 'Completed');
      if (this.mode === Type.Edit) {
        this.stopCurrentDraw(true);
        this.view.enableDraw(ToolName.skeleton);
      } else {
        this.stopCurrentDraw(false);
        this.resetDraw();
      }
    } else {
      // 绘制完成,退出绘制工具,进入编辑状态
      this.stopCurrentDraw(true);
      this.view.editor.selectObject(this.object);
    }
  }
  drawObjectToMainview() {
    if (this.isOnDraw) return;
    this.onDraw(this.object);
    this.view.editor.selectObject(this.object);
    this.isOnDraw = true;
    this.object.editable = true;
  }

  setToolMode(type: Type) {
    this.opType = type;
    const isEdit = type === Type.Edit;
    const canEdit = type !== Type.Tool;
    this.switchViewEvent(isEdit);

    const cursor = this.cursorMap[type] || this.cursor;
    this.view.cursor = cursor;
    this.view.setCursor(cursor);

    if (this.object) {
      const draggable = canEdit;
      this.object.points.forEach((e) => e.setAttrs({ draggable }));
    }
  }
  // 切换外部stage/renderLayer的事件开关
  switchViewEvent(state: boolean) {
    // this.view.renderLayer.listening(state);
    const action = this.view.getAction('select-hover') as SelectHoverAction;
    if (action) {
      action.selectFlag = state;
      action.hoverFlag = state
        ? () => true
        : (e) => e.object && e.object.uuid === this.object?.uuid;
    }
  }

  addPoint(point: Vector2) {
    const curAnchor = this.object.points[this.nextIndex];
    if (!curAnchor) return;
    curAnchor.setAttrs({
      ...point,
      valid: true,
    });
    const classConfig = this.view.editor.getClassType(this.object.userData.classId);
    const { pointList = [], tagList = [] } = classConfig?.getToolOptions()?.skeletonConfig || {};
    const idx = this.clickType === 0 ? 0 : 1;
    const tag = tagList[idx];
    if (tag) {
      const fill =
        idx == 0 ? pointList[this.nextIndex]?.color || this.classConfig?.color : tag.color;
      curAnchor.setAttrs({ fill });
      curAnchor.userData.tagId = tag.id;
      curAnchor.userData.tag = tag.attribute;
      curAnchor.userData.tagColor = fill;
    }
    this.object.onPointChange();
    this.currentIndex = this.nextIndex;
    this.updateNextIndex();
    this.updateCurrentAnchor();
  }

  createSkeletonData(classConfig: IClassType) {
    const { pointList, lineList, tagList } = (classConfig as IClassTypeItem).getToolOptions()
      .skeletonConfig;
    const defaultTag = tagList[0];
    // let indexMap = new Map<string, number>();
    const points = this.object.points;
    const edges = this.object.edges;
    while (points.length > pointList.length) {
      const point = points.pop();
      point?.destroy();
    }

    while (edges.length > lineList.length) {
      const edge = edges.pop();
      edge?.destroy();
    }

    const pointListIndex = {} as any;
    pointList.forEach((e: any, index: any) => {
      pointListIndex[e.uuid] = index;
    });

    // add
    while (points.length < pointList.length) {
      const anchor = new Circle({ valid: false });
      points.push(anchor);
    }

    while (edges.length < lineList.length) {
      const edge = new SkeletonEdge(undefined as any, undefined as any);
      edges.push(edge);
    }

    // update data
    points.forEach((anchor, index) => {
      const fill = pointList[index]?.color || this.classConfig?.color;
      anchor.setAttrs({ fill });
      anchor.userData.index = index;
      anchor.userData.tagId = defaultTag.id;
      anchor.userData.tag = defaultTag.attribute;
      anchor.userData.tagColor = fill;
      anchor.object = this.object;
      anchor.defaultStyle = skeletonAnchorStates.default;
      anchor.stateStyles = skeletonAnchorStates;
    });

    // 更新边的source target
    lineList.forEach((e: any, index: number) => {
      const ids = e.relationIds;
      const sourceIndex = pointListIndex[ids[0]];
      const targetIndex = pointListIndex[ids[1]];
      const edge = edges[index];
      edge.source = points[sourceIndex];
      edge.target = points[targetIndex];
      edge.setAttrs({
        stroke: e.color || classConfig.color,
        fill: e.color || classConfig.color,
        // showPointer: e.showPointer,
      });
      edge.object = this.object;
    });

    this.object.onPointChange();
  }

  updateNextIndex() {
    // if (!this.object) return;
    const object = this.object;

    const indexArr = object.points.map((e, index) => index);
    let newIndexArr = [] as number[];
    if (this.currentIndex < 0) {
      newIndexArr = indexArr;
    } else {
      newIndexArr = [
        ...indexArr.slice(this.currentIndex + 1),
        ...indexArr.slice(0, this.currentIndex),
      ];
    }

    const nextIndex = newIndexArr.find((index) => !object.points[index].attrs.valid);
    this.nextIndex = nextIndex === undefined ? -1 : nextIndex;
    // console.log('nextIndex', this.nextIndex);
  }

  toggleSkeletonDrag(draggable: boolean) {
    const object = this.object;
    if (!object) return;

    // object.setAttrs({ draggable: draggable });
    const root = this.view.getRoot(ToolModelEnum.INSTANCE);
    root?.allObjects?.forEach((e) => e.setAttrs({ draggable: draggable }));
    object.pointsGroup.children?.forEach((e) => {
      e.setAttrs({ draggable: !draggable });
    });
  }

  initEditEvent() {
    hotkeys.deleteScope('skeleton-tool');
    hotkeys.setScope('skeleton-tool');
    hotkeys('*', 'skeleton-tool', (event, handler) => {
      if (subKeys.indexOf(event.key) >= 0) {
        // console.log('sub hotkey', event.key);
        const index = +event.key;
        this.emit<SkeletonEvent>('hotKey', index);
      }
    });
    this.onDeleteObject = this.onDeleteObject.bind(this);
    this.view.editor.on(Event.ANNOTATE_REMOVE, this.onDeleteObject);

    // TODO
    setTimeout(() => {
      this.view.stage.on('click', this.onClick);
    });
    this.initObjectEvent();
  }

  initObjectEvent() {
    if (!this.object) return;

    this.object.pointsGroup.on('dragstart', (e: Konva.KonvaEventObject<MouseEvent>) => {
      this.editing = true;
      this.onChangeBefore({ type: 'anchor', anchors: [e.target.index] });
    });
    this.object.pointsGroup.on('dragmove', (e: Konva.KonvaEventObject<MouseEvent>) => {
      // console.log('dragmove');
      this.editing = true;
      if (this.object) {
        this.object._clearCache('boundRect');
      }
      // this.onChange();
    });
    this.object.pointsGroup.on('dragend', (e: Konva.KonvaEventObject<MouseEvent>) => {
      this.editing = false;
    });
    this.toggleSkeletonDrag(false);
  }

  clearEditEvent() {
    this.view.stage.off('click', this.onClick);
    // this.view.editor.off(Event.ANNOTATE_REMOVE, this.onDeleteObject);
    hotkeys.deleteScope('skeleton-tool');
    this.clearObjectEvent();
  }

  clearObjectEvent() {
    if (!this.object) return;
    // console.log('clearObjectEvent');
    this.object.pointsGroup.off('dragstart');
    this.object.pointsGroup.off('dragmove');
    this.object.pointsGroup.off('dragend');
    this.toggleSkeletonDrag(true);
  }
  onDeleteObject(objects: AnnotateObject[]) {
    if (!this.object || !this.isOnDraw || this.mode === Type.Edit) return;
    const obj = this.view.editor.dataManager.getObject(this.object.uuid);
    if (obj) return;
    this.resetDraw();
    // this.view.editor.actionManager.execute('drawTool', ToolName.skeleton);
  }

  // 等分点集合, 曲线曲率
  createDivideObject(pointsIndex: number[], tension: number = 0.5) {
    this.clearTool();
    const tool = this.view.getShapeTool('spline-curve') as SplineCurveTool;
    if (!tool) return;

    this.drawTool = tool;
    this.lastType = this.opType;
    this.setToolMode(Type.Tool);

    try {
      tool.tension = tension;
      tool.draw();
      tool.assignConfig(this.drawConfig);
    } catch (error) {
      console.error(error);
    }

    tool.off('object' as ToolEvent);
    tool.on('object' as ToolEvent, (object) => {
      if (!this.isOnDraw) this.drawObjectToMainview();
      this.setToolMode(this.lastType);

      (tool as any).off('object' as ToolEvent);
      this.clearTool();
      this.onChangeBefore({ type: 'anchor', anchors: pointsIndex });

      this.divideCurve(object, pointsIndex);
      this.adjustmentData(object, pointsIndex);

      this.currentIndex = pointsIndex[pointsIndex.length - 1];
      // 下一个点已经绘制了，更新nextIndex
      if (this.nextIndex >= 0 && this.object?.points[this.nextIndex].attrs.valid) {
        this.updateNextIndex();
      }
      this.onChange();
    });
  }

  divideCurve(curve: SplineCurve, pointsIndex: number[]) {
    if (!this.object) return;
    const points = this.object.points;
    const n = Math.max(2, pointsIndex.length);

    const existPoints = [] as number[];
    const skeletonAbPos = this.object.getAbsolutePosition(this.view.stage);
    // console.log({ skeletonAbPos }, curve.position());

    // 更新curve的position和skeleton一样，方便后面计算分割，不用转换坐标了
    const curvePoints = curve.attrs.points;
    curvePoints.forEach((e) => {
      e.x -= skeletonAbPos.x;
      e.y -= skeletonAbPos.y;
    });
    curve.setAttrs({ points: curvePoints });
    curve.position(skeletonAbPos);

    pointsIndex.forEach((pIndex, index) => {
      const v = index / (n - 1);
      const pos = curve.getPoint(v);
      const anchor = points[pIndex];
      if (anchor.attrs.valid) existPoints.push(pIndex + 1);
      anchor.setAttrs({ ...pos, percent: v, valid: true });
    });

    // Tip: The positions of Keypoints 1, 4, 5 have been adjusted
    if (existPoints.length > 0) {
      this.view.editor.showMsg(
        'warning',
        `The positions of Keypoints ${existPoints.join(',')} have been adjusted`,
      );
    }
    this.object.onPointChange();
  }

  adjustmentData(curve: SplineCurve, pointsIndex: number[], max = 300, varianceLimit = 0.00001) {
    if (!this.object) return;
    const object = this.object;
    const points = pointsIndex.map((index) => object.points[index]);

    let variance = calculateVar(getDistances(points));
    let count = 1;
    while (count <= max && variance > varianceLimit) {
      adjustmentPoints(points, curve);
      variance = calculateVar(getDistances(points));
      // console.log('count:', count, 'variance:', variance);
      count++;
    }
    console.timeEnd('data');
  }
}

function calculateVar(data: number[]) {
  const total = data.reduce((a, b) => a + b, 0);
  const avg = total / data.length;

  const totalVar = data.reduce((pre, v) => Math.pow(v - avg, 2) + pre, 0);
  return totalVar / avg;
}

function getDistances(points: Circle[]) {
  const lengths = [] as number[];
  points.forEach((e, index) => {
    if (index === 0) return;
    const len = utils.distance(points[index - 1].position(), e.position());
    lengths.push(len);
  });
  return lengths;
}

function adjustmentPoints(points: Circle[], curve: SplineCurve) {
  const distances = getDistances(points);
  const total = distances.reduce((a, b) => a + b, 0);
  const avg = total / distances.length;

  for (let i = 1; i <= points.length - 2; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];
    const p3 = points[i + 1];
    const percent1 = p1.attrs.percent || 0;
    const percent2 = p2.attrs.percent || 0;
    const percent3 = p3.attrs.percent || 0;

    const dis1 = utils.distance(p1.position(), p2.position());
    const dis2 = utils.distance(p3.position(), p2.position());

    let newPer1 = utils.rescaleTo(0, dis1, percent1, percent2, avg);
    newPer1 = Math.max(0, Math.min(1, newPer1));

    let newPer2 = utils.rescaleTo(0, dis2, percent3, percent2, avg);
    newPer2 = Math.max(0, Math.min(1, newPer2));
    const newPer = (newPer1 + newPer2) / 2;

    const newPos = curve.getPoint(newPer);
    p2.setAttrs({ ...newPos, percent: newPer });
  }

  // console.log('var:', calculateVar(this.getDistances()));
}
