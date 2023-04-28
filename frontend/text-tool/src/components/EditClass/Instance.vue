<template>
    <span class="instance-item">
        <MobileOutlined /><span class="name">{{ item.name }}</span
        ><CloseOutlined v-show="canEdit()" class="remove" @click="onRemove" />
    </span>
</template>

<script setup lang="ts">
    import { MobileOutlined, CloseOutlined } from '@ant-design/icons-vue';

    import { IInstanceItem } from './type';
    import useUI from '../../hook/useUI';

    interface IProps {
        item: IInstanceItem;
    }

    // ***************Props and Emits***************
    let emit = defineEmits(['remove']);
    let props = defineProps<IProps>();
    // *********************************************

    let { canEdit } = useUI();
    function onRemove() {
        emit('remove');
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
