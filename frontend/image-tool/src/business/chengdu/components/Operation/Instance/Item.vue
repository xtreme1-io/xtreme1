<template>
    <div
        @click="onTool('itemClick', $event)"
        :class="{
            item: true,
            active: props.select.includes(props.data.id),
            invisible: !props.data.visible && !props.data.filterVisible,
        }"
    >
        <div class="item-header">
            <span class="item-header-name">{{ props.data.name }}</span>
            <!-- tool -->
            <div class="item-header-icon">
                <i
                    class="iconfont icon-delete tool-icon"
                    title="Delete"
                    v-if="canEdit()"
                    @click.stop="onTool('delete')"
                />
                <i
                    class="iconfont icon-visible tool-icon"
                    title="Hide"
                    @click.stop="onTool('toggleVisible')"
                    v-if="props.data.visible"
                />
                <i
                    class="iconfont icon-hidden tool-icon"
                    title="Show"
                    v-else
                    @click.stop="onTool('toggleVisible')"
                />
                <EditOutlined
                    title="Edit"
                    v-if="canEdit()"
                    @click.stop="onTool('edit')"
                    class="tool-icon"
                />
                <!-- <AliwangwangOutlined
                    v-show="props.data.annotateType === AnnotateType.ANNOTATE_3D"
                    v-if="canAnnotate()"
                    @click.stop="onTool('annotation')"
                    title="Marks"
                    class="tool-icon"
                /> -->
            </div>
        </div>
        <div class="item-attrs" v-if="isShowAttrs() && props.data.attrs.length">
            <span class="attrs-item" v-for="(item, index) in props.data.attrs" :key="index">
                {{ item.toString() }}
            </span>
        </div>
        <div class="item-attrs" v-if="isShowSize()">
            <template v-if="props?.data?.type === UIType.polyline">
                <span class="size-item"> length: {{ props?.data?.lineLength.toFixed(0) }}px </span>
            </template>
            <template v-else-if="props?.data?.type === UIType.polygon">
                {{ 'area:' + props?.data?.area?.toFixed(0) }}px
            </template>
            <template v-else>
                {{ 'width:' + props?.data?.width?.toFixed(0) }}px
                {{ 'height:' + props?.data?.height?.toFixed(0) }}px
                {{ 'area:' + props?.data?.area?.toFixed(0) }}px
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { EditOutlined } from '@ant-design/icons-vue';
    import { UIType } from '../../../../../editor/config/mode';
    import { IItem } from './type';
    import useUI from '../../../hook/useUI';
    // ***************Props and Emits***************
    let emit = defineEmits(['tool']);
    let props = defineProps<{
        data: IItem;
        select: string[];
    }>();
    // *********************************************

    let { canEdit, canAnnotate, isShowAttrs, isShowSize } = useUI();

    function onTool(action: string, e?: MouseEvent) {
        emit('tool', action, props.data, e);
    }
</script>

<style lang="less" scoped>
    .attrs-item + .attrs-item {
        border-left: 1px solid rgb(0, 157, 255);
    }

    .item {
        font-family: 'Roboto';
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        line-height: 16px;
        color: #bec1ca;

        padding: 0 10px;
        line-height: 36px;
        cursor: pointer;
        &:last-child {
            .item-header {
                border: 0;
            }
        }
        .item-header {
            padding-left: 4px;
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #cccccc4d;

            .item-header-icon {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 54px;
                .tool-icon {
                    font-size: 12px;
                    width: 12px;
                    height: 12px;
                    // margin-left: 6px;
                    // margin-top: 10px;
                    // line-height: 1;
                }
            }
        }
        .item-attrs {
            line-height: 1.4;
            padding: 4px 0;
            // border-top: 1px solid #4a4a4a;
            .attrs-item {
                padding: 0 5px;
            }
        }

        &:hover {
            background: #353841;
            .tool-icon {
                display: block;
                color: white;
                &:hover {
                    color: #ed4014;
                }
            }
        }

        &.invisible {
            .tool-icon {
                display: block;
            }
        }
        &.active {
            background: #353c50;
        }
    }
</style>
