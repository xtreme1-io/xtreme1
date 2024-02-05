<template>
  <div class="tool-item" title="" @click="resetScale()">
    <i class="iconfont icon-reset"></i>
    <a-tooltip placement="right" trigger="hover">
      <template #title>
        <div class="rotate-actions">
          <div class="actions-item" @click="onRotate(0)">
            <i class="iconfont icon-reset" />
          </div>
          <div class="actions-item" @click="onRotate(-90)">
            <i class="iconfont icon-rotate270" />
          </div>
          <div class="actions-item" @click="onRotate(90)">
            <i class="iconfont icon-rotate90" />
          </div>
        </div>
      </template>
      <i class="iconfont icon-transform default-icon"></i>
    </a-tooltip>
    <p>{{ `R:${rotateTxt}` }}</p>
    <p>{{ `Z:${zoomTxt}` }}</p>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useInjectEditor } from '../../../context';
  import { Event } from '../../../../image-editor';

  const editor = useInjectEditor();
  editor.once(Event.INIT, initThis);

  const zoomTxt = ref('');
  const rotateTxt = ref('0°');

  function initThis() {
    editor.mainView.on(Event.ZOOM, (data) => {
      zoomTxt.value = (data * 100).toFixed(0) + '%';
    });
    editor.mainView.on(Event.ROTATE, (data) => {
      rotateTxt.value = data.toFixed(0) + '°';
    });
  }
  function resetScale() {
    editor.mainView.fitBackgroundAsRatio();
  }
  function onRotate(r: number) {
    if (r !== 0) r += editor.mainView.stage.rotation();
    r = ((r % 360) + 360) % 360;
    editor.mainView.rotateAroundCenter(r);
  }
</script>

<style lang="less" scoped>
  .rotate-actions {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .actions-item {
      cursor: pointer;

      &:hover {
        color: #57ccef;
      }
    }
  }
</style>
