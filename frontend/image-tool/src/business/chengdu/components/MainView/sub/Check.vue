<template>
    <a-checkbox-group v-model:value="value" size="small" :options="props.options" v-bind="$attrs">
    </a-checkbox-group>
</template>

<script setup lang="ts">
    import { computed } from 'vue';

    interface IOption {
        value: string;
        label: string;
    }

    interface IProps {
        options: IOption[];
        value: string[];
        name: string;
    }

    // ***************Props and Emits***************
    const emits = defineEmits(['update:value', 'change']);
    const props = defineProps<IProps>();
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
