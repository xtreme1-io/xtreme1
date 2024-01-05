<template>
  <div v-bind="$attrs" class="data-info" @click="handleDetail">
    <Tooltip placement="bottom" :title="props.dataInfo.name">
      <span class="name">{{ props.dataInfo.name }}</span>
    </Tooltip>
    <div class="header-info-divider"></div>
    <i class="iconfont icon-information"></i>
  </div>
  <Modal v-model:visible="thisState.visible" :title="editor.lang('titleData')" :footer="false">
    <div class="detail-content">
      <template v-for="data in props.dataInfo.details" :key="data.label">
        <h3> {{ data.label }} </h3>
        <div v-for="item in data.value" :key="item.label" class="detail">
          <div class="label">{{ item.label }}：</div>
          <span class="value">{{ item.value }}</span>
        </div>
      </template>
      <div style="margin-top: 10px; text-align: right">
        <Button @click="handleCopy" type="primary">{{ editor.lang('Copy') }}</Button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';
  import { message, Modal, Tooltip, Button } from 'ant-design-vue';
  import { useClipboard } from '@vueuse/core';
  import { useInjectBSEditor } from '../../../context';
  import { IDataInfo } from '../type';

  interface IDataInfoState {
    dataInfo: IDataInfo;
  }
  const editor = useInjectBSEditor();
  /**
   * props & emits
   */
  const props = defineProps<IDataInfoState>();

  const thisState = reactive({
    visible: false,
  });
  const { copy, isSupported } = useClipboard();
  async function handleCopy() {
    if (isSupported) {
      const data: string[] = [];
      props.dataInfo.details.forEach((option) => {
        data.push(`<${option.label}>\n`);
        option.value.forEach((item: { label: string; value: any }) => {
          data.push(`${item.label}: ${item.value}\n`);
        });
      });
      await copy(data.join(''));
      message.success(editor.lang('copy-ok'));
    } else {
      message.warning(editor.lang('the browser does not support copying'));
    }
  }

  function handleDetail() {
    thisState.visible = !thisState.visible;
  }
</script>

<style lang="less" scoped>
  .data-info {
    display: flex;
    padding: 8px 15px;
    border-radius: 300px;
    justify-content: center;
    align-items: center;
    height: 28px;
    background: #3a3a3e;
    flex-direction: row;
    cursor: pointer;
  }
  .name {
    overflow: hidden;
    max-width: 140px;
    font-size: 14px;
    text-overflow: ellipsis;
    white-space: nowrap;
    // line-height: 16px;
    color: #dee5eb;
  }
  .header-info-divider {
    margin: 0 12px;
    width: 1px;
    height: 100%;
    background-color: #57575c;
  }
  .detail-content {
    padding-left: 32px;
    .detail {
      display: flex;
      gap: 4px;
      margin-bottom: 10px;
      padding-left: 18px;
    }
    .label {
      word-break: keep-all;
    }
    .value {
      word-break: break-word;
    }
  }
</style>
