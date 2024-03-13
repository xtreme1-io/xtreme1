<template>
    <div
        class="img-view-max"
        ref="container"
        v-show="state.config.showSingleImgView"
        :style="{
            width: `${state.config.maxViewWidth}px`,
            height: `${state.config.maxViewHeight}px`,
        }"
    >
        <div style="height: 100%; position: relative" @dblclick="onDBClick">
            <!-- <div class="render-proxy" ref="proxy"></div> -->
            <div class="render" ref="dom"></div>
        </div>
        <ChangeRefVue v-show="canOperate()" />
        <div class="info" v-show="canOperate()">
            <span
                :class="state.config.singleImgViewIndex <= 0 ? 'icon disable' : 'icon'"
                @click="state.config.singleImgViewIndex <= 0 ? null : offsetImgIndex(-1)"
                style="margin-right: 6px"
                ><ArrowLeftOutlined
            /></span>
            <span class="name"
                ><span class="file-name limit" :title="getFileName()">{{ getFileName() }}</span> -
                {{ state.config.singleImgViewIndex }}</span
            >
            <span
                :class="
                    state.config.singleImgViewIndex >= state.imgViews.length - 1
                        ? 'icon disable'
                        : 'icon'
                "
                @click="
                    state.config.singleImgViewIndex >= state.imgViews.length - 1
                        ? null
                        : offsetImgIndex(1)
                "
                style="margin-left: 6px"
                ><ArrowRightOutlined
            /></span>
        </div>
        <div class="tool" v-show="canOperate()">
            <span class="icon" :title="$$('close')" @click="onBack"><CloseCircleOutlined /></span>
        </div>
        <div class="label-container">
            <Labels :data="innerState.labels" v-show="editor.state.config.showLabel" />
        </div>
        <slot name="annotation-2d" :data="innerState.annotations"></slot>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, onBeforeUnmount, ref, watch, reactive, computed } from 'vue';
    import { Image2DRenderView, Event, Rect, Box2D, Transform2DAction, utils } from 'pc-render';
    import { useInjectState, useInjectEditor } from '../../state';
    import * as THREE from 'three';
    import interact from 'interactjs';
    import { IClassType, Event as EditorEvent } from 'pc-editor';
    import * as locale from './lang';
    import * as _ from 'lodash';
    import Labels from '../MainView/Labels.vue';
    import ChangeRefVue from './ChangeRef.vue';
    import {
        ArrowLeftOutlined,
        ArrowRightOutlined,
        CloseCircleOutlined,
    } from '@ant-design/icons-vue';
    import useUI from '../../hook/useUI';
    import useContextMenu from '../../hook/useContextMenu';

    // ***************Props and Emits***************

    // *********************************************
    let { handleContext, clearContext } = useContextMenu();
    let { canOperate } = useUI();
    let dom = ref<HTMLDivElement | null>(null);
    let proxy = ref<HTMLDivElement | null>(null);
    let container = ref<HTMLDivElement | null>(null);
    let editor = useInjectEditor();
    let pc = editor.pc;
    let view = {} as Image2DRenderView;
    let state = useInjectState();
    let $$ = editor.bindLocale(locale);
    let innerState = reactive({
        renderBox: true,
        renderPoints: true,
        annotations: [] as any[],
        // width: '100%',
        // height: '100%',
        labels: [] as any[],
        transform: 'matrix(1, 0, 0, 1, 0, 0)',
    });

    watch(
        () => [state.config.showSingleImgView, state.config.singleImgViewIndex],
        () => {
            if (state.config.showSingleImgView) {
                // console.log(state.image2DMax.enable, state.image2DMax.index);
                update();
            }
        },
    );

    onMounted(() => {
        if (dom.value) {
            view = new Image2DRenderView(dom.value, pc, {
                name: state.config.singleViewPrefix,
                actions: ['select', 'render-2d-shape', 'create-obj', 'edit-2d', 'transform-2d', 'render-2d-track'],
            });
            pc.addRenderView(view);
            // view.lineWidth = 2;
            view.toggle(false);
            // proxy.value.appendChild(view.proxy.canvas);
            // proxy.value.appendChild(view.proxy.renderer.domElement);
        }

        view.addEventListener(Event.RENDER_AFTER, onRender);
        // view.addEventListener(Event.CONTAINER_TRANSFORM, updateContainerTransform);
        initResize(container.value as any);
        handleContext(container.value as any);
        // initZoom();
    });

    onBeforeUnmount(() => {
        clearContext();
        view.removeEventListener(Event.RENDER_AFTER, onRender);
        // view.removeEventListener(Event.CONTAINER_TRANSFORM, updateContainerTransform);
    });
    function onRender() {
        updateLabel();
    }
    let classTypeMap = computed(() => {
        let map = {} as Record<string, IClassType>;
        editor.state.classTypes.forEach((e) => {
            map[e.name] = e;
        });
        return map;
    });

    let updateSize = _.throttle(() => {
        let config = editor.state.config;
        if (!container.value || config.maxViewWidth === '100%' || config.maxViewHeight === '100%')
            return;

        let parent = container.value.parentElement as HTMLElement;
        let bbox = parent.getBoundingClientRect();
        if ((config.maxViewHeight as any) > bbox.height) config.maxViewHeight = bbox.height as any;
        if ((config.maxViewWidth as any) > bbox.width) config.maxViewWidth = bbox.width as any;
        editor.pc.render();
    }, 100);

    editor.addEventListener(EditorEvent.RESIZE, updateSize);

    function initResize(dom: HTMLDivElement) {
        interact(dom).resizable({
            // resize from all edges and corners
            edges: { left: false, right: true, bottom: true, top: false },
            margin: 10,
            listeners: {
                move(event) {
                    event.stopPropagation();
                    let config = editor.state.config;
                    const { width, height } = event.rect;
                    config.maxViewWidth = width;
                    config.maxViewHeight = height;
                    view.render();
                },
            },
            modifiers: [
                // keep the edges inside the parent
                interact.modifiers.restrictEdges({
                    outer: 'parent',
                }),

                // minimum size
                interact.modifiers.restrictSize({
                    min: { width: 200, height: 200 },
                }),
            ],

            inertia: true,
        });
    }

    let updateLabel = () => {
        if (!editor.state.config.showLabel) return;

        let camera = view.camera;
        let matrix = new THREE.Matrix4();
        matrix.copy(camera.projectionMatrix);
        matrix.multiply(camera.matrixWorldInverse);

        let objects = view.get3DObject();
        // @ts-ignore
        let list = [] as any[];
        let pos = new THREE.Vector3();
        // let pos1 = new THREE.Vector3();
        objects.forEach((e) => {
            if (!e.visible || !view.renderBox || !utils.isBoxInImage(e, view)) return;
            let userData = e.userData;
            let trackName = userData.trackName || '';
            let classType = userData.classType || '';
            let classConfig = editor.getClassType(userData.classId || classType);
            let className = classConfig ? classConfig.label || classConfig.name || '' : classType;

            pos.copy(e.position);
            view.worldToImg(pos);
            if (Math.abs(pos.z) > 1) return;

            view.imgToDom(pos);
            // let subId = (userData.id + '').slice(-4);
            let obj = {
                name: classType ? `${className}-${trackName}` : `${trackName}`,
                x: pos.x,
                y: pos.y,
                scale: 1,
            };
            list.push(obj);
        });

        let object2d = view.get2DObject();

        let tempPos = new THREE.Vector2();
        object2d.forEach((object) => {
            if (view.isRenderable(object) && object.viewId === view.renderId) {
                if (object instanceof Rect) {
                    tempPos.copy(object.center);
                } else if (object instanceof Box2D) {
                    object.getCenter(tempPos);
                }
                let userData = object.userData;
                let classType = userData.classType || '';
                // let subId = (userData.id + '').slice(-4);
                let trackName = userData.trackName || '';
                let classConfig = editor.getClassType(userData);
                let className = classConfig
                    ? classConfig.label || classConfig.name || ''
                    : classType;

                view.imgToDom(tempPos);
                let obj = {
                    name: classType ? `${className}-${trackName}` : `${trackName}`,
                    x: tempPos.x,
                    y: tempPos.y,
                    scale: 1,
                };
                list.push(obj);
            }
        });

        innerState.labels = list;
    };

    function update() {
        // let info = get2DInfo(state.singleImgView.imgIndex);
        view.renderBox = state.config.projectMap3d && state.config.renderProjectBox;
        view.setOptions(state.imgViews[state.config.singleImgViewIndex]);
        view.renderId = `${state.config.imgViewPrefix}-${state.config.singleImgViewIndex}`;
    }

    function getFileName() {
        let config = state.imgViews[state.config.singleImgViewIndex];
        return config ? config.name : '';
    }

    function onBack() {
        editor.viewManager.showImgView();
    }

    function onDBClick() {
        let action = view.getAction('transform-2d') as Transform2DAction;
        if (action) action.reset();
    }

    function offsetImgIndex(offset: 1 | -1) {
        state.config.singleImgViewIndex += offset;
    }
</script>

<style lang="less">
    .img-view-max {
        // height: 100%;
        height: 100%;
        padding: 1px;
        position: absolute;
        font-size: 14px;
        color: white;
        background: black;
        overflow: hidden;
        top: 0px;
        left: 0px;
        bottom: 0px;
        right: 0px;
        border: 1px solid #3a393e;
        // height: 400px;
        .create-obj {
            z-index: 1;
        }

        .change-ref,
        .info,
        .tool {
            z-index: 1;
        }

        .render-proxy {
            height: 100%;
            width: 100%;
        }
        .render {
            position: absolute;
            inset: 0;
            // height: 100%;
            // transform: scale(0.8);
            // transform-origin: center;
            // transform-origin: 0 0;
        }

        .back {
            left: 6px;
            top: 6px;
            background: #333333;
            padding: 0px 6px;
            position: absolute;
            cursor: pointer;
            line-height: 28px;
            height: 28px;
            border-radius: 4px;
        }

        .change-ref {
            font-size: 12px;
            position: absolute;
            left: 6px;
            top: 6px;
            background: #333333;
            line-height: 28px;
            height: 28px;
            padding: 0px 6px;
            border-radius: 4px;
            .iconfont {
                font-size: 12px;
            }
        }

        .tool {
            position: absolute;
            right: 6px;
            top: 6px;
            .icon {
                width: 28px;
                text-align: center;
                font-size: 20px;
                margin-left: 6px;
                padding: initial;

                &.active {
                    color: #40a9ff;
                }
            }
        }

        .icon,
        .name {
            vertical-align: middle;
            display: inline-block;
            background: #333333;
            line-height: 28px;
            height: 28px;
            padding: 0px 6px;
            border-radius: 4px;
            cursor: pointer;
        }

        .icon.disable {
            cursor: not-allowed;
            color: #747474;
        }

        .info {
            position: absolute;
            width: 240px;
            left: 50%;
            top: 6px;
            margin-left: -120px;
            user-select: none;

            .name {
                cursor: default;
                width: 110px;
                text-align: center;
            }
        }

        .label-container {
            position: absolute;
            left: 0px;
            top: 0px;
        }

        .file-name {
            display: inline-block;
            max-width: 60px;
            vertical-align: top;
        }
    }
</style>
