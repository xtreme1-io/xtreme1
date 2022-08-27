<template>
    <div v-show="config.pointColorMode !== 'intensity'" class="title3" style="padding-top: 10px"
        >{{ $$('setting_colorheight') }}
        <a-button
            :title="$$('setting_pointreset')"
            size="small"
            style="border: none; float: right"
            @click="onResetHeight"
        >
            <template #icon>
                <RetweetOutlined />
            </template>
        </a-button>
        <a-input-number
            v-model:value="config.pointHeight[1]"
            size="small"
            :step="0.1"
            :formatter="formatter"
            @blur="onBlur"
            :min="config.pointHeight[0] || config.pointInfo.min.z"
            :max="config.pointInfo.max.z"
            style="width: 60px; float: right"
        ></a-input-number>
        <a-input-number
            v-model:value="config.pointHeight[0]"
            size="small"
            :step="0.1"
            :formatter="formatter"
            @blur="onBlur"
            :min="config.pointInfo.min.z"
            :max="config.pointHeight[1] || config.pointInfo.max.z"
            style="width: 60px; float: right"
        ></a-input-number>
    </div>
    <div class="color-item-container">
        <a-tooltip trigger="click" placement="topLeft">
            <template #title>
                <color-picker
                    :isWidget="true"
                    pickerType="chrome"
                    useType="pure"
                    :disableAlpha="true"
                    :disableHistory="true"
                    v-model:pureColor="config.pointColors[0]"
                    @pureColorChange="updateColor"
                ></color-picker>
            </template>
            <div class="color-span" :style="{ background: config.pointColors[0] }"></div>
        </a-tooltip>
        <div :style="{ background: colorCodeBg(colorMap) }" class="color-slider">
            <!-- <div class="color-slider-indicator" :style="{ left: range[0] + '%' }"></div>
            <div class="color-slider-indicator" :style="{ left: range[1] + '%' }"></div> -->
            <a-slider
                v-show="config.pointColorMode !== 'intensity'"
                style="width: 100%; margin: 0px"
                v-model:value="config.pointHeight"
                range
                :min="config.pointInfo.min.z"
                :max="config.pointInfo.max.z"
                :step="0.1"
                @change="updateHeight"
            />
        </div>
        <a-tooltip trigger="click" placement="topLeft">
            <template #title>
                <color-picker
                    :isWidget="true"
                    pickerType="chrome"
                    useType="pure"
                    :disableAlpha="true"
                    :disableHistory="true"
                    v-model:pureColor="config.pointColors[1]"
                    @pureColorChange="updateColor"
                />
            </template>
            <div class="color-span" :style="{ background: config.pointColors[1] }"></div>
        </a-tooltip>
    </div>
    <div class="title3" style="padding-top: 10px; height: 24px">
        <a-button type="dashed" class="reset" size="small" @click="onResetColor">{{
            $$('setting_colorreset')
        }}</a-button>
    </div>
</template>
<script lang="ts" setup>
    import { computed, onMounted, reactive } from 'vue';
    import { utils } from 'pc-editor';
    import { RetweetOutlined } from '@ant-design/icons-vue';
    import * as THREE from 'three';
    import { PointsMaterial, IColorRangeItem } from 'pc-render';
    import { useInjectEditor } from '../../state';
    import * as _ from 'lodash';
    import * as locale from './lang';

    const editor = useInjectEditor();
    const config = editor.state.config;
    const $$ = editor.bindLocale(locale);
    const colorCodeBg = (colorMap: IColorRangeItem[]) => {
        const pointInfo = config.pointInfo;
        const _min = pointInfo.min.z;
        const _max = pointInfo.max.z;
        const mapLinear = (value: number) => THREE.MathUtils.mapLinear(value, _min, _max, 0, 100);
        const _color = colorMap
            .map((item) => {
                const colorRgb = item.color.getStyle();
                return `${colorRgb} ${mapLinear(item.min)}%,${colorRgb} ${mapLinear(item.max)}%`;
            })
            .join(',');
        return _color ? `linear-gradient(90deg, ${_color})` : 'transparent';
    };
    const colorMap = computed(() => {
        return utils.getColorRangeByArray(config.pointColors, config.pointHeight, [
            config.pointInfo.min.z,
            config.pointInfo.max.z,
        ]);
    });
    const update = _.throttle((type: 'pointHeight' | 'colorRange') => {
        let points = editor.pc.groupPoints.children[0] as THREE.Points;
        let material = points.material as PointsMaterial;
        switch (type) {
            case 'colorRange':
                material.setUniforms({ colorRange: colorMap.value });
                break;
            case 'pointHeight':
                material.setUniforms({
                    pointHeight: new THREE.Vector2().fromArray(config.pointHeight),
                });
                editor.pc.ground.plane.constant = config.pointHeight[0];
        }
        editor.pc.render();
    }, 200);

    function updateColor() {
        update('colorRange');
    }
    function updateHeight() {
        if (config.pointHeight.find((value) => isNaN(value) || utils.empty(value))) return;
        config.pointHeight.sort();
        update('pointHeight');
        updateColor();
    }
    function onResetHeight() {
        const { frameIndex, frames } = editor.state;
        const dataId = frames[frameIndex].id;
        const ground = editor.dataResource.dataMap[dataId].ground || 0;
        config.pointHeight = [ground, config.pointInfo.max.z];
        updateHeight();
    }

    function formatter(value: any) {
        let n = ('' + value).split('.');
        if (n[1] && n[1].length > 1) {
            return Number(value).toFixed(1);
        } else {
            return value;
        }
    }
    function onBlur() {
        const pointHeight = config.pointHeight;
        if (isNaN(pointHeight[0]) || utils.empty(pointHeight[0])) {
            pointHeight[0] = config.pointInfo.min.z;
        }
        if (isNaN(pointHeight[1]) || utils.empty(pointHeight[1])) {
            pointHeight[1] = config.pointInfo.max.z;
        }
        updateHeight();
    }
    function onResetColor() {
        config.pointColors = ['#141ff0', '#fab942'];
        updateColor();
    }
</script>
<style lang="less">
    .color-item-container {
        min-height: 10px;
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-top: 8px;
        .color-span {
            height: 16px;
            width: 16px;
            border: 1px solid white;
        }
        .color-slider {
            height: 10px;
            flex: 1;
            position: relative;
            margin: 0 8px;
            .color-slider-indicator {
                position: absolute;
                top: -4px;
                bottom: -4px;
                width: 4px;
                background: white;
                border-radius: 2px;
                cursor: pointer;
            }
            .ant-slider-track {
                background-color: transparent !important;
            }
            .ant-slider-rail {
                background-color: transparent;
            }
        }
    }
</style>
