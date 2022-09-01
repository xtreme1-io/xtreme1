<template>
  <Button v-bind="getBindValue" :style="style"><slot></slot></Button>
</template>
<script lang="ts" setup>
  import { computed, unref } from 'vue';
  import { CSSProperties, defineProps, useAttrs } from 'vue';
  import { Button } from 'ant-design-vue';
  import { ButtonSize, ButtonProps } from './typing';

  const attrs = useAttrs();
  const props = defineProps(ButtonProps);
  const style: CSSProperties = {
    borderRadius: '4px',
    boxSizing: 'border-box',
    ...props.style,
  };
  if (props.noBorder) {
    style.border = 'none';
  }
  if (props.gradient && !props.disabled) {
    style.background = 'linear-gradient(135deg, #57CCEF 0%, #86E5C9 100%)';
    style.fontWeight = 'bold';
    style.color = 'white';
  }
  const dispose = {
    [ButtonSize.SM]: () => {
      style.padding = '3px 6px';
      style.lineHeight = '14px';
      style.fontSize = '12px';
    },
    [ButtonSize.MD]: () => {
      style.padding = '6px 8px';
      style.lineHeight = '16px';
      style.fontSize = '14px';
      // @ts-ignore-next-line
      if (props.type === 'default') {
        style.padding = '5px 8px';
      }
    },
    [ButtonSize.LG]: () => {
      style.padding = '8.5px 16px';
      style.lineHeight = '19px';
      style.fontSize = '16px';
    },
  };
  dispose[props.size]();
  const getBindValue = computed(() => ({ ...unref(attrs), ...props }));
</script>
