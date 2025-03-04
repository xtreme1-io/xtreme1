import {
  AnnotateObject,
  IFrame,
  IUserData,
  IPointsData,
  ISourceDataBase,
  ToolModelEnum,
  TrackDirEnum,
} from '../types';
import Editor from '../Editor';
import { IShapeConfig } from '../ImageView/type';
import { GroupObject, ShapeRoot, Rect, Polygon, MaskShape, Skeleton } from '../ImageView/export';
import Event from '../config/event';
import { utils, Const, defaultMaskColor, __UNSERIES__ } from '..';
import { IMaskShapeConfig } from '../ImageView/shape/MaskShape';
import { t } from '@/lang';
import { ToolTypeEnum } from '@basicai/tool-components';

export default class DataManager {
  editor: Editor;
  // scene
  sceneMap: Map<string, IFrame[]> = new Map();
  // object
  private dataMap: Map<string, ShapeRoot> = new Map();
  // hasMap: Map<string, Map<string, AnnotateObject>> = new Map();
  constructor(editor: Editor) {
    this.editor = editor;
  }
  getDataMap() {
    return this.dataMap;
  }
  /**
   * scene
   */
  setSceneData(data: IFrame[]) {
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
  getFramesBySceneId(id?: string) {
    id = id || __UNSERIES__;
    return this.sceneMap.get(id + '') || [];
  }
  clearSceneMap() {
    this.sceneMap.clear();
  }

  // getRootKey(id: string, type: ToolModelEnum) {
  //   return `${id}#${type}`;
  // }

  hasObject(uuid: string, frame?: IFrame): boolean {
    return !!this.getObject(uuid, frame);
  }

  getObject(uuid: string, frame?: IFrame) {
    frame = frame || this.editor.getCurrentFrame();
    const root_ins = this.getFrameRoot(frame.id, ToolModelEnum.INSTANCE);
    const root_seg = this.getFrameRoot(frame.id, ToolModelEnum.SEGMENTATION);
    return root_ins?.hasMap.get(uuid) || root_seg?.hasMap.get(uuid);
  }

  setFrameRoot(frameId: string, roots: ShapeRoot | ShapeRoot[]) {
    if (!Array.isArray(roots)) roots = [roots];
    roots.forEach((root) => {
      const key = utils.formatId([frameId, root.type]);
      this.getDataMap().set(key, root);
    });
  }

  getFrameRoot(frameId?: string, type?: ToolModelEnum) {
    type = type || this.editor.state.imageToolMode;
    frameId = frameId || this.editor.getCurrentFrame()?.id || '';
    const key = utils.formatId([frameId, type]);
    return this.getDataMap().get(key) as ShapeRoot;
  }

  /**
   * @param frameId 帧id
   * @param type 实例 / 分割
   */
  getFrameObject(frameId: string, type?: ToolModelEnum, filter?: boolean) {
    type = type || this.editor.state.imageToolMode;
    const root = this.getFrameRoot(frameId, type);
    if (!root) return undefined;
    if (filter) return root.children.filter((e) => root.renderFilter(e));
    return root.children;
  }

  // 获取所有的对象
  getFrameAllObject(frameId: string) {
    const obj: AnnotateObject[] = [];
    this.editor.state.ToolModeList.forEach((type) => {
      const root = this.getFrameRoot(frameId, type);
      obj.push(...root.hasMap.values());
    });
    return obj;
  }
  // 获取指定帧集下所有object(包含实例与分割)
  getFramesObject() {
    const list: AnnotateObject[] = [];
    Array.from(this.dataMap.values()).forEach((root) => {
      root.allObjects.forEach((obj) => {
        obj.userData.annotationType = root.type;
        list.push(obj);
      });
    });
    return list;
  }

  getFrameSourceObject(sourceId: string, frame?: IFrame) {
    frame = frame || this.editor.getCurrentFrame();
    let objects = this.getFrameObject(frame.id) || [];
    objects = objects.filter((e) => {
      const userData = this.editor.getUserData(e);
      const id = userData.sourceId || '-1';
      return id === sourceId;
    });
    return objects;
  }
  // 获取当前帧的当前源的数据
  getCurrentSourceData(frame: IFrame): ISourceDataBase | undefined {
    return undefined;
  }

  /**
   * 将 objects 从 from 组移到 into 组的 index 位置
   * @param objects 需要操作的objects
   * @param indexs 与objects一一对应
   * @param into 目标组(可选, 无值表示从某个组里移出)
   * @param from 移出组(可选, 无值表示添加到某个组里)
   */
  moveObjectIndex(
    objects: AnnotateObject[] | AnnotateObject,
    indexs: number | number[] = Infinity,
    into?: GroupObject,
    from?: GroupObject,
  ) {
    if (!Array.isArray(objects)) objects = [objects];
    const idxArr = Array.isArray(indexs) ? indexs : [indexs];

    const changeGroupMap: any = {};
    if (from) {
      from.removeObject(objects, true);
      changeGroupMap[from.uuid] = from;
    }
    if (into) {
      into.addObject(objects, indexs);
      changeGroupMap[into.uuid] = into;
    } else {
      objects.forEach((e, i) => {
        const root = this.getFrameRoot(e.frame.id, e.annotateType);
        root.addObjects(e, idxArr[i]);
      });
    }

    this.onAnnotatesChange(objects, 'positionIndex');
    const changeGroups = Object.keys(changeGroupMap).map((id) => changeGroupMap[id]);
    if (changeGroups.length > 0) {
      this.onAnnotatesChange(changeGroups, 'group');
    }
  }

  addAnnotates(objects: AnnotateObject[] | AnnotateObject, frame?: IFrame) {
    if (!Array.isArray(objects)) objects = [objects];
    frame = frame || this.editor.getCurrentFrame();
    const rootIns = this.getFrameRoot(frame.id, ToolModelEnum.INSTANCE);
    const rootSeg = this.getFrameRoot(frame.id, ToolModelEnum.SEGMENTATION);
    const addIns: AnnotateObject[] = [];
    const addSeg: AnnotateObject[] = [];
    objects.forEach((e) => {
      if (e.toolType == ToolTypeEnum.MASK) {
        addSeg.push(e);
      } else {
        addIns.push(e);
      }
    });
    rootIns?.addObjects(addIns);
    rootSeg?.addObjects(addSeg);
    this.onAnnotatesAdd(objects, frame);
    if (frame.id === this.editor.getCurrentFrame().id) {
      this.updateObjectByUserData(objects);
    }
  }

  /**
   * 删除objects, 并且进行组关系解耦, 如果删除的是组结果, 不会删除组内元素
   */
  removeAnnotates(objects: AnnotateObject[] | AnnotateObject, frame?: IFrame) {
    if (!Array.isArray(objects)) objects = [objects];
    frame = frame || this.editor.getCurrentFrame();

    const rootIns = this.getFrameRoot(frame.id, ToolModelEnum.INSTANCE);
    const rootSeg = this.getFrameRoot(frame.id, ToolModelEnum.SEGMENTATION);
    if (objects.length === 0) return;

    // remove
    const selectionMap = this.editor.selectionMap;
    const changeGroupMap: any = {};
    let delFlag = false;
    const removeIns: AnnotateObject[] = [];
    const removeSeg: AnnotateObject[] = [];
    objects.forEach((e) => {
      if (e.toolType == ToolTypeEnum.MASK) {
        removeSeg.push(e);
      } else {
        removeIns.push(e);
      }
      if (selectionMap[e.uuid]) {
        delFlag = true;
        delete selectionMap[e.uuid];
      }
      if (e.groups?.length > 0) e.groups.forEach((g) => (changeGroupMap[g.uuid] = g));
    });
    if (delFlag) this.updateSelect();

    rootIns?.removeObjects(removeIns);
    rootSeg?.removeObjects(removeSeg);
    this.onAnnotatesRemove(objects, frame);
    const changeGroups = Object.keys(changeGroupMap).map((id) => changeGroupMap[id]);
    if (changeGroups.length > 0) {
      this.onAnnotatesChange(changeGroups, 'group');
    }
  }

  setAnnotatesVisible(
    objects: AnnotateObject | AnnotateObject[],
    data: boolean | boolean[],
    changeChildren: boolean = true,
  ) {
    let visibleObjs = Array.isArray(objects) ? objects : [objects];
    visibleObjs = visibleObjs.filter((e) => !e._deleted);
    if (visibleObjs.length === 0) return;
    if (changeChildren) {
      let allChildren: AnnotateObject[] = [];
      visibleObjs.forEach((e) => {
        if (e.member.length > 0) {
          allChildren = allChildren.concat(e.member);
        }
      });
      visibleObjs = visibleObjs.concat(allChildren);
    }
    const attrs: IShapeConfig[] = [];
    visibleObjs.forEach((obj, index) => {
      let visible = typeof data === 'boolean' ? data : data[index];
      if (typeof visible !== 'boolean') visible = (data as boolean[])[0];
      obj.showVisible = visible;
      attrs.push({ visible });
    });
    visibleObjs
      .filter((e) => e.isGroup() && e.showVisible)
      .forEach((e) => {
        e.onPointChange();
      });

    this.editor.emit(Event.ANNOTATE_VISIBLE, visibleObjs);
  }

  setAnnotatesAttrs(
    objects: AnnotateObject | AnnotateObject[],
    attrs: IShapeConfig | IShapeConfig[],
  ) {
    if (!Array.isArray(objects)) objects = [objects];

    objects.forEach((obj, index) => {
      const attr = Array.isArray(attrs) ? attrs[index] : attrs;
      obj.setAttrs(attr);
    });

    this.onAnnotatesChange(objects, 'attrs', attrs);
  }

  setAnnotatesUserData(objects: AnnotateObject[] | AnnotateObject, datas: IUserData | IUserData[]) {
    if (!Array.isArray(objects)) objects = [objects];

    objects.forEach((obj, index) => {
      const data = Array.isArray(datas) ? datas[index] : datas;
      Object.assign(obj.userData, data);
    });

    // this.editor.mainView.draw();
    this.updateObjectByUserData(objects);
    this.editor.mainView.updateToolStyleByClass();

    this.editor.emit(Event.ANNOTATE_USER_DATA, objects, datas);
    this.onAnnotatesChange(objects, 'userData', datas);
  }

  setAnnotatesTransform(
    objects: AnnotateObject[] | AnnotateObject,
    datas: IPointsData | IPointsData[],
  ) {
    if (!Array.isArray(objects)) objects = [objects];

    objects.forEach((obj, index) => {
      const data = Array.isArray(datas) ? datas[index] : datas;
      obj.setAttrs(data);
      obj.updateGroup();
      // 骨骼点 点编辑撤回包围框更新
      if (obj.object instanceof Skeleton) {
        obj.object.onPointChange();
      }
    });

    this.editor.emit(Event.ANNOTATE_TRANSFORM, objects, datas);
    this.onAnnotatesChange(objects, 'transform', datas);
  }
  setMaskChange(objects: MaskShape[] | MaskShape, datas: IMaskShapeConfig | IMaskShapeConfig[]) {
    if (!Array.isArray(objects)) objects = [objects];

    objects.forEach((obj, index) => {
      const data = Array.isArray(datas) ? datas[index] : datas;
      obj.updateConfig(data);
    });
    this.editor.mainView.draw();
    this.onAnnotatesChange(objects, 'other', datas);
  }

  onAnnotatesChange(
    objects: AnnotateObject[],
    type?: 'userData' | 'transform' | 'attrs' | 'group' | 'positionIndex' | 'other',
    data?: any,
  ) {
    objects.forEach((obj) => {
      const frame = obj.frame || obj.object?.frame;
      if (frame) frame.needSave = true;
      obj.userData.resultStatus = Const.True_Value;
    });
    this.editor.emit(Event.ANNOTATE_CHANGE, objects, type, data);
  }

  onAnnotatesAdd(objects: AnnotateObject[], frame?: IFrame) {
    frame = frame || this.editor.getCurrentFrame();
    frame.needSave = true;
    this.editor.emit(Event.ANNOTATE_ADD, objects, frame);
  }

  onAnnotatesRemove(objects: AnnotateObject[], frame?: IFrame) {
    frame = frame || this.editor.getCurrentFrame();
    frame.needSave = true;
    // console.log('onAnnotatesRemove', { objects, frame });

    this.editor.emit(Event.ANNOTATE_REMOVE, objects, frame);
  }

  updateSelect() {
    const { selection, selectionMap } = this.editor;
    const filterSelection = selection.filter((e) => selectionMap[e.uuid]);
    this.editor.selectObject(filterSelection);
  }

  updateObjectByUserData(objects: AnnotateObject | AnnotateObject[]) {
    if (!Array.isArray(objects)) objects = [objects];
    objects.forEach((object) => {
      const userData = this.editor.getUserData(object);
      const classConfig = this.editor.getClassType(userData.classId || '');
      let config: IShapeConfig = {
        stroke: classConfig?.color || this.editor.state.config.defaultResultColor || '#fff',
      };
      if (object instanceof MaskShape) {
        config = { fill: classConfig ? classConfig.color : defaultMaskColor };
      }
      object.setAttrs(config);
      this.editor.mainView.setState(object, {});
    });
  }

  updateFrameId(frameId: string) {}

  /**
   * 序列帧相关
   */
  copyForward() {
    const trackStrategy = this.editor.state.config.trackStrategy;
    return this.track({
      direction: TrackDirEnum.FORWARD,
      object: 'select',
      method: 'copy',
      frameN: 1,
      strategy: trackStrategy,
    });
  }
  copyBackWard() {
    const trackStrategy = this.editor.state.config.trackStrategy;
    return this.track({
      direction: TrackDirEnum.BACKWARD,
      object: 'select',
      method: 'copy',
      frameN: 1,
      strategy: trackStrategy,
    });
  }
  async track(option: {
    method: 'copy' | number; //  'copy'方式或者模型的id
    object: 'select' | 'all';
    direction: TrackDirEnum;
    frameN: number | number[];
    strategy?: Const[];
  }) {
    const editor = this.editor;
    const { frameIndex, frames } = editor.state;
    const curId = frames[frameIndex].id;
    const preTrackIds = Array.from(new Set(editor.selection.map((e) => e.userData.trackId)));
    const getToDataId = () => {
      const ids = [] as string[];
      const forward = option.direction === 'FORWARD' ? 1 : -1;
      const frameN = option.frameN;
      if (typeof frameN == 'number' && frameN > 0) {
        for (let i = 1; i <= frameN; i++) {
          const frame = frames[frameIndex + forward * i];
          if (frame) {
            ids.push(frame.id);
          }
        }
      } else if (Array.isArray(frameN)) {
        const validFrameN = frameN.filter((n) => typeof n == 'number' && n >= 0);
        if (validFrameN.length == 1) {
          const frame = frames[validFrameN[0]];
          if (frame && frameIndex !== validFrameN[0]) {
            ids.push(frame.id);
          }
        } else if (validFrameN.length >= 2) {
          for (let i = frameN[0]; i <= frameN[1]; i++) {
            const frame = frames[i];
            if (frame && frameIndex !== i) {
              ids.push(frame.id);
            }
          }
        }
      }
      return ids;
    };
    const ids = getToDataId();
    if (ids.length === 0) {
      return;
    }

    const getObjects = () => {
      const root = this.getFrameRoot(curId);
      let objects: AnnotateObject[] = root.allObjects;
      if (option.object == 'select') {
        objects = editor.selection;
        objects.forEach((o) => {
          if (o.isGroup()) {
            objects.push(...o.member);
          }
        });
      }
      objects = Array.from(new Set(objects.filter((e) => root.renderFilter(e))));
      return objects;
    };

    let objects = getObjects();
    // 模型只支持 Rect Polygon
    if (option.method !== 'copy') {
      objects = objects.filter((e) => e instanceof Rect || e instanceof Polygon);
    }

    if (objects.length === 0) {
      editor.showMsg('warning', t('image.track-no-source'));
      return;
    }
    let modelName = '';
    if (option.method !== 'copy') {
      const model = editor.getModelById(option.method);
      modelName = model?.name || '';
    }
    const data = { ...option, modelName };
    this.editor.emit(Event.MODEL_RUN_TRACK, data);
    const startTm = Date.now();
    const strategy = option.strategy || [];
    if (strategy.length > 0) {
      let slotStatusText = t('common.slotStatusAll');
      const slotObjText =
        option.object == 'select' ? t('common.slotObjSelect') : t('common.slotObjAll');
      const slotFrameText =
        option.direction == TrackDirEnum.BACKWARD
          ? t('common.slotFramePre')
          : t('common.slotFrameNext');
      if (strategy.length == 1) {
        if (strategy.includes(Const.True_Value)) {
          slotStatusText = t('common.slotStatusTruths');
        } else if (strategy.includes(Const.Predicted)) {
          slotStatusText = t('common.slotStatusPredictions');
        }
      }
      const frameNText: any = option.frameN;
      let subTitle = t('common.msgOverwriteObjects', {
        slotObj: slotObjText,
        slotStatus: slotStatusText,
        slotFrame: slotFrameText,
        n: frameNText,
      });
      if (Array.isArray(option.frameN)) {
        const validFrameN = option.frameN
          .filter((n) => typeof n == 'number' && n >= 0)
          .map((n) => n + 1);
        if (validFrameN.length == 1) {
          subTitle = t('common.msgOverwriteFrameObjects', {
            slotObj: slotObjText,
            slotStatus: slotStatusText,
            n: validFrameN[0],
          });
        } else if (validFrameN.length == 2) {
          subTitle = t('common.msgOverwriteObjects', {
            slotObj: slotObjText,
            slotStatus: slotStatusText,
            n: validFrameN.join('-'),
          });
        }
      }
      const confirm = await editor
        .showConfirm({
          title: t('common.titleOverwriteResults'),
          subTitle: subTitle,
          okText: t('common.btnOverwriteAndTrack'),
          cancelText: t('image.cancel'),
        })
        .then(
          () => true,
          () => false,
        );
      if (!confirm) return;
    }
    if (option.method === 'copy') {
      utils.copyData(editor, curId, ids, objects, option.strategy);
      editor.showMsg('success', t('image.copy-ok'));
      await this.gotoNext(ids[ids.length - 1]);
    } else {
      await this.modelTrack(ids, objects, option.direction, option.method, option.strategy);
    }
    const nextSelectObjects: AnnotateObject[] = [];
    preTrackIds.forEach((trackId) => {
      nextSelectObjects.push(...this.editor.trackManager.getObjectByTrackId(trackId));
    });
    this.editor.selectObject(nextSelectObjects);
    const modelTm = Date.now() - startTm;
    this.editor.emit(Event.MODEL_RUN_TRACK_SUCCESS, { time: modelTm });
  }
  async gotoNext(dataId: string) {
    const { frames } = this.editor.state;
    const index = frames.findIndex((e) => e.id === dataId);
    if (index < 0) return;
    await this.editor.loadFrame(index);
    // this.editor.dispatchEvent({ type: EditorEvent.UPDATE_TIME_LINE });
  }
  setModelTrackData(frameIds: string[], trackData: AnnotateObject[][], strategy: Const[]) {
    // 将模型跑出来的数据copy到对应的帧上
    utils.copyDataByTrackModel(this.editor, '', frameIds, trackData, strategy);
    trackData.forEach((objs) => {
      this.updateObjectByUserData(objs);
    });
  }
  async modelTrack(
    toIds: string[],
    objects: AnnotateObject[],
    direction: TrackDirEnum,
    modelId: number,
    strategy: Const[] = [],
  ) {}
}
