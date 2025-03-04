<template>
  <teleport v-if="iState.visible" to="body">
    <div class="sample-msg-container">
      <div class="msg">
        <div class="icon">
          <IconInfo />
        </div>
        <div class="text">
          {{ t('image.msgSample') }}
        </div>
        <div class="close">
          <CloseOutlined @click="onCLose" />
        </div>
      </div>
    </div>
  </teleport>
</template>
<script lang="ts" setup>
  import { CloseOutlined } from '@ant-design/icons-vue';
  import { onBeforeUnmount, onMounted, reactive } from 'vue';
  import { useInjectBSEditor } from '../../../context';
  import { Event } from 'image-editor';
  import { t } from '@/lang';
  import BsEvent from '../../../config/event';

  const editor = useInjectBSEditor();
  const bsState = editor.bsState;

  const iState = reactive<{
    visible: boolean;
  }>({
    visible: false,
  });
  onMounted(() => {
    editor.on(Event.FRAME_CHANGE, update);
    editor.on(BsEvent.SAMPLE_LOADED, update);
  });
  onBeforeUnmount(() => {
    editor.off(Event.FRAME_CHANGE, update);
    editor.off(BsEvent.SAMPLE_LOADED, update);
  });
  const update = () => {
    if (
      !bsState.sampleId ||
      !editor.state.isSeriesFrame ||
      bsState.query.stageType !== 'acceptance'
    )
      return;
    const frame = editor.getCurrentFrame();
    iState.visible = frame && frame.isSample !== true;
  };
  const onCLose = () => {
    iState.visible = false;
  };
</script>
<style lang="less">
  .sample-info {
    display: flex;
    margin-left: 10px;
    padding: 0 10px;
    border: 2px solid #63926f;
    border-radius: 5px;
    flex-direction: row;
    border-image: linear-gradient(to right, @primary-color, #91e0a2) 1 1;

    .sample-percent {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }

    .sample-filter {
      display: flex;
      margin-right: 10px;
      justify-content: center;
      align-items: center;
    }
  }

  .sample-msg-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;

    .msg {
      display: flex;
      position: absolute;
      top: 64px;
      left: 50%;
      padding: 4px 8px;
      border-radius: 50px;
      z-index: 999;
      max-width: 600px;
      background-color: #fdf8eb;
      text-align: center;
      color: #9f6835;
      transform: translateX(-50%);

      .icon,
      .close {
        display: flex;
        padding: 6px;
        padding: 0 15px;
        align-items: center;
      }

      .close:hover {
        opacity: 0.8;
      }

      .text {
        flex: 1;
      }
    }
  }
</style>
