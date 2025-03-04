<template>
  <!-- 辅助线组件 -->
  <div class="help-line" :style="helpStyle">
    <!-- 垂直辅助线 -->
    <div v-show="helperLine.showLine">
      <div ref="vLine" class="help-line vertical" :style="getLineStyle([0, 1])"></div>
      <div ref="hLine" class="help-line horizontal" :style="getLineStyle([1, 0])"></div>
    </div>
    <!-- 图形辅助线 -->
    <div
      class="help-line circle"
      v-show="helperLine.showCircle && helperLine.width > 0"
      :style="`width:${helperLine.width * props.zoom}px;
          height:${helperLine.height * props.zoom}px;
          border-radius: ${helperLine.width * helperLine.radius * props.zoom}px;
          border-color: ${helperLine.toolColor};`"
    >
      <p v-if="helperLine.radius > 0">R: {{ helperLine.width / 2 }}</p>
      <p v-else>W:{{ helperLine.width }},H:{{ helperLine.height }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { StyleValue, computed, watch } from 'vue';
  import hotkeys from 'hotkeys-js';
  import { useInjectEditor } from '../../context';
  import { RectTool, StatusType, Event } from 'image-editor';

  interface IProp {
    mousePos: { elementX: number; elementY: number };
    zoom: number;
  }

  // ***************Props and Emits***************
  const props = defineProps<IProp>();

  const editor = useInjectEditor();
  const { config, toolConfig } = editor.state;
  const { helperLine } = config;
  const helpStyle = computed(() => {
    return {
      left: props.mousePos.elementX + 'px',
      top: props.mousePos.elementY + 'px',
    };
  });

  function getLineStyle(v: [0, 1] | [1, 0]) {
    const style: StyleValue = {};
    const [vx, vy] = v;
    style.borderColor = helperLine.lineColor;
    style.transform = `translate(${-50 * vx}%, ${-50 * vy}%) rotate(${toolConfig.rectRotate}deg)`;
    return style;
  }
  function adjustRotate(step: number) {
    if (editor.state.status !== StatusType.Default) return;
    if (step == 0) toolConfig.rectRotate = 0;
    else toolConfig.rectRotate += step;
    if (Math.abs(toolConfig.rectRotate) >= 360) toolConfig.rectRotate = toolConfig.rectRotate % 360;
    if (toolConfig.rectRotate < 0) toolConfig.rectRotate += 360;
    const tool = editor.mainView.currentDrawTool;
    if (tool instanceof RectTool) {
      tool.updateHolder();
    }
  }
  function bindAdjustRotateHotkey() {
    hotkeys.unbind('[');
    hotkeys.unbind(']');
    hotkeys.unbind('\\');
    if (helperLine.showLine) {
      hotkeys('[', (event, handler) => {
        event.preventDefault();
        adjustRotate(-1);
      });
      hotkeys(']', (event, handler) => {
        event.preventDefault();
        adjustRotate(1);
      });
      hotkeys('\\', (event, handler) => {
        event.preventDefault();
        adjustRotate(0);
      });
    }
  }
  editor.on(Event.HOTKEY, () => {
    bindAdjustRotateHotkey();
  });
  watch(
    () => helperLine.showLine,
    () => {
      bindAdjustRotateHotkey();
    },
  );
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
      transform-origin: 0 50%;
    }

    &.horizontal {
      width: 200vw;
      height: 1px;
      border-top: 1px solid #ffffff;
      transform-origin: 50% 0;
    }

    &.circle {
      border: 1px solid #ffffff;
      transform: translate(-50%, -50%);
    }
  }
</style>
