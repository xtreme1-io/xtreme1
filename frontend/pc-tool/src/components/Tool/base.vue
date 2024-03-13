<template>
    <div class="pc-editor-tool">
        <slot v-if="$slots.tool" name="tool"></slot>
    </div>
    <div class="pc-editor-tool tool-bottom">
        <a-tooltip placement="rightBottom" trigger="click" overlayClassName="tool-info-tooltip">
            <template #title>
                <Setting :config="config" />
            </template>
            <slot v-if="$slots.titleInfo" name="titleSetting"></slot>
            <span v-else class="item" title=""
                ><i class="iconfont icon-xianshi"></i
                ><span class="title">{{ $$('btn_setting') }}</span>
            </span>
        </a-tooltip>

        <a-tooltip
            v-model:visible="iState.infoVisible"
            :onVisibleChange="onVisibleChange"
            placement="rightBottom"
            trigger="click"
            overlayClassName="tool-info-tooltip"
        >
            <template #title>
                <Info />
            </template>
            <slot v-if="$slots.titleInfo" name="titleInfo"></slot>
            <span v-else class="item" title="">
                <i class="iconfont icon-xinxi"></i><span class="title">{{ $$('btn_msg') }}</span>
            </span>
        </a-tooltip>
    </div>
</template>

<script setup lang="ts">
    import { useInjectEditor, useInjectState } from '../../state';
    import Info from './Info.vue';
    import Setting from './Setting.vue';
    import useTool, { IConfig } from './useTool';
    import * as locale from './lang';
    import { reactive } from 'vue';
    const props = defineProps<{
        config?: IConfig;
    }>();
    const editor = useInjectEditor();
    const state = useInjectState();
    const iState = reactive({
        infoVisible: false,
    });

    let $$ = editor.bindLocale(locale);
    async function onVisibleChange(value: any) {
        if (value) {
            await editor.configManager.countVisiblePointN();
        }
    }
</script>

<style lang="less">
    .pc-editor-tool {
        display: flex;
        flex-direction: column;
        align-items: center;

        .item {
            width: 38px;
            font-size: 12px;
            border-radius: 4px;
            background: #1e1f22;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: #bec1ca;
            cursor: pointer;
            padding: 4px 0px;
            margin-bottom: 4px;
            .title {
                font-size: 12px;
                line-height: 1;
                margin-top: 4px;
            }

            .anticon,
            .iconfont {
                font-size: 14px;
            }

            &:disabled {
                background: #6d7278;
            }

            &:hover {
                background: #224b77;
            }
            &.active {
                background: #0486fe;
                color: #dee5eb;
            }
        }
    }

    .tool-bottom {
        position: absolute;
        bottom: 0px;
        left: 0px;
        right: 0px;
        height: 120px;
        flex-direction: column-reverse;
    }

    .tool-info-tooltip {
        max-width: 250px;
        width: 250px;
        min-height: 100px;
        background: #333333;
        border-radius: 4px;
        padding: 4px;
        color: #bec1ca;
        font-size: 12px;

        .ant-slider-handle {
            background-color: #ffffff;
            border: solid 2px #2e8cf0;
        }

        .ant-slider-track {
            background-color: #2e8cf0;
        }

        .ant-tooltip-inner {
            color: #bec1ca;
        }

        .ant-checkbox-wrapper {
            margin-left: 0px !important;
            margin-right: 10px !important;
            margin-bottom: 10px !important;
        }

        .divider {
            border-top: 1px solid #6c6c6c;
            display: inline-block;
            width: 240px;
            vertical-align: middle;
        }

        .ant-tooltip-arrow {
            display: none;
        }
        .ant-tooltip-content {
            position: relative;
            .close {
                position: absolute;
                right: 6px;
                top: 6px;
                font-size: 20px;
                cursor: pointer;
            }
        }

        .ant-tooltip-inner {
            box-shadow: none;
        }

        .wrap {
            padding-left: 14px;
            // .ant-row {
            //     font-size: 12px;
            //     line-height: 21px;
            // }
        }

        .title1 {
            // font-weight: bold;
            font-size: 16px;
            line-height: 36px;
            color: white;
            text-align: center;
        }

        .title2 {
            // font-weight: 600;
            font-size: 12px;
            line-height: 30px;
            color: white;
        }

        .title3 {
            font-size: 12px;
            line-height: 26px;
        }

        .ant-checkbox-wrapper {
            font-size: 12px;
            color: #bec1ca;
        }
    }
</style>
