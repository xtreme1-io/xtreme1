<template>
    <div class="main-view-setting">
        <div class="item">
            <label>{{ $$('height-range') }}:</label>
        </div>
        <div class="item">
            <a-input-number
                v-model:value="config.heightRange[0]"
                size="small"
                @change="update"
                @blur="onBlur"
                :formatter="formatter"
                :min="config.pointInfo.min.z"
                :max="config.heightRange[1] || config.pointInfo.max.z"
                :step="0.1"
                style="width: 60px"
            ></a-input-number>
            <span>~</span>
            <a-input-number
                v-model:value="config.heightRange[1]"
                size="small"
                @change="update"
                @blur="onBlur"
                :formatter="formatter"
                :min="config.heightRange[0] || config.pointInfo.min.z"
                :max="config.pointInfo.max.z"
                :step="0.1"
                style="width: 60px"
            ></a-input-number>
            <a-button
                :title="$$('reset')"
                size="small"
                style="border: none; float: right"
                @click="onReset"
            >
                <template #icon>
                    <RetweetOutlined />
                </template>
            </a-button>
        </div>
        <!-- <div class="toggle-btn">
            <a-button style="width: 100%" size="small" @click="onVisible">
                <template #icon>
                    <UpOutlined v-if="visible" />
                    <DownOutlined v-else />
                </template>
            </a-button>
        </div> -->
    </div>
</template>
<script lang="ts" setup>
    import { reactive, ref, computed } from 'vue';
    import { RetweetOutlined, UpOutlined, DownOutlined } from '@ant-design/icons-vue';
    import { PointsMaterial } from 'pc-render';
    import { useInjectEditor } from '../../state';
    import * as THREE from 'three';
    import * as _ from 'lodash';
    import * as locale from './lang';
    import { utils } from 'pc-editor';
    const editor = useInjectEditor();
    const $$ = editor.bindLocale(locale);
    const config = editor.state.config;
    function formatter(value: any) {
        let n = ('' + value).split('.');
        if (n[1] && n[1].length > 1) {
            return Number(value).toFixed(1);
        } else {
            return value;
        }
    }
    function verify() {
        const heightRange = config.heightRange;
        if (!heightRange[0]) {
            heightRange[0] = 0.0;
        }
        if (!heightRange[1]) {
            heightRange[1] = config.pointInfo.max.z;
        }
    }
    function onBlur() {
        verify();
        update();
    }
    function onReset() {
        config.heightRange[0] = config.pointInfo.min.z;
        config.heightRange[1] = config.pointInfo.max.z;
        update();
    }
    const update = _.debounce(() => {
        const heightRange = config.heightRange;
        if (isNaN(heightRange[0]) || isNaN(heightRange[1])) return;
        let points = editor.pc.groupPoints.children[0] as THREE.Points;
        let material = points.material as PointsMaterial;
        let option = {} as any;
        option.heightRange = new THREE.Vector2().fromArray(heightRange);
        material.setUniforms(option);
        editor.pc.render();
    }, 300);
</script>
<style lang="less">
    .main-view-setting {
        // text-align: left;
        pointer-events: all;
        > .item {
            clear: both;
            margin-bottom: 4px;
            > label {
                margin-right: 10px;
            }
        }
    }
</style>
