<template>
  <div class="skeleton-info">
    <div
      class="item"
      v-for="item in data"
      :key="item.name + item.anchorIndex + item.objectIndex"
      :style="{ transform: `translate(${item.x + offsetX}px, ${item.y + offsetY}px)` }"
    >
      <div style="line-height: 1; height: 14px">
        <span
          v-show="config.showResultNumber"
          class="number"
          :style="{
            borderColor: activeIndex === item.anchorIndex ? '#f00' : item.objectColor,
          }"
        >
          {{ item.objectIndex }}
        </span>
        <span
          v-show="config.showClassTitle"
          class="name"
          :style="{ color: activeIndex === item.anchorIndex ? '#f00' : item.objectColor }"
        >
          {{ item.name }}
        </span>
      </div>
      <div v-show="item.info" class="info" :style="{ color: item.anchorColor }">{{
        item.info
      }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ISkeletonInfo } from './type';
  import { useInjectEditor } from '../../context';

  const offsetX = 10;
  const offsetY = -22;

  interface IProps {
    data: ISkeletonInfo[];
    activeIndex: number;
  }
  defineProps<IProps>();

  const editor = useInjectEditor();
  const config = editor.state.config;
</script>

<style lang="less">
  .skeleton-info {
    position: absolute;
    user-select: none;
    pointer-events: none;

    .item {
      position: absolute;
      text-align: left;
      white-space: nowrap;
    }

    .number {
      display: inline-block;
      margin-right: 4px;
      padding: 0 4px;
      border: 1px solid #60a9fe;
      border-radius: 4px;
      height: 14px;
      background: white;
      color: #60a9fe;
      line-height: 13px;
    }

    .info,
    .name {
      font-size: 12px;
      color: #60a9fe;
    }

    .info {
      margin-top: 2px;
      font-size: 12px;
      text-align: left;
      color: #d89614;
      line-height: 1;
    }
  }
</style>
