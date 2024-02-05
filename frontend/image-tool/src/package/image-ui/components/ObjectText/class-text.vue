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
        <label v-show="item.trackName"> #{{ item.trackName }}&nbsp; </label>
        <label>
          {{ item.className }}
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ITextItem } from './type';

  defineProps<{ data: ITextItem[] }>();
</script>

<style lang="less" scoped></style>
