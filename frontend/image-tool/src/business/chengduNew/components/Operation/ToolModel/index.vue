<template>
  <div class="tab-btns">
    <a-radio-group :value="state.imageToolMode" @change="changeToolMode" style="width: 260px">
      <a-radio-button
        v-for="item in toolOptions"
        :key="item.value"
        style="padding: 0 0 0 6px; width: 50%"
        :value="item.value"
        :title="item.tips"
      >
        <component style="font-size: 14px" :is="item.icon" />
        {{ item.label }}
      </a-radio-button>
    </a-radio-group>
    <a-tooltip overlayClassName="filter-tooltip" placement="bottomRight" trigger="hover">
      <FilterFilled class="filter-icon" />
      <template #title>
        <a-checkbox-group v-model:value="state.resultTypeFilter" @change="onFilterChange">
          <div v-for="item in toolOptions" :key="item.value">
            <a-checkbox
              :disabled="state.imageToolMode === item.value"
              style="margin-left: 8px; user-select: none"
              :value="item.value"
            >
              {{ item.label }}
            </a-checkbox>
          </div>
        </a-checkbox-group>
      </template>
    </a-tooltip>
    <div v-show="!canOperate()" class="over-not-allowed"></div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { Component } from 'vue';
  import { FilterFilled } from '@ant-design/icons-vue';

  import { useInjectBSEditor } from '../../../context';
  import { ToolModelEnum } from 'image-editor';
  import { t } from '@/lang';
  import useUI from 'image-ui/hook/useUI';
  import { IconTooltypePolygon, IconTarget } from '@basicai/icons';

  interface ITool {
    value: ToolModelEnum;
    label: string;
    icon: Component;
    tips: string;
  }
  const { canOperate } = useUI();
  const editor = useInjectBSEditor();
  const { state } = editor;
  // 屏蔽分割功能
  // state.ToolModeList = [ToolModelEnum.INSTANCE];

  const toolOptions = computed(() => {
    const options = editor.state.ToolModeList;
    return options ? options.map((key) => getTool(key)) : [];
  });

  function getTool(type: ToolModelEnum) {
    let tool: ITool;
    switch (type) {
      case ToolModelEnum.INSTANCE: {
        tool = {
          value: ToolModelEnum.INSTANCE,
          label: t('image.Instance'),
          icon: IconTooltypePolygon,
          tips: 'alt+1',
        };
        break;
      }
      case ToolModelEnum.SEGMENTATION: {
        tool = {
          value: ToolModelEnum.SEGMENTATION,
          label: t('image.Segmentation'),
          icon: IconTarget,
          tips: 'alt+2',
        };
        break;
      }
    }
    return tool;
  }
  function changeToolMode(type: any) {
    const data = getTool(type.target.value).value;
    editor.actionManager.execute('changeToolMode', data);
  }

  function onFilterChange() {
    editor.mainView.updateShapeRoot();
  }
</script>

<style lang="less" scoped>
  .tab-btns {
    position: relative;
    width: 100%;
    background-color: #303036;
    text-align: left;

    button {
      display: inline-flex;
      padding: 0;
      border: 1px solid #1e1f22;
      justify-content: center;
      align-items: center;
      width: 115px;
      background: none;
      color: #dddede;
      flex-direction: row;

      &:hover {
        border-color: @primary-color;
        color: @primary-color;
        cursor: pointer;
      }

      &.active {
        background-color: @primary-color;
        color: #dddede;
      }
    }

    .filter-icon {
      margin-right: 10px;
      padding-top: 5px;
      float: right;
      line-height: 24px;

      &:hover {
        color: @primary-color;
      }
    }
  }
</style>
