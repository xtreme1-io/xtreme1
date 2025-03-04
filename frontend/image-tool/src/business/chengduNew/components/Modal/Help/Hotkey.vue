<template>
  <div class="hotkey-body">
    <a-row>
      <a-col :span="15">
        <button
          v-for="item in toolOptions"
          :key="item.value"
          :class="{ active: activeVal == item.value }"
          @click="changeToolMode(item.value)"
        >
          <component :is="item.icon" />
          {{ item.label }}
        </button>
      </a-col>
      <a-col :span="8">
        <a-input-search v-model:value="searchValue" :placeholder="t('image.Input keyword')" />
      </a-col>
    </a-row>
    <div class="body-content">
      <div v-for="list in shortcutsData" :key="list.key">
        <a-row v-if="list.value.length > 0">
          <a-col :span="24" class="i-flex i-header">
            <div>{{ editor.tI(list.key) }}</div>
            <div class="i-title-line"></div>
          </a-col>
          <a-col :span="12" v-for="item in list.value" :key="item.label()">
            <HotkeyItem :item="item" />
          </a-col>
        </a-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import type { Component } from 'vue';
  import { ToolModelEnum } from 'image-editor';
  import { t } from '@/lang';
  import { useInjectBSEditor } from '../../../context';
  import {
    IKeyboardConfig,
    dataConfig,
    elseConfig,
    imageConfig,
    instanceConfig,
    resultConfig,
    segmentToolConfig,
  } from './HotkeyConfig';
  import { tools } from 'image-ui/components/Tool/item';
  import { IconTooltypePolygon, IconTarget } from '@basicai/icons';

  import HotkeyItem from './HotkeyItem.vue';

  interface ITool {
    value: ToolModelEnum;
    label: string;
    icon: Component;
  }

  const editor = useInjectBSEditor();
  const activeVal = ref<ToolModelEnum>(ToolModelEnum.INSTANCE);
  const searchValue = ref('');

  const toolOptions = computed(() => {
    // 屏蔽分割功能
    // const options = [ToolModelEnum.INSTANCE];
    const options = [ToolModelEnum.INSTANCE, ToolModelEnum.SEGMENTATION];
    return options ? options.map((key) => getTool(key)) : [];
  });

  // 快捷键数据
  const dataList = computed(() => {
    return filterSearch(dataConfig, activeVal.value, searchValue.value);
  });
  const instanceList = computed(() => {
    return filterSearch(instanceConfig, activeVal.value, searchValue.value);
  });
  const toolList = computed(() => {
    const map = tools[activeVal.value];
    const list = [...map.fixed, ...map.model, ...map.tools]
      .filter((e) => e.isDisplay(editor) && e.hotkey)
      .sort((tool1, tool2) => Number(tool1.hotkey) - Number(tool2.hotkey));
    const toolList = list.map((tool) => {
      return {
        label: () => editor.tI(tool.name),
        keys: [String(tool.hotkey)],
        tags: [activeVal.value],
      };
    });
    if (activeVal.value === ToolModelEnum.SEGMENTATION) {
      toolList.push(...segmentToolConfig);
    }
    return filterSearch(toolList, activeVal.value, searchValue.value);
  });
  const resultList = computed(() => {
    return filterSearch(resultConfig, activeVal.value, searchValue.value);
  });
  const imageList = computed(() => {
    return filterSearch(imageConfig, activeVal.value, searchValue.value);
  });
  const elseList = computed(() => {
    return filterSearch(elseConfig, activeVal.value, searchValue.value);
  });
  const shortcutsData = computed(() => {
    return [
      {
        key: 'Data',
        value: dataList.value,
      },
      {
        key: 'Actions',
        value: instanceList.value,
      },
      {
        key: 'Tool',
        value: toolList.value,
      },
      {
        key: 'Result',
        value: resultList.value,
      },
      {
        key: 'Image',
        value: imageList.value,
      },
      {
        key: 'Else',
        value: elseList.value,
      },
    ];
  });

  // 搜索过滤
  function filterSearch(list: IKeyboardConfig[], model: ToolModelEnum, search: string) {
    list = list.filter((e) => e.tags.includes(model));
    if (search) {
      return list.filter((item) => {
        const filterReg = new RegExp(search, 'i');
        let filterVal = item.label() + item.keys.join();
        item.tips && (filterVal += editor.tI(item.tips));
        item.otherKeys && (filterVal += item.otherKeys.join());
        return filterReg.test(filterVal);
        // 搜索忽略空格
        // const filterSpace = filterVal.replace(/ /g, '');
        // return filterReg.test(filterVal) || filterReg.test(filterSpace);
      });
    } else {
      return list;
    }
  }
  function getTool(type: ToolModelEnum) {
    let tool: ITool;
    switch (type) {
      case ToolModelEnum.INSTANCE: {
        tool = {
          value: ToolModelEnum.INSTANCE,
          label: t('image.Instance'),
          icon: IconTooltypePolygon,
        };
        break;
      }
      case ToolModelEnum.SEGMENTATION: {
        tool = {
          value: ToolModelEnum.SEGMENTATION,
          label: t('image.Segmentation'),
          icon: IconTarget,
        };
        break;
      }
    }
    return tool;
  }
  function changeToolMode(type: ToolModelEnum) {
    if (activeVal.value === type) return;
    activeVal.value = type;
  }
</script>

<style lang="less" scoped>
  .hotkey-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-height: 600px;

    .body-content {
      overflow: auto;
      max-height: 600px;
    }

    button {
      border: 1px solid #1e1f22;
      width: 140px;
      background: none;
      color: #dddede;

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

    .i-header {
      height: 30px;
      font-size: 16px;
      line-height: 30px;
    }

    .i-flex {
      display: flex;

      .i-title-line {
        margin: 0 40px 0 8px;
        height: 1px;
        flex: 1 1 0;
        border-top: 1px solid #515151;
        align-self: center;
      }
    }
  }

  .content-text-no {
    width: 100%;
    text-align: center;
  }
</style>
