<template>
    <div class="sub-header">{{ $$('delete-title') }}</div>
    <div>
        <a-button class="class-delete-object" @click="onMsgType('delete-all')" danger>{{
            $$('delete-all')
        }}</a-button>
        <a-button class="class-delete-object" @click="onMsgType('delete-range')" danger>{{
            $$('delete-some')
        }}</a-button>
        <a-button class="class-delete-object" @click="onMsgType('delete-no-true')" danger>{{
            $$('delete-no-true')
        }}</a-button>
    </div>
    <div
        class="class-msg-box"
        ref="msgDom"
        v-show="
            state.showMsgType === 'delete-all' ||
            state.showMsgType === 'delete-range' ||
            state.showMsgType === 'delete-no-true'
        "
    >
        <div class="content-wrap">
            <div style="color: #d89614" v-show="state.showMsgType === 'delete-all'">{{
                $$('delete-all-tip')
            }}</div>
            <div style="color: #d89614" v-show="state.showMsgType === 'delete-range'">{{
                $$('delete-some-tip')
            }}</div>
            <div style="color: #d89614" v-show="state.showMsgType === 'delete-no-true'">{{
                $$('delete-no-true-tip')
            }}</div>
            <div class="slide-wrap" v-show="state.showMsgType === 'delete-range'">
                <span style="margin-right: 10px" class="title">
                    {{ $$('delete-from', { n: iState.range[0] }) }}
                </span>
                <a-slider range v-model:value="iState.range" :min="1" :max="iState.frames" />
                <span style="margin-left: 10px" class="title">
                    {{ $$('delete-to', { n: iState.range[1] }) }}
                </span>
            </div>
        </div>

        <div class="btn">
            <a-button style="margin-right: 10px" @click="onCancel">{{
                $$('btn-title-cancel')
            }}</a-button>
            <a-button type="primary" danger @click="onOk">{{ $$('btn-title-delete') }}</a-button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { reactive, ref, nextTick } from 'vue';
    import { IState, MsgType } from './type';
    import { useInjectEditor } from '../../state';
    import * as locale from './lang';

    interface IProps {
        state: IState;
    }

    // ***************Props and Emits***************
    let emit = defineEmits(['delete']);
    let props = defineProps<IProps>();
    let msgDom = ref<HTMLDivElement | null>(null);
    // *********************************************
    let editor = useInjectEditor();
    let $$ = editor.bindLocale(locale);
    let iState = reactive({
        range: [2, 7],
        frames: 1,
    });

    function showMsg() {
        let dom = msgDom.value;
        if (dom) {
            dom.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
        }
    }

    function onMsgType(type: MsgType) {
        let { frames } = editor.state;
        if (props.state.showMsgType === type) return;
        props.state.showMsgType = type;
        if (type === 'delete-range') {
            iState.frames = frames.length;
            iState.range = [1, frames.length];
        }

        nextTick(() => {
            showMsg();
        });
    }
    function onCancel() {
        props.state.showMsgType = '';
    }
    function onOk() {
        let range;
        let type = props.state.showMsgType;
        if (type === 'delete-range') {
            range = [iState.range[0] - 1, iState.range[1] - 1];
        }
        props.state.showMsgType = '';
        emit('delete', type, range);
    }
</script>

<style lang="less" scoped>
    .class-delete-object {
        margin-top: 10px;
        margin-right: 10px;
    }

    .slide-wrap {
        position: relative;
        padding-left: 20px;
        margin-top: 10px;

        .ant-slider {
            margin: 0px;
            display: inline-block;
            width: 160px;
            vertical-align: middle;
        }
        .title {
            vertical-align: middle;
            color: inherit;
        }
    }
</style>
