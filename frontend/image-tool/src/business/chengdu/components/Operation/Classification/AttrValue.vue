<template>
    <Form.Item
        :validateFirst="true"
        :rules="{ required: item.required, validator: checkValue, trigger: 'change' }"
        :label="item.parentValue ? `${item.parentValue} ${item.name}` : item.name"
        :name="item.id"
        :autoLink="false"
        @click="handleToggle(item, $event)"
    >
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
        <Check
            :disabled="!canEdit()"
            :name="item.name"
            v-model:value="item.value"
            @change="onAttChange"
            :options="item.options"
            v-else-if="item.type === AttrType.MULTI_SELECTION"
        />
    </Form.Item>
</template>

<script setup lang="ts">
    import { IClassificationAttr, AttrType } from '../../../type';

    import { Form } from 'ant-design-vue';

    import Radio from '../../MainView/sub/Radio.vue';
    import Select from '../../MainView/sub/Select.vue';
    import Text from '../../MainView/sub/Text.vue';
    import Check from '../../MainView/sub/Check.vue';

    import useUI from '../../../hook/useUI';

    interface IProps {
        item: IClassificationAttr;
        visible: Boolean;
    }

    // 保存时候的校验
    const checkValue = (_: any, target: IClassificationAttr) => {
        // console.log('isVisiible: ', props.visible);
        // 判断是否显示，不显示则判断为校验通过
        if (!props.visible) return Promise.resolve();
        // 非必填
        if (!target.required) {
            emit('validate', true);
            return Promise.resolve();
        }
        // 必填已填
        if (target.required && target.value.length) {
            emit('validate', true);
            return Promise.resolve();
        }
        // 必填未填
        emit('validate', false);
        return Promise.reject(new Error(props.item.name + ' is Required'));
    };

    // ***************Props and Emits***************
    let emit = defineEmits(['change', 'toggle', 'validate']);
    let props = defineProps<IProps>();
    // *********************************************

    let { canEdit } = useUI();

    let timer: any = null;
    function onAttChange(...args: any[]) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            emit('change', props.item);
        }, 500);
    }

    // 找到点击项 判断第一项
    const handleToggle = (item: any, e: any) => {
        // console.log('get', item, e);
        const parent = item.parent;
        const className = e.target.className;
        const nodeName = e.target.nodeName;
        if (nodeName == 'LABEL') e.preventDefault();

        if (className.includes('ant-form-item-label') && parent == '') {
            emit('toggle', item.classificationId);
        }
    };
</script>

<style lang="less"></style>
