<template>
  <div class="intellect-tool" v-show="showIntellect">
    <img :src="iState.src" :style="getMaskImgStyle()" />
    <!-- <p>Move your cursor around to see the mask prediction update in real time.</p> -->
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import useIntellect from './useIntellect';
  import { ToolName } from '../../../image-editor';

  const { iState, editor } = useIntellect();
  const showIntellect = computed(() => {
    const show = editor.state.activeTool === ToolName.intellect;
    return show;
  });
  const getMaskImgStyle = () => {
    const baseStyle = 'position:absolute;pointer-events:none;opacity:0.4;';
    if (editor.mainView && editor.mainView.stage) {
      const { stage, backgroundWidth, backgroundHeight } = editor.mainView;
      const stagePos = stage.position();
      const scale = stage.scaleX();
      const posStyle = `left:${stagePos.x}px;top:${stagePos.y}px;`;
      const size = `width:${backgroundWidth * scale}px;height:${backgroundHeight * scale}`;
      return baseStyle + posStyle + size;
    } else {
      const posStyle = 'left:0;top:0';
      return baseStyle + posStyle;
    }
  };
</script>

<style lang="less" scoped>
  .intellect-tool {
    position: relative;
    width: 100%;
    p {
      margin: 0;
      padding: 10px;
    }
  }
</style>
