<template>
    <div
        @click="onTool('itemClick')"
        :class="{
            item: true,
            active: props.selectMap[props.data.id],
            // invisible: !props.data.visible,
        }"
    >
        <i v-show="props.data.annotateType === '3d'" class="iconfont icon-a-122"></i>
        <i v-show="props.data.annotateType === 'box2d'" class="iconfont icon-gongju"></i>
        <BorderOutlined v-show="props.data.annotateType === 'rect'" />
        <span style="margin-left: 4px">{{ props.data.name }}</span>
        <i
            class="iconfont icon-tixing invisible"
            v-show="props.data.invisible"
            :title="titleInvisible"
        ></i>

        <!-- tool -->
        <DeleteOutlined
            v-show="canEdit()"
            :title="titleDelete"
            class="tool-icon"
            @click.stop="onTool('delete')"
        />
        <EyeOutlined
            class="tool-icon"
            :title="titleHide"
            @click.stop="onTool('toggleVisible')"
            v-show="props.data.visible"
        />
        <EyeInvisibleOutlined
            :title="titleShow"
            class="tool-icon"
            @click.stop="onTool('toggleVisible')"
            v-show="!props.data.visible"
        />
        <i
            class="iconfont icon-pizhu tool-icon"
            v-show="props.data.hasAnnotation"
            :title="titleAnnotation"
        ></i>
        <!-- <AliwangwangOutlined
            v-show="props.data.hasAnnotation"
            :title="titleAnnotation"
            class="tool-icon"
        /> -->
    </div>
</template>

<script setup lang="ts">
    import {
        EyeOutlined,
        EyeInvisibleOutlined,
        DeleteOutlined,
        BorderOutlined,
        AliwangwangOutlined,
        GatewayOutlined,
    } from '@ant-design/icons-vue';
    import { IItem } from './type';
    import { AnnotateType } from 'pc-render';
    import useUI from '../../hook/useUI';
    // import data from '/@/data/camera_config';
    // ***************Props and Emits***************
    let emit = defineEmits(['tool']);
    let props = defineProps<{
        data: IItem;
        // select: string;
        selectMap: Record<string, true>;
        // title
        titleHide: string;
        titleShow: string;
        titleInvisible: string;
        titleDelete: string;
        titleAnnotation: string;
    }>();
    // *********************************************

    let { canEdit, canAnnotate } = useUI();

    function onTool(action: string) {
        emit('tool', action, props.data);
    }
</script>

<style lang="less"></style>
