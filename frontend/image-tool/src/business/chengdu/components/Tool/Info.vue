<template>
    <div class="statistic-info">
        <div class="title1 border-bottom">Info</div>
        <div class="wrap">
            <div class="title2">
                <span style="vertical-align: middle; margin-right: 10px">Data info</span>
                <!-- <div class="divider"></div> -->
            </div>
            <a-row>
                <a-col :span="12" class="title">ID:</a-col>
                <a-col :span="12"> {{ state.dataId }}</a-col>
            </a-row>
            <a-row>
                <a-col :span="12" class="title">Name:</a-col>
                <a-col :span="12">{{ state.dataName }}</a-col>
            </a-row>
            <a-row>
                <a-col :span="12" class="title">Width x Height:</a-col>
                <a-col :span="12">{{ state.imageWidth }} x {{ state.imageHeight }}</a-col>
            </a-row>
            <a-row>
                <a-col :span="12" class="title">Size:</a-col>
                <a-col :span="12"> {{ filesize(state.imageSize) }}</a-col>
            </a-row>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, onBeforeUnmount, reactive } from 'vue';
    import { useInjectEditor } from 'editor/inject';
    import { CloseCircleOutlined } from '@ant-design/icons-vue';
    import filesize from 'filesize';
    // ***************Props and Emits***************
    const emit = defineEmits(['close']);
    // *********************************************

    let editor = useInjectEditor();
    // let pc = editor.pc;
    let state = editor.state;
    const i18n = {};

    function onClose() {
        emit('close');
    }
</script>

<style lang="less" scoped>
    .statistic-info {
        .title {
            text-align: right;
            padding-right: 5px;
        }
    }
</style>
