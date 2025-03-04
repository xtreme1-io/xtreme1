<template>
  <Collapse>
    <template #header>
      <Header :title="`${t('image.comments')}(${showCommentNum(commentState.commentNumber)})`" />
    </template>
    <a-spin :spinning="commentState.loading" :tip="t('image.load-point')">
      <div class="operation-comment">
        <!-- Tab -->
        <div class="switch">
          <a-radio-group
            :value="commentState.activeTab"
            :style="{ marginBottom: '8px' }"
            @change="handleChangeTab"
          >
            <a-radio-button :value="CommentTabEnum.OPEN">
              {{ `${t('image.Open')}(${showCommentNum(countInfo.OPEN)})` }}
            </a-radio-button>
            <a-radio-button :value="CommentTabEnum.FIXED">
              {{ `${t('image.Fixed')}(${showCommentNum(countInfo.FIXED)})` }}
            </a-radio-button>
            <a-radio-button :value="CommentTabEnum.RESOLVED">
              {{ `${t('image.Resolved')}(${showCommentNum(countInfo.RESOLVED)})` }}
            </a-radio-button>
          </a-radio-group>
        </div>
        <!-- Resolve all -->
        <div class="resolve" v-show="showResolveAll">
          <span @click="showResolveAllConfirm()">{{
            commentState.activeTab === CommentTabEnum.OPEN
              ? t('image.Fix All')
              : t('image.Resolve All')
          }}</span>
        </div>
        <!-- Comment -->
        <div class="comment">
          <div class="comment-main">
            <!-- key-回复评论不刷新列表问题 -->
            <div
              v-for="(item, index) in commentState.list"
              :key="`${item.id}${item.replies?.length || 0}`"
              class="comment-main--item"
              :class="commentState.activeKey.includes(item.id + '') ? 'active' : ''"
              v-show="item.display"
              @click.stop.prevent="onItemClick(item)"
            >
              <p v-if="editor.state.isSeriesFrame" class="comment-item-frame">
                {{ showFrame(item) }}
              </p>
              <CommentTitle :order="index + 1" :uuid="item.id + ''" :item="item" />
              <CommentType :item="item" :showType="true" />
              <CommentList :commentItem="item" />
            </div>
          </div>

          <div
            v-if="commentState.list.length === 0"
            class="no-info"
            style="padding: 8px 10px; text-align: left"
            >No Data</div
          >
        </div>
      </div>
    </a-spin>
  </Collapse>
  <ReplyComment
    :visible="replyCommentVisible"
    :commentItem="replyCommentItem"
    :footerValue="replyCommentFooter"
    @cancel="handleCloseReplyComment"
  />
</template>

<script setup lang="ts">
  import { ref, computed, provide } from 'vue';

  import Collapse from '../../Collapse/index.vue';
  import Header from './Header.vue';
  import CommentTitle from './components/CommentTitle.vue';
  import CommentType from './components/CommentType.vue';
  import CommentList from './components/CommentList.vue';
  import ReplyComment from './components/ReplyComment.vue';

  import { useInjectBSEditor } from '../../../context';
  import useComment from './useComment';
  import { ICommentItem, TaskStatusEnum } from '@/business/chengduNew/type';
  import { CommentTabEnum } from '@/business/chengduNew/config/comment';
  import Event from '../../../config/event';
  import { tabKey } from '../typing';
  import { t } from '@/lang';

  const editor = useInjectBSEditor();
  const commentState = editor.bsState.commentState;
  /** 评论相关数据、操作 */
  const {
    updateLoading,
    updateCommentList,
    onResolveAll,
    changeCommentState,
    onRemoveComment,
    onReply,
    onCommentItemClick,
  } = useComment();
  editor.on(Event.BUSINESS_INIT, () => {
    const bsState = editor.bsState;
    if (bsState.isTaskFlow) {
      if (countInfo.value.OPEN > 0) {
        commentState.activeTab = CommentTabEnum.OPEN;
        editor.emit(Event.OPERATION_TAB_CHANGE, tabKey.COMMENT);
      } else if (countInfo.value.FIXED) {
        commentState.activeTab = CommentTabEnum.FIXED;
        editor.emit(Event.OPERATION_TAB_CHANGE, tabKey.COMMENT);
      }
      editor.emit(Event.UPDATE_COMMENTS, tabKey.COMMENT);
    }
  });
  /** 评论数量 */
  const showCommentNum = (num: number): string => {
    return num > 99 ? '99+' : String(Math.max(0, num));
  };
  const countInfo = computed<Record<CommentTabEnum, number>>(() => {
    return commentState.list.reduce(
      (info, item) => {
        info[item.status]++;
        return info;
      },
      {
        [CommentTabEnum.OPEN]: 0,
        [CommentTabEnum.FIXED]: 0,
        [CommentTabEnum.RESOLVED]: 0,
      },
    );
  });
  const showFrame = (comment: ICommentItem) => {
    const frameIdx = editor.getFrameIndex(String(comment.dataId)) + 1;
    return `${t('image.frame-title')}: ${frameIdx}`;
  };
  /** 切换 tab */
  const handleChangeTab = (e: any) => {
    updateLoading(true);
    setTimeout(() => {
      commentState.activeTab = e.target.value;
      updateCommentList();
      updateLoading(false);
    }, 200);
  };
  /** 解决所有评论 */
  const showResolveAll = computed(() => {
    let flag = editor.bsState.task?.status != TaskStatusEnum.COMPLETED;
    switch (commentState.activeTab) {
      case CommentTabEnum.FIXED:
        flag = flag && editor.bsState.stage.type !== 'ANNOTATION';
        break;
      case CommentTabEnum.RESOLVED:
        flag = false;
        break;
      default:
      case CommentTabEnum.OPEN:
        break;
    }
    return flag;
  });
  async function showResolveAllConfirm() {
    if (editor.bsState.isVisitorClaim) {
      editor.showMsg('warning', t('image.visitorTips'));
      return;
    }
    const subTitle =
      commentState.activeTab == CommentTabEnum.OPEN
        ? t('image.msgFixAll')
        : t('image.msgResolveAll');
    try {
      editor
        .showConfirm({
          title: t('image.Warning'),
          subTitle: subTitle,
          okText: t('image.confirm'),
          cancelText: t('image.cancel'),
        })
        .then(onResolveAll)
        .catch(() => {});
    } catch (e: any) {
      editor.handleErr(e, 'Error');
    }
  }
  // const handleResolveAll = async () => {
  //   await onResolveAll();
  // };
  /** 点击评论 */
  const onItemClick = (item: ICommentItem) => {
    onCommentItemClick(item);
  };
  /** 回复评论 */
  const replyCommentVisible = ref<boolean>(false);
  const replyCommentFooter = ref();
  const replyCommentItem = ref<ICommentItem>({} as ICommentItem);
  const replyComment = (item: ICommentItem) => {
    replyCommentVisible.value = true;
    // 此处比较特殊，需要用到null
    replyCommentFooter.value =
      editor.bsState.task.status == TaskStatusEnum.COMPLETED ? false : undefined;
    replyCommentItem.value = item;
  };
  const handleCloseReplyComment = () => {
    replyCommentVisible.value = false;
  };
  editor.on(Event.REPLY_COMMENT, replyComment);

  provide('changeCommentState', changeCommentState);
  provide('onRemoveComment', onRemoveComment);
  provide('replyComment', replyComment);
  provide('onReply', onReply);
</script>

<style lang="less" scoped>
  .operation-comment {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .switch {
      padding: 8px 4px;
      width: 100%;
    }

    .resolve {
      display: flex;
      padding: 0 10px;
      align-items: flex-end;
      width: 100%;
      color: @primary-color;
      flex-direction: column;
      cursor: pointer;
    }

    .comment {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      flex-direction: column;

      &-main {
        width: 100%;

        &--item {
          display: flex;
          padding: 8px 10px;
          transition: all 0.3s;
          flex-direction: column;
          gap: 8px;

          .comment-item-frame {
            margin: 0;
            text-align: left;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .title {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 14px;
              line-height: 16px;
              color: #dee5eb;

              .order {
                padding: 1px 2px;
                border: 1px solid #cccccc;
                border-radius: 20px;
              }
            }

            .btns {
              display: flex;
              align-items: center;
              gap: 10px;
            }
          }

          .type {
            display: flex;
          }

          &.active {
            background-color: #353c50;

            &:hover {
              background-color: #353c50;
            }
          }

          &:hover {
            background-color: #353841;
          }
        }
      }

      .spin {
        display: flex;
        padding-top: 250px;
        justify-content: center;
        align-items: center;
        flex-direction: column;
      }

      .no-info {
        display: flex;
        padding-top: 250px;
        justify-content: center;
        align-items: center;
      }

      .error {
        .link {
          color: @primary-color;
          cursor: pointer;
        }
      }
    }
  }

  :deep(.ant-radio-group) {
    display: flex;
    border-radius: 4px;

    .ant-radio-button-wrapper {
      padding: 0;
      border-color: @primary-color;
      overflow: hidden;
      text-align: center;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;

      &:hover {
        color: @primary-color;
      }

      &:not(.ant-radio-button-wrapper-disabled):hover::before {
        background-color: @primary-color;
      }

      &:hover::before {
        background-color: @primary-color;
      }
    }

    .ant-radio-button-wrapper-checked {
      border-color: @primary-color;
      background-color: @primary-color;
      color: #ffffff;

      &:hover {
        color: #ffffff;
      }

      &:not(.ant-radio-button-wrapper-disabled):hover::before {
        background-color: @primary-color;
      }

      &:hover::before {
        background-color: @primary-color;
      }
    }
  }
</style>
