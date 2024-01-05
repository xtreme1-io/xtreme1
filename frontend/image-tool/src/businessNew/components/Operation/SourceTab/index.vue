<template>
  <Collapse header="Results source">
    <div class="operation-results">
      <div class="filter-wrap">
        <a-select
          v-model:value="bsState.activeSource"
          mode="multiple"
          :fieldNames="replaceFields"
          :maxTagCount="1"
          :maxTagTextLength="6"
          style="width: 100%"
          :showSearch="false"
          :options="treeData"
          @deselect="onDeselect"
          @select="onSelect"
        >
        </a-select>
      </div>
    </div>
  </Collapse>
</template>
<script lang="ts" setup>
  import Collapse from '../../Collapse/index.vue';
  import { onMounted, onUnmounted, ref } from 'vue';
  import { useInjectBSEditor } from '../../../context';
  import { SourceType, Event, __ALL__ as ALL_SOURCE } from 'image-editor';

  const editor = useInjectBSEditor();
  const { bsState } = editor;

  const treeData = ref<any[]>([]);
  const replaceFields = {
    label: 'name',
    value: 'sourceId',
    options: 'children',
  };

  onMounted(() => {
    editor.on(Event.FRAME_CHANGE, onFrameChange);
  });

  onUnmounted(() => {
    editor.off(Event.FRAME_CHANGE, onFrameChange);
  });

  function onFrameChange() {
    updateSourceList();
  }
  function updateData() {
    editor.mainView.renderFrame();
  }

  function onSelect(value: string) {
    const ALL = ALL_SOURCE;
    if (value === ALL && bsState.activeSource.length > 1) {
      bsState.activeSource = [ALL];
    } else if (value !== ALL && bsState.activeSource.indexOf(ALL) >= 0) {
      bsState.activeSource = bsState.activeSource.filter((v) => v !== ALL);
    }
    updateData();
  }
  function onDeselect() {
    if (bsState.activeSource.length === 0) {
      bsState.activeSource = [ALL_SOURCE];
    }
    updateData();
  }
  function updateSourceList() {
    const frame = editor.getCurrentFrame();
    const sources = editor.dataManager.getSources(frame);
    if (!sources) return;
    const model = sources.filter((e) => e.sourceType == SourceType.MODEL);

    const data: any[] = [
      {
        name: 'ALL',
        sourceId: ALL_SOURCE,
      },
      {
        name: 'Ground Truth',
        sourceId: editor.state.defaultSourceId,
      },
    ];
    if (model.length > 0) {
      data.push({
        name: 'Model Runs',
        sourceId: 'MODEL_RUNS',
        children: model,
      });
    }
    console.log('data', data);
    treeData.value = data;
  }
</script>
<style lang="less">
  .operation-results {
    // height: 40px;
    background: #1e1f23;

    padding: 4px 8px;
    // padding-left: 12px;
    margin-bottom: 6px;

    .ant-select-selection-overflow-item-suffix {
      display: none;
    }

    .filter-wrap {
      display: flex;
      align-items: center;
      .title {
        // color: rgba(177, 177, 177, 0.85);
        margin-right: 6px;
      }

      .ant-select-multiple .ant-select-selection-item {
        max-width: 70px;
      }
    }

    .result-source-wrap {
      // min-height: 100px;
      background: #1e1f23;
      padding: 10px 0px;

      .source-item {
        display: inline-block;
        font-size: 14px;
        line-height: 16px;
        border: 1px solid rgba(222, 229, 235, 1);
        padding: 4px 6px;
        border-radius: 4px;
        margin-right: 4px;
        margin-top: 4px;
        cursor: pointer;
        user-select: none;

        .iconfont {
          vertical-align: middle;
          font-size: 12px;
          margin-right: 4px;
        }
        .remove {
          font-size: 12px;
          vertical-align: middle;
        }

        .name {
          display: inline-block;
          max-width: 85px;
          vertical-align: middle;
        }

        &.active {
          background: red;
          color: white;
          border-color: transparent;
        }
      }
    }
  }
</style>
