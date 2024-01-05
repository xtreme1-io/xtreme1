<template>
  <div class="image-tool-editor">
    <Layout>
      <template #header><Header /></template>
      <template #tools><Tool /></template>
      <div class="main-container">
        <div class="editor-wrap">
          <MainView>
            <ObjectText />
            <EditClass />
            <MouseHelp />
          </MainView>
          <Mask v-show="false"></Mask>
        </div>
        <div class="framesline-wrap" v-if="state.isSeriesFrame">
          <FrameLine />
        </div>
      </div>
      <template #operation><Operation /></template>
      <template #mask><Loading /></template>
    </Layout>
    <Mask v-show="false"></Mask>
    <Modal />
  </div>
</template>

<script setup lang="ts">
  import { nextTick, onMounted, watch } from 'vue';
  import { useProvideBSEditor } from './context';
  import { Event as EditorEvent } from 'image-editor';
  import useFlow from './hook/useFlow';

  import Layout from './components/Layout/index.vue';
  import Mask from './components/Mask/index.vue';
  import Header from './components/Header/index.vue';
  import Operation from './components/Operation/index.vue';
  import Confirm from './components/Modal/Confirm.vue';
  import HotkeyHelp from './components/Modal/HotkeyHelp/index.vue';

  import {
    MainView,
    Tool,
    MouseHelp,
    Modal,
    Loading,
    ObjectText,
    EditClass,
    FrameLine,
  } from 'image-ui/components';

  const editor = useProvideBSEditor();
  const { state } = editor;

  onMounted(() => {
    editor.registerModal('confirm', Confirm);
    editor.registerModal('HotkeyHelp', HotkeyHelp);
    watch(
      () => [state.isSeriesFrame],
      () => {
        nextTick(() => {
          editor.mainView.resize();
        });
      },
    );
  });

  editor.on(EditorEvent.INIT, () => {
    const flow = useFlow();
    flow?.init();
  });
</script>

<style lang="less">
  .image-tool-editor {
    width: 100%;
    height: 100%;

    .main-container {
      display: flex;
      width: 100%;
      height: 100%;
      flex-direction: column;

      .editor-wrap {
        flex: 1;
        position: relative;
        background-color: #6a6a6a;
      }
      .framesline-wrap {
        position: relative;
      }
    }
  }
</style>
