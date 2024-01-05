<template>
  <a-select size="small" style="width: 220px" v-bind="$attrs" v-model:value="value">
    <a-select-option v-for="item in props.options" :key="item.value" :value="item.value"
      >{{ labelKey ? item[labelKey] ?? item.name : item.name
      }}<span
        v-if="value === item.value"
        @click.prevent.stop="onCancel"
        class="select-cancel-button"
        ><CheckOutlined /></span
    ></a-select-option>
  </a-select>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { CheckOutlined } from '@ant-design/icons-vue';
  type IOption = {
    value: string;
    name: string;
    alias?: string;
    [k: string]: any;
  };

  interface IProps {
    options: IOption[];
    value: string | number;
    labelKey?: string;
    name: string;
  }

  // ***************Props and Emits***************
  const emit = defineEmits(['update:value', 'change']);
  const props = defineProps<IProps>();
  // *********************************************

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
  .select-cancel-button {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    padding-right: 10px;
    z-index: 1;
    width: 100%;
    height: 100%;
    background: transparent;
    text-align: right;
    line-height: 32px;
  }
</style>
