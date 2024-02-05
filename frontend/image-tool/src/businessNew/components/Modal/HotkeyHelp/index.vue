<template>
  <div class="hotkey-body">
    <a-row>
      <a-col :span="15"></a-col>
      <a-col :span="8">
        <a-input-search v-model:value="searchValue" :placeholder="editor.lang('Input keyword')" />
      </a-col>
    </a-row>
    <div class="body-content">
      <div v-for="list in shortcutsData" :key="list.key">
        <a-row v-if="list.value.length > 0">
          <a-col :span="24" class="i-flex i-header">
            <div>{{ editor.lang(list.key as any) }}</div>
            <div class="i-title-line"></div>
          </a-col>
          <a-col :span="12" v-for="item in list.value" :key="item.label">
            <HotkeyItem :item="item" />
          </a-col>
        </a-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useInjectBSEditor } from '../../../context';
  import { AnnotateModeEnum, tools } from 'image-editor';
  import {
    IKeyboardConfig,
    dataConfig,
    elseConfig,
    imageConfig,
    instanceConfig,
    resultConfig,
  } from './index';

  import HotkeyItem from './HotkeyItem.vue';

  const editor = useInjectBSEditor();
  const activeVal = ref<AnnotateModeEnum>(AnnotateModeEnum.INSTANCE);
  const searchValue = ref('');

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
        label: tool.name,
        tips: '',
        keys: [String(tool.hotkey)],
        tags: [activeVal.value],
      };
    });
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

  function filterSearch(list: IKeyboardConfig[], model: AnnotateModeEnum, search: string) {
    list = list.filter((e) => e.tags.includes(model));
    if (search) {
      return list.filter((item) => {
        const filterReg = new RegExp(search, 'i');
        let filterVal =
          editor.lang(item.label as any) + editor.lang(item.tips as any) + item.keys.join();
        item.otherKeys && (filterVal += item.otherKeys.join());
        return filterReg.test(filterVal);
        // const filterSpace = filterVal.replace(/ /g, '');
        // return filterReg.test(filterVal) || filterReg.test(filterSpace);
      });
    } else {
      return list;
    }
  }
</script>

<style lang="less" scoped>
  .hotkey-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-height: 650px;

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
        border-color: #57ccef;
        color: #57ccef;
        cursor: pointer;
      }

      &.active {
        background-color: #57ccef;
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
