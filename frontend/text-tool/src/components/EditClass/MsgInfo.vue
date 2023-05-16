<template>
    <div class="class-msg-info">
        <div class="content-wrap">
            <span class="icon"><WarningOutlined /></span>
            <span class="msg">
                <slot name="msg" v-if="$slots.msg"></slot>
            </span>
        </div>
        <div class="btn">
            <a-button style="margin-right: 10px" @click="onCancel">{{
                $$('btn-title-cancel')
            }}</a-button>
            <a-button type="primary" @click="onOk">{{ $$('btn-title-confirm') }}</a-button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { WarningOutlined } from '@ant-design/icons-vue';
    import { IInstanceItem } from './type';
    import * as locale from './lang';
    import { useInjectEditor } from '../../state';

    // import useUI from 'pc-ui/hook/useUI';

    // interface IProps {
    // }

    // ***************Props and Emits***************
    let emit = defineEmits(['cancel', 'ok']);
    // let props = defineProps<IProps>();
    // *********************************************

    let editor = useInjectEditor();
    let $$ = editor.bindLocale(locale);

    function onCancel() {
        emit('cancel');
    }
    function onOk() {
        emit('ok');
    }
</script>

<style lang="less">
    .class-msg-info {
        padding: 10px;
        width: 300px;
        border: 1px solid #543a07;
        margin-top: 10px;

        .msg {
            color: #b1b1b1;
        }

        .content-wrap {
            display: flex;
            align-items: center;
        }

        .icon {
            display: inline-block;
            width: 100px;
            font-size: 24px;
            text-align: center;
            color: #d89614;
        }

        .btn {
            text-align: right;
            margin-top: 10px;
        }
    }
</style>
