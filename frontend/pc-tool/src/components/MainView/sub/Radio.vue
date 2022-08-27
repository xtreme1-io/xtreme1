<template>
    <a-radio-group v-model:value="value" size="small" @change="onChange" v-bind="$attrs">
        <a-radio v-for="item in props.options" :value="item.value">{{
            item.label || item.value
        }}</a-radio>
    </a-radio-group>
</template>

<script setup lang="ts">
    import { ref, watch } from 'vue';

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
    let emit = defineEmits(['update:value', 'change']);
    let props = defineProps<IProps>();
    // *********************************************

    // let instance = getCurrentInstance();
    // debugger;

    let value = ref(props.value || '');
    watch(
        () => props.value,
        () => {
            if (value.value !== props.value) value.value = props.value as any;
        },
    );

    function onChange() {
        // console.log(value.value);
        emit('update:value', value.value);
        emit('change', props.name, value.value);
    }
</script>

<style lang="less"></style>
