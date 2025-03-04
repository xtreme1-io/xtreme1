<template>
  <a-tooltip trigger="click" placement="right" v-model:visible="iState.visible">
    <div
      class="tool-trigger"
      :style="{
        color: iState.visible ? 'rgb(23, 125, 220)' : '',
      }"
    >
      <IconHorizontalMore style="font-size: 14px; border-top: 1px solid #4e4e4e" />
    </div>
    <template #title>
      <div ref="containerRef" class="tool-info-tooltip" style="padding: 0 4px; width: 230px">
        <div class="tool-setting-title">
          {{ t('image.Interactive Model Setting') }}
        </div>
        <div class="title2">
          <span style="vertical-align: middle; margin-right: 10px">
            {{ t('image.Model') }}
          </span>
          <a-select
            :getPopupContainer="() => containerRef"
            v-model:value="state.config.interactiveModel"
            style="width: 100%; font-size: 12px"
            :options="options"
          >
          </a-select>
        </div>
        <div class="title2">
          <span style="vertical-align: middle; margin-right: 10px">
            {{ t('image.Smoothness') }}
          </span>
          <a-slider
            v-model:value="state.config.smoothness"
            :min="0"
            :max="3.0"
            :step="0.1"
            tooltipPlacement="bottom"
            @afterChange="onInteractiveRetry"
          />
        </div>
      </div>
    </template>
  </a-tooltip>
</template>
<script lang="ts" setup>
  import { IconHorizontalMore } from '@basicai/icons';
  import { ref, reactive, computed } from 'vue';
  import { Event, ModelTypeEnum } from '../../../../image-editor';
  import { useInjectEditor } from '../../../context';
  import { t } from '@/lang';
  const containerRef = ref();
  const iState = reactive({
    visible: false,
  });
  const editor = useInjectEditor();
  const { state } = editor;
  const options = computed(() => {
    const models = editor.getModelsByType(ModelTypeEnum.OBJECT_DETECTION, true);
    return models.map((e) => {
      return {
        value: e.id,
        label: e.name,
      };
    });
  });
  const onInteractiveRetry = (args: any) => {
    editor.emit(Event.INTERACTIVE_RETRY);
  };
</script>

<style lang="less" scoped>
  .tool-setting-title {
    padding-bottom: 4px;
    font-size: 14px;
    color: white;
    border-bottom: 1px solid gray;
  }
</style>
