<template>
    <div class="layout-main-container">
        <div
            ref="imgContainer"
            v-show="!state.config.showSingleImgView && editor.state.imgViews.length > 0"
            :style="{
                width: `${imgViewWidth}px`,
                right: 0,
            }"
            class="img-view-container"
        >
            <div v-show="state.config.showImgView" style="width: 100%; height: 100%">
                <slot name="img-view"></slot>
            </div>
            <div class="handle-line-img"></div>
            <div @click="toggleImgView" class="visible-handle img">
                <LeftOutlined v-if="state.config.showImgView" />
                <RightOutlined v-else />
            </div>
        </div>
        <div
            class="main-view-container"
            :style="{ left: `${mainViewLeft}px`, right: `${mainViewRight}px` }"
        >
            <div style="position: relative; width: 100%; height: 100%">
                <slot name="main-view"></slot>
            </div>
        </div>
        <div
            class="side-view-container"
            ref="sideContainer"
            :style="{
                width: `${sideViewWidth}px`,
                right: 0,
            }"
        >
            <div v-show="state.config.showSideView" style="width: 100%; height: 100%">
                <slot name="side-view"></slot>
            </div>
            <div class="handle-line-side"></div>
            <div @click="toggleSideView" class="visible-handle side">
                <RightOutlined v-if="state.config.showSideView" />
                <LeftOutlined v-else />
            </div>
            <!-- <slot name="side-view"></slot> -->
        </div>
        <Modal />
    </div>
</template>

<script setup lang="ts">
    // import { PointCloud } from '../lib';
    import { reactive, computed, ref, watch, onMounted, nextTick } from 'vue';
    import { useInjectState } from '../../state';
    import { useInjectEditor } from '../../state';
    import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue';
    import interact from 'interactjs';
    import { RenderView, SideRenderView, Image2DRenderView, MainRenderView } from 'pc-render';
    import * as _ from 'lodash';
    import Modal from '../Modal/index.vue';

    let state = useInjectState();
    let editor = useInjectEditor();
    // let toolWidth = 50;
    let info = reactive({
        imgViewWidth: 230,
        sideViewWidth: 220,
        showBottomView: true,
        // operationWidth: 270,
    });
    //** useless now */
    function toggleSideView() {
        state.config.showSideView = !state.config.showSideView;
        if (info.sideViewWidth < 100) {
            info.sideViewWidth = 220;
        }
    }
    function toggleImgView() {
        state.config.showImgView = !state.config.showImgView;
        if (info.imgViewWidth < 100) {
            info.imgViewWidth = 230;
        }
    }

    onMounted(() => {
        initResize();
    });

    watch(
        () => [
            state.config.showImgView,
            state.config.showOperationView,
            state.config.showSideView,
            state.config.showSingleImgView,
        ],
        () => {
            nextTick(() => {
                render();
            });
        },
    );
    const sideContainer = ref<HTMLElement | null>(null);
    const imgContainer = ref<HTMLElement | null>(null);
    // let imgViewRight = toolWidth + info.imgViewWidth;
    // let operationRight = 0;
    let sideViewWidth = computed(() => {
        let value = 0;
        if (state.config.showSideView) value += info.sideViewWidth;
        return value;
    });
    let imgViewWidth = computed(() => {
        let value = 0;
        if (state.config.showImgView) value += info.imgViewWidth;
        return value;
    });
    let mainViewRight = computed(() => {
        let value = 0;
        // if (state.config.showOperationView) value += info.operationWidth;
        if (state.config.showSideView) value += info.sideViewWidth;
        return value;
    });

    let mainViewLeft = computed(() => {
        let value = 0;
        if (state.config.showImgView) value += info.imgViewWidth;
        return value;
    });

    const render = _.throttle(() => {
        editor.pc.renderViews.forEach((view: RenderView) => {
            if (view instanceof SideRenderView) {
                view.updateSize();
                view.fitObject();
            }
        });
        editor.pc.render();
    }, 30);
    function initResize() {
        if (sideContainer.value) {
            const container = sideContainer.value as HTMLElement;
            interact(container).resizable({
                edges: { left: true },
                listeners: {
                    move(event) {
                        const { width } = event.rect;
                        info.sideViewWidth = width < 100 ? 0 : width;
                        state.config.showSideView = info.sideViewWidth > 100;
                        render();
                    },
                },
                modifiers: [
                    // keep the edges inside the parent
                    interact.modifiers.restrictEdges({
                        outer: 'parent',
                    }),
                    // minimum size
                    interact.modifiers.restrictSize({
                        min: { width: 99, height: 200 },
                        max: { width: 600, height: 200 },
                    }),
                ],

                inertia: false,
            });
        }
        if (imgContainer.value) {
            const container = imgContainer.value as HTMLElement;
            interact(container).resizable({
                edges: { right: true },
                listeners: {
                    move(event) {
                        const { width } = event.rect;
                        info.imgViewWidth = width < 100 ? 0 : width;
                        state.config.showImgView = info.imgViewWidth > 100;
                        render();
                    },
                },
                modifiers: [
                    // keep the edges inside the parent
                    interact.modifiers.restrictEdges({
                        outer: 'parent',
                    }),

                    // minimum size
                    interact.modifiers.restrictSize({
                        min: { width: 99, height: 200 },
                        max: { width: 500, height: 200 },
                    }),
                ],

                inertia: false,
            });
        }
    }
</script>

<style lang="less">
    .layout-main-container {
        width: 100%;
        height: 100%;
        position: relative;
        user-select: none;
        padding: 6px 0px;
        .img-view-container {
            position: absolute;
            top: 0px;
            left: 0px;
            width: 230px;
            bottom: 0px;
            z-index: 1;
            // padding-right: 3px;
            border-right: 3px solid transparent;
        }

        .side-view-container {
            position: absolute;
            top: 0px;
            right: 0px;
            width: 220px;
            bottom: 0px;
            // padding-left: 3px;
            border-left: 3px solid transparent;
        }
        .check-view-container {
            position: absolute;
            top: 0px;
            right: 220px;
            left: 0px;
            bottom: 0px;
            z-index: 100;
        }
        .main-view-container {
            position: absolute;
            top: 0px;
            right: 220px;
            left: 230px;
            bottom: 0px;
            background-color: black;
        }
        .handle-line-img {
            width: 10px;
            height: 100%;
            position: absolute;
            right: -10px;
            top: 0;
            border-left-width: 3px;
            border-left-style: solid;
            border-left-color: transparent;
            &:hover {
                border-left-color: #2e8cf0;
            }
        }
        .handle-line-side {
            width: 10px;
            height: 100%;
            position: absolute;
            left: -10px;
            top: 0;
            border-right-width: 3px;
            border-right-style: solid;
            border-right-color: transparent;
            &:hover {
                border-right-color: #2e8cf0;
            }
        }
        .visible-handle {
            position: absolute;
            background: #3a393e;
            padding: 10px 0;
            text-align: center;
            width: 18px;
            z-index: 1;
            cursor: auto;
            line-height: 24px;
            color: #aaaaaa;

            &:hover {
                background: #2b2a2e;
            }

            &.img {
                right: 0;
                top: 50%;
                transform: translate(100%, -50%);
                border-bottom-right-radius: 10px;
                border-top-right-radius: 10px;
            }

            &.bottom {
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                border-top-left-radius: 10px;
                border-top-right-radius: 10px;
            }

            &.side {
                left: 0;
                top: 50%;
                transform: translate(-100%, -50%);
                border-bottom-left-radius: 10px;
                border-top-left-radius: 10px;
            }
        }
    }
</style>
