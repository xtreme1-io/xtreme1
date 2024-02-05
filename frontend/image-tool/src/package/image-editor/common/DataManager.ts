import {
  IFrame,
  AnnotateModeEnum,
  AnnotateObject,
  Const,
  ITransform,
  IObjectSource,
  IShapeConfig,
  IUserData,
  ModelCodeEnum,
  MsgType,
} from '../types';
import * as utils from '../utils';
import * as _utils from '../ImageView/utils';
import Editor from '../Editor';
import { Event } from '../configs';
import { ShapeRoot } from '../ImageView';
import { __UNSERIES__ } from '..';

export default class DataManager {
  editor: Editor;
  // Multi series frames; seriesFrame is named scene
  sceneMap: Map<string, IFrame[]> = new Map();
  sceneId: string = __UNSERIES__;
  // annotations container map
  dataMap: Map<string, ShapeRoot> = new Map();
  // annotations source map
  sourceMap: Record<string, IObjectSource[]> = {};

  constructor(editor: Editor) {
    this.editor = editor;
  }
  /**
   * Scene
   */
  setSceneDataByFrames(data: IFrame[]) {
    this.clearSceneMap();
    data.forEach((e) => {
      const key = e.sceneId ? String(e.sceneId) : __UNSERIES__;
      let arr = this.sceneMap.get(key);
      if (!arr) {
        arr = [];
        this.sceneMap.set(key, arr);
      }
      arr.push(e);
    });
  }
  getFramesBySceneIndex(index: number) {
    const arr = Array.from(this.sceneMap.values());
    return arr[index] || [];
  }
  getFramesBySceneId(id: string) {
    return this.sceneMap.get(id + '') || [];
  }
  clearSceneMap() {
    this.sceneMap.clear();
  }
  /**
   * source
   */
  setSources(frame: IFrame, data: IObjectSource[]) {
    this.sourceMap[String(frame.id)] = data;
  }
  getSources(frame: IFrame) {
    return this.sourceMap[String(frame.id)];
  }
  clearSource(frame?: IFrame) {
    if (frame) {
      delete this.sourceMap[String(frame.id)];
    } else {
      this.sourceMap = {};
    }
  }

  /**
   * annotations
   */
  // set roots
  setFrameRoot(frameId: string, roots: ShapeRoot | ShapeRoot[]) {
    if (!Array.isArray(roots)) roots = [roots];
    roots.forEach((root) => {
      const key = utils.formatId(frameId, root.type);
      this.dataMap.set(key, root);
    });
  }
  getFrameRoot(frameId?: string, type?: AnnotateModeEnum) {
    type = type || this.editor.state.annotateMode;
    frameId = frameId || this.editor.getCurrentFrame()?.id || '';
    const key = utils.formatId(frameId, type);
    return this.dataMap.get(key) as ShapeRoot;
  }
  hasObject(uuid: string, frame?: IFrame) {
    return !!this.getObject(uuid, frame);
  }
  // get specific annotation
  getObject(uuid: string, frame?: IFrame) {
    frame = frame || this.editor.getCurrentFrame();
    const root_ins = this.getFrameRoot(frame.id, AnnotateModeEnum.INSTANCE);
    const root_seg = this.getFrameRoot(frame.id, AnnotateModeEnum.SEGMENTATION);
    return root_ins?.hasMap.get(uuid) || root_seg?.hasMap.get(uuid);
  }
  // get frame annotations
  getFrameObject(frameId: string, type?: AnnotateModeEnum) {
    type = type || this.editor.state.annotateMode;
    const root = this.getFrameRoot(frameId, type);
    return root ? root.children : undefined;
  }
  addAnnotates(objects: AnnotateObject[] | AnnotateObject, frame?: IFrame) {
    if (!Array.isArray(objects)) objects = [objects];
    frame = frame || this.editor.getCurrentFrame();
    const root = this.getFrameRoot(frame.id);
    if (!root) return;

    root.addObjects(objects);
    this.onAnnotatesAdd(objects, frame);
  }
  removeAnnotates(objects: AnnotateObject[] | AnnotateObject, frame?: IFrame) {
    if (!Array.isArray(objects)) objects = [objects];
    frame = frame || this.editor.getCurrentFrame();
    const root = this.getFrameRoot(frame.id);
    if (!root) return;
    const removeMap = {} as Record<string, boolean>;
    const selectionMap = this.editor.selectionMap;
    let delFlag = false;
    _utils.traverse(objects, (e) => {
      removeMap[e.uuid] = true;
      if (selectionMap[e.uuid]) {
        delFlag = true;
        delete selectionMap[e.uuid];
      }
    });
    if (delFlag) this.editor.updateSelect();
    root.removeObjects(objects);
    this.onAnnotatesRemove(objects, frame);
  }
  setAnnotatesTransform(
    objects: AnnotateObject[] | AnnotateObject,
    datas: ITransform | ITransform[],
  ) {
    if (!Array.isArray(objects)) objects = [objects];

    objects.forEach((obj, index) => {
      const data = Array.isArray(datas) ? datas[index] : datas;
      obj.setAttrs(data);
    });

    this.editor.emit(Event.ANNOTATE_TRANSFORM, objects, datas);
    this.onAnnotatesChange(objects, 'transform', datas);
  }
  onAnnotatesAdd(objects: AnnotateObject[], frame?: IFrame) {
    frame = frame || this.editor.getCurrentFrame();
    frame.needSave = true;

    this.editor.emit(Event.ANNOTATE_ADD, objects, frame);
  }
  onAnnotatesChange(
    objects: AnnotateObject[],
    type?: 'userData' | 'transform' | 'attrs' | 'group' | 'positionIndex' | 'other',
    data?: any,
  ) {
    objects.forEach((obj) => {
      const frame = obj.frame;
      if (frame) frame.needSave = true;
      obj.userData.resultStatus = Const.True_Value;
    });
    this.editor.emit(Event.ANNOTATE_CHANGE, objects, type, data);
  }
  onAnnotatesRemove(objects: AnnotateObject[], frame?: IFrame) {
    frame = frame || this.editor.getCurrentFrame();
    frame.needSave = true;

    this.editor.emit(Event.ANNOTATE_REMOVE, objects, frame);
  }
  setAnnotatesUserData(objects: AnnotateObject[] | AnnotateObject, datas: IUserData | IUserData[]) {
    if (!Array.isArray(objects)) objects = [objects];

    objects.forEach((obj, index) => {
      const data = Array.isArray(datas) ? datas[index] : datas;
      Object.assign(obj.userData, data);
    });
    this.editor.mainView.updateObjectByUserData(objects);
    this.editor.mainView.updateToolStyleByClass();

    this.editor.emit(Event.ANNOTATE_USER_DATA, objects, datas);
    this.onAnnotatesChange(objects, 'userData', datas);
  }
  setAnnotatesVisible(objects: AnnotateObject | AnnotateObject[], data: boolean | boolean[]) {
    let visibleObjs = Array.isArray(objects) ? objects : [objects];
    if (visibleObjs.length === 0) return;
    const attrs: IShapeConfig[] = [];
    visibleObjs.forEach((obj, index) => {
      let visible = typeof data === 'boolean' ? data : data[index];
      if (typeof visible !== 'boolean') visible = (data as boolean[])[0];
      obj.showVisible = visible;
      attrs.push({ visible });
    });

    this.editor.emit(Event.ANNOTATE_VISIBLE, visibleObjs);
  }

  /**
   * scene
   */
  copyForward() {
    return this.track({
      direction: 'FORWARD',
      object: this.editor.selection.length > 0 ? 'select' : 'all',
      method: 'copy',
      frameN: 1,
    });
  }
  copyBackWard() {
    return this.track({
      direction: 'BACKWARD',
      object: this.editor.selection.length > 0 ? 'select' : 'all',
      method: 'copy',
      frameN: 1,
    });
  }
  async track(option: {
    method: 'copy' | ModelCodeEnum;
    object: 'select' | 'all';
    direction: 'BACKWARD' | 'FORWARD';
    frameN: number;
  }) {
    const editor = this.editor;
    const { frameIndex, frames } = editor.state;
    const curId = frames[frameIndex].id;

    const getToDataId = () => {
      const ids = [] as string[];
      const forward = option.direction === 'FORWARD' ? 1 : -1;
      const frameN = option.frameN;
      if (frameN <= 0) return ids;
      for (let i = 1; i <= frameN; i++) {
        const frame = frames[frameIndex + forward * i];
        if (frame) ids.push(frame.id);
      }
      return ids;
    };
    const ids = getToDataId();
    if (ids.length === 0) return;

    const getObjects = () => {
      let objects: AnnotateObject[] = [];
      if (option.object === 'all') {
        const root = this.getFrameRoot(curId);
        objects = root.allObjects.filter((e) => root.renderFilter(e));
      } else {
        editor.selection.forEach((e) => {
          objects.push(e);
        });
      }
      return objects;
    };

    let objects = getObjects();

    if (objects.length === 0) {
      editor.showMsg(MsgType.warning, editor.lang('track-no-source'));
      return;
    }
    const data = { ...option };
    this.editor.emit(Event.MODEL_RUN_TRACK, data);
    const startTm = Date.now();
    utils.copyData(editor, curId, ids, objects);
    editor.showMsg(MsgType.success, editor.lang('copy-ok'));
    this.gotoNext(ids[0]);
    const modelTm = Date.now() - startTm;
    this.editor.emit(Event.MODEL_RUN_TRACK_SUCCESS, { time: modelTm });
  }
  gotoNext(dataId: string) {
    const { frames } = this.editor.state;
    const index = frames.findIndex((e) => e.id === dataId);
    if (index < 0) return;
    this.editor.loadFrame(index);
  }

  /**
   * clear
   */
  clear(frame?: IFrame) {
    if (frame) {
      this.dataMap.delete(utils.formatId(frame.id, AnnotateModeEnum.INSTANCE));
      delete this.sourceMap[frame.id];
    } else {
      this.dataMap.clear();
      this.clearSource();
    }
  }
}
