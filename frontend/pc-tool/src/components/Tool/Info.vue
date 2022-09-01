<template>
    <div class="statistic-info">
        <div class="title1 border-bottom">{{ $$('info_title') }}</div>
        <div class="wrap">
            <div class="title2">
                <span style="vertical-align: middle; margin-right: 10px">{{
                    $$('info_datainfo')
                }}</span>
                <!-- <div class="divider"></div> -->
            </div>
            <a-row>
                <a-col :span="2">X:</a-col>
                <a-col :span="10">Min {{ format(config.pointInfo.min.x) }}</a-col>
                <a-col :span="10">Max {{ format(config.pointInfo.max.x) }}</a-col>
            </a-row>
            <a-row>
                <a-col :span="2">Y:</a-col>
                <a-col :span="10">Min {{ format(config.pointInfo.min.y) }}</a-col>
                <a-col :span="10">Max {{ format(config.pointInfo.max.y) }}</a-col>
            </a-row>
            <a-row>
                <a-col :span="2">Z:</a-col>
                <a-col :span="10">Min {{ format(config.pointInfo.min.z) }}</a-col>
                <a-col :span="10">Max {{ format(config.pointInfo.max.z) }}</a-col>
            </a-row>
            <div class="title2">
                <span style="vertical-align: middle; margin-right: 10px">{{
                    $$('info_pointinfo')
                }}</span>
                <!-- <div class="divider"></div> -->
            </div>
            <a-row>
                <a-col :span="12">{{ $$('info_pointall') }}： {{ config.pointInfo.count }}</a-col>
                <a-col :span="12"
                    >{{ $$('info_pointvisible') }}： {{ config.pointInfo.vCount }}</a-col
                >
            </a-row>
        </div>
        <!-- <CloseCircleOutlined @click="onClose" class="close" /> -->
    </div>
</template>

<script setup lang="ts">
    import { useInjectEditor } from '../../state';
    import * as _ from 'lodash';
    import { formatNumber as format } from '../../utils';
    // import { useSingleInfo } from './useInfo';

    import * as locale from './lang';

    // ***************Props and Emits***************
    const emit = defineEmits(['close']);

    // *********************************************

    let editor = useInjectEditor();
    let $$ = editor.bindLocale(locale);
    let pc = editor.pc;
    let config = editor.state.config;

    function onClose() {
        emit('close');
    }
</script>

<style lang="less" scoped>
    .statistic-info {
    }
</style>
