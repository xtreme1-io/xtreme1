<template>
    <div class="sub-header">{{ $$('merge-title') }}</div>
    <a-radio-group :value="state.showMsgType">
        <a-radio-button value="merge-to" @click="onMerge('merge-to')">{{
            $$('merge-to')
        }}</a-radio-button>
        <a-radio-button value="merge-from" @click="onMerge('merge-from')">{{
            $$('merge-from')
        }}</a-radio-button>
    </a-radio-group>
    <div
        class="class-msg-box"
        v-if="state.showMsgType === 'merge-from' || state.showMsgType === 'merge-to'"
    >
        <div class="content-wrap" style="position: relative">
            <div style="margin-bottom: 10px">{{ $$('marge-target') }}</div>
            <a-select
                showSearch
                animation="no"
                optionFilterProp="label"
                :options="iState.trackList"
                size="small"
                v-model:value="iState.trackId"
                style="width: 200px"
            >
                <!-- <template #option="{ value, label }">tes</template> -->
            </a-select>
        </div>
        <div class="btn">
            <a-button style="margin-right: 10px" @click="onCancel">{{
                $$('btn-title-cancel')
            }}</a-button>
            <a-button type="primary" @click="onOk" :disabled="!iState.trackId">{{
                $$('btn-title-merge')
            }}</a-button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { reactive, ref, watch } from 'vue';
    import { IState } from './type';
    import { useInjectEditor } from '../../state';
    import { utils, Event } from 'pc-editor';
    // import * as utils from '../../utils';
    import * as _ from 'lodash';
    // import toolEvent from '../../config/event';
    import * as locale from './lang';

    interface ITrackInfo {
        id: string;
        name: string;
        value: string;
    }

    interface IProps {
        state: IState;
    }

    // ***************Props and Emits***************
    let emit = defineEmits(['merge']);
    let props = defineProps<IProps>();
    // *********************************************
    let editor = useInjectEditor();
    let $$ = editor.bindLocale(locale);
    let iState = reactive({
        trackId: '',
        trackList: [] as ITrackInfo[],
    });

    watch(() => [props.state.showMsgType, iState.trackId], onPreMerge);

    let onMerge = _.debounce((type: 'merge-to' | 'merge-from') => {
        if (props.state.showMsgType === type) return;

        if (props.state.showMsgType !== 'merge-to' && props.state.showMsgType !== 'merge-from') {
            iState.trackId = '';
        }
        props.state.showMsgType = type;
        getTrackObject();
    }, 100);

    function onCancel() {
        props.state.showMsgType = '';
        editor.dispatchEvent({
            type: Event.PRE_MERGE_ACTION,
            data: {
                action: 'cancel',
            },
        });
    }
    function getTrackId() {
        const regResult = iState.trackId.split(/[\(\)]/);
        let trackId = '';
        let trackName = '';

        if (regResult[0]) {
            trackName = regResult[0];
        }
        if (regResult[1]) {
            trackId = regResult[1];
        }
        return {
            trackId,
            trackName,
        };
    }
    function onOk() {
        let sourceId = props.state.trackId;
        let targetId = getTrackId().trackId; //iState.trackId;

        if (props.state.showMsgType === 'merge-from') {
            [sourceId, targetId] = [targetId, sourceId];
        }
        emit('merge', sourceId, targetId);
    }
    function onPreMerge() {
        const { trackId, trackName } = getTrackId();
        // const trackId = iState.trackId;
        // const trackName = iState.trackList.find((item) => item.value === iState.trackId)?.name;
        editor.dispatchEvent({
            type: Event.PRE_MERGE_ACTION,
            data: {
                action: props.state.showMsgType,
                trackId: trackId,
                trackName: trackName,
            },
        });
    }
    function getTrackObject() {
        let { frames } = editor.state;
        let infos = utils.getTrackObject(frames, editor.dataManager);
        iState.trackList = infos
            .filter((e) => e.id !== props.state.trackId)
            .map((item) => {
                return {
                    ...item,
                    label: `${item.name} (${item.id})`,
                    value: `${item.name}(${item.id})`,
                };
            });
    }
</script>
