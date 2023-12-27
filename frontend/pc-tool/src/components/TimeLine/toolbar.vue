<template>
    <div class="i-toolbar-container">
        <div class="bar-left">
            <span style="display: inline-block; padding-right: 10px; min-width: 60px">{{
                editor.lang('autoLoad')
            }}</span>
            <a-tooltip placement="top">
                <template #title>{{ editor.lang('autoLoad') }}</template>
                <span @keydown.capture="(e) => e.stopPropagation()">
                    <a-switch
                        ref="autoLoadSwitch"
                        :checked="config.autoLoad"
                        @change="onAutoLoadHandle"
                        style="margin-right: 10px"
                    />
                </span>
            </a-tooltip>
            <div v-show="disable" class="over-not-allowed"></div>
        </div>
        <div class="bar-center">
            <div style="width: 100%; text-align: center">
                <a-tooltip v-if="canEdit()" placement="top">
                    <template #title>{{ editor.lang('copyLeft1') }}</template>
                    <a-button
                        :disabled="disable"
                        @click="() => onAction('CopyBackward')"
                        style="width: 40px"
                    >
                        <template #icon>
                            <div>
                                <StepBackwardOutlined />
                                <CopyOutlined
                                    style="
                                        margin-left: -4px;
                                        font-size: 14px;
                                        transform: rotateY(180deg);
                                    "
                                />
                            </div>
                        </template>
                    </a-button>
                </a-tooltip>

                <a-tooltip placement="top">
                    <template #title>{{
                        editor.lang('speedDown', {
                            n: state.playSpeed,
                        })
                    }}</template>
                    <a-button
                        :disabled="!canOperate()"
                        v-show="!isCheck()"
                        @click="onChangeSpeed(-1)"
                    >
                        <template #icon>
                            <i class="iconfont icon-zuo-fuzhi" />
                        </template>
                    </a-button>
                </a-tooltip>

                <a-tooltip placement="top">
                    <template #title>{{ editor.lang('replay') }}</template>
                    <a-button
                        :disabled="!canOperate()"
                        v-show="!isCheck()"
                        @click="() => onAction('Replay')"
                    >
                        <template #icon>
                            <i class="iconfont icon-chongxinbofang" />
                        </template>
                    </a-button>
                </a-tooltip>

                <a-tooltip placement="top">
                    <template #title>{{ editor.lang('pre') }}</template>
                    <a-button
                        :disabled="isPreDisabled"
                        @click="() => onAction('PreFrame')"
                        type="default"
                    >
                        <template #icon>
                            <i class="iconfont icon-shouqi" />
                        </template>
                    </a-button>
                </a-tooltip>
                <!-- @change="changeFrameIndex" -->
                <a-input-number
                    style="width: 80px"
                    :disabled="disable"
                    v-model:value="iState.frameIndex"
                    :precision="0"
                    @blur="() => changeFrameIndex('Input')"
                    @pressEnter="() => changeFrameIndex('Input')"
                    :min="1"
                    :max="total"
                    size="small"
                />
                <span class="i-span">/ {{ total }}</span>

                <a-tooltip placement="top">
                    <template #title>{{ editor.lang('next') }}</template>
                    <a-button
                        :disabled="isNextDisabled"
                        @click="() => onAction('NextFrame')"
                        type="default"
                    >
                        <template #icon>
                            <i class="iconfont icon-zhankai1" />
                        </template>
                    </a-button>
                </a-tooltip>

                <a-tooltip placement="top">
                    <template #title>{{
                        state.play
                            ? editor.lang('pause')
                            : editor.lang('play', { n: state.playSpeed })
                    }}</template>
                    <a-button
                        v-show="!isCheck()"
                        :disabled="!canOperate()"
                        @click="() => onAction(state.play ? 'Stop' : 'Play')"
                        type="default"
                    >
                        <template #icon>
                            <i class="iconfont icon-guaqi" v-if="state.play" />
                            <i class="iconfont icon-bofang" v-else />
                        </template>
                    </a-button>
                </a-tooltip>

                <a-tooltip placement="top">
                    <template #title>{{ editor.lang('speedUp', { n: state.playSpeed }) }}</template>
                    <a-button
                        :disabled="!canOperate()"
                        v-show="!isCheck()"
                        @click="onChangeSpeed(1)"
                    >
                        <template #icon>
                            <i class="iconfont icon-right-fuzhi" />
                        </template>
                    </a-button>
                </a-tooltip>

                <a-tooltip v-if="canEdit()" placement="top">
                    <template #title>{{ editor.lang('copyRight1') }}</template>
                    <a-button
                        :disabled="disable"
                        @click="() => onAction('CopyForward')"
                        style="width: 40px"
                    >
                        <template #icon>
                            <div>
                                <CopyOutlined style="margin-right: -4px; font-size: 14px" />
                                <StepForwardOutlined />
                            </div>
                        </template>
                    </a-button>
                </a-tooltip>
            </div>
        </div>
        <div class="bar-right" v-show="!isCheck()" v-if="canEdit()">
            <!-- object tracking -->
            <!-- <toolTipTrack v-if="isAnnotate()" :state="state" /> -->
            <!-- <div class="divide-line"> </div> -->

            <!-- <toolTipMerge v-if="!isGroup()" :state="state" @action="onTrackAction" /> -->

            <!-- <toolTipSplit v-if="!isGroup()" :state="state" @action="onTrackAction" /> -->

            <a-tooltip placement="top">
                <template #title>{{ editor.lang('delete') }}</template>
                <a-button @click="() => onTrackAction('Delete')">
                    <template #icon>
                        <i class="iconfont icon-shanchuicon" />
                    </template>
                </a-button>
            </a-tooltip>
            <div v-show="disable" class="over-not-allowed"></div>
        </div>
    </div>
</template>
<script lang="ts" setup>
    import * as _ from 'lodash';
    import { ref, computed, watch, reactive } from 'vue';

    import useUI from '../../hook/useUI';
    import { ITrackAction, IBottomState } from './useTimeLine';

    import { StepForwardOutlined, StepBackwardOutlined, CopyOutlined } from '@ant-design/icons-vue';
    import { useInjectEditor } from '../../state';
    const props = defineProps<{
        state: IBottomState;
    }>();
    const { canEdit, isCheck, canOperate } = useUI();
    const editor = useInjectEditor();
    const config = editor.state.config;
    const iState = reactive({
        // autoLoad: false,
        frameIndex: editor.state.frameIndex + 1,
    });
    const autoLoadSwitch = ref<HTMLElement>();
    const emit = defineEmits(['onTrackAction', 'updateTrackLine']);

    watch(
        () => editor.state.frameIndex,
        () => {
            if (iState.frameIndex !== editor.state.frameIndex + 1)
                iState.frameIndex = editor.state.frameIndex + 1;
        },
        { immediate: true },
    );

    const isPreDisabled = computed(() => {
        return editor.state.frameIndex <= 0 || disable.value;
    });
    const isNextDisabled = computed(() => {
        return editor.state.frameIndex >= editor.state.frames.length - 1 || disable.value;
    });
    const total = computed(() => {
        return editor.state.frames.length;
    });

    type IBarAction =
        | 'CopyForward'
        | 'CopyBackward'
        | 'AutoLoad'
        | 'Replay'
        | 'PreFrame'
        | 'NextFrame'
        | 'Play'
        | 'Stop'
        | 'Check';

    function onChangeSpeed(dir: 1 | -1) {
        const state = props.state;
        const scale = dir === 1 ? 2 : 0.5;
        state.playSpeed *= scale;
        state.playSpeed = Math.max(0.5, Math.min(4, state.playSpeed));
        editor.playManager.interval = Math.round(300 / state.playSpeed);
    }
    function onTrackAction(action: ITrackAction) {
        emit('onTrackAction', action);
    }
    function onAutoLoadHandle() {
        autoLoadSwitch.value?.blur();
        onAction('AutoLoad');
    }
    function onAction(action: IBarAction) {
        const { frames } = editor.state;
        switch (action) {
            case 'AutoLoad':
                editor.dataResource.setLoadMode(config.autoLoad ? 'near_2' : 'all');
                editor.dataResource.load();
                break;
            case 'CopyForward':
                editor.dataManager.copyForward();
                break;

            case 'CopyBackward':
                editor.dataManager.copyBackWard();
                break;
            case 'Replay':
                rePlay();
                break;
            case 'PreFrame':
                iState.frameIndex = Math.max(1, Math.min(frames.length, iState.frameIndex - 1));
                changeFrameIndex('Previous');
                break;
            case 'NextFrame':
                iState.frameIndex = Math.max(1, Math.min(frames.length, iState.frameIndex + 1));
                changeFrameIndex('Next');
                break;
            case 'Play':
                play();
                break;
            case 'Stop':
                editor.playManager.stop();
                break;
            case 'Check':
                onCheck();
                break;
        }
    }

    function onCheck() {
        // editor.actionManager.execute('toggleShowCheckView');
    }

    async function rePlay() {
        if (editor.playManager.playing) {
            editor.playManager.stop();
        }
        await editor.loadFrame(props.state.playStart, false);
        play();
    }

    function play() {
        const { frames, frameIndex } = editor.state;
        const pState = props.state;
        const nextData = frames[frameIndex + 1];
        if (!nextData || nextData.loadState !== 'complete') {
            editor.showMsg('warning', editor.lang('noPlayData'));
            return;
        }

        pState.play = true;
        pState.playStart = frameIndex;
        editor.playManager.play();
    }

    const changeFrameIndex = _.debounce((method: 'Input' | 'Next' | 'Previous') => {
        const beforeIndex = editor.state.frameIndex;
        if (!iState.frameIndex) iState.frameIndex = 1;
        editor.loadFrame(iState.frameIndex - 1);
        // editor.reportManager.reportChangeFrame(method, beforeIndex + 1);
        // frameIndexChange(iState.frameIndex);
    }, 300);

    const disable = computed(() => {
        return !canOperate() || props.state.play;
    });
</script>
<style lang="less">
    .i-toolbar-container {
        display: flex;
        position: relative;
        align-items: center;
        overflow-x: auto;
        overflow-y: hidden;
        height: 32px;
        background-color: #1e1f22;
        white-space: nowrap;
        flex-direction: row;

        .iconfont {
            font-size: 14px;
        }

        .bar-left {
            display: flex;
            position: relative;
            align-items: center;
            height: 100%;
        }

        .bar-right {
            display: flex;
            position: relative;
            align-items: center;
            height: 100%;
        }

        .bar-center {
            display: flex;
            position: relative;
            align-items: center;
            height: 100%;
            flex: 1;
        }

        &::-webkit-scrollbar {
            // display: none;
            position: absolute;
            height: 2px;
        }

        .i-margin-right {
            margin-right: 1px;
        }

        .ant-input-number-handler-wrap {
            display: none;
        }

        .ant-input-number {
            margin-left: 2px;
        }

        .ant-input-number-input {
            background-color: white;
            text-align: center;
            color: black;
        }

        .empty-space {
            display: inline-block;
            width: 80px;
            height: 20px;
        }

        .divide-line {
            display: inline-block;
            margin: 0 10px;
            width: 1px;
            height: 20px;
            border-left: 1px solid white;
        }

        .ant-btn {
            border: none;
        }

        .i-span {
            display: inline-block;
            user-select: none;
            margin: 0 4px;
        }

        .item {
            display: inline-block;
            margin-left: 10px;
            cursor: pointer;

            &.icon {
                margin-right: 5px;
                margin-left: 8px;
            }
        }
    }

    .frame-setting {
        width: 220px;

        .wrap {
            margin-top: 10px;
            padding-right: 4px;
            padding-left: 6px;
        }

        .title {
            font-size: 14px;
            text-align: center;
            line-height: 32px;
        }

        .title1 {
            font-size: 12px;
            text-align: left;
            // padding-bottom: 8px;
            line-height: 32px;
        }

        .title2 {
            display: flex;
            font-size: 12px;
            color: white;
            line-height: 32px;

            .ant-input-number-input {
                text-align: center;
            }

            > label {
                display: inline-block;
                padding: 0 8px 0 0;
                min-width: 70px;
                text-align: left;
                line-height: 32px;
            }
        }
    }
</style>
