<template>
  <a-modal
    :visible="props.visible"
    wrapClassName="replyModal"
    :okText="t('image.confirm')"
    :cancelText="t('image.Cancel')"
    @ok="handleConfirm"
    @cancel="handleCancel"
    :footer="props.footerValue"
  >
    <template #title>
      <div class="reply-title">
        <span>{{ t('image.Reply Comment') }}</span>
        <CommentAction
          :id="props.commentItem.id"
          :item="commentItem"
          :createdBy="String(props.commentItem.createdBy)"
          @close="handleCancel"
        />
      </div>
    </template>
    <div class="reply-content">
      <div>
        <CommentType :item="commentItem" :showType="false" />
      </div>
      <div class="divider"></div>
      <div v-for="item in replyCommentList" :key="item.id">
        <ListItem
          :id="item.id"
          :content="item.content"
          :avatarUrl="item.avatarUrl"
          :nickname="item.creatorName"
          :stage="item.stageName"
          :showTime="true"
          :time="item.createdAt"
          :showDelete="true"
          :createdBy="String(item.createdBy)"
        />
        <div class="divider"></div>
      </div>
      <div>
        <a-form ref="formRef" :model="formState" :rules="rules">
          <a-form-item label="" name="reply">
            <a-textarea
              v-model:value="formState.reply"
              :placeholder="t('image.AddReply')"
              :rows="4"
            />
          </a-form-item>
        </a-form>
      </div>
    </div>
  </a-modal>
</template>
<script lang="ts" setup>
  import { computed, inject, reactive, ref } from 'vue';
  import { message } from 'ant-design-vue';
  import { useInjectBSEditor } from '../../../../context';
  import { t } from '@/lang';
  import CommentAction from './CommentAction.vue';
  import CommentType from './CommentType.vue';
  import ListItem from './ListItem.vue';

  import { ICommentItem } from '@/business/chengduNew/type';

  import { IReplyParams } from '@/business/chengduNew/api/comment/typing';

  const editor = useInjectBSEditor();

  const onReply = inject('onReply', Function, true);

  const props = defineProps<{
    commentItem: ICommentItem;
    visible: boolean;
    footerValue: any;
  }>();

  const emits = defineEmits(['cancel']);
  const replyCommentList = computed(() => {
    let list = [props.commentItem];
    if (props.commentItem.replies) list = list.concat(props.commentItem.replies);
    return list;
  });

  const handleCancel = () => {
    formState.reply = undefined;
    formState.replying = false;
    formRef.value.clearValidate();
    emits('cancel');
  };

  /** Form */
  const formRef = ref();
  const formState = reactive({ reply: undefined, replying: false });
  const rules = computed(() => {
    return {
      reply: [
        { required: true, message: t('image.AddReply'), trigger: 'blur' },
        { max: 500, message: t('image.msgChar'), trigger: 'blur' },
      ],
    };
  });
  const handleConfirm = async () => {
    if (formState.replying) return;
    if (editor.bsState.isVisitorClaim) {
      editor.showMsg('warning', t('image.visitorTips'));
      return;
    }
    try {
      formState.replying = true;
      await formRef.value.validate();
      const { id, taskId, dataId } = props.commentItem;
      const params: IReplyParams = {
        sceneId: editor.state.isSeriesFrame ? editor.state.sceneId : undefined,
        parentId: id,
        taskId,
        dataId,
        content: formState.reply,
      };
      const reply = await onReply(params);
      if (reply) replyCommentList.value.push(reply);
      handleCancel();
    } catch (error: any) {
      formState.replying = false;
      message.error('Reply error');
    }
  };

  // ---------
  // const types = computed(() => {
  //   let res: any = [];
  //   replyCommentList.value.forEach((item: any) => {
  //     res = Array.from(new Set([...res, ...(item.types ?? [])]));
  //   });
  //   return res;
  // });
</script>
<style lang="less" scoped>
  .reply-title {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .reply-content {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .divider {
      width: 100%;
      height: 1px;
      background-color: #57575c;
    }
  }
</style>
