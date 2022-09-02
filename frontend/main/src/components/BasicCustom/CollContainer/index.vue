<template>
  <div :class="`${prefixCls}`">
    <div class="header">
      <div class="wrapper">
        <Icon
          style="
            background: #fff;
            border-radius: 4px;
            width: 16px;
            height: 16px;
            padding-left: 2px;
            padding-top: 2px;
            color: #57ccef;
          "
          size="12"
          :icon="icon"
        />
        <span class="title">{{ title }}</span>
      </div>
      <div class="right-fix">
        <Icon
          :style="coll ? { transform: 'rotate(180deg)' } : {}"
          size="12"
          icon="bi:chevron-down"
          @click="handleTrigger"
        />
      </div>
    </div>
    <div v-if="coll" class="flex">
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, defineProps } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import Icon from '/@/components/Icon';
  const { prefixCls } = useDesign('coll-container');
  const coll = ref(true);

  const handleTrigger = () => {
    coll.value = !coll.value;
  };
  defineProps<{
    icon: string;
    title: string;
  }>();
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-coll-container';
  .@{prefix-cls} {
    margin-bottom: 10px;
    padding: 6px;
    border-radius: 10px;
    background: #f3f3f3;

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .wrapper {
        display: flex;
        align-items: center;

        .title {
          display: inline-block;
          margin-left: 5px;
        }
      }

      .right-fix {
        display: inline-flex;
        width: 16px;
        height: 16px;
        background: #fff;
        border-radius: 4px;
        justify-content: center;
        align-items: center;
      }
    }
  }
</style>
