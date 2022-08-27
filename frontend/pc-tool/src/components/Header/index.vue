<template>
    <div class="pc-flow">
        <div class="item-wrap">
            <span :class="blocking ? 'close disable' : 'close'" @click="blocking ? null : onClose()"
                ><CloseOutlined /><span style="margin-left: 4px">Close</span></span
            >
        </div>
        <div class="item-wrap data-index" v-if="!state.isSeriesFrame && state.frames.length > 0">
            <LeftOutlined
                :class="state.frameIndex > 0 && !blocking ? 'icon' : 'icon disable'"
                @click="state.frameIndex > 0 && !blocking ? onPre() : null"
            />
            <a-input-number
                :disabled="blocking"
                v-model:value="dataIndex"
                size="small"
                :min="1"
                :step="1"
                @change="onIndexChange"
                @blur="onIndexBlur"
                :max="state.frames.length"
                style="width: 50px; text-align: center; font-size: 18px"
            />
            <span class="text">
                <span style="margin-right: 4px">/</span>{{ state.frames.length }}
            </span>
            <RightOutlined
                :class="
                    state.frameIndex < state.frames.length - 1 && !blocking
                        ? 'icon'
                        : 'icon disable'
                "
                @click="state.frameIndex < state.frames.length - 1 && !blocking ? onNext() : null"
            />
        </div>
        <div class="item-wrap">
            <a-tooltip placement="bottom" title="Help">
                <div class="icon" style="margin-right: 10px" @click="onHelp">
                    <i style="font-size: 22px" class="iconfont icon-help"></i>
                </div>
            </a-tooltip>
            <a-tooltip
                placement="bottom"
                :title="iState.fullScreen ? 'Exit Full Screen' : 'Full Screen'"
            >
                <div class="icon" style="margin-right: 10px" @click="onFullScreen">
                    <i
                        style="font-size: 21px"
                        class="iconfont"
                        :class="[iState.fullScreen ? 'icon-tuichuquanping' : 'icon-a-Fullscreen']"
                    ></i>
                </div>
            </a-tooltip>
            <a-button
                class="save"
                v-if="has(BsUIType.flowSave)"
                :disabled="blocking"
                :loading="bsState.saving"
                @click="onSave"
            >
                <template #icon><SaveOutlined /></template>
                Save
            </a-button>
        </div>
    </div>
</template>

<script setup lang="ts">
    // import { PointCloud } from '../lib';
    import { reactive, onMounted } from 'vue';
    import {
        RightOutlined,
        LeftOutlined,
        SaveOutlined,
        CloseOutlined,
    } from '@ant-design/icons-vue';
    import { useInjectEditor } from '../../state';
    import useHeader from './useHeader';
    import useFlow from '../../hook/useFlow';
    import useUI from '../../hook/useUI';
    import * as _ from 'lodash';
    import { BsUIType } from '../../config/ui';

    let {
        onFullScreen,
        iState,
        blocking,
        dataIndex,
        onIndexChange,
        onHelp,
        onIndexBlur,
        onSave,
        onPre,
        onNext,
        onClose,
    } = useHeader();
    let { has } = useUI();
    let { init } = useFlow();
    let editor = useInjectEditor();
    let { state, bsState } = editor;

    onMounted(() => {
        init();
    });
</script>

<style lang="less">
    .pc-flow {
        height: 100%;
        display: flex;
        justify-content: space-between;

        .item-wrap {
            // min-width: 100px;
            display: flex;
            align-items: center;
            .icon {
                font-size: 20px;
                margin: 0px 4px;
                cursor: pointer;
            }

            .icon.disable {
                cursor: not-allowed;
                color: #5a5a5a;
            }

            .text {
                font-size: 18px;
                margin-left: 4px;
            }
        }

        .close {
            font-size: 20px;
            margin-left: 10px;
            cursor: pointer;

            &.disable {
                cursor: not-allowed;
                color: #5a5a5a;
            }
        }

        .data-index {
            .ant-input-number-handler-wrap {
                display: none;
            }
            .ant-input-number-sm input {
                text-align: center;
            }
        }

        .save {
            // font-size: 18px;
            margin-right: 10px;
            // cursor: pointer;
            // padding: 4px;
            border-radius: 30px;
            // background: #3a393e;

            .anticon {
                font-size: 20px;
                vertical-align: middle;
            }

            &.ant-btn:hover,
            &.ant-btn:focus {
                color: white;
                border-color: #434343;
            }

            // &:hover {
            //     background: #3a393e;
            // }
        }
    }
</style>
