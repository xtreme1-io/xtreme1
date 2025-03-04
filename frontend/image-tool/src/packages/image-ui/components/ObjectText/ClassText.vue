<template>
  <div class="object-title">
    <div
      v-for="item in data"
      :key="item.objectId"
      class="item"
      :style="{
        transform: `translate(${item.x}px, ${item.y}px)`,
        zIndex: item.zindex ?? 0,
      }"
    >
      <div class="item-class-title" :style="{ background: item.color }">
        <label v-show="config.showResultNumber && item.trackName">
          #{{ item.trackName }}&nbsp;
        </label>
        <label v-show="config.showClassTitle"> {{ item.className }} </label>
      </div>
      <div class="item-invalid" v-show="item.limitInfo">
        <warning-outlined style="color: #fcb17a" />
        <label>{{ t('image.Class Invalid') }}</label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { WarningOutlined } from '@ant-design/icons-vue';
  import { useInjectEditor } from '../../context';
  import { ITextItem } from './useClassTag';
  import { t } from '@/lang';

  interface IProps {
    data: ITextItem[];
  }
  defineProps<IProps>();

  const editor = useInjectEditor();
  const { config } = editor.state;
</script>

<style lang="less" scoped>
  .object-title {
    position: absolute;
    user-select: none;
    pointer-events: none;

    .item {
      display: flex;
      position: absolute;
      margin-top: -24px;
      height: 22px;
      font-size: 12px;
      white-space: nowrap;
      color: white;
      flex-direction: row;
      gap: 1px;
      line-height: 22px;
      pointer-events: none;
      transform-origin: 0 110%;
      // opacity: 0.8;
      &-class-title {
        padding: 0 6px;
        border-radius: 4px;
        background: rgb(255 0 0);
      }

      &-invalid {
        padding: 0 6px;
        border-radius: 4px;
        background-color: #ffffff;
        color: #fcb17a;
      }
    }
  }
</style>
