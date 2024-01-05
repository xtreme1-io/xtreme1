<template>
  <a-popover
    overlayClassName="result-header-show"
    :title="editor.lang('Setting')"
    placement="bottomRight"
    :trigger="['click']"
  >
    <i class="icon iconfont icon-more" @click.stop />
    <template #content>
      <a-row class="setting-item">
        <a-col :span="16" class="title">
          <span class="item-title">{{ editor.lang('Show Size') }}</span>
        </a-col>
        <a-col :span="8">
          <a-switch
            size="small"
            v-model:checked="config.showSize"
            checked-children="On"
            un-checked-children="Off"
            @change="onChange"
          />
        </a-col>
      </a-row>
      <a-row class="setting-item">
        <a-col :span="16" class="title">
          <span class="item-title">{{ editor.lang('Show Attr') }}</span>
        </a-col>
        <a-col :span="8">
          <a-switch
            size="small"
            v-model:checked="config.showAttrs"
            checked-children="On"
            un-checked-children="Off"
            @change="onChange"
          />
        </a-col>
      </a-row>
    </template>
  </a-popover>
</template>

<script setup lang="ts">
  import { useInjectBSEditor } from '../../../../context';
  import { useResultsInject } from '../context';

  const editor = useInjectBSEditor();
  const { bsState } = editor;
  const config = editor.state.config;
  const { onUpdateList } = useResultsInject();

  function onChange() {
    onUpdateList();
  }
</script>

<style lang="less" scoped>
  .result-header-show {
    .setting-item {
      margin: 4px 0;
    }

    .item-title {
      font-size: 12px;
    }
  }
</style>
