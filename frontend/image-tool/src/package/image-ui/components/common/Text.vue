<template>
  <a-textarea
    size="small"
    placeholder=""
    v-bind="$attrs"
    v-model:value="value"
    style="width: 50%; min-width: 220px"
  />
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  // ***************Props and Emits***************
  const emit = defineEmits(['update:value', 'change']);
  const props = defineProps({
    value: String,
    name: String,
  });
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
