<template>
  <a-tooltip trigger="click" placement="right" v-model:visible="visible">
    <div
      class="tool-trigger"
      :style="{
        color: visible ? 'rgb(23, 125, 220)' : '',
      }"
    >
      <IconHorizontalMore style="font-size: 14px; border-top: 1px solid #4e4e4e" />
    </div>
    <template #title>
      <div class="tooltip-setting">
        <div class="setting-switch">
          <label>{{ t('image.Shared Edge') }}</label>
          <a-switch v-model:checked="toolConfig.pls" size="small" @change="onShare" />
        </div>
        <a-radio-group v-model:value="toolConfig.plsm" v-show="toolConfig.pls">
          <a-radio :value="ShareDrawMode.point">{{ t('image.By Points') }}</a-radio>
        </a-radio-group>
      </div>
    </template>
  </a-tooltip>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { IconHorizontalMore } from '@basicai/icons';
  import { useInjectEditor } from '../../../context';
  import { ShareDrawMode } from '../../../../image-editor';
  import { t } from '@/lang';

  const visible = ref(false);
  const editor = useInjectEditor();
  const { state } = editor;
  const { toolConfig } = state;
  function onShare() {
    editor.mainView.intoSharedMode();
  }
</script>

<style lang="less" scoped>
  .tooltip-setting {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 12px;

    .setting-switch {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      line-height: 22px;
    }

    .ant-radio-group {
      display: flex;
      flex-direction: column;

      .ant-radio-wrapper {
        font-size: 12px;
      }
    }
  }
</style>
