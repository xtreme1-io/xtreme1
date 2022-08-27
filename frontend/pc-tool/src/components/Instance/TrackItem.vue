<template>
    <div
        :class="track === data.id ? ' instance-track-item active ' : 'instance-track-item'"
        @click="onTrackClick"
    >
        <a-collapse :bordered="false" v-model:activeKey="data.active" :openAnimation="animation">
            <a-collapse-panel :key="data.key" :show-arrow="!data.invisible">
                <template #header>
                    <span class="track-title">
                        <span class="track-name" @click.stop="onTrackTool('select')">{{
                            data.name
                        }}</span>
                        <i
                            class="iconfont icon-tixing invisible"
                            v-show="data.invisible"
                            :title="titleInvisible"
                        ></i>
                    </span>
                </template>
                <template #extra>
                    <div class="extra-tool" style="padding-right: 4px">
                        <EditOutlined
                            :title="titleEdit"
                            v-if="data.isTrackItem && canEdit()"
                            @click.stop="onTrackTool('edit')"
                        />
                        <EyeOutlined
                            class="tool-icon"
                            :title="titleHide"
                            @click.stop="onTrackTool('toggleVisible')"
                            v-if="data.visible"
                        />
                        <EyeInvisibleOutlined
                            :title="titleShow"
                            class="tool-icon"
                            @click.stop="onTrackTool('toggleVisible')"
                            v-else
                        />
                        <DeleteOutlined
                            :title="titleDelete"
                            v-if="canEdit()"
                            @click.stop="onTrackTool('delete')"
                        />
                    </div>
                </template>
                <template v-if="!data.invisible">
                    <Item
                        v-for="subItem in data.data"
                        :data="subItem"
                        :select-map="selectMap"
                        @tool="onItemTool"
                        :title-delete="titleDelete"
                        :title-hide="titleHide"
                        :title-show="titleShow"
                        :title-annotation="titleAnnotation"
                        :title-invisible="titleInvisible"
                    />
                </template>

                <div v-show="data.attrLabel && editor.state.config.showAttr">
                    <div class="props">{{ data.attrLabel }}</div>
                </div>
            </a-collapse-panel>
        </a-collapse>
    </div>
</template>

<script setup lang="ts">
    import {
        EyeOutlined,
        EyeInvisibleOutlined,
        DeleteOutlined,
        WarningOutlined,
        AliwangwangOutlined,
        EditOutlined,
        CodepenOutlined,
        GatewayOutlined,
    } from '@ant-design/icons-vue';
    import { IItem, IState } from './type';
    import { useInjectEditor } from '../../state';
    import { animation } from './useInstance';
    import useUI from '../../hook/useUI';
    import Item from './Item.vue';

    // ***************Props and Emits***************
    let emit = defineEmits(['item-tool', 'track-tool']);
    let props = defineProps<{
        state: IState;
        data: IItem;
        // select: string;
        selectMap: Record<string, true>;
        track: string;
        // title
        titleHide: string;
        titleShow: string;
        titleEdit: string;
        titleDelete: string;
        titleAnnotation: string;
        titleInvisible: string;
    }>();
    // *********************************************

    let { canEdit, canAnnotate } = useUI();
    let editor = useInjectEditor();

    function onTrackClick(e: MouseEvent) {
        if (props.data.invisible && props.track !== props.data.id) {
            // e.stopPropagation();
            emit('track-tool', 'select', props.data);
        }
        // console.log('onTrackClick', e);
    }

    function onTrackTool(action: string) {
        emit('track-tool', action, props.data);
    }
    function onItemTool(...args: any[]) {
        emit('item-tool', ...args);
    }
</script>

<style lang="less">
    .instance-track-item {
        padding: 2px;
        padding-left: 20px;
        background: #2a2a2c;
        border: 1px solid transparent;
        // background: #1e1f23;

        &.active {
            // background: #1e1f23;
            border-color: #177ddc;
        }

        .track-name {
            display: inline-block;
            padding: 0px 2px;
            // min-width: 100px;
        }

        .track-title {
            font-size: 14px;
            color: white;
        }

        .ant-collapse-header {
            padding-left: 35px !important;
        }

        .props {
            line-height: 16px;
            padding: 4px 10px;
            background: rgb(69 73 88 / 62%);
            margin: 4px 0px;
            color: #bec1ca;
            display: inline-block;
            font-size: 14px;
            border-radius: 4px;
            word-wrap: break-word;
        }
    }
</style>
