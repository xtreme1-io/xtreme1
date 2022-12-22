<template>
    <div class="pc-editor">
        <div class="pc-editor-layout">
            <div v-if="showMask" class="interactive-mask mask-header"></div>
            <div class="business-container"><Header /></div>
            <div class="content-container-wrap">
                <div class="content-container">
                    <div v-if="showMask" class="interactive-mask mask-tool"></div>
                    <div class="tool-container"><Tool /></div>
                    <div class="main-container">
                        <UseMouseInElement
                            v-slot="{ elementX, elementY }"
                            style="height: 100%; position: relative; overflow: hidden"
                        >
                            <div ref="container" style="height: 100%"></div>
                            <div
                                class="help-line vertical"
                                v-show="state.helpLineVisible"
                                :style="{ left: elementX + 'px' }"
                            ></div>
                            <div
                                class="help-line horizontal"
                                v-show="state.helpLineVisible"
                                :style="{ top: elementY + 'px' }"
                            ></div>
                            <div ref="zoom" class="help-zoom"></div>
                            <teleport to="body">
                                <div
                                    ref="shapeSize"
                                    class="help-size"
                                    :style="{
                                        left: elementX + 55 + 'px',
                                        top: elementY + 60 + 'px',
                                    }"
                                >
                                    <template
                                        v-if="
                                            sizeData.type === UIType.polyline ||
                                            (sizeData.type === UIType.polygon && sizeData.isDrawing)
                                        "
                                    >
                                        <span class="size-item">
                                            Length: {{ sizeData.length.toFixed(0) }}px
                                        </span>
                                    </template>
                                    <template
                                        v-else-if="
                                            sizeData.type === UIType.polygon && !sizeData.isDrawing
                                        "
                                    >
                                        <span class="size-item">
                                            area: {{ sizeData.area.toFixed(0) }}px
                                        </span>
                                    </template>
                                    <template v-else-if="sizeData.type === UIType.rectangle">
                                        <span class="size-item">
                                            width:{{ sizeData.width.toFixed(0) }}px
                                        </span>
                                        <span class="size-item">
                                            height:{{ sizeData.height.toFixed(0) }}px
                                        </span>
                                        <span class="size-item">
                                            area: {{ sizeData.area.toFixed(0) }}px
                                        </span>
                                    </template>
                                </div>
                            </teleport>
                        </UseMouseInElement>
                        <EditClass />
                    </div>
                    <div v-if="showMask" class="interactive-mask mask-operation"></div>
                    <div class="operation-container">
                        <Operation />
                    </div>
                </div>
                <Loading />
            </div>
            <Modal />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, reactive, ref, nextTick, computed } from 'vue';

    import { useProvideTool } from './state';
    import { UseMouseInElement } from '@vueuse/components';
    import Header from './components/Header/index.vue';
    import Operation from './components/Operation/index.vue';
    import Tool from './components/Tool/index.vue';
    import EditClass from './components/MainView/EditClass.vue';
    import Loading from 'editor/components/Modal/Loading.vue';
    import Modal from 'editor/components/Modal/index.vue';
    // Modal

    import ModelRun from './components/Modal/ModelRun.vue';
    // import ModalConfirm from './components/Modal/ModalConfirm.vue';

    import Event from 'editor/config/event';
    import { UIType } from 'editor/config/mode';

    // tool provide
    let tool = useProvideTool();
    let editor = tool.editor;
    let state = editor.state;
    let container = ref<HTMLDivElement | null>(null);
    let zoom = ref<HTMLDivElement | null>(null);
    let shapeSize = ref<HTMLDivElement | null>(null);
    let zoomTimerId: any;
    let shiwSizeTimerId: any;
    let sizeData = reactive({
        width: 0,
        height: 0,
        length: 0,
        area: 0,
        type: null,
        isDrawing: false, // The polygon being drawn only shows the length
    });
    function zoomChange(e: any) {
        if (zoomTimerId) {
            clearTimeout(zoomTimerId);
        }
        let ele = zoom.value;
        if (ele) {
            ele.textContent = (e.data * 100).toFixed(0) + '%';
            ele.style.display = 'block';
        }
        zoomTimerId = setTimeout(() => {
            if (ele) ele.style.display = 'none';
        }, 1000);
    }
    function sizeChange(e: any) {
        let { width, height, area, length, type } = e.data;
        // console.log(length);
        sizeData.width = width;
        sizeData.height = height;
        sizeData.length = length || 0;
        sizeData.area = area;
        sizeData.type = type;
        sizeData.isDrawing = editor.toolConfig.isDrawing;
    }

    function sizeChangeBefore(e: any) {
        // console.log(e);
        sizeChange(e);
        let ele = shapeSize.value;
        clearTimeout(shiwSizeTimerId);
        if (ele && state.showSizeTips) {
            ele.style.display = 'block';
        }
    }
    function sizeChangeAfter() {
        shiwSizeTimerId = setTimeout(() => {
            let ele = shapeSize.value;
            if (ele) {
                ele.style.display = 'none';
            }
        }, 300);
    }

    const showMask = computed(() => {
        return state.showMask;
    });
    onMounted(async () => {
        editor.initTool({ container: container.value });
        editor.registerModal('modelRun', ModelRun);
        editor.on(Event.ZOOM_CHANGE, zoomChange);
        editor.on(Event.DIMENSION_CHANGE, sizeChange);
        editor.on(Event.DIMENSION_CHANGE_BEFORE, sizeChangeBefore);
        editor.on(Event.DIMENSION_CHANGE_AFTER, sizeChangeAfter);
    });
</script>

<style lang="less">
    .pc-editor {
        width: 100%;
        height: 100%;
        position: relative;
        background: #3a393e;

        .pc-editor-layout {
            .business-container {
                position: absolute;
                top: 0px;
                left: 0px;
                right: 0px;
                height: 54px;
                background: #1e1f22;
            }

            .content-container-wrap {
                position: absolute;
                top: 54px;
                left: 0px;
                right: 0px;
                bottom: 0px;
                padding: 0px;
            }

            .content-container {
                height: 100%;
                position: relative;
            }

            .tool-container {
                position: absolute;
                top: 0px;
                left: 0px;
                width: 50px;
                bottom: 0px;
                background: #3a3a3e;
            }

            .main-container {
                position: absolute;
                top: 0px;
                left: 50px;
                right: 268px;
                bottom: 0px;
            }

            .operation-container {
                position: absolute;
                top: 0px;
                right: 0px;
                width: 268px;
                bottom: 0px;
                padding: 4px;
            }
            .help-line,
            .help-zoom {
                position: absolute;
                pointer-events: none;
            }
            .help-line {
                left: 0;
                top: 0;
                &.vertical {
                    width: 1px;
                    height: 200vh;
                    border-right: 1px solid #fff;
                }
                &.horizontal {
                    height: 1px;
                    width: 200vw;
                    border-top: 1px solid #fff;
                }
            }
            .help-zoom {
                top: 50%;
                left: 50%;
                border-radius: 10px;
                padding: 6px 10px;
                background-color: rgba(0, 0, 0, 0.4980392156862745);
                color: #fff;
                display: none;
            }
        }
    }
    .help-size {
        position: absolute;
        pointer-events: none;
        background-color: rgba(0, 0, 0, 0.4980392156862745);
        color: #fff;
        display: none;
        border-radius: 4px;
        padding: 2px 4px;
        white-space: nowrap;
        .size-item {
            display: inline-block;
            margin-right: 5px;
        }
    }

    // mask
    .interactive-mask {
        position: absolute;
        z-index: 999;
        background-color: #00000080;
        &.mask-header {
            top: 0px;
            left: 0px;
            right: 0px;
            height: 54px;
        }
        &.mask-tool {
            top: 0px;
            left: 0px;
            width: 50px;
            bottom: 0px;
        }
        &.mask-operation {
            top: 0px;
            right: 0px;
            width: 268px;
            bottom: 0px;
        }
    }
</style>
