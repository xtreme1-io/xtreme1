import { ICommentItem, ICommentType } from '@/business/chengduNew/type';
import { useInjectBSEditor } from '../../context';
import { reactive, StyleValue } from 'vue';
import {
  Event as EditorEvent,
  Vector2,
  Shape,
  ToolModelEnum,
  Konva,
  Skeleton,
  Circle,
} from 'image-editor';
import Event from '../../config/event';
import CommentTool from './CommentTool';
import * as api from '../../api';
import Comment from './Comment.vue';
import {
  CommentTypeColor,
  CommentTabType,
  CommentSeverity,
  CommentObjectType,
} from '../../config/comment';
import { t } from '@/lang';

interface ICommentTag {
  position?: Vector2;
  objectId?: string;
  annotationType: ToolModelEnum;
  msg: string;
  canvasX: number;
  canvasY: number;
  typeTxt?: string;
  commentItem?: ICommentItem;
  attributes?: any;
  classId?: string;
}

export default function useInteractive() {
  const editor = useInjectBSEditor();
  const commentState = editor.bsState.commentState;
  let tool = {} as CommentTool;
  const iState = reactive({
    tags: [] as ICommentTag[],
  });

  editor.on(EditorEvent.INIT, () => {
    init();
  });

  function init() {
    tool = new CommentTool(editor.mainView);
    editor.mainView.setShapeTool('comment', tool);

    // register Modal
    editor.registerModal('comment', Comment);
    editor.on(EditorEvent.DRAW, updateCanvasPos);
    editor.on(EditorEvent.FRAME_CHANGE, drawCommentData);
    editor.on(EditorEvent.BEFORE_FRAME_CHANGE, () => {
      iState.tags = [];
    });
    editor.on(Event.DELETE_COMMENT, deleteComments);
    editor.on(Event.UPDATE_COMMENT_VIEW, drawCommentData);
    editor.on(Event.FOCUS_COMMENT, focusComment);

    tool.on('click', onClick);
  }

  const transform = new Konva.Transform();
  function updateCanvasPos() {
    iState.tags.forEach((e) => {
      transformTagPos(e);
    });
  }
  function transformTagPos(tag: ICommentTag) {
    const { position, objectId } = tag;
    const stage = editor.mainView.stage;
    const stageTrans = stage.getAbsoluteTransform();
    let object,
      usePosition = true;
    if (objectId) object = editor.dataManager.getObject(objectId);
    const { commentTabType, pointIndex } = tag.attributes || {};

    if (object && commentTabType === CommentTabType.point) {
      const anchor = (object as Skeleton).points[pointIndex];
      if (anchor) {
        usePosition = false;
        const anchorPos = anchor.position();
        const objTrans = object.getAbsoluteTransform();
        objTrans.copyInto(transform);
        transform.translate(anchorPos.x, anchorPos.y);
      }
    }
    if (position && usePosition) {
      stageTrans.copyInto(transform);
      transform.translate(position.x, position.y);
    }
    const pos = transform.getTranslation();
    tag.canvasX = pos.x;
    tag.canvasY = pos.y;
  }

  function onClick(point: Vector2, target: Shape) {
    const object = (target && target.object) || target;
    const type = object
      ? target.object && target instanceof Circle
        ? CommentTabType.point
        : CommentTabType.object
      : CommentTabType.empty;
    editor
      .showModal('comment', {
        title: t('image.Comment'),
        data: { type },
        maskClosable: false,
      })
      .then(async (data) => {
        const isPoint = data.commentObject === CommentTabType.point;
        const tag: ICommentTag = {
          position: point,
          objectId: object?.uuid || undefined,
          classId: object?.userData?.classId || '',
          annotationType: editor.state.imageToolMode,
          msg: data.comment,
          canvasX: 0,
          canvasY: 0,
          typeTxt: getLabelText(data.type),
          attributes: {
            commentObjectType: isPoint ? CommentObjectType.POINT : CommentObjectType.OBJECT,
            pointIndex: isPoint ? target.index : undefined,
          },
        };
        transformTagPos(tag);
        tag.commentItem = await createComment(tag, data);
        onCommentDomClick(tag);
        iState.tags.push(tag);
      })
      .catch((error) => {
        console.error('create comment', error);
      });
  }

  /**
   * 评论数据相关
   */
  // 创建评论
  async function createComment(tag: ICommentTag, data: any) {
    // editor.showLoading(true);
    try {
      const frame = editor.getCurrentFrame();
      const { task, sampleId } = editor.bsState;
      const { sceneId } = editor.state;
      const param = {
        sceneId: editor.state.isSeriesFrame ? sceneId : undefined,
        dataId: frame.id,
        position: tag.position,
        objectId: tag.objectId || undefined,
        annotationType: tag.annotationType,
        types: data.types,
        classId: data.classId || tag.classId || undefined,
        content: tag.msg,
        taskId: task.id,
        sampleId,
        fileType: 'IMAGE',
        attributes: tag.attributes,
      };
      const item = await api.createComment(param);
      editor.dataManager.getCommentsByFrameId(frame.id)?.push(item);
      editor.emit(Event.UPDATE_COMMENTS);
      editor.showLoading(false);
      return item;
    } catch (error) {
      editor.handleErr(error);
      editor.showLoading(false);
      return undefined;
    }
  }
  // 删除评论
  function deleteComments(ids: string[]) {
    for (let i = 0; i < iState.tags.length; i++) {
      const comment = iState.tags[i].commentItem;
      if (ids.includes(String(comment?.id))) {
        iState.tags.splice(i, 1);
        i--;
      }
    }
  }
  // 聚焦评论
  function focusComment(item: ICommentItem) {
    const tag = iState.tags.find((comment) => {
      return comment.commentItem?.id === item.id;
    });
    const stagePos = editor.mainView.stage.position();
    const containerRect = editor.mainView.container.getBoundingClientRect();
    const centerX = (containerRect.left + containerRect.width) / 2;
    const centerY = (containerRect.top + containerRect.height) / 2;
    const offsetX = (tag?.canvasX || 0) - centerX;
    const offsetY = (tag?.canvasY || 0) - centerY;
    stagePos.x -= offsetX;
    stagePos.y -= offsetY;
    editor.mainView.focusView(stagePos);
  }
  // 将评论数据ICommentItem转为ICommentTag来绘制
  function drawCommentData() {
    iState.tags = [];
    const frame = editor.getCurrentFrame();
    if (!frame) return;
    const comments = editor.dataManager.getCommentsByFrameId(frame.id) || [];
    if (comments.length === 0) return;
    comments.forEach((item: ICommentItem) => {
      iState.tags.push({
        position: Array.isArray(item.position) ? item.position[0] : item.position,
        objectId: item.objectId || undefined,
        msg: item.content,
        canvasX: 0,
        canvasY: 0,
        typeTxt: getLabelText(item.types),
        commentItem: item,
        annotationType: item.annotationType,
        attributes: item.attributes,
      });
    });
    updateCanvasPos();
  }
  function getLabelText(types?: ICommentType[]): string {
    if (!types) return '';
    const typeTexts = types.map((item) => {
      return item.name;
    });
    let txt = typeTexts.join(' & ');
    if (txt.length > 20) txt = txt.slice(0, 20) + '...';
    return txt;
  }
  function getTagStyle(item: ICommentTag): StyleValue {
    const tagColor = getCommentTypeColor(item.commentItem?.types);
    const isActive = commentState.activeKey.includes(String(item.commentItem?.id));
    const styleObj = {
      left: item.canvasX + 'px',
      top: item.canvasY + 'px',
      backgroundColor: isActive ? tagColor : '#fff',
      color: isActive ? '#fff' : tagColor,
      'z-index': isActive ? 1 : 0,
    };
    return styleObj;
  }
  function getCommentTypeColor(types?: ICommentType[]): string {
    const colors = ['', '', ''];
    (types || []).forEach((t) => {
      switch (t.severity) {
        case CommentSeverity.high:
          colors[0] = CommentTypeColor.HIGH;
          break;
        case CommentSeverity.medium:
          colors[1] = CommentTypeColor.MEDIUM;
          break;
        case CommentSeverity.low:
          colors[2] = CommentTypeColor.LOW;
          break;
      }
    });
    return colors[0] || colors[1] || colors[2];
  }
  // 点击评论dom, 选中评论dom comment: ICommentItem
  function onCommentDomClick(item: ICommentTag) {
    if (item.annotationType != editor.state.imageToolMode) {
      editor.actionManager.execute('changeToolMode', item.annotationType);
    }
    commentState.activeKey = [String(item.commentItem?.id)];
    item.commentItem?.objectId &&
      editor.selectObject(editor.dataManager.getObject(item.commentItem.objectId) as any);
  }
  // 双击回复评论
  function onCommentDBClick(item: ICommentTag) {
    if (item.annotationType != editor.state.imageToolMode) {
      editor.actionManager.execute('changeToolMode', item.annotationType);
    }
    editor.emit(Event.REPLY_COMMENT, item.commentItem);
  }

  return {
    iState,
    getTagStyle,
    onCommentDomClick,
    onCommentDBClick,
  };
}
