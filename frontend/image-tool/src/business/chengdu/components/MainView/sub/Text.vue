<template>
    <a-textarea
        size="small"
        placeholder=""
        v-bind="$attrs"
        v-model:value="value"
        @change="onChange"
        style="width: 220px"
        :autoSize="{ minRows: 1, maxRows: 5 }"
    />
</template>

<script setup lang="ts">
    import { ref } from 'vue';

    // ***************Props and Emits***************
    let emit = defineEmits(['update:value', 'change']);
    let props = defineProps({
        value: String,
        name: String,
    });
    // *********************************************

    let value = ref(props.value || '');

    function onChange() {
        // console.log(value.value);
        emit('update:value', value.value);
        emit('change', props.name, value.value);
    }
</script>

<style lang="less"></style>
