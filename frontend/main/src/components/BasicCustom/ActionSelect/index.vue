<template>
  <div :class="`${prefixCls}`">
    <div class="actions">
      <Dropdown placement="bottomLeft" :disabled="isSelectAll">
        <div class="actionSelect" :class="isSelectAll ? 'disabled' : null">
          <div class="label">
            <span class="count">{{
              selectedCount !== undefined ? selectedCount : selectedList.length
            }}</span>
            <span class="tips">
              Selected
              <Icon icon="ri:arrow-down-s-fill" />
            </span>
          </div>
        </div>
        <template #overlay>
          <Menu>
            <template v-for="(item, index) in actionList" :key="item.text">
              <Authority :value="item.permission ? [item.permission] : undefined">
                <Menu.Item
                  @click="
                    () => {
                      functionMap[item.function] && functionMap[item.function]();
                    }
                  "
                  :disabled="
                    (selectedList.length === 0 && index > 1) ||
                    (item.isDisabledFlag && flagReactive[item.isDisabledFlag])
                  "
                >
                  <div class="action-item">
                    <SvgIcon v-if="item.svgIcon" size="20" :name="item.svgIcon" />
                    <Icon
                      v-if="item.icon"
                      style="color: @primary-color"
                      size="20"
                      :icon="item.icon"
                    />
                    <img v-if="item.img" width="20" height="20" :src="item.img" alt="" />
                    <span style="display: inline-block; margin-left: 5px">{{ item.text }} </span>
                  </div>
                </Menu.Item>
              </Authority>
              <Divider v-if="item.hasDivider" style="margin: 5px" />
            </template>
          </Menu>
        </template>
      </Dropdown>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { defineProps } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { Dropdown, Menu, Divider } from 'ant-design-vue';
  import { Authority } from '../../Authority';
  import Icon, { SvgIcon } from '../../Icon';
  const { prefixCls } = useDesign('action-select');
  defineProps<{
    isSelectAll?: boolean;
    selectedCount?: Nullable<number>;
    selectedList: any[];
    actionList: any[];
    functionMap: any;
    flagReactive?: any;
  }>();
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-action-select';
  .@{prefix-cls} {
    color: #333;

    .actionSelect {
      position: relative;
      padding: 6px 16px;
      display: inline-block;
      border: 1px solid @primary-color;
      box-sizing: border-box;
      border-radius: 8px;
      background: #fff;
      cursor: pointer;

      &.disabled {
        cursor: not-allowed;
        background: #eee;
      }

      :global(.action-item) {
        display: inline-flex;
        align-items: center;
      }

      .label {
        color: @primary-color;

        .count {
          display: inline-block;
          margin-right: 4px;
        }
      }

      .list {
        position: absolute;
        left: 10px;
        top: 100%;
        width: 100%;

        .item {
          background: #fff;
        }
      }
    }
  }
</style>
