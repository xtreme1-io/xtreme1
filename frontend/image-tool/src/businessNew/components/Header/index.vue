<template>
  <div class="tool-header">
    <div class="header-left">
      <Close :label="editor.lang('Close')" @onClose="onFlowAction(FlowAction.close)" />
      <InfoData v-bind="{ dataInfo }" />
    </div>
    <div class="header-center">
      <Flowindex @onFlowindex="onIndex" v-bind="{ info: indexInfo }" />
    </div>
    <div class="header-right">
      <Tooltip :title="editor.lang('titleHelp')">
        <div @click="onHelp">
          <i class="iconfont icon-hotkey action-icon" />
        </div>
      </Tooltip>
      <Tooltip :title="isFullscreen ? editor.lang('ExitFullscreen') : editor.lang('Fullscreen')">
        <div @click="toggle">
          <i v-if="isFullscreen" class="iconfont icon-exitfullscreen action-icon" />
          <i v-else class="iconfont icon-fullscreen action-icon" />
        </div>
      </Tooltip>
      <div class="header-divider"></div>
      <!-- save button -->
      <ActionBtn
        v-if="has(BsUIType.flowSave)"
        :type="FlowAction.save"
        :loading="bsState.doing.saving"
        title="Ctrl + S"
        @onActions="onFlowAction(FlowAction.save)"
      >
        <template #icon><i class="iconfont icon-save icon" /></template>
        {{ editor.lang('btnSave') }}
      </ActionBtn>
      <!-- mark vaild or invaild button -->
      <ActionBtn
        v-if="has(BsUIType.markValid)"
        :type="validStatus ? FlowAction.markinvaild : FlowAction.markvaild"
        :loading="bsState.doing.marking"
        @onActions="markVaild"
      >
        {{ validStatus ? editor.lang('Mark as Invalid') : editor.lang('Mark as valid') }}
      </ActionBtn>
      <!-- skip button -->
      <ActionBtn
        v-if="has(BsUIType.skip)"
        :type="FlowAction.skip"
        :loading="bsState.doing.skip"
        @onActions="onSkip"
      >
        {{ editor.lang('Skip') }}
      </ActionBtn>
      <!-- submit button -->
      <ActionBtn
        v-if="has(BsUIType.submit)"
        :type="FlowAction.submit"
        :loading="bsState.doing.submitting"
        @onActions="onSubmit"
      >
        <template #icon><i class="iconfont icon-hotkey icon" /></template>
        {{ annotateStatus ? editor.lang('Update') : editor.lang('btnSubmit') }}
      </ActionBtn>
      <!-- modify button -->
      <ActionBtn
        v-if="has(BsUIType.modify)"
        :type="FlowAction.modify"
        :loading="bsState.doing.modify"
        @onActions="onViewToAnnotate"
      >
        {{ editor.lang('btnModify') }}
      </ActionBtn>
    </div>
    <div class="block-mask" v-show="bsState.blocking"></div>
  </div>
</template>

<script setup lang="ts">
  import { useFullscreen } from '@vueuse/core';
  import { Tooltip } from 'ant-design-vue';
  import { useInjectBSEditor } from '../../context';
  import { FlowAction } from '../../types';
  import { Event as EditorEvent } from 'image-editor';

  // useHandler
  import useHeader from './useHeader';
  import useDataInfo from './useDataInfo';
  import useFlowIndex from './useFlowIndex';
  import useUI from 'image-ui/hook/useUI';

  // components
  import Close from './components/Close.vue';
  import InfoData from './components/InfoData.vue';
  import Flowindex from './components/Flowindex.vue';
  import ActionBtn from './components/ActionBtn.vue';
  import { BsUIType } from '@/businessNew/configs/ui';

  const { isFullscreen, toggle } = useFullscreen();
  const editor = useInjectBSEditor();
  const { bsState } = editor;
  const {
    onHelp,
    markVaild,
    onSubmit,
    onSkip,
    onViewToAnnotate,
    onFlowAction,
    validStatus,
    annotateStatus,
  } = useHeader();
  const { updateDataInfo, dataInfo } = useDataInfo();
  const { indexInfo, onIndex } = useFlowIndex();
  const { has } = useUI();

  editor.on(EditorEvent.FRAME_CHANGE, async () => {
    updateDataInfo();
  });
</script>

<style lang="less">
  .tool-header {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    padding: 0 16px;
    font-style: normal;
    font-weight: 400;
    white-space: nowrap;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
      font-style: normal;
      font-weight: 400;
    }
    .header-center {
    }
    .header-right {
      display: flex;
      justify-content: flex-end;
      gap: 15px;
      font-size: 22px;
    }
    .action-icon {
      cursor: pointer;
      overflow: hidden;
      // vertical-align: -0.15em;
      fill: currentcolor;
      font-size: 20px;
    }
    .disabled {
      cursor: not-allowed !important;
      color: #5a5a5a;
    }
    .block-mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: not-allowed;
      z-index: 998;
    }
    .flow-btn {
      border: 0;
      border-radius: 4px;
      height: 32px;
      padding: 4px 12px;
      color: #ffffff !important;
      .icon {
        margin-right: 5px;
        font-size: 12px;
      }
      &.save {
        background: #57ccef;
      }
      &.markvaild {
        background: #91e0a2;
      }
      &.markinvaild {
        background: #fcb17a;
      }
      &.skip {
        background: #98b0d2;
      }
      &.submit {
        background: #60a9fe;
      }
      &.modify {
        background: #fcb17a;
      }
    }
    .header-divider {
      width: 1px;
      height: 36px;
      border-left: 1px solid #57575c;
      margin: 0 10px;
    }
  }
</style>
