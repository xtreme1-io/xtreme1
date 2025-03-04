<template>
  <div class="button" v-if="showCommentAction">
    <CheckOutlined
      v-if="canNextStep(item)"
      style="color: #91e0a2"
      :title="hoverNextTitle(item)"
      @click.stop="handleResolve"
    />
    <IconRestore
      v-if="canPreStep(item)"
      style="color: #f8e792"
      :title="hoverPreTitle(item)"
      @click.stop="handleCancelResolve"
    />
    <a-popover
      placement="bottom"
      :arrowPointAtCenter="true"
      v-model:visible="deleteVisible"
      trigger=""
    >
      <template #content>
        <div class="content">
          <div class="header">
            <InfoCircleFilled />
            <span>{{ t('image.deleteConfirm') }}</span>
          </div>
          <div class="footer">
            <a-button size="small" @click="handleCancelDelete">
              {{ t('image.Cancel') }}
            </a-button>
            <a-button size="small" type="primary" @click="handleConfirmDelete">
              {{ t('image.confirm') }}
            </a-button>
          </div>
        </div>
      </template>
      <DeleteOutlined
        v-if="canRemove"
        :title="t('image.Delete')"
        @click.stop="handleRemove"
        style="color: #f8827b"
      ></DeleteOutlined>
      <i v-else class="annotation"></i>
    </a-popover>
  </div>
</template>
<script lang="ts" setup>
  import { computed, inject, ref } from 'vue';
  import { CheckOutlined, InfoCircleFilled, DeleteOutlined } from '@ant-design/icons-vue';
  import { message } from 'ant-design-vue';

  import { useInjectBSEditor } from '../../../../context';
  import { ICommentItem, TaskStatusEnum } from '@/business/chengduNew/type';
  import { t } from '@/lang';
  import { CommentTabEnum } from '@/business/chengduNew/config/comment';

  const editor = useInjectBSEditor();
  const { bsState } = editor;

  const onRemoveComment = inject('onRemoveComment', Function, true);
  const changeCommentState = inject('changeCommentState', Function, true);

  const showCommentAction = computed(() => {
    return props.status != TaskStatusEnum.COMPLETED;
  });

  // const showResolve = computed(() => {
  //   return bsState.commentState.activeTab == CommentTabEnum.OPEN;
  // });

  const props = defineProps<{
    id: string | number;
    uuid?: string;
    createdBy: string;
    item: ICommentItem;
    status?: TaskStatusEnum;
  }>();
  const emits = defineEmits(['close']);

  /** Resolve */
  const handleResolve = async () => {
    if (editor.bsState.isVisitorClaim) {
      editor.showMsg('warning', t('image.visitorTips'));
      return;
    }
    try {
      await changeCommentState(props.item, true);
      // message.success('Resolved');
      emits('close');
    } catch (error: any) {
      message.error(error.message || 'Failed to resolve this comment, please try again!');
    }
  };
  /** Cancel Resolve */
  const handleCancelResolve = async () => {
    if (editor.bsState.isVisitorClaim) {
      editor.showMsg('warning', t('image.visitorTips'));
      return;
    }
    try {
      await changeCommentState(props.item, false);
      // message.success('Opened');
      emits('close');
    } catch (error: any) {
      message.error(error.message || 'Failed to open this comment, please try again!');
    }
  };
  const hoverNextTitle = (item: ICommentItem) => {
    return item.status === CommentTabEnum.OPEN ? t('image.Fix') : t('image.Resolve');
  };
  const hoverPreTitle = (item: ICommentItem) => {
    return item.status === CommentTabEnum.FIXED ? t('image.unFix') : t('image.unResolve');
  };
  const canPreStep = (item: ICommentItem) => {
    switch (item.status) {
      default:
      case CommentTabEnum.RESOLVED:
        return item.resolvable;
      case CommentTabEnum.FIXED:
        return true;
      case CommentTabEnum.OPEN:
        return false;
    }
  };
  const canNextStep = (item: ICommentItem) => {
    switch (item.status) {
      default:
      case CommentTabEnum.FIXED:
        return item.resolvable;
      case CommentTabEnum.OPEN:
        return true;
      case CommentTabEnum.RESOLVED:
        return false;
    }
  };
  /** Remove */
  const deleteVisible = ref<boolean>(false);
  const handleRemove = () => {
    if (editor.bsState.isVisitorClaim) {
      editor.showMsg('warning', t('image.visitorTips'));
      return;
    }
    deleteVisible.value = true;
  };
  const handleCancelDelete = () => {
    deleteVisible.value = false;
  };
  const handleConfirmDelete = async () => {
    try {
      await onRemoveComment(props.id);
      deleteVisible.value = false;
      emits('close');
    } catch (error: any) {
      message.error('deleteComment error: ' + error.message);
    }
  };

  // 限制 解决、回复评论
  // 分别控制
  // const canResolve = computed(() => {
  //   return true;
  // });
  const canRemove = computed(() => {
    const userId = bsState.user.id;
    return userId == props.createdBy;
  });
</script>
<style lang="less" scoped>
  @import url('./comment.less');

  .button {
    display: flex;
    align-items: center;
    gap: 10px;

    .annotation {
      font-size: 12px;
      color: #ffffff;
      cursor: pointer;
    }
  }
</style>
