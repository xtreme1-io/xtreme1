<template>
    <a-textarea
        size="small"
        placeholder=""
        v-bind="$attrs"
        v-model:value="value"
        style="width: 220px"
        :autoSize="{ minRows: 1, maxRows: 5 }"
    />
</template>

<script setup lang="ts">
    import { computed } from 'vue';

    // ***************Props and Emits***************
    const emits = defineEmits(['update:value', 'change']);
    const props = defineProps({
        value: String,
        name: String,
    });
    // *********************************************
    const value = computed({
        get: () => {
            return props.value;
        },
        set: (newVal) => {
            emits('update:value', newVal);
            emits('change', props.name, newVal);
        },
    });
</script>
