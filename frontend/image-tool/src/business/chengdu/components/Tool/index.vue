<template>
    <div class="pc-editor-tool" :class="editor.state.activeItem">
        <!-- Mark -->
        <!-- <a-tooltip placement="right" trigger="hover">
            <template #title> Coming Soon </template>
            <span class="item">
                <i class="iconfont icon-pizhuicon"></i>
            </span>
        </a-tooltip> -->
        <!-- <div class="divider"></div> -->
        <!-- edit -->
        <template v-for="item in allItems" :key="item.action">
            <a-tooltip placement="right" trigger="hover" v-show="item.isDisplay(tool)">
                <!-- <template v-if="item.action === 'edit'" #title> </template> -->
                <template #title>
                    <div style="display: flex; align-items: center">
                        <span>{{ item.title }}</span>
                        <i
                            style="font-size: 14px; margin: 3px 5px 0"
                            class="iconfont icon-keyboard"
                        ></i>
                        <span>{{ item.hotkey }}</span>
                    </div>
                </template>
                <span
                    v-show="item.isDisplay(tool)"
                    :class="{
                        active: item.isActive(tool),
                        item: true,
                    }"
                    :style="item.getStyle ? item.getStyle(tool) : {}"
                    @click="onTool(item.action)"
                >
                    <i :class="item.getIcon(tool)"></i>
                    <span class="msg" v-show="item.hasMsg && item.hasMsg(tool)">+</span>
                </span>
                <div v-show="item.isDisplay(tool)">
                    <component v-if="item.extra" :is="item.extra()" />
                </div>
            </a-tooltip>
            <div v-show="item.bottomBar && item.isDisplay(tool)" class="divider dashed"></div>
        </template>
        <div v-if="state.showInteriorTool" class="item-float-content">
            <a-tooltip tigger="hover" placement="right">
                <template #title>Hollow out</template>
                <div class="float-item" @click.stop="onTool('addInterior')">
                    <i class="iconfont icon-polygon-hollow" style="font-size: 20px"></i>
                    <span class="item-title">Hollow</span>
                </div>
            </a-tooltip>
            <a-tooltip tigger="hover" placement="right">
                <template #title>Cancel the hollow out</template>
                <div class="float-item" @click.stop="onTool('removeInterior')">
                    <i class="iconfont icon-cancel-hollow" style="font-size: 20px"></i>
                    <span class="item-title">Cancel</span>
                </div>
            </a-tooltip>
        </div>
        <div v-if="state.showCutTool" class="item-float-content">
            <a-tooltip tigger="hover" placement="right">
                <template #title>
                    <div class="display: flex;align-items: center">
                        <span>Do not crop the first object</span>
                        <i
                            style="
                                font-size: 14px;
                                display: inline-block;
                                margin: 0px 5px;
                                transform: translateY(1px);
                            "
                            class="iconfont icon-keyboard"
                        ></i>
                        <span>{{ crop1Keyboard }}</span>
                    </div>
                </template>
                <div class="float-item" @click.stop="onTool('clipPolygon', false)">
                    <i class="iconfont icon-polygon-clip" style="font-size: 20px"></i>
                    <span class="item-title">Crop1</span>
                </div>
            </a-tooltip>
            <a-tooltip tigger="hover" placement="right">
                <template #title>
                    <div class="display: flex;align-items: center">
                        <span>Crop the first object</span>
                        <i
                            style="
                                font-size: 14px;
                                display: inline-block;
                                margin: 0px 5px;
                                transform: translateY(1px);
                            "
                            class="iconfont icon-keyboard"
                        ></i>
                        <span>{{ crop2Keyboard }}</span>
                    </div>
                </template>
                <div class="float-item" @click.stop="onTool('clipPolygon', true)">
                    <i class="iconfont icon-polygon-clip" style="font-size: 20px"></i>
                    <span class="item-title">Crop2</span>
                </div>
            </a-tooltip>
        </div>
        <!-- brush -->
        <!-- <a-tooltip placement="right" trigger="hover">
            <template #title> comming soon </template>
            <span class="item">
                <i class="iconfont icon-a-lujing15750"></i>
            </span>
        </a-tooltip> -->
    </div>
    <div class="pc-editor-tool tool-bottom">
        <a-tooltip placement="rightBottom" trigger="hover" overlayClassName="tool-info-tooltip">
            <template #title>
                <Setting />
            </template>
            <span class="item" title=""><i class="iconfont icon-setting"></i> </span>
        </a-tooltip>

        <a-tooltip placement="rightBottom" trigger="hover" overlayClassName="tool-info-tooltip">
            <template #title>
                <Info />
            </template>
            <span class="item" title="">
                <i class="iconfont icon-information"></i>
            </span>
        </a-tooltip>
    </div>
</template>

<script setup lang="ts">
    import { reactive, computed } from 'vue';
    import { useInjectTool } from '../../state';
    import { Event, AnnotateType } from 'editor';
    import Info from './Info.vue';
    import Setting from './Setting.vue';
    import useTool from './useTool';
    import useUI from '../../hook/useUI';
    import { BsUIType } from '../../config/ui';
    import { isMac } from '../../utils';

    let tool = useInjectTool();
    let editor = tool.editor;
    let { has } = useUI();
    let { onTool, allItems } = useTool();
    editor.handleSelectTool = onTool;
    let state = reactive({
        showInteriorTool: false,
        showCutTool: false,
    });
    editor.on(Event.SELECT, (data) => {
        let selection = data.data.curSelection.filter((t: any) => t.type === AnnotateType.POLYGON);
        if (selection.length > 1) {
            state.showCutTool = true;
        } else {
            state.showCutTool = false;
        }
        if (selection.length === 0) {
            state.showInteriorTool = false;
        } else if (selection.length === 1) {
            state.showInteriorTool = selection[0].interior.length > 0;
        } else {
            state.showInteriorTool = true;
        }
    });

    // Title ----------------
    const crop1Keyboard = 'X';
    const crop2Keyboard = isMac() ? '⌘ + X' : 'Ctrl + X';
</script>

<style lang="less">
    .pc-editor-tool {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        .divider {
            border-top: 1px solid #0f0909;
            display: inline-block;
            width: 38px;
            vertical-align: middle;
            &.dashed {
                border-top: 1px dashed #6c6c6c;
            }
        }
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
            padding: 8px 0px;
            margin: 4px 0;
            position: relative;
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
            .anticon,
            .iconfont {
                font-size: 18px;
            }

            &:disabled {
                background: #6d7278;
            }

            &:hover {
                .iconfont {
                    color: #57ccef;
                }
            }
            &.active {
                background: #57ccef;
                color: #dee5eb;
                .iconfont {
                    color: #dee5eb;
                }
                .interactive {
                    color: #57ccef;
                }
            }
        }
        &.edit .item-float-content {
            display: flex;
        }
        .item-float-content {
            display: none;
            position: absolute;
            top: 10px;
            right: -60px;
            height: 108px;
            width: 46px;
            background-color: #3a3a3e;
            z-index: 1;
            border-radius: 6px;
            box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.15);
            flex-direction: column;
            justify-content: space-around;
            align-items: center;
            & + .item-float-content {
                top: 128px;
            }
            .float-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-around;
                cursor: pointer;
                &:hover {
                    color: #57ccef;
                    .iconfont {
                        color: inherit;
                    }
                }
            }
            .item-title {
                padding: 4px 0;
                font-size: 12px;
            }
            .item-img {
                width: 24px;
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
        max-width: 300px;
        width: 300px;
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
            padding-left: 8px;
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
