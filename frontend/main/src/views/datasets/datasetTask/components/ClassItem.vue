<template>
  <div class="class-item">
    <div class="content">
      <div class="type">
        <img :src="imgFactory(record)" alt="" />
      </div>
      <div class="name">{{ record.name }}</div>
    </div>
    <div class="action">
      <Icon
        v-if="type === 'remove'"
        style="color: #57ccef; cursor: pointer"
        icon="mdi:window-close"
        size="18"
        @click="emits('handleRemove', record.id)"
      />
      <Icon
        v-else
        style="color: #57ccef; cursor: pointer"
        icon="ic:baseline-add"
        size="20"
        @click="emits('handleSelect', record.id)"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { defineProps, defineEmits } from 'vue';
  import Icon from '/@/components/Icon';
  import { imgFactory } from '/@/utils/business/classUtil';
  const emits = defineEmits(['handleSelect', 'handleRemove']);
  defineProps<{
    record: any;
    type?: 'remove' | 'add';
  }>();
</script>
<style lang="less" scoped>
  .class-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 16px;
    padding: 4px 6px;
    height: 24px;
    font-size: 10px;
    line-height: 12px;
    margin-bottom: 6px;

    .content {
      display: flex;
      align-items: center;
    }

    .type {
      margin-right: 4px;
      flex-shrink: 0;

      img {
        width: 16px;
      }
    }

    .name {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    .action {
      display: none;
    }

    &:hover {
      background: #e6f7fd;

      .action {
        display: block;
      }
    }
  }
</style>
