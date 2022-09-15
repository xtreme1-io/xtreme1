<template>
    <div
        class="img-view-max"
        ref="container"
        v-show="state.config.showSingleImgView"
        :style="{ width: `${innerState.width}px`, height: `${innerState.height}px` }"
    >
        <div style="height: 100%" @dblclick="onDBClick">
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
        <div class="label-container" :style="{ transform: innerState.transform }">
            <Labels :data="innerState.labels" v-show="editor.state.config.showLabel" />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, onBeforeUnmount, ref, watch, reactive, computed } from 'vue';
    import { Image2DRenderView, Event, Rect, Box2D, Transform2DAction } from 'pc-render';
    import { useInjectEditor } from '../../state';
    import { useInjectState } from '../../state';
    import * as THREE from 'three';
    import interact from 'interactjs';
    import { IClassType } from 'pc-editor';
    import * as locale from './lang';
    // import config from './config';
    import Labels from '../MainView/Labels.vue';
    import ChangeRefVue from './ChangeRef.vue';
    import {
        ArrowLeftOutlined,
        ArrowRightOutlined,
        CloseCircleOutlined,
    } from '@ant-design/icons-vue';

    import useUI from '../../hook/useUI';
    import useContextMenu from '../../hook/useContextMenu';

    // import * as d3Selection from 'd3-selection';
    // import * as d3Zoom from 'd3-zoom';
    // import * as d3 from 'd3';

    // ***************Props and Emits***************

    // *********************************************
    let { handleContext, clearContext } = useContextMenu();
    let { canOperate } = useUI();
    let dom = ref<HTMLDivElement | null>(null);
    let container = ref<HTMLDivElement | null>(null);
    let editor = useInjectEditor();
    let pc = editor.pc;
    let view = {} as Image2DRenderView;
    let state = useInjectState();
    let $$ = editor.bindLocale(locale);
    let innerState = reactive({
        renderBox: true,
        renderPoints: true,
        width: '100%',
        height: '100%',
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
            view = new Image2DRenderView(dom.value, pc, { name: state.config.singleViewPrefix });
            pc.addRenderView(view);
            view.lineWidth = 2;
            view.toggle(false);
        }

        view.addEventListener(Event.RENDER_AFTER, updateLabel);
        view.addEventListener(Event.CONTAINER_TRANSFORM, updateContainerTransform);
        initResize(container.value as any);
        handleContext(container.value as any);
        // initZoom();
    });

    onBeforeUnmount(() => {
        clearContext();
        view.removeEventListener(Event.RENDER_AFTER, updateLabel);
        view.removeEventListener(Event.CONTAINER_TRANSFORM, updateContainerTransform);
    });

    let classTypeMap = computed(() => {
        let map = {} as Record<string, IClassType>;
        editor.state.classTypes.forEach((e) => {
            map[e.name] = e;
        });
        return map;
    });

    // function initZoom() {
    //     let parent = container.value as HTMLDivElement;
    //     let child = d3.select(dom.value as HTMLDivElement);

    //     const zoom = d3.zoom<HTMLDivElement, any>().on('zoom', (e) => {
    //         console.log(e.transform);
    //         let { k, x, y } = e.transform;
    //         child.style('transform', `translate(${x}px,${y}px) scale(${k})`);
    //         // g.style('stroke-width', 3 / Math.sqrt(transform.k));
    //         // points.attr('r', 3 / Math.sqrt(transform.k));
    //     });

    //     d3.select(parent).call(zoom).call(zoom.transform, d3.zoomIdentity);
    // }

    function initResize(dom: HTMLDivElement) {
        interact(dom).resizable({
            // resize from all edges and corners
            edges: { left: false, right: true, bottom: true, top: false },

            listeners: {
                move(event) {
                    const { width, height } = event.rect;
                    innerState.width = width;
                    innerState.height = height;
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

    function updateContainerTransform() {
        let m = view.containerMatrix.elements;
        innerState.transform = `matrix(${m[0]},${m[1]},${m[4]},${m[5]},${m[12]},${m[13]})`;
    }

    let updateLabel = () => {
        if (!editor.state.config.showLabel) return;

        updateContainerTransform();

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
            if (!e.visible || !view.renderBox) return;
            let userData = e.userData;
            let trackName = userData.trackName || '';
            let classType = userData.classType || '';
            let classConfig = classTypeMap.value[classType];
            let className = classConfig ? classConfig.label || classConfig.name || '' : classType;

            pos.set(0, 0, 0);
            pos.applyMatrix4(e.matrixWorld);
            pos.applyMatrix4(matrix);
            pos.x = ((pos.x + 1) / 2) * view.width;
            pos.y = (-(pos.y - 1) / 2) * view.height;
            // pos.z = 0;
            if (Math.abs(pos.z) > 1) return;

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
            if (view.isRenderable(object)) {
                if (object instanceof Rect) {
                    tempPos.copy(object.center);
                } else if (object instanceof Box2D) {
                    object.getCenter(tempPos);
                }

                let userData = object.userData;
                let classType = userData.classType || '';
                // let subId = (userData.id + '').slice(-4);
                let trackName = userData.trackName || '';
                let classConfig = classTypeMap.value[classType];
                let className = classConfig
                    ? classConfig.label || classConfig.name || ''
                    : classType;

                // tempPos.y = tempPos.y - object.size.y;
                tempPos.x = (tempPos.x / view.imgSize.x) * view.width;
                tempPos.y = (tempPos.y / view.imgSize.y) * view.height;
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

        .render {
            height: 100%;
            // transform: scale(0.8);
            // transform-origin: center;
            transform-origin: 0 0;
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
