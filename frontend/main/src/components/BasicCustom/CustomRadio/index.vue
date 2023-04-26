<template>
  <div :class="`${prefixCls}`">
    <div class="options">
      <span
        :class="`item ${type === null ? 'active' : null}`"
        @click="
          () => {
            handleChange(null);
          }
        "
      >
        All
      </span>
      <span
        v-for="item in options"
        :key="item.label"
        :class="`item ${item.value === type ? 'active' : null}`"
        @click="
          () => {
            handleChange(item.value);
          }
        "
      >
        {{ item.label }}
      </span>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { defineProps, defineEmits } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  // const active = ref<string>();
  const { prefixCls } = useDesign('custom-radio');

  // const { t } = useI18n();
  defineProps<{
    options: { label: string; value: string }[];
    type: Nullable<string>;
  }>();
  const emits = defineEmits(['update:type']);

  const handleChange = (value) => {
    emits('update:type', value);
    // active.value = value;
  };
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-custom-radio';
  .@{prefix-cls} {
    color: #333;
    // display: flex;
    margin-top: 6px;
    font-size: 12px;
    // .options {
    .item {
      cursor: pointer;
      margin-right: 10px;

      &:last-child {
        margin-right: 0;
      }

      &.active {
        color: @primary-color;
      }
    }
    // }
    // .box {
    //   text-align: center;
    // }
  }
</style>
