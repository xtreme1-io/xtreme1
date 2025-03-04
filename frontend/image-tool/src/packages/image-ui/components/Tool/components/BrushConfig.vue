<template>
  <div class="brush-config" v-show="showBrushConfig">
    <a-tooltip placement="bottom" trigger="hover">
      <template #title>
        <IconKeyboard style="margin: 3px 5px 0; font-size: 14px" />
        <span>-/+</span>
      </template>
      <p> {{ `${t('image.Brush width')}(${editor.state.toolConfig.brushWidth}px)` }} </p>
    </a-tooltip>
    <div style="width: 160px">
      <a-slider
        v-model:value="toolConfig.brushWidth"
        :min="1"
        :max="100"
        :step="1"
        tooltipPlacement="bottom"
        @afterChange="onChangeBrushWidth"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useInjectEditor } from '../../../context';
  import { ToolName } from '../../../../image-editor';
  import { t } from '@/lang';

  const editor = useInjectEditor();
  const { state } = editor;
  const { toolConfig } = editor.state;

  const showBrushConfig = computed(() => {
    return state.activeTool === ToolName.brush && toolConfig.segmentTool == ToolName.brush;
  });

  function onChangeBrushWidth() {
    editor.mainView.updateCurrentDrawTool();
  }
</script>

<style lang="less" scoped>
  .brush-config {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 5px;

    p {
      margin: 0;
      width: 130px;
      text-align: left;
      white-space: nowrap;
    }
  }
</style>
