<template>
    <div class="view-2d">
        <Image2D v-for="(item, index) in state.imgViews" :key="index" :img-index="index" />
    </div>
</template>

<script setup lang="ts">
    import { onMounted, ref, watch, reactive } from 'vue';
    import Image2D from './Image2D.vue';
    import { useInjectState } from '../../state';

    // ***************Props and Emits***************

    // *********************************************
    let state = useInjectState();
</script>

<style lang="less">
    .view-2d {
        position: relative;
        // display: flex;
        // flex-direction: column;
        // justify-content: space-evenly;
        // padding-top: 20px;
        overflow-y: auto;
        height: 100%;
        background: #1e1f23;
    }
</style>
