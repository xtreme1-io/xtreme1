import Editor from './Editor';
import * as api from '../api';
import * as utils from '../utils/index';
import { ISourceData, IResultSource, IObject, ICommentItem, ITaskData } from '../type';
import {
  DataManager as BaseDataManager,
  IFrame,
  LoadStatus,
  IModelRunningState,
  AnnotateObject,
  Rect,
  Polygon,
  GroupObject,
  Event,
  Const,
  TrackDirEnum,
} from 'image-editor';
import BsEvent from '../config/event';
import { CommentSeverity, CommentTypeColor, ICommentTag } from '../config/comment';
import { t } from '@/lang';
import { historyStore } from '../stores';

export default class DataManager extends BaseDataManager {
  declare editor: Editor;
  sourceData: Record<string, Record<string, ISourceData>> = {};
  sources: Record<string, IResultSource[]> = {};
  commentMap: Record<string, ICommentItem[]> = {}; // key: frameId, value: commentList
  commentTypes: ICommentTag[] = [];
  taskDataMap: Map<string, ITaskData> = new Map();

  constructor(editor: Editor) {
    super(editor);
    this.editor = editor;
  }
  getDataMap() {
    if (this.editor.state.isHistoryView) {
      return historyStore()._dataMap;
    }
    return super.getDataMap();
  }
  clear(frame?: IFrame) {
    if (frame) {
      this.getDataMap().delete(frame.id);
      // this.hasMap.delete(frame.id);
      delete this.sourceData[frame.id];
      delete this.sources[frame.id];
      delete this.commentMap[frame.id];
      this.editor.modelManager.removeModelResult(frame.id);
    } else {
      this.getDataMap().clear();
      // this.hasMap.clear();
      this.sourceData = {};
      this.sources = {};
      this.commentMap = {};
      this.editor.modelManager.clearModelData();
    }
  }

  onAnnotatesChange(
    objects: AnnotateObject[],
    type?: 'userData' | 'transform' | 'attrs' | 'group' | 'positionIndex' | 'other',
    data?: any,
  ) {
    // console.log('business-onAnnotatesChange', objects, type, data);
    this.countPerformance(objects, type, data);
    super.onAnnotatesChange(objects, type, data);
  }
  // 计算绩效
  countPerformance(
    objects: AnnotateObject[],
    type?: 'userData' | 'transform' | 'attrs' | 'group' | 'positionIndex' | 'other',
    data?: any,
  ) {
    // 结果移出组或者移入组, 只计算组的绩效, 不计算结果绩效
    if (type === 'positionIndex') return;
    // 组的transform操作, 计算组内结果的绩效, 不计算组本身的绩效
    if (type === 'transform') {
      let objectArr: AnnotateObject[] = [];
      objects.forEach((e) => {
        if (e.isGroup()) {
          const group = e as GroupObject;
          if (group.member.length > 0) objectArr = objectArr.concat(group.member);
        } else objectArr.push(e);
        if (e.object) {
          objectArr.push(e.object);
        }
      });
      objects = objectArr;
    }
    // console.log('计算绩效', type, objects, data);
    objects.forEach((object) => {
      object.updateTime = Date.now();
    });
  }

  onAnnotatesAdd(objects: AnnotateObject[], frame?: IFrame | undefined): void {
    const { user } = this.editor.bsState;

    // console.log('onAnnotatesAdd', objects);
    super.onAnnotatesAdd(objects, frame);

    // 绩效统计
    if (user.id) {
      objects.forEach((object) => {
        if (!object.createdAt) {
          object.lastTime = Date.now();
          object.updateTime = object.lastTime;
          object.createdAt = utils.formatTimeUTC(object.lastTime);
        }
        if (!object.createdBy) {
          object.createdBy = user.id;
        }
      });
    }
  }

  setSources(frame: IFrame, data: IResultSource[]) {
    this.sources[frame.id] = data;
  }

  getSources(frame: IFrame) {
    return this.sources[frame?.id];
  }

  setSourceData(frame: IFrame, sourceId: string, data: ISourceData) {
    this.sourceData[frame.id] = this.sourceData[frame.id] || {};
    this.sourceData[frame.id][sourceId] = data;
  }

  getSourceData(frame: IFrame, sourceId: string) {
    if (frame && this.sourceData[frame.id]) {
      return this.sourceData[frame.id][sourceId];
    }
    return undefined;
  }

  getCurrentSourceData(frame: IFrame) {
    const sourceId = this.editor.bsState.currentSource;
    if (this.sourceData[frame.id]) {
      return this.sourceData[frame.id][sourceId];
    }
    return undefined;
  }

  getAllSourceData(frame: IFrame) {
    return this.sourceData[frame.id];
  }

  /**
   * comment 评论相关的数据
   */
  // 所有评论
  getAllComments(): ICommentItem[] {
    let commentList: ICommentItem[] = [];
    Object.values(this.commentMap).forEach((comments) => {
      commentList = commentList.concat(comments);
    });
    return commentList;
  }
  // 当前帧的评论
  getCommentsByFrameId(frameid: string | number) {
    const key = String(frameid);
    const list = this.commentMap[key];
    return list;
  }
  setComments(objects: ICommentItem[], frameIds?: string[]) {
    frameIds?.forEach((id) => {
      this.commentMap[String(id)] = [];
    });
    if (!objects || objects.length === 0) return;
    objects.forEach((comment) => {
      comment.resolvable = comment.resolvable === true;
      const key = String(comment.dataId);
      let comments = this.commentMap[key];
      if (!comments) {
        comments = [];
        this.commentMap[key] = comments;
      }
      comments.push(comment);
    });
  }
  setCommentTypes(data: ICommentTag[]) {
    this.commentTypes = [];
    this.commentTypes = data.map((e) => {
      return {
        ...e,
        color: CommentTypeColor[e.severity || CommentSeverity.high],
      };
    });
  }
  getInitCommentMap() {
    this.clearAllCommentMap();
    const frames = this.editor.state.frames;
    frames.forEach((frame) => {
      this.commentMap[frame.id] = [];
    });
  }
  resolveCommentBatch(frameid: string | number) {
    const list = this.getCommentsByFrameId(frameid);
    list?.forEach((item: ICommentItem) => {
      item.isResolved = true;
    });
  }
  resolveComment(frameid: string | number, commentId: string | number, result: boolean) {
    const list = this.getCommentsByFrameId(frameid);
    list?.forEach((item: ICommentItem) => {
      if (item.id === commentId) {
        item.isResolved = result;
        return;
      }
    });
  }
  resolveComments(comments: ICommentItem[]) {
    comments.forEach((e) => (e.isResolved = true));
  }
  removeComment(frameid: string | number, commentId: string | number) {
    const list = this.getCommentsByFrameId(frameid) || [];
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (item.id === commentId) {
        list.splice(i, 1);
        break;
      }
    }
    this.editor.emit(BsEvent.DELETE_COMMENT, [String(commentId)]);
    this.editor.emit(Event.DRAW);
  }
  addReplyComment(frameid: string | number, replyItem: ICommentItem) {
    const list = this.getCommentsByFrameId(frameid);
    list?.forEach((item: ICommentItem) => {
      if (item.id === replyItem.parentId) {
        if (item.replies) item.replies.push(replyItem);
        else item.replies = [replyItem];
        return;
      }
    });
  }
  clearCommentsByFrameId(frameid: string | number) {
    delete this.commentMap[String(frameid)];
  }
  clearAllCommentMap() {
    this.commentMap = {};
  }
  /** task data status info */
  setTaskDataInfo(data: ITaskData[]) {
    this.taskDataMap.clear();
    if (!data || data.length === 0) return;
    data.forEach((e) => {
      this.taskDataMap.set(e.itemId + '', e);
    });
  }
  getTaskData(id: string | number) {
    return this.taskDataMap.get(id + '');
  }

  async pollDataModelResult() {
    const editor = this.editor;
    const { state } = this.editor;
    const modelMap = {} as Record<string, IFrame[]>;

    state.frames.forEach((frame) => {
      if (frame.model && frame.model.state !== LoadStatus.COMPLETE) {
        const id = frame.model.recordId;
        modelMap[id] = modelMap[id] || [];
        modelMap[id].push(frame);
      } else if (frame.modelRun) {
        const id = frame.modelRun;
        modelMap[id] = modelMap[id] || [];
        modelMap[id].push(frame);
      }
    });

    if (Object.keys(modelMap).length === 0) return;

    const requests = [] as Promise<any>[];
    Object.keys(modelMap).forEach((recordId) => {
      requests.push(createRequest(recordId, modelMap[recordId]));
    });

    await Promise.all(requests);

    setTimeout(this.pollDataModelResult.bind(this), 1000);

    function createRequest(recordId: string, dataList: IFrame[]) {
      const ids = dataList.map((e) => e.id);
      const request = api
        .getModelResult(ids, recordId)
        .then((data) => {
          // return;
          data = data.data || {};
          const resultList = data.modelDataResults;
          if (!resultList) return;

          const rspModel = editor.getModelById(data.modelId);
          if (!rspModel) return;
          const modelId = rspModel.id;
          const resultMap = {} as Record<string, any>;
          resultList.forEach((e: any) => {
            resultMap[e.dataId] = e;
          });

          const curFrame = editor.getCurrentFrame();
          dataList.forEach((frame) => {
            const info = resultMap[frame.id];
            const model = (frame.model ?? { id: modelId }) as IModelRunningState;
            if (info) {
              const modelResult = info.modelResult;
              if (modelResult.code !== 0) {
                frame.model = undefined;
                if (frame.id === curFrame.id) {
                  editor.showMsg('error', modelResult.message || 'Model Run Error');
                  if (editor.state.activeTool != '') editor.actionManager.execute('selectTool');
                }
                return;
              }
              const objects = (modelResult.objects || []) as IObject[];
              const segmentFileUrl = modelResult.segmentFileUrl;
              if (objects.length > 0) {
                // 更新状态
                model.state = LoadStatus.COMPLETE;
                editor.modelManager.setModelResult(frame.id, rspModel, { objects, modelId });
                frame.model = model;
              } else if (segmentFileUrl) {
                model.state = LoadStatus.COMPLETE;
                const segments = (modelResult.segments || []) as IObject[];
                editor.modelManager.setModelResult(frame.id, rspModel, {
                  segments,
                  segmentFileUrl,
                  modelId,
                });
                frame.model = model;
                editor.modelManager.loadedSAMFile(frame, rspModel);
              } else {
                frame.model = undefined;
                if (frame.id === curFrame.id) {
                  editor.showMsg('warning', `frame ${curFrame.id} has not model results`);
                }
              }
            } else {
              frame.model = undefined;
              if (frame.id === curFrame.id) {
                editor.showMsg('warning', `frame ${curFrame.id} has not model results`);
              }
            }
          });
        })
        .catch(() => {
          // clearInterval(timer);
        });

      return request;
    }
  }
  async modelTrack(
    toIds: string[],
    objects: AnnotateObject[],
    direction: TrackDirEnum,
    modelId: number,
    strategy: Const[],
  ) {
    const editor = this.editor;
    const { frameIndex, frames } = editor.state;
    const dataInfo = frames[frameIndex];
    const curId = dataInfo.id;

    const contourArr: any[] = [];
    // 模型追踪支持rect && polygon
    const filterObjects = objects.filter((obj) => {
      if (obj instanceof Rect) {
        contourArr.push(undefined);
        return true;
      } else if (obj instanceof Polygon) {
        const rect = obj.getBoundRect();
        const points = [
          { x: rect.x, y: rect.y },
          { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 },
          { x: rect.x + rect.width, y: rect.y + rect.height },
        ];
        contourArr.push({ points });
        return true;
      }
      return false;
    });
    if (filterObjects.length === 0) {
      editor.showMsg('warning', t('image.track-invalid'));
      return;
    }
    const targetObjects = utils.convertAnnotate2Object(filterObjects, editor);
    targetObjects.forEach((target, index) => {
      if (contourArr[index]) target.contour = contourArr[index];
    });

    this.runModelTrack(curId, toIds, direction as any, targetObjects, modelId, strategy, () => {
      this.gotoNext(toIds[0]);
    });
  }
  async runModelTrack(
    curId: string,
    toIds: string[],
    direction: TrackDirEnum,
    targetObjects: any[],
    modelId: number,
    strategy: Const[],
    onComplete?: () => void,
  ) {
    const editor = this.editor;
    const { frameIndex, frames } = this.editor.state;
    const { datasetId, taskId } = this.editor.bsState;
    const dataInfo = frames[frameIndex];
    const config = {
      datasetId: +datasetId,
      dataId: +dataInfo.id,
      direction,
      dataIds: toIds,
      taskId: taskId ? +taskId : undefined,
      modelId,
      imageTargetObjects: targetObjects,
    };
    editor.showLoading({ type: 'loading', content: t('image.load-track') });

    await api
      .runModelTrack(config)
      .then((result) => {
        const recordId = result.data as string;
        utils.pollModelTrack(
          recordId,
          (modelResults) => {
            if (modelResults.length === 0) {
              editor.showMsg('warning', t('image.track-no-data'));
            } else {
              const trackAnnotations: AnnotateObject[][] = [];
              modelResults.forEach((objects, index) => {
                const annotations = utils.convertObject2Annotate({ objects }, editor);
                trackAnnotations[index] = annotations;
              });
              this.setModelTrackData(toIds, trackAnnotations, strategy);
              editor.showMsg('success', t('image.track-ok'));
              onComplete && onComplete();
            }
            editor.showLoading(false);
          },
          (error: any) => {
            editor.showLoading(false);
            editor.showMsg('error', (error && error.message) || t('image.track-error'));
          },
        );
      })
      .catch((e: any) => {
        editor.showLoading(false);
        editor.showMsg('error', e.message || t('image.track-error'));
      });
  }
}
