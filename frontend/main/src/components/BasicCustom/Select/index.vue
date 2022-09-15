<template>
  <Select v-bind="getBindValue" :style="style">
    <template #suffixIcon>
      <Icon icon="ion:arrow-down-b" size="16" />
    </template>
  </Select>
</template>
<script lang="ts" setup>
  import { CSSProperties, computed, unref } from 'vue';
  import { Select } from 'ant-design-vue';
  import Icon from '/@/components/Icon/src/Icon.vue';
  import { SelectProps } from './typing';
  import { useAttrs } from '/@/hooks/core/useAttrs';

  const props = defineProps(SelectProps);
  // get component class
  const attrs = useAttrs({ excludeDefaultKeys: false });
  const style: CSSProperties = {};
  // get inherit binding value
  const getBindValue = computed(() => ({ ...unref(attrs), ...props }));
</script>
