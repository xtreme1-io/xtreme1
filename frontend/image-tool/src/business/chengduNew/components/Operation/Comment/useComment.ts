import { ICommentItem } from './../../../type';
import { onBeforeUnmount, nextTick } from 'vue';
import { debounce } from 'lodash';
import * as api from '@/business/chengduNew/api';
import { useInjectBSEditor } from '../../../context';
import Event from '../../../config/event';

import { message } from 'ant-design-vue';
import { IReplyParams } from '@/business/chengduNew/api/comment/typing';
import { CommentTabEnum } from '@/business/chengduNew/config/comment';
import { t } from '@/lang';
// import { CommentTabEnum } from '@/business/chengduNew/config/comment';

export default function useComment() {
  const editor = useInjectBSEditor();
  const { bsState } = editor;
  const { commentState } = bsState;
  const updateComment = debounce(() => {
    updateCommentList();
  }, 100);

  // *****life hook******
  onBeforeUnmount(() => {
    editor.off(Event.UPDATE_COMMENTS, updateComment);
  });
  editor.on(Event.UPDATE_COMMENTS, updateComment);

  const updateCommentList = () => {
    const comments = editor.dataManager.getAllComments();
    commentState.list = comments.filter((item: ICommentItem) => {
      const filterCondition = filterCommentVisible(item);
      const isShowByTab = commentState.activeTab === item.status;
      item.display = filterCondition && isShowByTab;
      return filterCondition;
    });
    commentState.commentNumber = commentState.list.length;
    editor.emit(Event.UPDATE_COMMENT_VIEW);
  };

  const updateLoading = (isLoading: boolean) => {
    commentState.loading = isLoading;
  };
  /** 解决所有评论 */
  const onResolveAll = async () => {
    updateLoading(true);
    try {
      const items = commentState.list.filter((e) => {
        const flag1 = e.status == commentState.activeTab;
        const flag2 = e.status == CommentTabEnum.FIXED ? e.resolvable : true;
        return flag1 && flag2;
      });
      if (items.length > 0) {
        const params: any = {
          taskId: bsState.task?.id,
          itemId: editor.getTaskFrameId(),
          stageId: bsState.stage.id,
          commentIds: items.map((e) => e.id),
        };
        if (commentState.activeTab === CommentTabEnum.OPEN) {
          await api.fixCommentBatch(params);
          editor.showMsg('success', t('image.successFixed'));
        } else if (commentState.activeTab === CommentTabEnum.FIXED) {
          await api.resolveCommentBatch(params);
          editor.showMsg('success', t('image.successResolved'));
        }
        await editor.loadManager.loadComment(editor.state.frames, true);
      }
    } catch (error: any) {
      message.error(error.message);
    }
    updateLoading(false);
  };
  /** 解决/取消解决 */
  const changeCommentState = async (data: ICommentItem, nextStep: boolean) => {
    updateLoading(true);
    try {
      let backData: any;
      switch (data.status) {
        case CommentTabEnum.OPEN:
          if (nextStep) {
            backData = await api.fixComment(data.id, bsState.stage.id, true);
            editor.showMsg('success', t('image.successFixed'));
          }
          break;
        case CommentTabEnum.FIXED:
          if (nextStep) {
            backData = await api.resolveComment(data.id, bsState.stage.id, true);
            editor.showMsg('success', t('image.successResolved'));
          } else {
            backData = await api.fixComment(data.id, bsState.stage.id, false);
            editor.showMsg('success', t('image.successRestored'));
          }
          break;
        case CommentTabEnum.RESOLVED:
          if (!nextStep) {
            backData = await api.resolveComment(data.id, bsState.stage.id, false);
            editor.showMsg('success', t('image.successRestored'));
          }
          break;
        default:
          break;
      }
      if (backData) {
        const {
          data: { resolvable = false, status },
        } = backData;
        data.status = status;
        data.resolvable = resolvable;
      }

      // await api.resolveComment(id, bsState.stage.id, status);
      // const frame = editor.getCurrentFrame();
      // editor.dataManager.resolveComment(frame.id, id, status);
      updateCommentList();
      updateLoading(false);
    } catch (error: any) {
      message.error(error.message);
      updateLoading(false);
    }
  };
  /** 删除评论 */
  const onRemoveComment = async (id: any) => {
    updateLoading(true);
    try {
      await api.deleteComment({
        taskId: bsState.task?.id,
        commentId: id,
      });
      const frame = editor.getCurrentFrame();
      editor.dataManager.removeComment(frame.id, id);
      updateCommentList();
      updateLoading(false);
    } catch (error: any) {
      message.error(error.message);
      updateLoading(false);
    }
  };
  /** 回复 */
  const onReply = async (params: IReplyParams) => {
    updateLoading(true);
    try {
      const res = await api.replyComment(params);
      const frame = editor.getCurrentFrame();
      editor.dataManager.addReplyComment(frame.id, res);
      updateCommentList();
      updateLoading(false);
      return res;
    } catch (error: any) {
      message.error(error.message);
      updateLoading(false);
    }
  };
  /** 点击选中 */
  const onCommentItemClick = async (item: ICommentItem) => {
    if (item.annotationType != editor.state.imageToolMode) {
      editor.actionManager.execute('changeToolMode', item.annotationType);
    }
    const curFrame = editor.getCurrentFrame();
    if (curFrame.id !== item.dataId) {
      let frameIdx = editor.getFrameIndex(String(item.dataId)) || 0;
      frameIdx = Math.min(editor.state.frames.length, frameIdx);
      await editor.loadFrame(frameIdx, true);
    }
    commentState.activeKey = [String(item.id)];
    editor.emit(Event.FOCUS_COMMENT, item);
    item.objectId && editor.selectObject(editor.dataManager.getObject(item.objectId) as any);
  };
  // 过滤评论列表, 检测单个评论是否显示
  function filterCommentVisible(item: ICommentItem): boolean {
    const { user } = editor.bsState;
    if (!editor.state.isSeriesFrame) {
      const { id } = editor.getCurrentFrame() || {};
      if (id != item.dataId) return false;
    }

    const { createdBy, stageName, types } = commentState.filterObj;
    const isShowByCreator = createdBy === 'All' || String(item.createdBy) === String(user.id);
    if (!isShowByCreator) return false;

    const isShowByStageName = stageName.includes('All') || stageName.includes(item.stageName);
    if (!isShowByStageName) return false;

    let isShowByTypes = types.includes('All');
    if (isShowByTypes) return true;
    item.types.forEach((t) => {
      if (types.includes(t)) {
        isShowByTypes = true;
        return;
      }
    });
    return isShowByTypes;
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////

  /** 筛选 */
  // const filterValue = ref<any>({}); // 根据 creator 和 stage 过滤
  const onFilter = () => {};
  const resetFilter = () => {};
  const handleToggleVisible = (item: any, visible: boolean) => {
    // 先判断这个形状是否被过滤，再判断其是否可见
    // editor.setCommentVisible(item, visible);
  };

  const onSelect = (data: any) => {
    const commentSelection = data.data.curSelection;

    commentState.activeKey = [];
    if (commentSelection.length > 0) {
      const objectIds: string[] = [];
      commentSelection.forEach((comment: any) => {
        commentState.activeKey.push(comment.userData.id);
        objectIds.push(comment.getObjectId());
      });
      // editor?.tool?.selectShapeForComment(objectIds.toString());
    }

    selectedScrollToView();
  };
  const clearSelect = () => {
    commentState.activeKey = [];
  };
  // 进入可视范围
  function selectedScrollToView() {
    nextTick(() => {
      const selected = document.querySelector('.operation-comment .comment__main--item.active');
      if (selected) {
        selected.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    });
  }

  return {
    updateLoading,
    updateCommentList,
    onResolveAll,
    changeCommentState,
    onRemoveComment,
    onCommentItemClick,

    onFilter,
    resetFilter,
    handleToggleVisible,
    onReply,
    onSelect,
    clearSelect,
  };
}
