<template>
  <div class="close-btn" @click="$emit('onClose')">
    <CloseOutlined />
    <span style="margin-left: 4px">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
  import { CloseOutlined } from '@ant-design/icons-vue';

  defineProps<{ label: string }>();
  defineEmits(['onClose']);
</script>

<style lang="less" scoped>
  .close-btn {
    font-size: 20px;
    font-weight: 400;
    font-style: normal;
    cursor: pointer;
    :hover {
      color: #ffffff;
    }
  }
</style>
