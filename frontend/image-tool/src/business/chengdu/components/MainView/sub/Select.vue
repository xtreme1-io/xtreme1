<template>
    <a-select size="small" style="width: 220px" v-bind="$attrs" v-model:value="value">
        <a-select-option v-for="item in props.options" :value="item.value">
            {{ item.label || item.value }}
        </a-select-option>
    </a-select>
</template>

<script setup lang="ts">
    import { computed } from 'vue';

    interface IOption {
        value: string;
        label: string;
    }

    interface IProps {
        options: IOption[];
        value: string;
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
