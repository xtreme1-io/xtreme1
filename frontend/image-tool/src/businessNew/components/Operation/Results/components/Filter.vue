<template>
  <a-popover
    :title="editor.lang('Filter')"
    placement="bottomRight"
    :trigger="['click']"
    overlayClassName="result-header-filter"
  >
    <i class="iconfont icon-filter icon" @click.stop />
    <template #content>
      <div class="filter-body">
        <a-tree
          class="filter-tree"
          checkable
          :treeData="classList"
          :defaultExpandAll="true"
          v-model:checkedKeys="bsState.filterClasses"
          @check="handleCheck"
          :selectable="false"
        >
        </a-tree>
      </div>
      <div class="filter-divider"></div>
      <div class="filter-footer">
        <a-button size="small" @click="onReset">
          {{ editor.lang('Reset') }}
        </a-button>
      </div>
    </template>
  </a-popover>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { __ALL__ as ALL } from 'image-editor';
  import { useInjectBSEditor } from '../../../../context';

  const editor = useInjectBSEditor();
  const { bsState } = editor;

  const classList = computed(() => {
    const list = editor.state.classTypes.map((e) => {
      return { title: e.name, key: e.id };
    });
    list.unshift({ title: editor.lang('Class Required'), key: '' });
    return [{ title: 'All', key: ALL, children: list }];
  });

  const handleCheck = () => {
    editor.mainView.renderFrame();
  };

  function onReset() {
    bsState.filterClasses = [ALL];
    editor.mainView.renderFrame();
  }
</script>
<style lang="less">
  .result-header-filter {
    width: 240px;

    .filter {
      position: absolute;
      top: 40px;
      right: 16px;
      padding: 12px 16px;
      border-radius: 4px;
      z-index: 10;
      overflow-x: hidden;
      background-color: #1f1f1f;
      color: rgb(255 255 255 / 85%);
    }

    .filter-title {
      margin: 0;
      padding: 5px 16px 4px;
      min-width: 177px;
      min-height: 32px;
      color: rgb(255 255 255 / 85%);
      font-weight: 500;
      border-bottom: 1px solid #303030;
    }

    .filter-body {
      overflow: overlay;
      max-height: 400px;
      color: rgb(255 255 255 / 85%);
    }

    .filter-divider {
      margin-top: 10px;
      width: 100%;
      height: 1px;
      background-color: #303030;
    }

    .filter-footer {
      display: flex;
      padding-top: 10px;
      justify-content: space-between;
    }
  }
  .filter-tree {
    .ant-tree-switcher {
      display: none !important;
    }
  }
</style>
