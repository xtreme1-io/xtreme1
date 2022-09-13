<template>
    <div class="setting">
        <div class="title1 border-bottom">{{ $$('setting_display') }}</div>
        <div class="wrap">
            <!-- image -->
            <div class="title2">
                <span style="vertical-align: middle; margin-right: 10px">{{
                    $$('setting_imgview')
                }}</span>
                <!-- <div class="divider"></div> -->
            </div>
            <div class="wrap">
                <div style="padding: 6px 0px">
                    <a-checkbox
                        v-if="state.config.projectPoint4"
                        v-model:checked="state.config.renderRect"
                        >{{ $$('setting_rect') }}</a-checkbox
                    >
                    <a-checkbox
                        v-if="state.config.projectPoint8"
                        v-model:checked="state.config.renderBox"
                        >{{ $$('setting_box') }}</a-checkbox
                    >

                    <a-checkbox
                        v-if="state.config.projectMap3d"
                        v-model:checked="state.config.renderProjectBox"
                        >{{ $$('setting_projectbox') }}</a-checkbox
                    >
                    <a-checkbox v-model:checked="state.config.renderProjectPoint">{{
                        $$('setting_projectpoint')
                    }}</a-checkbox>
                </div>
            </div>
            <!-- pointCloud background color-->
            <div class="title2">
                <span style="vertical-align: middle; margin-right: 10px">{{
                    $$('setting_backgroundColor')
                }}</span>
                <!-- <div class="divider"></div> -->
            </div>
            <div class="wrap">
                <a-tooltip trigger="click" placement="topLeft">
                    <template #title>
                        <color-picker
                            :isWidget="true"
                            pickerType="chrome"
                            useType="pure"
                            :disableAlpha="true"
                            :disableHistory="true"
                            v-model:pureColor="iState.backgroudColor"
                            @pureColorChange="updateBackgroundColor"
                        />
                    </template>
                    <div
                        style="
                            height: 16px;
                            display: inline-block;
                            width: 16px;
                            border: 1px solid white;
                        "
                        :style="{ background: iState.backgroudColor }"
                    ></div>
                </a-tooltip>
                <a-button type="dashed" class="reset" size="small" @click="onResetBg">{{
                    $$('setting_pointreset')
                }}</a-button>
            </div>
            <!-- show point -->
            <div class="title2">
                <span style="vertical-align: middle; margin-right: 10px">{{
                    $$('setting_pointview')
                }}</span>
                <!-- <div class="divider"></div> -->
            </div>
            <div class="wrap">
                <div class="title3"
                    >{{ $$('setting_pointsize')
                    }}<a-button type="dashed" class="reset" size="small" @click="onResetSize">{{
                        $$('setting_pointreset')
                    }}</a-button>
                </div>
                <a-slider
                    style="width: 200px; margin: 0px; margin-top: 5px"
                    v-model:value="config.pointSize"
                    :tip-formatter="formatter"
                    :min="0.1"
                    :max="2"
                    :step="0.1"
                />
            </div>
            <div class="wrap">
                <div class="title3"
                    >{{ $$('setting_pointcolor') }}
                    <a-radio-group
                        v-model:value="config.pointColorMode"
                        size="small"
                        style="width: 200px; font-size: 12px; margin-top: 5px"
                    >
                        <a-radio-button style="width: 100px; text-align: center" value="height">
                            {{ $$('setting_colorheight') }}
                        </a-radio-button>
                        <a-radio-button
                            v-if="config.pointInfo.hasIntensity"
                            style="width: 100px; text-align: center"
                            value="intensity"
                        >
                            {{ $$('setting_colorintensity') }}
                        </a-radio-button>
                    </a-radio-group>
                </div>
            </div>
            <div
                class="wrap"
                v-show="config.pointColorMode === 'intensity' && config.pointInfo.hasIntensity"
            >
                <div class="title3" style="padding-top: 10px"
                    >{{ $$('setting_colorintensity') }}
                    <a-button
                        :title="$$('setting_pointreset')"
                        size="small"
                        style="border: none; float: right"
                        @click="onResetIntensity"
                    >
                        <template #icon>
                            <RetweetOutlined />
                        </template>
                    </a-button>
                    <a-input-number
                        v-model:value="config.pointIntensity[1]"
                        size="small"
                        :min="0"
                        :max="255"
                        style="width: 60px; float: right"
                    ></a-input-number>
                    <a-input-number
                        v-model:value="config.pointIntensity[0]"
                        size="small"
                        :min="0"
                        :max="255"
                        style="width: 60px; float: right"
                    ></a-input-number>
                </div>
                <div style="margin-top: 5px" class="title3">
                    <a-slider
                        range
                        style="width: 180px; margin: 5px 0 0 5px"
                        v-model:value="config.pointIntensity"
                        :min="0"
                        :max="255"
                        :step="1"
                    />
                </div>
            </div>
            <!-- <div class="wrap" v-show="config.pointColorMode !== 'intensity'">
                <div class="title3" style="margin-top: 5px"
                    >{{ $$('setting_ground') }}
                    <a-button
                        :title="$$('setting_pointreset')"
                        size="small"
                        style="border: none; float: right"
                        @click="onResetGround"
                    >
                        <template #icon>
                            <RetweetOutlined />
                        </template>
                    </a-button>
                    <a-input-number
                        v-model:value="config.groundValue"
                        size="small"
                        :min="config.pointInfo.min.z"
                        :max="config.pointInfo.max.z"
                        style="width: 80px; float: right"
                        :step="0.1"
                    ></a-input-number>
                </div>
                <div class="title3" style="margin-top: 5px">
                    <a-slider
                        style="width: 200px; margin: 0px; margin-top: 5px"
                        v-model:value="config.groundValue"
                        :tip-formatter="formatter"
                        :min="config.pointInfo.min.z"
                        :max="config.pointInfo.max.z"
                        :step="0.1"
                    />
                </div>
            </div> -->
            <div class="wrap">
                <!-- <div
                    :style="{
                        'margin-top': '6px',
                        height: '10px',
                        background: iState.colorCodeBg,
                    }"
                    ref="colorCodeRef"
                ></div> -->
                <ColorSlider />
            </div>
            <!-- <div class="title2">
                <span style="vertical-align: middle; margin-right: 10px">{{
                    $$('setting_resultview')
                }}</span>
            </div>
            <div class="wrap">
                <div class="title3"
                    >{{ $$('setting_showlabel') }}
                    <a-switch
                        size="small"
                        style="float: right; margin-top: 5px"
                        v-model:checked="state.config.showLabel"
                    />
                </div>
                <slot name="object"></slot>
            </div> -->

            <div class="title2" v-if="!_config.noUtility">
                <span style="vertical-align: middle; margin-right: 10px">{{ $$('utility') }}</span>
                <!-- <div class="divider"></div> -->
            </div>
            <div class="wrap" v-if="!_config.noUtility">
                <div class="title3"
                    >{{ $$('measure') }}
                    <a-switch
                        v-model:checked="iState.measureOpen"
                        @change="onMeasureSwitch"
                        size="small"
                        style="float: right; margin-top: 5px"
                    />
                </div>
                <div v-for="item in iState.measureConfig" :key="item.id" class="title3">
                    {{ $$('measure_radius') }}
                    <a-button
                        size="small"
                        @click="() => delMeasure(item.id)"
                        style="float: right; border: none"
                    >
                        <template #icon>
                            <DeleteOutlined />
                        </template>
                    </a-button>
                    <a-input-number
                        style="width: 100px; float: right"
                        size="small"
                        :min="0"
                        :max="999"
                        @change="() => updateMeasure(item.id)"
                        v-model:value="item.radius"
                    />
                </div>
                <div class="title3">
                    <a-button size="small" style="width: 100%" @click="addMeasure">
                        <template #icon>
                            <PlusOutlined />
                        </template>
                        {{ $$('measure_add') }}
                    </a-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { watch, onMounted, reactive, ref, computed } from 'vue';
    import * as THREE from 'three';
    import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
    // import { getColorRange } from '../../utils';
    import * as _ from 'lodash';
    import { useInjectEditor } from '../../state';
    import { useInjectState } from '../../state';
    // import useRenderConfig from '../hook/useRenderConfig';
    import { RetweetOutlined } from '@ant-design/icons-vue';
    import { PointsMaterial, Event, Image2DRenderView } from 'pc-render';
    // import useLang from '../../hook/useLang';
    import * as locale from './lang';
    import { IConfig } from './useTool';
    import ColorSlider from './colorSlider.vue';
    let editor = useInjectEditor();
    let $$ = editor.bindLocale(locale);
    let pc = editor.pc;
    let state = useInjectState();
    let config = state.config;
    const props = defineProps<{
        config?: IConfig;
    }>();
    const _config = computed(() => {
        return Object.assign({} as IConfig, props.config || {});
    });
    let countId = 0;
    interface IMeasure {
        id: number;
        radius: number;
    }

    // ***************Props and Emits***************
    const emit = defineEmits(['close']);

    // *********************************************
    const formatter = (value: number) => {
        return value.toFixed(2);
    };
    const iState = reactive({
        colorCodeBg: 'transparent',
        focusOne: false,
        measureOpen: false,
        measureConfig: [] as IMeasure[],
        backgroudColor: '#000',
    });
    onMounted(() => {
        onMeasureSwitch();
    });
    function onMeasureSwitch() {
        if (props.config?.noUtility) return;
        editor.pc.groupTrack.visible = iState.measureOpen;
        editor.pc.render();
    }
    function addMeasure() {
        if (props.config?.noUtility) return;
        const measureLine = {
            id: countId++,
            radius: 50,
        };
        iState.measureConfig.push(measureLine);
        editor.viewManager.addTrackCircle(measureLine.radius, {
            id: measureLine.id,
        });
    }
    function delMeasure(id: number) {
        if (props.config?.noUtility) return;
        iState.measureConfig = iState.measureConfig.filter((item: IMeasure) => item.id !== id);
        editor.viewManager.delTrackCircle(id);
    }
    function onResetBg() {
        iState.backgroudColor = '#000';
        updateBackgroundColor();
    }
    const updateMeasure = _.debounce((id: number) => {
        const item = iState.measureConfig.find((item: IMeasure) => item.id === id);
        if (item && isFinite(item.radius)) {
            editor.viewManager.updateTrackCircle(id, item.radius);
        }
    }, 200);
    const updateBackgroundColor = _.throttle(() => {
        editor.viewManager.updateBackgroundColor(iState.backgroudColor || '#000');
    }, 100);

    let update = _.throttle((type: string) => {
        let points = pc.groupPoints.children[0] as THREE.Points;
        let material = points.material as PointsMaterial;
        let options = {} as any;
        switch (type) {
            case 'pointSize':
                options.pointSize = config.pointSize * 10;
                break;
            case 'type':
                // options.trimType = config.type === 'range-only' ? 1 : 2;
                break;
            case 'colorModel':
                options.colorMode = config.pointColorMode === 'height' ? -1.0 : 1.0;
                break;
            case 'intensityRange':
                options.intensityRange = new THREE.Vector2(
                    config.pointIntensity[0],
                    config.pointIntensity[1],
                );
                break;
        }

        material.setUniforms(options);
        pc.render();
        // console.log('update config', type, options);
    }, 200);

    function onResetSize() {
        config.pointSize = 0.1;
        update('pointSize');
    }

    function onResetIntensity() {
        config.pointIntensity = [0, 255];
    }

    watch(
        () => config.pointColorMode,
        () => {
            update('colorModel');
        },
    );

    watch(
        () => [config.pointIntensity[0], config.pointIntensity[1]],
        () => {
            update('intensityRange');
        },
    );

    watch(
        () => config.pointSize,
        () => {
            update('pointSize');
        },
    );

    // watch(
    //     () => [config.showAnnotation, config.showLabel],
    //     () => {
    //         pc.render();
    //     },
    // );

    watch(
        () => [
            config.renderBox,
            config.renderRect,
            config.renderProjectBox,
            config.renderProjectPoint,
        ],
        () => {
            pc.renderViews.forEach((view) => {
                if (view instanceof Image2DRenderView) {
                    view.renderBox = config.renderProjectBox && state.config.projectMap3d;
                    view.renderRect = config.renderRect && state.config.projectPoint4;
                    view.renderBox2D = config.renderBox && state.config.projectPoint8;
                    if (view.name === state.config.singleViewPrefix) {
                        view.renderPoints = config.renderProjectPoint;
                    }
                }
            });
            pc.render();
        },
    );

    // function

    function onClose() {
        emit('close');
    }
</script>

<style lang="less">
    .setting {
        .reset {
            border: 1px solid #6d7278;
            color: #6d7278;
            float: right;
            font-size: 12px;
        }
    }
</style>
