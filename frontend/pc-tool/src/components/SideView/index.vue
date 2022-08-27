<template>
    <div class="side-view-wrap">
        <View axis="z" />
        <View axis="-y" />
        <View axis="-x" />
    </div>
</template>

<script setup lang="ts">
    import View from './view.vue';
</script>

<style lang="less">
    .side-view-wrap {
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: 0px 6px;
        background: black;

        .side-view {
            border-bottom: 1px solid #2a2a2a;
            &:last-child {
                border-bottom: none;
            }
        }
    }
</style>
