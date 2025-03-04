<template>
  <a-tooltip trigger="hover" placement="right" v-model:visible="iState.visible">
    <div
      class="tool-trigger"
      :style="{
        color: iState.visible ? 'rgb(23, 125, 220)' : '',
      }"
    >
      <IconHorizontalMore style="font-size: 14px; border-top: 1px solid #4e4e4e" />
    </div>
    <template #title>
      <div class="segment-tools">
        <template v-for="toolName in iState.toolList" :key="toolName">
          <ToolItem :item="toolMap[toolName]" @onItemClick="onTool" />
        </template>
      </div>
    </template>
  </a-tooltip>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';
  import { IconHorizontalMore } from '@basicai/icons';
  import { useInjectEditor } from '../../../context';
  import { segmentToolActions } from '../tools';
  import { toolMap } from '../item';
  import ToolItem from './ToolItem.vue';
  import { ToolName } from '../../../../image-editor';

  const emit = defineEmits(['callbackOntool']);

  const editor = useInjectEditor();
  const { state } = editor;

  const iState = reactive({
    visible: false,
    toolList: segmentToolActions,
  });

  function onTool(name: ToolName) {
    if (state.toolConfig.segmentTool === name) return;
    state.toolConfig.segmentTool = name;
    emit('callbackOntool', name);
  }
</script>

<style lang="less">
  .segment-tools {
    display: flex;
    flex-direction: column;
  }
</style>
