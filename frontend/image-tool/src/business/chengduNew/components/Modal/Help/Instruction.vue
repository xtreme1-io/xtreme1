<template>
  <div class="instruction">
    <div class="help-tab-header">
      <div style="width: 100%; line-height: 30px">
        <span>{{ t('image.Instruction') }}</span>
        <Button @click.stop="handlePreview" style="float: right" type="primary">
          {{ t('image.Open in New Tab') }}
          <template #icon><SelectOutlined /></template>
        </Button>
      </div>
    </div>
    <div class="help-tab-content">
      <div class="instruction-info" v-if="bsState.task.instructionFiles?.length">
        <div>{{ t('image.Attachment') }}</div>
        <div
          v-for="item in bsState.task.instructionFiles || []"
          :key="item.name"
          :title="item.name"
          @click="() => handlePreviewPdf(item.url)"
          class="attachment-item"
        >
          <FileTextOutlined class="file-icon" />
          <span> {{ item.name }} </span>
          <SelectOutlined class="file-icon-open" />
        </div>
        <div class="instruction-msg" v-html="bsState.task.instruction"></div>
      </div>
      <div v-else class="empty">
        <img :src="emptyHelp" />
        <div>{{ t('image.no-data') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { SelectOutlined, FileTextOutlined } from '@ant-design/icons-vue';
  import { Button } from 'ant-design-vue';
  import { useInjectBSEditor } from '../../../context';
  import { t } from '@/lang';
  import emptyHelp from '@/assets/empty_help.svg';

  const editor = useInjectBSEditor();
  const { bsState } = editor;

  function handlePreview() {
    window.open(
      `${window.location.origin}${import.meta.env.BASE_URL}preview?taskId=${bsState.taskId}`,
      '_blank',
    );
  }
  const handlePreviewPdf = (url: any) => {
    if (url.endsWith('.pdf')) {
      window.open(`${window.location.origin}${import.meta.env.BASE_URL}pdf?url=${url}`, '_blank');
    }
  };
</script>

<style lang="less" scoped>
  .instruction-info {
    margin-top: 10px;
    padding: 0 15px 4px;
    background: #2a2a2c;
    font-size: 14px;
    color: #dee5eb;

    .attachment-item {
      display: flex;
      margin-left: 8px;
      padding: 4px 8px;
      align-items: center;
      width: fit-content;
      color: #aaaaaa;
      gap: 10px;
      cursor: pointer;

      &:hover {
        background-color: #393c45;
      }
    }

    .file-icon {
      padding: 2px;
      border-radius: 2px;
      background: white;
      color: @primary-color;
    }

    .file-icon-open {
      color: @primary-color;
      transform: rotateY(180deg);
    }

    .instruction-msg {
      margin-top: 10px;
      padding: 0 16px 4px;
      font-size: 14px;
      white-space: pre-wrap;
      color: #dee5eb;
    }
  }

  .empty {
    display: flex;
    padding-top: 4px;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
</style>
