<template>
  <a-collapse class="operation-collapse" :activeKey="activeTabs" :bordered="false">
    <a-collapse-panel key="item-1" :showArrow="false">
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
  import { computed } from 'vue';

  interface IProps {
    header?: string;
    open?: boolean;
    expandIcon?: any;
  }
  // ***************Props and Emits***************
  const props = withDefaults(defineProps<IProps>(), {
    open: true,
  });
  // *********************************************
  const activeTabs = computed(() => {
    return props.open ? ['item-1'] : [];
  });
</script>

<style lang="less" scoped>
  .operation-collapse {
    border: 1px solid #1e1f22;
    border-radius: 0;
    overflow: hidden;
    background-color: #303036;
    flex: 1;

    .ant-collapse-item {
      height: auto;
      background: hsl(225deg 6% 13%);

      &.ant-collapse-item-active {
        height: 100%;
        background: #303036;
      }

      :deep(.ant-collapse-header) {
        display: flex;
        padding: 4px;
        padding-left: 10px;
        align-items: center;
        height: 40px;
        background: #1e1f22;
        font-size: 14px;
        text-align: left;
        font-weight: 600;

        .ant-collapse-arrow {
          left: 10px;
        }

        .content {
          border: 1px solid;
          height: 300px;
        }

        .header {
          display: flex;
          align-items: center;
          width: 100%;
          gap: 5px;

          .header-content {
            .tool {
              padding-right: 4px;
              float: right;

              .icon {
                margin: 0 4px;
                font-size: 16px;
                outline: none;

                &:hover {
                  color: #ed4014;
                }
              }
            }
          }
        }
      }

      :deep(.ant-collapse-content) {
        display: flex;
        position: relative;
        border: none;
        overflow: hidden overlay;
        height: calc(100% - 45px);

        .ant-collapse-content-box {
          padding: 0;
          background: #303036;
          flex: 1;
        }
      }
    }
  }
</style>
