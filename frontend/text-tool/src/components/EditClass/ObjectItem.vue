<template>
    <div class="object-item">
        <div class="title2">{{ data.info }}</div>
        <a-input
            size="small"
            style="width: 250px; margin-right: 10px"
            disabled
            :value="data.name"
            placeholder=""
        />
        <DeleteOutlined v-if="canEdit()" @click="onRemove" />
    </div>
</template>

<script setup lang="ts">
    import { DeleteOutlined } from '@ant-design/icons-vue';
    import { IInstanceItem } from './type';
    import useUI from '../../hook/useUI';

    interface IProps {
        data: IInstanceItem;
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
    .object-item {
        line-height: 30px;
        // .remove {
        //     cursor: pointer;
        // }
    }
</style>
