<template>
  <div class="pc-editor">
    <div class="pc-editor-layout">
      <div class="business-container">
        <Header />
      </div>
      <div class="content-container-wrap">
        <div class="content-container">
          <div class="tool-container-wrap">
            <div class="tool-container">
              <Tool />
            </div>
          </div>
          <div class="main-container-wrap">
            <div class="main-container">
              <div class="editor-wrap" @mouseout="onMouseoutEditor">
                <ImageEditor>
                  <ObjectText />
                  <EditClass />
                  <InteractiveTool />
                  <IntellectTool />
                  <CommentTool />
                  <SkeletonTool />
                  <UseMouseComponent />
                </ImageEditor>
                <div class="stage-mask" v-show="showStageMask">
                  <div class="mask-warning">
                    <p>{{ t('image.loadFailed') }}</p>
                    <button @click="reloadFrame()">{{ t('image.reload') }}</button>
                  </div>
                </div>
              </div>
              <div class="frameline-wrap" v-if="state.isSeriesFrame">
                <!-- <div class="frameline-wrap"> -->
                <FrameLine />
              </div>
            </div>
          </div>
          <div class="operation-container-wrap">
            <div class="operation-container">
              <Operation />
            </div>
          </div>
          <H.UI.List />
        </div>
        <Loading />
      </div>
      <!-- <Modal /> -->
    </div>
    <!-- <Loading />
        <ClaimMask /> -->
    <div class="editor-mask" v-show="state.editorMuted">
      <div class="mask-msg">
        <p>{{ state.editorMutedMsg }}</p>
        <a-button
          v-show="state.editorMutedData && state.editorMutedData.showBtn"
          type="primary"
          @click="onMutedBtn()"
        >
          {{ state.editorMutedData?.btnText || '' }}
        </a-button>
      </div>
    </div>
    <CustomMessage />
    <Modal />
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onMounted, watch } from 'vue';
  import { useInjectBSEditor } from './context';
  import { LoadStatus, Event } from 'image-editor';
  import { useCheckToolAppVersionUpdate } from '@basicai/tool-components';
  import { t } from '@/lang';

  import Header from './components/Header/index.vue';
  import Operation from './components/Operation/index.vue';
  import CommentTool from './components/CommentTool/index.vue';

  import {
    Tool,
    ImageEditor,
    ObjectText,
    Modal,
    Loading,
    EditClass,
    SkeletonTool,
    UseMouseComponent,
    FrameLine,
    InteractiveTool,
    IntellectTool,
    CustomMessage,
  } from 'image-ui/components';

  // modal
  import Reject from './components/Modal/Reject.vue';
  import Confirm from './components/Modal/Confirm.vue';
  import HotkeyHelp from './components/Modal/Help/index.vue';
  import ClaimConfirm from './components/Modal/ClaimConfirm.vue';
  import AccClaim from './components/Modal/AccClaim.vue';
  import { historyStore } from './stores';

  const editor = useInjectBSEditor();
  const H = historyStore();
  const { state } = editor;
  const showStageMask = computed(() => {
    const frame = editor.getCurrentFrame();
    return frame && frame.loadState === LoadStatus.ERROR;
  });

  // 定时检查工具版本更新
  useCheckToolAppVersionUpdate(() => editor.state.lang);

  const reloadFrame = () => {
    editor.loadFrame(editor.state.frameIndex, true, true);
  };

  onMounted(() => {
    editor.registerModal('reject', Reject);
    editor.registerModal('confirm', Confirm);
    editor.registerModal('HotkeyHelp', HotkeyHelp);
    editor.registerModal('ClaimConfirm', ClaimConfirm);
    editor.registerModal('AccClaim', AccClaim);
    watch(
      () => [state.isSeriesFrame],
      () => {
        nextTick(() => {
          editor.mainView.resize();
        });
      },
    );
  });
  function onMutedBtn() {
    state.editorMutedData?.btnCallback();
    editor.blockEditor(false, '');
  }
  function onMouseoutEditor() {
    editor.emit(Event.TOOL_DRAW, 'end');
  }
</script>

<style lang="less">
  .pc-editor {
    position: relative;
    width: 100%;
    height: 100%;
    background: #3a393e;

    .pc-editor-layout {
      .business-container {
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        height: 54px;
        background: #1e1f22;
      }

      .content-container-wrap {
        position: absolute;
        inset: 54px 0 0;
        padding: 0;
      }

      .content-container {
        display: flex;
        position: relative;
        height: 100%;
        flex-direction: row;
      }

      .tool-container-wrap {
        position: relative;
        width: 50px;

        .tool-container {
          position: absolute;
          inset: 0;
          background: #3a3a3e;
        }
      }

      .main-container-wrap {
        position: relative;
        flex: 1;

        .main-container {
          display: flex;
          position: absolute;
          inset: 0;
          flex-direction: column;

          .editor-wrap {
            flex: 1;
            position: relative;
          }

          .frameline-wrap {
            position: relative;
          }
        }
      }

      .operation-container-wrap {
        position: relative;
        width: 300px;

        .operation-container {
          position: absolute;
          inset: 0;
          padding: 4px;
        }
      }
    }
  }

  .editor-mask {
    position: fixed;
    inset: 0;
    z-index: 998;
    height: 100%;
    background-color: rgb(0 0 0 / 70%);

    .mask-msg {
      position: absolute;
      top: 50%;
      left: 0;
      width: 100%;
      text-align: center;
      color: #f8827b;
    }
  }

  // 遮罩层
  .stage-mask {
    display: flex;
    position: relative;
    z-index: 997;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-color: #000000;
    flex-direction: row;
  }
</style>
