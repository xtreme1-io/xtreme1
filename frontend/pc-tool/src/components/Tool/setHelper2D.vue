<template>
    <a-tooltip trigger="click" placement="right" v-model:visible="iState.visible">
        <span
            class="item"
            :style="{
                'border-top-right-radius': 0,
                'border-top-left-radius': 0,
                'padding-bottom': '2px',
                'padding-top': 0,
                color: iState.visible ? 'rgb(23, 125, 220)' : '',
            }"
            :title="$$('title_contourSetting')"
        >
            <EllipsisOutlined style="font-size: 14px; border-top: 1px solid #4e4e4e" />
        </span>
        <template #title>
            <div class="editor-info-tooltip" style="padding: 0 4px; width: 160px">
                <div class="title2">
                    {{ $$('title_aux_line') }}:
                    <a-switch
                        size="small"
                        style="margin-top: 5px; margin-right: 10px; float: right"
                        v-model:checked="activeLine"
                    />
                </div>
                <div class="title2">
                    {{ $$('title_aux_circle') }}:
                    <a-switch
                        size="small"
                        style="margin-top: 5px; margin-right: 10px; float: right"
                        v-model:checked="activeCircle"
                    />
                </div>
                <div class="title2">
                    {{ $$('title_radius') }}:
                    <a-input-number
                        v-model:value="config.circleRadius"
                        size="small"
                        :step="0.1"
                        :formatter="formatter"
                        @blur="onRadiusBlur"
                        :min="0"
                        style="width: 72px"
                    ></a-input-number>
                    px
                </div>
            </div>
        </template>
    </a-tooltip>
</template>
<script lang="ts" setup>
    import { EllipsisOutlined } from '@ant-design/icons-vue';
    import { computed, reactive } from 'vue';
    import { useInjectEditor } from '../../state';
    import * as locale from './lang';
    import { IHelper2D } from 'pc-editor';
    // ***************Props and Emits***************
    const iState = reactive({
        visible: false,
    });
    // ***************Props and Emits***************
    const editor = useInjectEditor();
    let $$ = editor.bindLocale(locale);
    const config = editor.state.config;
    function getComputedData(key: IHelper2D) {
        return {
            set(value) {
                if (value) {
                    config.activeHelper2d.push(key);
                } else {
                    config.activeHelper2d = config.activeHelper2d.filter((e) => e !== key);
                }
            },
            get() {
                return config.activeHelper2d.includes(key);
            },
        };
    }
    const activeCircle = computed<boolean>(getComputedData('aux_circle'));
    const activeLine = computed<boolean>(getComputedData('aux_line'));
    function onRadiusBlur() {}
    function formatter(value: any) {
        const n = ('' + value).split('.');
        if (n[1] && n[1].length > 1) {
            return Number(value).toFixed(1);
        } else {
            return value;
        }
    }
</script>
