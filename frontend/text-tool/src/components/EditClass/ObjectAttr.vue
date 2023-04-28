<template>
    <div>
        <!-- <div v-show="state.attrs.length > 0"> -->
        <!-- <div class="sub-header" style="position: relative">
            <span>{{ $$('attributes-title') }}</span>
            <div class="copy-attr" v-show="state.classType && canEdit()">
                <NodeCollapseOutlined
                    class="icon"
                    @click="onCopy('attr-from')"
                    :title="$$('attr-copy-from')"
                />
            </div>
        </div> -->
        <!-- <div
            class="class-msg-box"
            v-if="state.showMsgType === 'attr-from' || state.showMsgType === 'attr-to'"
        >
            <div class="content-wrap">
                <template v-if="state.showMsgType === 'attr-from'">
                    <div>{{ $$('attr-from-title') }}</div>
                    <div style="margin-top: 10px">
                        <span style="margin-right: 10px">{{ $$('attr-from-object') }}</span>
                        <a-select
                            show-search
                            animation="no"
                            style="width: 140px"
                            :options="iState.trackNameAddIds"
                            optionFilterProp="label"
                            v-model:value="iState.trackNameAddId"
                        >
                        </a-select>
                        <a-input
                            size="small"
                            style="width: 140px"
                            disabled
                            v-model:value="iState.trackId"
                            placeholder=""
                        />
                        <SubnodeOutlined title="Pick" @click="onPick" class="pick" />
                    </div>
                </template>
                <template v-if="state.showMsgType === 'attr-to'">
                    <div>{{ $$('attr-to-title') }}</div>
                    <div style="color: #d89614">{{ $$('attr-to-tip') }}</div>
                    <div class="slide-wrap">
                        <span style="margin-right: 10px" class="title">
                            {{ $$('attr-to-from', { n: iState.range[0] }) }}
                        </span>
                        <a-slider
                            range
                            v-model:value="iState.range"
                            :min="1"
                            :max="iState.frames"
                        />
                        <span style="margin-left: 10px" class="title">
                            {{ $$('attr-to-to', { n: iState.range[1] }) }}
                        </span>
                    </div>
                </template>
            </div>
            <div class="btn">
                <a-button style="margin-right: 10px" @click="onCancel">{{
                    $$('btn-title-cancel')
                }}</a-button>
                <a-button
                    type="primary"
                    @click="onOk"
                    :disabled="state.showMsgType === 'attr-from' && !iState.trackId"
                >
                    {{ $$('btn-title-copy') }}</a-button
                >
            </div>
        </div> -->
        <div class="attr-container">
            <div
                class="attr-item"
                v-for="item in state.attrs"
                :key="state.objectId + state.classType + item.id"
            >
                <AttrValue v-if="isAttrVisible(item)" @change="onAttChange" :item="item" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { IState } from './type';
    import { reactive, watch } from 'vue';
    import AttrValue from './AttrValue.vue';
    import { AttrType, IAttr, utils } from 'pc-editor';
    import {
        SubnodeOutlined,
        NodeExpandOutlined,
        NodeCollapseOutlined,
    } from '@ant-design/icons-vue';
    import { Box } from 'pc-render';
    import { useInjectEditor } from '../../state';
    import * as locale from './lang';
    import useUI from '../../hook/useUI';
    import useControl from './useControl';

    interface IProps {
        state: IState;
    }
    interface IOption {
        label: string;
        value: string;
    }
    // ***************Props and Emits***************
    let emit = defineEmits(['copy-from', 'change']);
    let props = defineProps<IProps>();
    // *********************************************
    let editor = useInjectEditor();
    let $$ = editor.bindLocale(locale);
    let { canEdit } = useUI();
    let control = useControl();
    let attrMap = {} as Record<string, IAttr>;
    let TState = editor.state;
    let iState = reactive({
        trackId: '',
        trackNameAddId: '',
        frames: 1,
        range: [0, 1],
        trackNameAddIds: [] as IOption[],
    });

    function onCopy(type: 'attr-from') {
        let { frames } = editor.state;
        if (type === 'attr-from') {
            updateTrackIds();
        }
        props.state.showMsgType = type;
        iState.trackNameAddId = '';
        iState.range = [1, frames.length];
        iState.frames = frames.length;
    }
    function getTrackId(str: string) {
        const regResult = str.split(/[\(\)]/);
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
    function updateTrackIds() {
        let boxs = editor.pc.getAnnotate3D();
        const exclude = props.state.trackId;
        let option: IOption[] = [];
        boxs.forEach((box) => {
            const { trackId, trackName, classType, classId } = box.userData;
            if (trackId === exclude || ![classId, classType].includes(props.state.classType))
                return;
            option.push({
                label: `${trackName} (${trackId})`,
                value: `${trackName}(${trackId})`,
            });
        });
        iState.trackNameAddIds = option;
    }
    watch(
        () => iState.trackNameAddId,
        () => {
            iState.trackId = getTrackId(iState.trackNameAddId).trackId;
        },
    );

    watch(
        () => props.state.attrs,
        () => {
            if (props.state.attrs.length) {
                props.state.attrs.forEach((e) => {
                    attrMap[e.id] = e;
                });
            }
        },
    );

    async function onPick() {
        control.close();
        let box = (await editor.actionManager.execute('pickObject')) as Box;
        control.open();
        // console.log(box);
        if (box) {
            let { trackId, trackName } = box.userData;
            let { classType, classId } = box.userData;
            if (trackId === props.state.trackId) {
                editor.showMsg('warning', $$('attr-from-self'));
                return;
            }

            if (![classType, classId].includes(props.state.classType)) {
                editor.showMsg('warning', $$('attr-from-different-class'));
                return;
            }
            iState.trackNameAddId = `${trackName}(${trackId})`;
            // iState.trackId = box.userData.trackId;
        }
    }

    function onAttChange(...args: any[]) {
        emit('change', ...args);
    }

    function onCancel() {
        props.state.showMsgType = '';
    }

    function onOk() {
        if (props.state.showMsgType === 'attr-from') {
            emit('copy-from', iState.trackId);
        }
        // else {
        //     emit('copy-to', [iState.range[0] - 1, iState.range[1] - 1]);
        // }

        props.state.showMsgType = '';
    }
    function isItemVisible(attr: IAttr): boolean {
        let parentAttr = attrMap[attr.parent];
        return parentAttr.type !== AttrType.MULTI_SELECTION
            ? parentAttr.value === attr.parentValue
            : (parentAttr.value as any[]).indexOf(attr.parentValue) >= 0;
    }

    function isAttrVisible(attr: IAttr): boolean {
        if (!attr.parent) return true;
        let parentAttr = attrMap[attr.parent];
        return isItemVisible(attr) && isAttrVisible(parentAttr);
    }
</script>

<style lang="less" scoped>
    .copy-attr {
        position: absolute;
        right: 10px;

        // margin-left: 10px;
        .icon {
            cursor: pointer;
            font-size: 18px;
            margin-left: 10px;
        }
    }

    .slide-wrap {
        position: relative;
        padding-left: 5px;
        margin-top: 10px;

        .ant-slider {
            margin: 0px;
            display: inline-block;
            width: 130px;
            vertical-align: middle;
        }

        .title {
            vertical-align: middle;
            color: inherit;
        }
    }
</style>
