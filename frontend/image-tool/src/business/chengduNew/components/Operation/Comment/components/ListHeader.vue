<template>
  <div class="list-header">
    <a-collapse :activeKey="activeKey">
      <a-collapse-panel key="1" :header="t('image.comments')" :showArrow="false">
        <template #extra>
          <div class="btns">
            <IconCommentReply class="mark" @click="handleReply" />
            <span class="mark">
              {{ props.count }}
            </span>
            <RightOutlined
              :style="{ fontSize: '14px', color: '#aaa' }"
              :rotate="isActive ? 90 : 0"
              @click="handleChange"
            />
          </div>
        </template>
        <slot></slot>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>
<script lang="ts" setup>
  import { ref, inject } from 'vue';
  import { RightOutlined } from '@ant-design/icons-vue';
  import { ICommentItem } from '@/business/chengduNew/type';
  import { t } from '@/lang';

  const props = defineProps<{
    commentItem: ICommentItem;
    count: number;
  }>();
  const replyComment = inject('replyComment', Function, true);

  const activeKey = ref<string>('1');
  const isActive = ref<boolean>(true);

  const handleChange = () => {
    isActive.value = !isActive.value;
    activeKey.value = isActive.value ? '1' : '0';
  };

  const handleReply = () => {
    replyComment(props.commentItem);
  };
</script>
<style lang="less" scoped>
  .list-header {
    .btns {
      display: flex;
      align-items: center;
      gap: 4px;

      .mark {
        color: @primary-color;
      }
    }
  }

  :deep(.ant-collapse) {
    border: 0 !important;
    background-color: transparent !important;

    .ant-collapse-item {
      background-color: transparent;

      .ant-collapse-header {
        display: flex;
        padding: 0;
        border: 0;
        align-items: center;
        background-color: transparent;
        font-size: 14px;
        color: #dee5eb;
        font-weight: 400;
        line-height: 16px;

        .ant-collapse-arrow {
          right: 0;
          left: auto;
        }

        .ant-collapse-extra {
          position: absolute;
          right: 0;
        }
      }

      .ant-collapse-content {
        border: 0;
        background-color: transparent;

        .ant-collapse-content-box {
          background: transparent;
          background-color: transparent;
        }
      }
    }
  }
</style>
