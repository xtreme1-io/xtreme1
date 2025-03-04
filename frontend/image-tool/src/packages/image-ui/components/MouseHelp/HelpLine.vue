<template>
  <div class="help-line" :style="helpStyle">
    <div v-show="lineData.showLine">
      <div class="help-line vertical" :style="{ borderColor: lineData.lineColor }"></div>
      <div class="help-line horizontal" :style="{ borderColor: lineData.lineColor }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject } from 'vue';
  import { useInjectEditor } from '../../context';
  import { IHelpLine } from '../../../image-editor';

  interface IProp {
    mousePos: { elementX: number; elementY: number };
    zoom: number;
  }

  // ***************Props and Emits***************
  const props = defineProps<IProp>();

  const w: number = inject('ToolWidth') || 0;
  const h: number = inject('HeaderHight') || 0;

  const editor = useInjectEditor();
  const lineData: IHelpLine = editor.state.config.helperLine;
  const helpStyle = computed(() => {
    return {
      left: props.mousePos.elementX - w + 'px',
      top: props.mousePos.elementY - h + 'px',
    };
  });
</script>

<style lang="less" scoped>
  .help-line {
    position: absolute;
    pointer-events: none;

    p {
      transform: translateY(-100%);
      text-align: left;
    }

    &.vertical {
      width: 1px;
      height: 200vh;
      border-right: 1px solid #ffffff;
      transform: translateY(-50%);
    }

    &.horizontal {
      width: 200vw;
      height: 1px;
      border-top: 1px solid #ffffff;
      transform: translateX(-50%);
    }

    &.circle {
      border: 1px solid #ffffff;
      transform: translate(-50%, -50%);
    }
  }
</style>
