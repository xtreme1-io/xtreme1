<template>
    <div
        class="img-view"
        @dblclick="onDBClick"
        :style="{
            borderColor: state.config.imgRegionIndex === props.imgIndex ? '#1890ff' : '#2e2525',
        }"
    >
        <div class="render" ref="dom"></div>
        <div class="tool">
            <span
                :class="state.config.imgRegionIndex === props.imgIndex ? 'icon active' : 'icon'"
                :title="$$('show-camera')"
                @dblclick.stop="null"
                @click.stop="showView"
                ><EyeOutlined />
            </span>
            <!-- <span class="icon" title="full screen" @click="onTool('full')"
                ><FullscreenOutlined
            /></span> -->
        </div>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, ref, onBeforeMount } from 'vue';
    import * as THREE from 'three';
    import { Image2DRenderView, PointsMaterial, Rect } from 'pc-render';
    import { useInjectEditor } from '../../state';
    import { useInjectState } from '../../state';
    import * as locale from './lang';

    import useUI from '../../hook/useUI';
    import useContextMenu from '../../hook/useContextMenu';
    import { FullscreenOutlined, EyeOutlined } from '@ant-design/icons-vue';

    // ***************Props and Emits***************
    interface ImgViewProps {
        imgIndex: number;
    }

    const props = withDefaults(defineProps<ImgViewProps>(), {
        imgIndex: 0,
    });

    // *********************************************

    let dom = ref<HTMLDivElement | null>(null);
    let editor = useInjectEditor();
    let pc = editor.pc;
    let view = {} as Image2DRenderView;
    let state = useInjectState();
    let $$ = editor.bindLocale(locale);
    let { canOperate } = useUI();
    let { handleContext, clearContext } = useContextMenu();

    onMounted(() => {
        // console.log('img view onMounted');
        if (dom.value) {
            let config = state.config;
            view = new Image2DRenderView(dom.value, pc, {
                name: `${config.imgViewPrefix}-${props.imgIndex}`,
                actions: ['render-2d-shape'],
            });
            view.renderBox = state.config.projectMap3d;
            view.renderRect = state.config.projectPoint4;
            view.renderBox2D = state.config.projectPoint8;

            view.id = `${config.imgViewPrefix}-${props.imgIndex}`;
            pc.addRenderView(view);

            // let info = get2DInfo(props.imgIndex);
            view.setOptions(state.imgViews[props.imgIndex]);
            view.renderPoints = false;

            // view.onImageLoad = function () {
            //     let config = state.imgViews[props.imgIndex];
            //     let { imgSize } = config;
            //     let { naturalWidth, naturalHeight } = view.img;

            //     if (!imgSize || imgSize[0] !== naturalWidth || imgSize[1] !== naturalHeight) {
            //         config.imgSize = [naturalWidth, naturalHeight];
            //         view.setOptions(config);
            //     }
            // };

            handleContext(dom.value);
        }
    });

    onBeforeMount(() => {
        clearContext();
    });

    function showView(e: MouseEvent) {
        let points = pc.groupPoints.children[0] as THREE.Points;
        let material = points.material as PointsMaterial;
        if (state.config.imgRegionIndex === props.imgIndex) {
            state.config.imgRegionIndex = -1;
            material.setUniforms({
                hasCameraRegion: -1,
            });
        } else {
            state.config.imgRegionIndex = props.imgIndex;
            let matrix = new THREE.Matrix4()
                .copy(view.camera.projectionMatrix)
                .multiply(view.camera.matrixWorldInverse);
            material.setUniforms({
                hasCameraRegion: 1,
                regionMatrix: matrix,
            });
        }
        pc.render();
    }

    function onDBClick() {
        if (!canOperate()) return;
        editor.viewManager.showSingleImgView(props.imgIndex);
    }

    function rand(start: number, end: number) {
        return Math.round(start + (end - start) * Math.random());
    }
</script>

<style lang="less" scoped>
    .img-view {
        // height: 100%;
        position: relative;
        color: white;
        // padding: 3px;
        background: #2e2525;
        border: 2px solid #2e2525;
        width: 100%;
        min-height: 100px;
        aspect-ratio: 1.8;

        .render {
            height: 100%;
        }

        .icon {
            vertical-align: middle;
            display: inline-block;
            background: #333333;
            line-height: 24px;
            height: 24px;
            padding: 0px 6px;
            border-radius: 4px;
            cursor: pointer;

            &.active {
                color: #40a9ff;
            }
        }

        .tool {
            position: absolute;
            right: 6px;
            top: 6px;
            .icon {
                width: 28px;
                text-align: center;
                font-size: 16px;
                margin-left: 6px;
                padding: initial;
            }
        }
    }
</style>
