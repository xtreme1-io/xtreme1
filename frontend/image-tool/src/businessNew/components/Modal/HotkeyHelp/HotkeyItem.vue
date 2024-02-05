<template>
  <div class="hotkey-item">
    <div class="hotkey-tips">
      {{ editor.lang(props.item.label as any) }}
      <span v-if="props.item.tips">[{{ editor.lang(props.item.tips as any) }}]</span>
    </div>
    <div class="hotkey-tags">
      <template v-for="(action, index) in props.item.keys" :key="index">
        <span class="action-text">{{ action }}</span>
        <span class="action-plus" v-if="index < props.item.keys.length - 1"> + </span>
      </template>
      <span v-if="props.item.otherKeys">
        <span class="action-plus"> or </span>
        <template v-for="(action, index) in props.item.otherKeys" :key="index">
          <span class="action-text">{{ action }}</span>
          <span
            class="action-plus"
            v-if="props.item.otherKeys && index < props.item.otherKeys.length - 1"
          >
            +
          </span>
        </template>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useInjectBSEditor } from '../../../context';
  import { IKeyboardConfig } from '.';

  const props = defineProps<{ item: IKeyboardConfig }>();

  const editor = useInjectBSEditor();
</script>

<style lang="less" scoped>
  .hotkey-item {
    display: flex;
    margin: 0 32px 16px 16px;
    padding: 10px;
    border-radius: 5px;
    justify-content: space-between;
    height: 45px;
    background-color: #424247;
    font-size: 14px;
    flex-direction: row;
  }

  .hotkey-tips {
    line-height: 25px;
    flex: 1;
  }

  .hotkey-tags {
    .action-text {
      padding: 5px 10px;
      border-radius: 3px;
      background-color: #ffffff;
      font-size: 12px;
      color: #000000;
    }
  }
</style>
