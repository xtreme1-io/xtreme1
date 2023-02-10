<template>
    <div class="name" :span="10">
        {{ item.name }}
        <span v-if="item.type === AttrType.RADIO || item.type === AttrType.MULTI_SELECTION">
            {{ item.type === AttrType.RADIO ? '(Radio)' : '(CheckBox)' }}
        </span>
    </div>
    <div class="value" :span="14">
        <Radio
            :disabled="props.isDisable"
            :name="item.id"
            v-model:value="item.value"
            @change="onAttChange"
            :options="item.options"
            v-if="item.type === AttrType.RADIO"
        />
        <Select
            :disabled="props.isDisable"
            :name="item.id"
            v-model:value="item.value"
            @change="onAttChange"
            :options="item.options"
            v-else-if="item.type === AttrType.DROPDOWN"
        />
        <Text
            :disabled="props.isDisable"
            :name="item.id"
            v-model:value="item.value"
            @change="onAttChange"
            v-else-if="item.type === AttrType.TEXT"
        />
        <Check
            :disabled="props.isDisable"
            :name="item.id"
            v-model:value="item.value"
            @change="onAttChange"
            :options="item.options"
            v-else-if="item.type === AttrType.MULTI_SELECTION"
        />
    </div>
</template>

<script setup lang="ts">
    import { AttrType } from 'editor';
    import Radio from './Radio.vue';
    import Select from './Select.vue';
    import Text from './Text.vue';
    import Check from './Check.vue';
    import { IAttrItem } from '../../Operation/Instance/type';
    import * as _ from 'lodash';

    interface IProps {
        item: IAttrItem | any;
        isDisable: boolean;
    }
    const props = defineProps<IProps>();

    const emit = defineEmits(['change', 'toggle', 'validate']);

    const onAttChange = _.debounce((name: string, value: any) => {
        emit('change', name, value);
    }, 100);
</script>

<style lang="less"></style>
