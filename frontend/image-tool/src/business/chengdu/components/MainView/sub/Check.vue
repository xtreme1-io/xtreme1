<template>
    <a-checkbox-group
        v-model:value="value"
        size="small"
        @change="onChange"
        :options="props.options"
        v-bind="$attrs"
    >
        <!-- <a-radio v-for="item in props.options" :value="item.value">{{ item.value }}</a-radio> -->
    </a-checkbox-group>
</template>

<script setup lang="ts">
    import { ref } from 'vue';

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
    let emit = defineEmits(['update:value', 'change']);
    let props = defineProps<IProps>();
    // *********************************************

    let value = ref(props.value || []);
    function onChange() {
        // console.log(value.value);
        emit('update:value', value.value);
        emit('change', props.name, value.value);
    }
</script>

<style lang="less"></style>
