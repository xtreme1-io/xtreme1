<template>
    <div class="view-2d">
        <div class="view-2d-proxy" ref="proxy"> </div>
        <div class="view-2d-wrap" ref="wrap">
            <Image2D v-for="(item, index) in state.imgViews" :key="index" :img-index="index" />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, ref, computed, reactive } from 'vue';
    import { Image2DRenderProxy } from 'pc-render';
    import Image2D from './Image2D.vue';
    import { useInjectEditor } from '../../state';
    import { useProvideProxy } from './useProxy';
    // ***************Props and Emits***************

    // *********************************************
    let proxy = ref<HTMLDivElement | null>(null);
    let wrap = ref<HTMLDivElement | null>(null);
    let editor = useInjectEditor();
    let state = editor.state;

    let renderProxy = new Image2DRenderProxy(editor.pc);
    // @ts-ignore
    window.renderProxy = renderProxy;
    useProvideProxy(renderProxy);

    // let containerHeight = computed(() => {
    //     return (
    //         Math.round(
    //             (state.config.view2DWidth / state.config.aspectRatio) * state.imgViews.length,
    //         ) + 2
    //     );
    // });
    onMounted(() => {
        if (proxy.value && wrap.value) {
            renderProxy.attach(proxy.value);
            wrap.value.addEventListener('scroll', () => {
                renderProxy.render();
            });
        }
    });
</script>

<style lang="less">
    .view-2d {
        position: relative;
        // overflow-y: auto;
        height: 100%;
        background: #1e1f23;

        .view-2d-proxy {
            height: 100%;
        }

        .view-2d-wrap {
            position: absolute;
            overflow-y: auto;
            inset: 0;
        }
    }
</style>
