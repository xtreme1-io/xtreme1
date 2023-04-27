<template>
    <div class="attr-item">
        <div class="name" :span="10">
            {{ item.parentValue ? `${item.parentValue} ${item.name}` : item.name }}
            <span v-if="item.type === AttrType.RADIO || item.type === AttrType.MULTI_SELECTION">
                <!-- {{item.type === AttrType.RADIO ? '(Single)' : '(Multi)'}} -->
            </span>
        </div>
        <div class="value" :span="14">
            <Radio
                :disabled="!canEdit()"
                :name="item.name"
                v-model:value="item.value"
                @change="onAttChange"
                :options="item.options"
                v-if="item.type === AttrType.RADIO"
            />
            <Select
                :disabled="!canEdit()"
                :name="item.name"
                v-model:value="item.value"
                @change="onAttChange"
                :options="item.options"
                v-else-if="item.type === AttrType.DROPDOWN"
            />
            <Text
                :disabled="!canEdit()"
                :name="item.name"
                v-model:value="item.value"
                @change="onAttChange"
                v-else-if="item.type === AttrType.TEXT"
            />
            <TextLong
            :disabled="!canEdit()"
            :name="item.id"
            v-model:value="item.value"
            @change="onAttChange"
            v-else-if="item.type === AttrType.TEXT_LONG"
        />
            <Check
                :disabled="!canEdit()"
                :name="item.name"
                v-model:value="item.value"
                @change="onAttChange"
                :options="item.options"
                v-else-if="item.type === AttrType.MULTI_SELECTION"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, getCurrentInstance } from 'vue';
    import {
        AttrType,
        IAttr,
        IClassType,
        Event as EditorEvent,
        IClassificationAttr,
    } from 'pc-editor';

    import Radio from '../../MainView/sub/Radio.vue';
    import Select from '../../MainView/sub/Select.vue';
    import Text from '../../MainView/sub/Text.vue';
    import TextLong from '../../MainView/sub/TextLong.vue';
    import Check from '../../MainView/sub/Check.vue';

    import useUI from '../../../hook/useUI';

    interface IProps {
        item: IClassificationAttr;
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

<style lang="less">
    .instance-item {
        display: inline-block;
        padding: 2px 6px;
        background: #177ddc;
        margin-right: 4px;
        margin-bottom: 4px;
        border-radius: 2px;

        .remove {
            cursor: pointer;
        }

        .name {
            font-size: 14px;
            margin: 0px 4px;
        }
    }
</style>
