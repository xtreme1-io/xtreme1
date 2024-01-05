<template>
  <a-checkbox-group v-model:value="value" size="small" :options="props.options" v-bind="$attrs">
    <template #label="item">
      {{ labelKey ? item[labelKey] ?? item.name : item.name }}
    </template>
  </a-checkbox-group>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  type IOption = {
    value: string;
    name: string;
    alias?: string;
  };

  interface IProps {
    options: IOption[];
    labelKey?: string;
    value: string[];
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
</script>
