<template>
  <div class="pc-editor-operation">
    <SourceTab v-if="!bsState.isTaskFlow" />
    <ToolModel v-if="editor.state.ToolModeList.length > 1" />
    <ToolOperation :langType="state.lang" :tabs="tabPane" v-model:active="activeKey">
      <template #validity>
        <!-- <TabValidity v-bind="validityProps" /> -->
        <Validity />
      </template>
      <template #classification><Classification /></template>
      <template #results><Instance /></template>
      <template #comments><Comment /></template>
    </ToolOperation>
    <div v-show="!canOperate()" class="over-not-allowed"></div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useInjectBSEditor } from '../../context';
  import Event from '../../config/event';

  import { ToolOperation, OperationTabEnum } from '@basicai/tool-components';

  import SourceTab from './SourceTab/index.vue';
  import ToolModel from './ToolModel/index.vue';
  import Validity from './Validity/index.vue';
  // import Classification from './Classification/index.vue';
  import Classification from './Classification/ClassificationNew.vue';
  import Instance from './Instance/index.vue';

  import Comment from './Comment/index.vue';
  import useUI from 'image-ui/hook/useUI';

  const editor = useInjectBSEditor();
  const { bsState, state } = editor;
  const activeKey = ref<OperationTabEnum>(OperationTabEnum.Results);
  editor.on(Event.OPERATION_TAB_CHANGE, (key) => {
    activeKey.value = key;
  });
  const { canOperate } = useUI();

  const tabPane = computed(() => {
    if (editor.state.modeConfig.name === 'empty') return [];

    const hasComment = editor.bsState.isTaskFlow && !editor.state.isHistoryView;
    const tabs = [
      {
        key: OperationTabEnum.Validity,
      },
      {
        key: OperationTabEnum.Classification,
      },
      {
        key: OperationTabEnum.Results,
      },
    ];

    if (hasComment) tabs.push({ key: OperationTabEnum.Comments });

    return tabs;
  });
</script>

<style lang="less">
  .pc-editor-operation {
    display: flex;
    height: 100%;
    color: white;
    flex-direction: column;

    .operation-tabs .tab-pane .tab-pane-item.active {
      background-color: @primary-color;
    }

    .ant-collapse-content-box {
      height: 100%;
    }
  }
</style>
