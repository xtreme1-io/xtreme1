<template>
  <div ref="refContainer" style="position: relative">
    <HelpLine :mousePos="mousePos" :zoom="zoom"></HelpLine>
    <HelpSizeInfo :mousePos="mousePos"></HelpSizeInfo>
    <div v-show="zoomTxt" class="help-zoom">{{ zoomTxt }}</div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';

  import HelpLine from './HelpLine.vue';
  import HelpSizeInfo from './HelpSizeInfo.vue';

  import { useInjectEditor } from '../../context';
  import { Event } from '../../../image-editor';

  const editor = useInjectEditor();
  editor.once(Event.INIT, initThis);
  const refContainer = ref<HTMLDivElement>();
  const mousePos = ref<{ elementX: number; elementY: number }>({ elementX: 0, elementY: 0 });
  const zoom = ref(0);
  const zoomTxt = ref('');
  let zoomTimerId: any;

  function initThis() {
    editor.mainView.on(Event.ZOOM, (data, showTips = true) => {
      zoom.value = data;
      if (!showTips) return;
      if (zoomTimerId) clearTimeout(zoomTimerId);
      zoomTxt.value = (data * 100).toFixed(0) + '%';
      zoomTimerId = setTimeout(() => {
        zoomTimerId = undefined;
        zoomTxt.value = '';
      }, 1000);
    });
  }
  const onDocMousemove = (e: MouseEvent) => {
    const { x = 0, y = 0 } = refContainer.value?.getBoundingClientRect() || {};
    mousePos.value = {
      elementX: e.clientX - x,
      elementY: e.clientY - y,
    };
  };
  onMounted(() => {
    document.addEventListener('mousemove', onDocMousemove);
  });
  onUnmounted(() => {
    document.removeEventListener('mousemove', onDocMousemove);
  });
</script>

<style lang="less" scoped>
  .help-zoom {
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    padding: 6px 10px;
    border-radius: 10px;
    background-color: rgb(0 0 0 / 49.8%);
    color: #ffffff;
    pointer-events: none;
  }
</style>
