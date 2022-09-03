<template>
    <div class="setting">
        <div class="title1 border-bottom">Setting</div>
        <div class="wrap">
            <!-- Image -->
            <div class="title2">
                <span style="vertical-align: middle; margin-right: 10px">Image</span>
            </div>
            <div class="wrap">
                <a-row class="setting-item">
                    <a-col :span="9" class="title"
                        ><span class="item-title">Brightness</span></a-col
                    >
                    <a-col :span="15" class="item-value">
                        <a-slider
                            v-model:value="state.brightness"
                            :min="-100"
                            :max="100"
                            :step="1"
                        />
                        <span>{{ state.brightness }}</span>
                    </a-col>
                </a-row>
                <a-row class="setting-item">
                    <a-col :span="9" class="title"><span class="item-title">Contrast</span></a-col>
                    <a-col :span="15" class="item-value">
                        <a-slider v-model:value="state.contrast" :min="-100" :max="100" :step="1" />
                        <span>{{ state.contrast }}</span>
                    </a-col>
                </a-row>
            </div>
            <div class="divider"></div>
            <!-- Result -->
            <div class="title2">
                <span style="vertical-align: middle; margin-right: 10px">Result</span>
            </div>
            <div class="wrap">
                <a-row class="setting-item">
                    <a-col :span="9" class="title"><span class="item-title">Opacity</span></a-col>
                    <a-col :span="15" class="item-value">
                        <a-slider v-model:value="state.fillalpha" :min="0" :max="1" :step="0.01" />
                        <span> {{ state.fillalpha }}</span>
                    </a-col>
                </a-row>
                <a-row class="setting-item">
                    <a-col :span="9" class="title"
                        ><span class="item-title">Border Width</span></a-col
                    >
                    <a-col :span="15" class="item-value">
                        <a-slider v-model:value="state.strokeWidth" :min="1" :max="5" :step="1" />
                        <span> {{ state.strokeWidth }}px</span>
                    </a-col>
                </a-row>

                <a-row class="setting-item">
                    <a-col :span="9" class="title"><span class="item-title">Show Size</span></a-col>
                    <a-col :span="6">
                        <a-switch
                            v-model:checked="state.showSizeTips"
                            checked-children="On"
                            un-checked-children="Off"
                        />
                    </a-col>
                </a-row>
                <a-row class="setting-item">
                    <a-col :span="9" class="title"
                        ><span class="item-title">Show Class</span></a-col
                    >
                    <a-col :span="6">
                        <a-switch
                            v-model:checked="state.showLabel"
                            checked-children="On"
                            un-checked-children="Off"
                        />
                    </a-col>
                </a-row>
            </div>
            <div class="divider"></div>
            <!--  Other-->
            <div class="title2">
                <span style="vertical-align: middle; margin-right: 10px">Other</span>
                <!-- <div class="divider"></div> -->
            </div>
            <div class="wrap">
                <a-row class="setting-item">
                    <a-col :span="9" class="title"
                        ><span class="item-title">BisectrixLine</span></a-col
                    >
                    <a-col :span="6">
                        <a-switch
                            v-model:checked="state.bisectrixLine.enable"
                            checked-children="On"
                            un-checked-children="Off"
                        />
                    </a-col>
                </a-row>
                <a-row class="setting-item">
                    <a-col :span="12" class="title">
                        <span style="margin-right: 4px">horizontal </span>
                        <a-input-number
                            :disabled="!state.bisectrixLine.enable"
                            v-model:value="state.bisectrixLine.horizontal"
                            size="small"
                            :min="2"
                            :step="1"
                            :max="10"
                            style="width: 50px"
                        />
                    </a-col>
                    <a-col :span="12">
                        <span style="margin-right: 4px">vertical </span>
                        <a-input-number
                            :disabled="!state.bisectrixLine.enable"
                            v-model:value="state.bisectrixLine.vertical"
                            size="small"
                            :min="2"
                            :step="1"
                            :max="10"
                            style="width: 50px"
                        />
                    </a-col>
                </a-row>
                <a-row class="setting-item">
                    <a-col :span="9" class="title"
                        ><span class="item-title">Display Mode</span></a-col
                    >
                    <a-col :span="12">
                        <a-radio-group v-model:value="state.viewType" size="small">
                            <a-radio-button value="mark">Mark</a-radio-button>
                            <a-radio-button value="mask">Mask</a-radio-button>
                        </a-radio-group>
                    </a-col>
                </a-row>
                <!-- <a-row class="setting-item">
                    <a-col :span="9" class="title"><span class="item-title">显示批注</span></a-col>
                    <a-col :span="6">
                        <a-switch
                            v-model:checked="state.showMarker"
                            checked-children="On"
                            un-checked-children="Off"
                        />
                    </a-col>
                </a-row> -->
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { watch, onMounted, reactive } from 'vue';
    import * as _ from 'lodash';
    import { useInjectEditor, useInjectEditorState } from '../../../../editor/inject';
    // import { useInjectState } from '../../state';
    // import useRenderConfig from '../hook/useRenderConfig';
    import { CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons-vue';
    // import { PointsMaterial, Event, Image2DRenderView } from 'pc-render';

    let editor = useInjectEditor();
    // ***************Props and Emits***************
    const emit = defineEmits(['close']);

    // *********************************************
    const formatter = (value: number) => {
        return value.toFixed(2);
    };
    type IviewType = 'mark' | 'mask';
    let state = reactive({
        brightness: 0,
        contrast: 0,
        fillalpha: 0.1,
        strokeWidth: 1,
        showSizeTips: true,
        showLabel: true,
        showAttr: true,
        singleMode: true,
        bisectrixLine: {
            enable: false,
            vertical: 2,
            horizontal: 2,
        },
        viewType: 'mark',
        showMarker: true,
    });

    let update = _.throttle((type: string) => {
        switch (type) {
            case 'canvasStyle': {
                editor.updateCanvasStyle(state);
                break;
            }
            case 'shapeStyle': {
                editor.updateShapeStyle(state);
                break;
            }
            case 'shapeSize': {
                // editor.toggleShapeSize(state);
                break;
            }
            case 'shapeLabel': {
                editor.toggleLabel(state.showLabel);
                break;
            }
            case 'shapeAttr': {
                editor.toggleAttrs(state.showAttr);
                break;
            }
            case 'viewType': {
                editor.updateViewType(state.viewType);
                break;
            }
            case 'bisectrixLine': {
                editor.updateBisectrixLine(state.bisectrixLine);
            }
        }
        // console.log('update config', type, options);
    }, 200);

    watch(
        () => [state.brightness, state.contrast],
        () => {
            update('canvasStyle');
        },
    );
    watch(
        () => [state.fillalpha, state.strokeWidth],
        () => {
            update('shapeStyle');
        },
    );

    watch(
        () => [state.showSizeTips],
        () => {
            editor.state.showSizeTips = state.showSizeTips;
        },
    );
    watch(
        () => [state.showLabel],
        () => {
            update('shapeLabel');
        },
    );
    watch(
        () => [state.showAttr],
        () => {
            update('shapeAttr');
        },
    );
    watch(
        () => [state.viewType],
        () => {
            update('viewType');
        },
    );

    watch(
        () => [state.bisectrixLine],
        () => {
            update('bisectrixLine');
        },
        { deep: true },
    );

    // function

    function onClose() {
        emit('close');
    }
</script>

<style lang="less">
    .setting {
        .setting-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            .ant-slider {
                //   width: 100px;
                margin: 6px;
                flex: 75% 0 1;
            }
            .item-value {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
        }
        .reset {
            border: 1px solid #6d7278;
            color: #6d7278;
            float: right;
            font-size: 12px;
        }
    }
</style>
