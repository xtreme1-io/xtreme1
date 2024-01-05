<template>
  <a-collapse class="operation-collapse" v-model:activeKey="state.activeTabs" :bordered="false">
    <a-collapse-panel key="item-1">
      <template #header>
        <div class="header">
          <slot name="header" v-if="$slots.header"></slot>
          <span v-else>{{ header || '' }}</span>
        </div>
      </template>
      <slot></slot>
    </a-collapse-panel>
  </a-collapse>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';

  interface IProps {
    header?: string;
    open?: boolean;
  }
  // ***************Props and Emits***************
  let props = withDefaults(defineProps<IProps>(), {
    open: true,
  });
  // *********************************************
  let state = reactive({
    activeTabs: props.open ? ['item-1'] : [],
  });
</script>

<style lang="less">
  .operation-collapse {
    .ant-collapse-header {
      .tool {
        float: right;
        padding-right: 4px;
        .icon {
          font-size: 14px;
          margin-left: 2px;
          padding: 4px;
          &:hover {
            color: #ed4014;
          }
          &.active {
            background: #3c9be8;
            color: white;
            border-radius: 4px;
          }
        }
      }
    }

    .content {
      height: 300px;
      border: 1px solid;
    }
    .header {
      width: 100%;
    }
  }
</style>
