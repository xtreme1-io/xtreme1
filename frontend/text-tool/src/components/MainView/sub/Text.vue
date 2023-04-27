<template>
    <a-input
        size="small"
        placeholder=""
        v-bind="$attrs"
        v-model:value="value"
        @change="onChange"
        style="width: 220px"
    />
</template>

<script setup lang="ts">
    import { ref, watch } from 'vue';

    // ***************Props and Emits***************
    let emit = defineEmits(['update:value', 'change']);
    let props = defineProps({
        value: String,
        name: String,
    });
    // *********************************************

    let value = ref(props.value || '');
    watch(
        () => props.value,
        () => {
            if (value.value !== props.value) value.value = props.value as any;
        },
    );

    function onChange(v: any) {
        emit('update:value', value.value);
        emit('change', props.name, value.value);
    }
</script>

<style lang="less"></style>
