<template>
  <a-radio-group v-model:value="value" size="small" v-bind="$attrs">
    <a-radio v-for="item in props.options" :key="item.value" :value="item.value"
      >{{ labelKey ? item[labelKey] ?? item.name : item.name }}
      <span
        v-if="item.value === value && !$attrs.disabled"
        class="radio-cancel-button"
        @click.stop.prevent="onCancel"
      ></span>
    </a-radio>
  </a-radio-group>
</template>
<script setup lang="ts">
  import { computed } from 'vue';
  type IOption = {
    value: string;
    name: string;
    alias?: string;
    [k: string]: any;
  };

  interface IProps {
    options: IOption[];
    labelKey?: string;
    value: string | number;
    name: string;
  }

  // ***************Props and Emits***************
  const emit = defineEmits(['update:value', 'change']);
  const props = defineProps<IProps>();
  // *********************************************

  // let instance = getCurrentInstance();
  // debugger;

  const value = computed({
    get() {
      return props.value;
    },
    set(value) {
      emit('update:value', value);
      emit('change', props.name, value);
    },
  });
  function onCancel() {
    value.value = '';
  }
</script>

<style lang="less">
  .radio-cancel-button {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
    background: transparent;
  }
</style>
