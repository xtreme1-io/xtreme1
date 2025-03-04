<template>
  <div class="source-tab">
    <div class="header">
      <div>{{ t('image.Load Sources') }}</div>
      <div class="select">
        <a-select
          :disabled="editor.state.status !== StatusType.Default"
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
    <div class="content">
      <div class="content-tags">
        {{ t('image.Editing Source') }}
        <a-tag v-for="item in activeTags" :key="item.sourceId" class="active" :title="item.name">
          <div class="tab-label">
            <IconModelsRunsFilter v-if="item.sourceType == 'MODEL'" />
            <IconTabResults v-else />
            <span>{{ item.name }}</span>
          </div>
        </a-tag>
      </div>
      <div class="content-tags">
        <a-tag
          v-for="item in tags"
          :key="item.sourceId"
          :closable="true"
          @click="handleChange(item)"
          @close="handleClose(item)"
          :title="item.name"
        >
          <div class="tab-label">
            <IconModelsRunsFilter v-if="item.sourceType == 'MODEL'" />
            <IconTabResults v-else />
            <span>{{ item.name }}</span>
          </div>
        </a-tag>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, watch, onMounted, onUnmounted } from 'vue';
  import { IconTabResults, IconModelsRunsFilter } from '@basicai/icons';
  import { useInjectBSEditor } from '../../../context';
  import { Event, __ALL__ as ALL_SOURCE, StatusType } from 'image-editor';
  import { SourceType, IResultSource } from '../../../type';
  import { t } from '@/lang';

  const editor = useInjectBSEditor();
  const { state, bsState } = editor;
  const { defaultSourceId } = state.config;

  const sourceList = ref<IResultSource[]>([]);
  const treeData = ref<any[]>([]);
  const replaceFields = {
    options: 'children',
    key: 'sourceId',
    value: 'sourceId',
    label: 'name',
  };

  onMounted(() => {
    editor.on(Event.FRAME_CHANGE, onFrameChange);
  });

  onUnmounted(() => {
    editor.off(Event.FRAME_CHANGE, onFrameChange);
  });

  const tags = ref<IResultSource[]>([]);
  const activeTags = ref<IResultSource[]>([]);

  watch(
    () => bsState.activeSource,
    () => {
      updateTag();
    },
  );

  function onFrameChange() {
    updateSourceList();
    updateTag();
  }

  function updateTag() {
    const keyMap = {} as any;
    bsState.activeSource.forEach((id) => {
      keyMap[id] = true;
    });

    const filters = [] as IResultSource[];
    sourceList.value.forEach((e) => {
      if (keyMap[ALL_SOURCE] || keyMap[e.sourceId]) {
        filters.push({ ...e });
      }
    });

    const withoutTask = filters.filter((e) => e.sourceId == defaultSourceId);
    const others = filters.filter((e) => e.sourceId != defaultSourceId);

    const data = [...withoutTask, ...others];
    if (data.length > 0 && !data.find((e) => e.sourceId == bsState.currentSource)) {
      bsState.currentSource = data[0].sourceId;
      updateData();
    }

    const actives = [] as IResultSource[];
    const unActives = [] as IResultSource[];
    data.forEach((e) => {
      if (e.sourceId == bsState.currentSource) actives.push(e);
      else unActives.push(e);
    });
    activeTags.value = actives;
    tags.value = unActives;
  }

  /** Active */
  const handleChange = (item: IResultSource) => {
    if (bsState.currentSource == item.sourceId) return;
    bsState.currentSource = item.sourceId;
    editor.loadManager.loadDataFromManager();
    updateTag();
  };
  const handleClose = (item: IResultSource) => {
    const sources = sourceList.value;
    if (bsState.activeSource.length == 1 && bsState.activeSource[0] == ALL_SOURCE) {
      bsState.activeSource = sources
        .filter((e) => e.sourceId !== item.sourceId)
        .map((e) => e.sourceId);
    } else {
      bsState.activeSource = bsState.activeSource.filter((e) => e !== item.sourceId);
    }
    updateData();
  };

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

  function updateData() {
    editor.loadManager.loadDataFromManager();
  }

  function updateSourceList() {
    const frame = editor.getCurrentFrame();
    const sources = editor.dataManager.getSources(frame);
    if (!sources) return;
    sourceList.value = sources;

    const groundTruth = sources.filter((e) => e.sourceType != SourceType.MODEL);
    const model = sources.filter((e) => e.sourceType == SourceType.MODEL);

    const data = [
      {
        name: 'ALL',
        sourceId: ALL_SOURCE,
      } as any,
    ];
    if (groundTruth.length > 0)
      data.push({
        name: 'Ground Truth',
        sourceId: 'GROUND_TRUTH',
        children: groundTruth,
      });

    if (model.length > 0) {
      data.push({
        name: 'Model Runs',
        sourceId: 'MODEL_RUNS',
        children: model,
      });
    }
    treeData.value = data;
  }
</script>
<style lang="less">
  .source-tab {
    margin-bottom: 4px;
    padding: 4px 10px 12px;
    width: 100%;
    min-height: 112px;
    background-color: #1e1f22;

    .header {
      display: flex;
      margin-bottom: 4px;
      align-items: center;
      height: 28px;
      color: #dee5eb;
      gap: 10px;

      .select {
        flex: 1;
      }
    }

    .content {
      display: flex;
      flex-flow: column wrap;
      padding: 10px 0;
      gap: 8px;
      color: #dee5eb;

      &-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        line-height: 26px;
      }

      .ant-tag {
        display: flex;
        // width: 125px;
        margin: 0 !important;
        border-radius: 4px;
        align-items: center;
        font-size: 14px;
        cursor: pointer;

        &.active {
          background-color: @primary-color;
        }

        .tab-label {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          line-height: 26px;

          span {
            display: block;
            overflow: hidden;
            max-width: 80px;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
  }

  .result-source-select {
    .ant-select-tree-checkbox {
      top: 4px;
      margin: 0;
    }

    .ant-select-tree-title {
      display: block;
      overflow: hidden;
      width: 125px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>
