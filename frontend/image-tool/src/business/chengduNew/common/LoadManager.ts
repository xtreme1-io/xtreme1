import Editor from './Editor';
import * as api from '../api';
import {
  LoadManager as BaseLoadManager,
  IFrame,
  AnnotateObject,
  ShapeRoot,
  utils as baseUtils,
  __ALL__ as ALL,
  BSError,
  IValidity,
  ToolModelEnum,
  Event as EditorEvent,
  __UNSERIES__,
} from 'image-editor';
import { SourceType, IObject } from '../type';
import * as utils from '../utils';
import { dataFlowSource } from './Editor';
import Event from '../config/event';
import { CommentWrongType, ICommentTag } from '../config/comment';
import { t } from '@/lang';
import { historyStore } from '../stores';

export default class LoadManager extends BaseLoadManager {
  declare editor: Editor;
  constructor(editor: Editor) {
    super(editor);
  }

  // 每一帧的加载逻辑
  async loadFrameData(frame: IFrame) {
    const { bsState } = this.editor;
    this.editor.clearResource({ clearComment: false });
    await this.loadFrameSource(frame);
    if (bsState.isTaskFlow) {
      await this.loadWorkflow(frame);
      if (!this.editor.state.isSeriesFrame) await this.loadComment([frame]);
    } else {
      await this.loadDataFlow(frame);
    }
    await this.loadResource();
  }

  // 连续帧一次性加载完数据
  async loadAllFrameData() {
    const { state, bsState } = this.editor;

    if (bsState.isTaskFlow) {
      await this.loadWorkflow(state.frames);
      await this.loadComment(state.frames);
    } else {
      await this.loadDataFlow(state.frames);
    }
  }
  /**
   * 加载scene
   * 单帧数据为一个 id 是 __UNSERIES__ 的 scene
   * @param index 需要加载的 scene index
   * @param frameIdx 加载的数据 data index
   */
  async loadSceneData(index: number, frameIdx: number = 0) {
    this.editor.showLoading(true);
    const { bsState, state } = this.editor;
    this.editor.selectObject();
    this.editor.clearResource({ clearComment: bsState.isTaskFlow, resetBgRotation: true });
    state.sceneIndex = index;
    state.sceneId = state.sceneIds[index] || __UNSERIES__;
    if (bsState.isTaskFlow) await this.loadTaskFlowSceneData();
    else await this.loadDataFlowSceneData();

    if (this.editor.state.isSeriesFrame) {
      await this.loadAllFrameData();
    }
    await this.editor.loadFrame(frameIdx, false, true);

    this.updateFramesCounter();
    this.editor.showLoading(false);
    this.editor.emit(Event.SCENE_LOADED);
  }
  /**
   * 加载数据流 scene data
   * @param initFrameIdx 初始帧的索引序号
   */
  async loadDataFlowSceneData(frameIdx: number = 0) {
    const id = this.editor.state.sceneId;
    const sceneFrames = this.editor.dataManager.getFramesBySceneId(id);
    if (sceneFrames.length === 0) return;
    this.editor.setFrames(sceneFrames);
    await this.loadFrameSource(sceneFrames[frameIdx]);
    // await this.loadAllFrameData();
    // await this.editor.loadFrame(initFrameIdx, false, true);
  }
  // 加载任务流连续帧sceneData
  async loadTaskFlowSceneData() {
    const { bsState, state } = this.editor;
    const ids = await api.getTaskSceneData(bsState.taskId, state.sceneId);
    if (ids.length === 0) throw new BSError('', t('image.no-data'));
    this.editor.setFrameFromIds(ids);
    // await this.loadAllFrameData();
    // await this.editor.loadFrame(0, false, true);
  }

  updateTrack(objects: IObject[]) {
    const { globalTrack } = utils.getTrackInfo(objects, this.editor);

    Object.keys(globalTrack).forEach((trackId) => {
      this.editor.trackManager.addTrackObject(trackId, globalTrack[trackId]);
    });
  }

  // 加载source 列表
  async loadFrameSource(frame?: IFrame) {
    const { state, bsState } = this.editor;
    const datasetId = bsState.datasetId;
    frame = frame || this.editor.getCurrentFrame();
    const dataId = frame.id;

    const sourceData = this.editor.dataManager.getSources(frame);
    if (sourceData) return;

    // 任务流source
    if (bsState.isTaskFlow) {
      const source = [{ ...dataFlowSource }];
      this.editor.dataManager.setSources(frame, source);
      return;
    }

    const resultSource = await api.getResultSourcesApi({
      datasetId: datasetId,
      dataId: dataId,
    });

    const sourceList = [...resultSource.groundTruth, ...resultSource.model];
    // 连续帧只需要加载一次
    if (state.isSeriesFrame) {
      state.frames.forEach((frame) => {
        this.editor.dataManager.setSources(frame, sourceList);
      });
    } else {
      this.editor.dataManager.setSources(frame, sourceList);
    }
  }

  // 加载数据流
  async loadDataFlow(frames: IFrame | IFrame[]) {
    if (!Array.isArray(frames)) frames = [frames];
    const { state, bsState } = this.editor;

    const loadFrames = frames.filter((frame) => {
      return !this.editor.dataManager.getFrameObject(frame.id);
    });
    if (loadFrames.length === 0) return;

    // 拉取结果信息
    const dataIds = loadFrames.map((e) => e.id);
    const frameDatas = await api.getDataflowAnnotationApi({
      datasetId: bsState.datasetId,
      dataIds,
    });

    // init source
    frameDatas.forEach((item) => {
      const sourceId =
        (item.sourceType as any) === SourceType.DATA_FLOW
          ? state.config.defaultSourceId
          : item.sourceId;

      // 设置 标注数据
      item.sourceId = sourceId;
      item.objects?.forEach((obj) => {
        obj.sourceId = sourceId;
        obj.sourceType = item.sourceType;
      });
      item.segments?.forEach((obj) => {
        obj.sourceId = sourceId;
        obj.sourceType = item.sourceType;
      });
    });

    if (state.isSeriesFrame) {
      const allObjects = [] as IObject[];
      frameDatas.forEach((e) => {
        allObjects.push(...(e.objects || []));
        allObjects.push(...(e.segments || []));
      });
      this.updateTrack(allObjects);
    }

    // 赋值
    const dataMap: any = {};
    frameDatas.forEach((e) => (dataMap[`${e.dataId}#${e.sourceId}`] = e));
    for (let l = 0; l < loadFrames.length; l++) {
      const frame = loadFrames[l];
      const dataId = frame.id;
      const sources = this.editor.dataManager.getSources(frame) || [];
      const root_ins = new ShapeRoot({ frame, type: ToolModelEnum.INSTANCE });
      const root_seg = new ShapeRoot({ frame, type: ToolModelEnum.SEGMENTATION });
      this.editor.dataManager.setFrameRoot(frame.id, [root_ins, root_seg]);
      for (let i = 0; i < sources.length; i++) {
        const e = sources[i];
        const key = `${dataId}#${e.sourceId}`;
        const item = dataMap[key];
        if (!item) frame.needSave = true;

        const sourceId = e.sourceId;
        // sourceId为-1是需要特殊处理
        if (!item && sourceId !== state.config.defaultSourceId) return;

        const classificationValues = item && item.classifications ? item.classifications : [];
        const validity = item && item.validity ? item.validity : IValidity.VALID;
        const sourceType = item && item.sourceType ? item.sourceType : SourceType.DATA_FLOW;

        const annotates_ins = utils.convertObject2Annotate(item, this.editor);
        root_ins.addObjects(annotates_ins);
        const annotates_seg = await utils.getSegmentAnnotates(item, this.editor);
        root_seg.addObjects(annotates_seg);

        const { newClassifications, oldClassifications } = utils.copyClassificationValues(
          bsState.classifications,
          classificationValues,
          !item,
        );

        this.editor.dataManager.setSourceData(frame, sourceId, {
          id: sourceId,
          type: sourceType as any,
          validity: validity as any,
          classifications: newClassifications,
          oldClassifications,
        });
      }

      this.updateFrameIdInfo(dataId);
    }
    this.editor.emit(EditorEvent.ANNOTATIONS_LOADED, dataIds);
  }

  // 加载任务流
  async loadWorkflow(frames: IFrame | IFrame[]) {
    if (!Array.isArray(frames)) frames = [frames];

    const { bsState, state } = this.editor;
    // const frame = this.editor.getCurrentFrame();

    const loadFrames = frames.filter((frame) => {
      return !this.editor.dataManager.getFrameObject(frame.id);
    });
    if (loadFrames.length === 0) return;

    const dataIds = loadFrames.map((e) => e.id);
    const frameDatas = await api.getWorkflowAnnotationApi({
      taskId: bsState.taskId as string,
      dataIds,
    });

    if (state.isSeriesFrame) {
      const allObjects = [] as IObject[];
      frameDatas.forEach((e) => {
        allObjects.push(...(e.objects || []));
        allObjects.push(...(e.segments || []));
      });
      this.updateTrack(allObjects);
    }

    const dataMap: any = {};
    frameDatas.forEach((e) => (dataMap[e.dataId] = e));
    for (let i = 0; i < loadFrames.length; i++) {
      const frame = loadFrames[i];
      const dataId = frame.id;
      const item = dataMap[dataId];
      if (item) {
        item.sourceId = '-1';
        item.sourceType = SourceType.DATA_FLOW;
      } else {
        frame.needSave = true;
      }

      const classificationValues = item?.classifications || [];
      const validity = item?.validity || bsState.task?.dataDefaultValidity || IValidity.VALID;

      const annotates_ins = utils.convertObject2Annotate(item, this.editor);
      const annotates_seg = await utils.getSegmentAnnotates(item, this.editor);

      // shape root
      const root_ins = new ShapeRoot({ frame, type: ToolModelEnum.INSTANCE });
      const root_seg = new ShapeRoot({ frame, type: ToolModelEnum.SEGMENTATION });
      root_ins.addObjects(annotates_ins);
      root_seg.addObjects(annotates_seg);
      this.editor.dataManager.setFrameRoot(frame.id, [root_ins, root_seg]);

      this.updateFrameIdInfo(frame.id);

      const { newClassifications, oldClassifications } = utils.copyClassificationValues(
        bsState.classifications,
        classificationValues,
        !item,
      );

      this.editor.dataManager.setSourceData(frame, '-1', {
        id: '-1',
        type: SourceType.DATA_FLOW,
        validity: validity,
        classifications: newClassifications,
        oldClassifications,
      });
    }
    historyStore().updateCurrentSnapshot(loadFrames);
    this.editor.emit(EditorEvent.ANNOTATIONS_LOADED, dataIds);
  }

  /**
   * 任务流程
   */
  // 加载评论列表
  async loadComment(frames: IFrame[], force = false) {
    if (!this.editor.bsState.isTaskFlow) return;
    const taskId = this.editor.bsState.taskId;
    frames = force
      ? frames
      : frames.filter((f) => !this.editor.dataManager.getCommentsByFrameId(f.id));
    const frameIds = frames.map((frame) => frame.id);
    if (frameIds.length > 0) {
      try {
        await this.loadCommentTypes();
        const res = await api.getComment({
          dataIds: frameIds,
          taskId,
          stageId: this.editor.bsState.stage.id,
        });
        const comments = utils.convertComment2Annotate(res, this.editor);
        this.editor.dataManager.setComments(comments, frameIds);
      } catch (error: any) {
        this.editor.handleErr(error, t('image.load-comment-error'));
      }
    }

    this.editor.emit(Event.UPDATE_COMMENTS);
  }
  /** 加载评论类型 */
  async loadCommentTypes() {
    if (this.editor.dataManager.commentTypes.length > 0) return;
    const modeList = this.editor.state.ToolModeList;
    const { commentTypeIds } = this.editor.bsState.task;
    const mode = modeList.join(',');
    const levelMap: Record<any, number> = {
      HIGH: 0,
      MEDIUM: 1,
      LOW: 2,
    };
    const sortArr: ICommentTag[][] = [[], [], []];
    let types = (await api.getCommentTypes(mode)) as ICommentTag[];
    types.forEach((t) => {
      if (commentTypeIds.indexOf(t.entityId) === -1) return;
      const arr = sortArr[levelMap[t.severity as any]] || [];
      t.wrongType === CommentWrongType.MISS ? arr.unshift(t) : arr.push(t);
    });
    types = [...sortArr[0], ...sortArr[1], ...sortArr[2]];
    this.editor.dataManager.setCommentTypes(types);
  }

  getRenderFilter() {
    const { bsState, state } = this.editor;
    let currentSource = this.editor.bsState.currentSource;
    const activeSource = this.editor.bsState.activeSource;

    currentSource = currentSource + '';
    const curToolModel = state.imageToolMode;

    // source
    const sourceMap: any = {};
    activeSource.forEach((s) => {
      sourceMap[s] = true;
    });

    // class
    const classMap: any = {};
    bsState.filterClasses.forEach((e) => {
      classMap[e] = true;
    });

    const toolTypeMap: any = {};
    bsState.filterTools.forEach((e) => {
      toolTypeMap[e] = true;
    });

    return (e: AnnotateObject) => {
      const userData = this.editor.getUserData(e);
      const sourceId = userData.sourceId || '-1';
      const classId = userData.classId || '';
      const toolType = e.toolType;
      const objAnnotationTypes = baseUtils.Tooltype2Toolmode(toolType);

      const validMode = objAnnotationTypes.includes(curToolModel);

      let validSource = false;
      if (objAnnotationTypes.includes(ToolModelEnum.SEGMENTATION)) {
        // 分割只显示当前source, 多来源不同时显示
        validSource = sourceId == currentSource;
      } else {
        validSource = sourceMap[ALL] || sourceMap[sourceId];
      }
      // 某一个 source下生效, 一下条件只针对当前source下的结果
      const validClass = sourceId !== currentSource || classMap[ALL] || classMap[classId];
      const validTool = sourceId !== currentSource || toolTypeMap[ALL] || toolTypeMap[toolType];

      return !!(validSource && ((validClass && validTool) || !validMode));
    };
  }
}
