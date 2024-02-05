<template>
  <Tooltip :title="title" :trigger="title ? 'hover' : undefined">
    <Button :class="['flow-btn', type]" :loading="loading" @click="$emit('onActions', type)">
      <template #icon><slot name="icon" /></template>
      <slot />
    </Button>
  </Tooltip>
</template>

<script setup lang="ts">
  import { Tooltip, Button } from 'ant-design-vue';
  import { FlowAction } from '../../../types';

  interface IActionBtnProps {
    type: FlowAction;
    title?: string;
    loading?: boolean;
  }
  defineProps<IActionBtnProps>();
  defineEmits(['onActions']);
</script>

<style lang="less" scoped></style>
