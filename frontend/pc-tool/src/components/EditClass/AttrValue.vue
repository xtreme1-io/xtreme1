<template>
    <div class="name" :span="10">
        {{ item.label || item.name }}
        <span v-if="item.type === AttrType.RADIO || item.type === AttrType.MULTI_SELECTION">
            <!-- {{item.type === AttrType.RADIO ? '(Single)' : '(Multi)'}} -->
        </span>
    </div>
    <div class="value" :span="14">
        <Radio
            :disabled="!canEdit()"
            :name="item.id"
            v-model:value="item.value"
            @change="onAttChange"
            :options="item.options"
            v-if="item.type === AttrType.RADIO"
        />
        <Select
            :disabled="!canEdit()"
            :name="item.id"
            v-model:value="item.value"
            @change="onAttChange"
            :options="item.options"
            v-else-if="item.type === AttrType.DROPDOWN"
        />
        <Text
            :disabled="!canEdit()"
            :name="item.id"
            v-model:value="item.value"
            @change="onAttChange"
            v-else-if="item.type === AttrType.TEXT"
        />
        <Check
            :disabled="!canEdit()"
            :name="item.id"
            v-model:value="item.value"
            @change="onAttChange"
            :options="item.options"
            v-else-if="item.type === AttrType.MULTI_SELECTION"
        />
    </div>
</template>

<script setup lang="ts">
    import { AttrType, IAttr, IClassType, Event as EditorEvent } from 'pc-editor';

    import Radio from '../MainView/sub/Radio.vue';
    import Select from '../MainView/sub/Select.vue';
    import Text from '../MainView/sub/Text.vue';
    import Check from '../MainView/sub/Check.vue';

    import useUI from '../../hook/useUI';

    interface IAttrItem extends IAttr {
        value: any;
    }

    interface IProps {
        item: IAttrItem;
    }

    // ***************Props and Emits***************
    let emit = defineEmits(['change']);
    let props = defineProps<IProps>();
    // *********************************************

    let { canEdit } = useUI();

    function onAttChange(...args: any[]) {
        emit('change', ...args);
    }
</script>

<style lang="less"></style>
