<template>
    <div class="sub-header">{{ $$('split-title') }}</div>
    <a-radio-group :value="''">
        <a-radio-button @click="onSplit">{{ $$('split-btn-title') }}</a-radio-button>
    </a-radio-group>
    <div class="class-msg-box" v-if="state.showMsgType === 'split'">
        <div class="content-wrap">
            <div style="margin-bottom: 10px">{{ $$('split-new-object') }}</div>
            <a-input
                size="small"
                style="width: 250px"
                disabled
                v-model:value="iState.newTrackId"
                placeholder=""
            />
            <div style="margin-bottom: 10px">{{ $$('split-new-class') }}</div>
            <SelectClass
                ref="select"
                :attr="{
                    size: 'small',
                }"
                @change="onClassChange"
                v-model:value="iState.classType"
            />
            <!-- <a-select
                size="small"
                ref="select"
                showSearch
                animation="no"
                v-model:value="iState.classType"
                style="width: 250px"
                optionFilterProp="label"
                :options="options"
                @change="onClassChange"
            >
            </a-select> -->
        </div>
        <div class="btn">
            <a-button style="margin-right: 10px" @click="onCancel">{{
                $$('btn-title-cancel')
            }}</a-button>
            <a-button type="primary" :disabled="!iState.classType" @click="onOk">{{
                $$('btn-title-split')
            }}</a-button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { useInjectEditor } from '../../state';
    import SelectClass from '../Common/selectClass.vue';
    import { reactive } from 'vue';
    import { IState } from './type';
    import * as _ from 'lodash';
    import { nanoid } from 'nanoid';
    import { Event } from 'pc-editor';
    // import Event from '../../config/event';
    import * as locale from './lang';
    import { computed } from '@vue/reactivity';

    interface IProps {
        state: IState;
    }

    // ***************Props and Emits***************
    let emit = defineEmits(['split']);
    let props = defineProps<IProps>();
    // *********************************************
    let editor = useInjectEditor();
    let $$ = editor.bindLocale(locale);

    let iState = reactive({
        classType: '',
        newTrackId: '',
    });

    let onSplit = _.debounce(() => {
        if (props.state.showMsgType === 'split') return;
        props.state.showMsgType = 'split';
        iState.classType = '';
        iState.newTrackId = nanoid(16);
        onPreSplit();
    }, 100);
    function onPreSplit() {
        editor.dispatchEvent({
            type: Event.PRE_SPLIT_ACTION,
            data: {
                action: props.state.showMsgType,
                trackId: iState.newTrackId,
                classType: iState.classType,
            },
        });
    }
    function onClassChange() {
        onPreSplit();
    }
    function onCancel() {
        props.state.showMsgType = '';
        editor.dispatchEvent({
            type: Event.PRE_SPLIT_ACTION,
            data: {
                action: 'cancel',
            },
        });
    }
    function onOk() {
        emit('split', iState.newTrackId, iState.classType);
    }
</script>
