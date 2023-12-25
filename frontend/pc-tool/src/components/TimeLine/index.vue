<template>
    <div ref="topContainerRef" class="bottom-operation-container">
        <div class="i-head" v-show="visible">
            <ToolBar
                @updateTrackLine="updateTrackLine"
                :state="iState"
                @onTrackAction="onHandleTrackAction"
            />
        </div>
        <div ref="zoomContainer" v-show="visible" class="i-body">
            <div class="i-body-left">
                <div class="i-line-height i-label tick-line-title">{{
                    editor.lang('timeLine')
                }}</div>
                <div class="i-line-height i-label"
                    ><span class="iconfont icon-a-122" style="font-size: 12px"></span>
                    <span class="i-title">
                        {{ getTitle(iState.trackTargetLine) || editor.lang('selectObject') }}</span
                    >
                </div>
                <div v-show="iState.trackAction">
                    <div v-if="iState.trackList.length > 0" class="i-line-height i-label"></div>
                    <div>
                        <div
                            class="i-line-height i-label"
                            v-for="item in iState.trackList"
                            :key="item.trackId"
                            ><span class="icon iconfont icon-a-122" style="font-size: 12px"></span>
                            <span class="i-title"> {{ getTitle(item) }}</span>
                            <span class="new-badge" v-if="newBadge(item.trackId)">{{
                                editor.lang('newBadge')
                            }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="i-body-right">
                <TickLine
                    :frames="editor.state.frames"
                    :status="iState.annotationStatus"
                    :config="iState.frameConfig"
                />
                <!-- 当前追终对象 -->
                <TrackLine
                    style="height: 32px"
                    :trackList="iState.trackTargetLine.list"
                    :colorMap="iState.colorMap"
                    :msg-event="false"
                    :msg-tip="iState.tip"
                    :click="true"
                    :showStatus="true"
                    :annotates="iState.annotationStatus"
                    :spanWidth="iState.frameConfig.spanWidth"
                    :activeType="iState.activeType"
                />
                <!-- 操作提示 -->
                <div v-if="iState.trackAction && iState.trackList.length > 0">
                    <div class="i-line-height">
                        <div
                            class="i-line-height i-label"
                            style="position: fixed; padding-left: 60px"
                        >
                            {{
                                ['PreMergeFrom', 'MergeFrom'].indexOf(iState.trackAction) >= 0
                                    ? '↑↑↑'
                                    : '↓↓↓'
                            }}
                        </div>
                    </div>
                    <!-- 追踪对象列表 -->
                    <div class="container-tracklist">
                        <TrackLine
                            v-for="item in iState.trackList"
                            :key="item.trackId"
                            :trackList="item.list"
                            :primary="true"
                            :colorMap="iState.colorMap"
                            :spanWidth="iState.frameConfig.spanWidth"
                            :activeType="iState.activeType"
                        />
                    </div>
                </div>
            </div>
            <div v-show="!canOperate() || iState.play" class="over-not-allowed"></div>
        </div>
        <!-- <contentMsg :state="iState" /> -->
    </div>
</template>
<script lang="ts" setup>
    // import ToolBody from './toolBody.vue';
    import ToolBar from './toolbar.vue';
    import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
    import useUI from '../../hook/useUI';
    import TickLine from './tickLine.vue';
    import TrackLine from './trackLine.vue';
    // import PinList from './pinList.vue';
    import useBottom, { ITrackObject, IConfig } from './useTimeLine';
    import * as _ from 'lodash';
    // import contentMsg from './tip/msg.vue';

    const { canOperate } = useUI();
    const { editor, updateTrackLine, iState, zoomContainer, setConfig, onHandleTrackAction } =
        useBottom();
    const visible = ref(true);
    const props = defineProps<{
        config?: IConfig;
    }>();
    const topContainerRef = ref<HTMLElement>();
    const upDateHeight = _.debounce(() => {
        editor.pc.render();
    }, 100);
    onMounted(() => {
        window.addEventListener('resize', upDateHeight);
    });
    onBeforeUnmount(() => {
        window.removeEventListener('resize', upDateHeight);
    });
    watch(
        () => props.config,
        () => {
            setConfig(props.config);
        },
        {
            deep: true,
            immediate: true,
        },
    );
    watch(
        () => [iState.trackAction, iState.trackList, iState.frameConfig.spanWidth],
        () => {
            upDateHeight();
        },
        {
            immediate: true,
        },
    );
    function canSplit() {
        return ['PreSplit', 'Split'].indexOf(iState.trackAction) >= 0;
    }
    function trackId2View(trackId: string) {
        const splitStr = String(trackId).split('-');
        return splitStr.length > 1
            ? `${splitStr[0]}***${splitStr[splitStr.length - 1]}`
            : splitStr[0];
    }
    function getTitle(trackObject: ITrackObject) {
        const { trackId, trackName } = trackObject;
        if (trackId) return `${trackName}(${trackId2View(trackId)})`;
        else return '';
    }
    function newBadge(trackId: string) {
        const selectTrackId = iState.trackTargetLine.trackId;
        return canSplit() && selectTrackId !== trackId;
    }
</script>
<style lang="less">
    .bottom-operation-container {
        display: flex;
        position: relative;
        margin-top: 4px;
        padding-left: 2px;
        width: 100%;
        height: 100%;
        background-color: #1e1f22;
        text-align: left;
        flex-direction: column;

        .toggle-handle {
            position: absolute;
            top: -18px;
            left: 50%;
            padding: 0 15px;
            text-align: center;
            color: #aaaaaa;
            transform: translateX(-50%);
            line-height: 18px;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;

            &:hover {
                background: #2b2a2e;
            }
        }

        .i-line-height {
            height: 32px;
            line-height: 32px;
            white-space: nowrap;

            .comment {
                display: block;
                margin-top: 2px;
                font-size: 12px;
                text-align: center;
                color: #2e8cf0;
                line-height: 1;
            }

            .miss-icon {
                display: block;
                padding-left: 1px;
                font-size: 12px;
            }

            .invalid-icon {
                display: block;
                margin-top: 2px;
                font-size: 12px;
                text-align: center;
                color: #ff5656;
                line-height: 1;
            }

            .i-title {
                padding-left: 4px;
                font-size: 12px;
            }

            .new-badge {
                display: block;
                padding-right: 4px;
                float: right;
                font-size: 12px;
                color: red;
            }
        }

        .i-label {
            padding-left: 8px;
            overflow: hidden;
        }

        .i-head {
            // padding-left: 200px;
        }

        .i-body {
            flex: 1;
            display: flex;
            position: relative;
            flex-direction: row;

            .i-body-left {
                width: 200px;

                .tick-line-title {
                    height: 36px;
                    line-height: 36px;
                    background-color: #23262e;
                    box-shadow: inset 0 -1px 0 #43454b;
                }
            }

            .i-body-right {
                &::-webkit-scrollbar-thumb {
                    border-radius: 10px;
                    background: #818181;
                }

                &::-webkit-scrollbar {
                    // display: none;
                    position: absolute;
                    height: 6px;
                }

                position: relative;
                overflow-x: auto;
                overflow-y: hidden;
                width: 0;
                text-align: left;
                flex: 1;
                // }
            }
        }
    }
</style>
