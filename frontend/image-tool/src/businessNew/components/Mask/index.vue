<template>
  <div :style="maskStyle" class="mask">
    <!-- <loading v-if="showLoading" /> -->
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  interface IConfig {
    zIndex?: number;
    bgColor?: string;
    showLoading?: boolean;
  }
  const props = withDefaults(defineProps<IConfig>(), {
    zIndex: 999,
    bgColor: 'rgba(0,0,0,0.6)',
    showLoading: false,
  });
  const maskStyle = computed(() => {
    return {
      zIndex: props.zIndex,
      background: props.bgColor,
    };
  });
</script>

<style lang="less" scoped>
  .mask {
    position: absolute;
    inset: 0;
  }
</style>
