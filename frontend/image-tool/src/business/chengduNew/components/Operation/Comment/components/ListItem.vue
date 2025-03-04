<template>
  <div class="list-item">
    <div class="info-content">
      <div class="info">{{ props.content }}</div>
      <div class="footer">
        <div class="left">
          <div class="avatar">
            <a-avatar class="avatar" :src="props.avatarUrl || defaultAvatar" />
          </div>
          <div class="text">
            <div class="name">{{ props.nickname }} </div>
            <div v-if="props.stage" class="stage"> ({{ props.stage }})</div>
          </div>
        </div>
        <div class="right">
          <div v-if="props.time" class="time">{{ getDiffTime(props.time) }}</div>
          <div v-if="props.showDelete" class="del">
            <a-popover
              placement="bottom"
              :arrowPointAtCenter="true"
              v-model:visible="deleteVisible"
              :trigger="['click']"
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
              <span v-if="showCommentAction">
                <DeleteOutlined @click="handleRemove"></DeleteOutlined>
              </span>
            </a-popover>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, inject, ref } from 'vue';
  import { InfoCircleFilled, DeleteOutlined } from '@ant-design/icons-vue';
  import { message } from 'ant-design-vue';

  import { getDiffTime } from '@/business/chengduNew/utils/time';
  import { t } from '@/lang';

  import { TaskItemStatusEnum } from '@/enum/workflowEnum';
  import defaultAvatar from '@/assets/default-avatar.svg';

  const onDelete = inject('onDelete', Function, true);

  const props = defineProps<{
    id?: string | number;
    uuid?: string;
    createdBy: string;
    content: string;
    avatarUrl?: string;
    nickname: string;
    stage: string;
    time?: string;
    showDelete?: boolean;
    status?: TaskItemStatusEnum;
  }>();

  /** Remove */
  const deleteVisible = ref<boolean>(false);
  const handleRemove = () => {
    deleteVisible.value = true;
  };
  const handleCancelDelete = () => {
    deleteVisible.value = false;
  };
  const handleConfirmDelete = async () => {
    try {
      await onDelete(props.id, props.uuid as string);
      deleteVisible.value = false;
    } catch (error: any) {
      message.error(error.message || 'Failed to delete this comment, please try again!');
    }
  };

  // const showRemove = computed(() => {
  //   const userId = editor.bsState.user.id;
  //   return userId == props.createdBy;
  // });

  const showCommentAction = computed(() => {
    return props.status == TaskItemStatusEnum.COMPLETED;
  });
</script>
<style lang="less" scoped>
  @import url('./comment.less');

  .list-item {
    background-color: transparent;

    .info-content {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 10px 0;

      .info {
        font-size: 14px;
        text-align: left;
        color: #ffffff;
        line-height: 16px;
      }

      .footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 20px;

        .left {
          display: flex;
          align-items: center;
          gap: 6px;

          .avatar {
            border-radius: 50%;
            overflow: hidden;
            width: 20px;
            height: 20px;
            background-color: #cccccc;

            img {
              width: 100%;
              height: 100%;
            }
          }

          .text {
            display: flex;
            font-size: 12px;
            line-height: 14px;
            color: #aaaaaa;

            &:active {
              color: @primary-color;
            }
          }
        }

        .right {
          display: flex;
          align-items: center;
          gap: 6px;

          .time {
            font-size: 12px;
            line-height: 14px;
            color: #aaaaaa;
          }

          .del {
            color: #bec1ca;
            transition: all 0.3s;
            cursor: pointer;

            &:hover {
              color: #f8827b;
            }
          }
        }
      }
    }
  }
</style>
