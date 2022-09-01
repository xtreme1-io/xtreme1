<template>
  <Popover
    v-model:visible="isVisible"
    v-bind="$attrs"
    placement="left"
    overlayClassName="custom-popover"
  >
    <template #content>
      <div :class="noClass ? null : 'popover-list'" @click="handleClick">
        <slot name="content"></slot>
      </div>
    </template>
    <slot></slot>
  </Popover>
</template>
<script lang="tsx" setup>
  import { Popover } from 'ant-design-vue';
  import { ref, defineProps } from 'vue';

  defineProps({
    noClass: Boolean,
  });
  const isVisible = ref<boolean>(false);

  const handleClick = () => {
    isVisible.value = false;
  };
</script>
<style lang="less">
  .custom-popover {
    .ant-popover-content {
      border-radius: 8px;

      .ant-popover-arrow {
        display: none;
      }

      .ant-popover-inner {
        border-radius: 8px;
        box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.15);
      }
    }

    .popover-list {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      padding: 10px 0px;
      border-radius: 8px;
      background: #fff;

      & > div {
        min-width: 180px;
        width: 100%;
        height: 36px;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        cursor: pointer;

        .icon {
          width: 16px;
          height: 16px;
        }

        .title {
          flex: 1;
          font-size: 14px;
          line-height: 16px;
          color: #333;
        }

        &:hover {
          background: rgba(87, 204, 239, 0.15);
        }
      }
    }
  }
</style>
