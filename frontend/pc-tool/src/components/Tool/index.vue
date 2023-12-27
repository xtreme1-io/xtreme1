<template>
    <Setting :config="{ noAnnotate: true }">
        <template #tool>
            <div class="pc-editor-editor">
                <template v-for="item in tools" :key="item.action">
                    <span
                        v-show="item.isDisplay(editor)"
                        :class="item.isActive(editor) ? 'item active' : 'item'"
                        :style="item.getStyle ? item.getStyle(editor) : ''"
                        @click="onTool(item.action)"
                        :title="item.title($$)"
                    >
                        <i :class="item.getIcon(editor)"></i>
                        <span class="msg" v-show="item.hasMsg && item.hasMsg(editor)">+</span>
                    </span>
                    <div v-show="item.isDisplay(editor)">
                        <component v-if="item.extra" :is="item.extra()" />
                    </div>
                </template>
                <div
                    v-show="editor.state.status === StatusType.Play"
                    class="over-not-allowed"
                ></div>
            </div>
        </template>
        <template #titleInfo>
            <span class="item" title="Info">
                <i class="iconfont icon-xinxi"></i><span class="title"> </span>
            </span>
        </template>
        <template #titleSetting>
            <span class="item" title="Setting">
                <i class="iconfont icon-xianshi"></i><span class="title"> </span>
            </span>
        </template>
    </Setting>
</template>

<script setup lang="ts">
    import Setting from './base.vue';
    import useTool from './useTool';
    import { useInjectEditor } from '../../state';
    import { StatusType } from 'pc-editor';
    import * as locale from './lang';

    let editor = useInjectEditor();
    let $$ = editor.bindLocale(locale);

    let { tools, onTool } = useTool();
</script>

<style lang="less">
    .pc-editor-editor {
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
            position: relative;
            .title {
                font-size: 12px;
                line-height: 1;
                margin-top: 4px;
            }

            .msg {
                position: absolute;
                right: 2px;
                top: 2px;
                color: white;
                background: red;
                border-radius: 30px;
                font-size: 16px;
                display: inline-block;
                width: 14px;
                height: 14px;
                line-height: 14px;
                text-align: center;
            }

            .iconfont {
                font-size: 18px;
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

    .editor-bottom {
        position: absolute;
        bottom: 0px;
        left: 0px;
        right: 0px;
        height: 120px;
        flex-direction: column-reverse;
    }

    .editor-info-tooltip {
        max-width: 250px;
        max-height: 80vh;
        overflow-x: hidden;
        overflow-y: auto;
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
    .tool-btn-tooltip {
        .tool-btn {
            display: flex;
            margin: 4px;
            border-radius: 2px;
            justify-content: center;
            align-items: center;
            width: 30px;
            height: 30px;
            background: #1e1f22;
            color: #bec1ca;

            &:hover {
                background: #224b77;
                color: #dee5eb;
            }

            &.active {
                background: #224b77;
                color: #dee5eb;
            }
        }
    }
</style>
