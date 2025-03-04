<template>
  <teleport to="body">
    <div
      v-show="editor.state.config.showSizeTips && showTips"
      class="help-size"
      :style="{
        left: props.mousePos.elementX + 'px',
        top: props.mousePos.elementY + 'px',
      }"
    >
      <span class="size-item"> {{ sizeInfo }}</span>
    </div>
  </teleport>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { Event, Shape, AnnotateModeEnum } from '../../../image-editor';
  import { useInjectEditor } from '../../context';
  import { ShapeTool } from '../../../image-editor/ImageView';

  // ***************Props and Emits***************
  const props = defineProps<{ mousePos: { elementX: number; elementY: number } }>();

  const editor = useInjectEditor();
  editor.on(Event.TOOL_DRAW, (type: string, object: Shape, tool: ShapeTool) => {
    updateSizeInfo('draw', type, object, tool);
  });
  editor.on(Event.TOOL_Edit, (type: string, object: Shape, tool: ShapeTool) => {
    updateSizeInfo('edit', type, object, tool);
  });

  const showTips = ref(false);
  const sizeInfo = ref('');
  function updateSizeInfo(drawEdit: string, type: string, object: Shape, tool: ShapeTool) {
    if (!editor.state.config.showSizeTips) return;
    // console.log('tool info:', drawEdit, type, tool);
    if (type === 'end' || tool.toolMode === AnnotateModeEnum.SEGMENTATION) {
      showTips.value = false;
      return;
    }
    sizeInfo.value = tool.drawInfo();
    showTips.value = !!sizeInfo.value;
  }
</script>

<style lang="less" scoped>
  .help-size {
    display: block;
    position: absolute;
    padding: 2px 4px;
    border-radius: 4px;
    z-index: 999;
    background-color: rgb(0 0 0 / 49.8%);
    white-space: nowrap;
    color: #ffffff;
    pointer-events: none;

    .size-item {
      display: inline-block;
      margin-right: 5px;
    }
  }
</style>
