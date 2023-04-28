<template>
    <div class="main-container">
        <div class="layout-wrap">
            <Layout>
                <template #main-view>
                    <MainView>
                        <template #editClass><EditClass /></template>
                    </MainView>
                </template>
                <template #img-view><ImgView /></template>
                <template #side-view><SideView /></template>
            </Layout>
        </div>
    </div>
</template>

<script setup lang="ts">
    import Layout from '../Layout/index.vue';
    import MainView from '../MainView/index.vue';
    import ImgView from '../ImgView/index.vue';
    import SideView from '../SideView/index.vue';
    import EditClass from '../EditClass/bs/main.vue';
</script>

<style lang="less">
    .main-container {
        display: flex;
        flex-direction: column;

        .layout-wrap {
            flex: 1;
            position: relative;
        }
    }
</style>
