<template>
    <div ref="domRef" class="instance-wrap">
        <!-- classify -->
        <a-collapse
            class="operation-collapse"
            v-for="classify in state.list"
            :activeKey="classify.key"
            :bordered="false"
            :openAnimation="animation"
        >
            <a-collapse-panel :showArrow="false" :key="classify.key">
                <template #header>
                    <Header @toggle-attr="onToggleAttr" :data="classify" />
                </template>
                <div class="operation-instance">
                    <div style="height: 100%; overflow-y: auto">
                        <!-- class  -->
                        <a-collapse
                            :openAnimation="animation"
                            v-model:activeKey="classify.activeClass"
                            :bordered="false"
                        >
                            <template #expandIcon="{ isActive }">
                                <CaretRightOutlined :rotate="isActive ? 90 : 0" />
                            </template>
                            <a-collapse-panel v-for="item in classify.data" :key="item.key">
                                <div class="list">
                                    <!-- track -->
                                    <TrackItem
                                        v-for="subItem in item.data"
                                        @item-tool="onItemTool"
                                        @track-tool="onTrackTool"
                                        :data="subItem"
                                        :state="state"
                                        :select-map="state.selectMap"
                                        :track="state.trackId"
                                        :title-edit="$$('title-edit')"
                                        :title-delete="$$('title-delete')"
                                        :title-hide="$$('title-hide')"
                                        :title-show="$$('title-show')"
                                        :title-annotation="$$('title-annotation')"
                                        :title-invisible="$$('title-invisible')"
                                    />
                                </div>
                                <template #header>
                                    <span
                                        @click="onClassTool('clickHeader', item)"
                                        :class="
                                            !item.isModel &&
                                            item.classId == editor.state.currentClass
                                                ? 'class-header active'
                                                : 'class-header'
                                        "
                                    >
                                        <WarningOutlined
                                            style="color: #ffa900"
                                            v-if="!item.classType"
                                        />
                                        <i
                                            class="iconfont icon-lifangti"
                                            v-else
                                            :style="{ color: item.color }"
                                        ></i>
                                        <span class="class-title limit" :title="item.className">{{
                                            item.className
                                        }}</span
                                        >{{ `(${item.data.length})` }}
                                    </span>
                                </template>
                                <template #extra>
                                    <div class="extra-tool" v-show="item.data.length > 0">
                                        <EditOutlined
                                            :title="$$('title-edit')"
                                            v-show="item.isModel"
                                            @click.stop="onClassTool('edit', item)"
                                        />
                                        <EyeOutlined
                                            :title="$$('title-hide')"
                                            @click.stop="onClassTool('toggleVisible', item)"
                                            v-if="item.visible"
                                        />
                                        <EyeInvisibleOutlined
                                            :title="$$('title-show')"
                                            @click.stop="onClassTool('toggleVisible', item)"
                                            v-else
                                        />
                                        <DeleteOutlined
                                            :title="$$('title-delete')"
                                            @click.stop="onClassTool('delete', item)"
                                            v-if="canEdit()"
                                        />
                                    </div>
                                </template>
                            </a-collapse-panel>
                        </a-collapse>
                    </div>
                    <div v-show="!canOperate() || isPlay()" class="over-not-allowed"></div>
                </div>
            </a-collapse-panel>
        </a-collapse>
    </div>
</template>

<script setup lang="ts">
    import {
        EyeOutlined,
        DeleteOutlined,
        CaretRightOutlined,
        DisconnectOutlined,
        WarningOutlined,
        EyeInvisibleOutlined,
        EditOutlined,
    } from '@ant-design/icons-vue';
    import useUI from '../../hook/useUI';
    import useInstance, { animation } from './useInstance';
    import Header from './Header.vue';
    // import Collapse from '../../Collapse/index.vue';

    // import Item from './Item.vue';
    import TrackItem from './TrackItem.vue';

    // ***************Props and Emits***************
    // *********************************************

    let { canEdit, canOperate, isPlay } = useUI();
    let { editor, state, domRef, onTrackTool, onItemTool, onClassTool, onToggleAttr, $$ } =
        useInstance();
</script>

<style lang="less">
    .instance-wrap {
        flex: 1;
        position: relative;

        > .ant-collapse {
            position: absolute;
            inset: 0;
            > .ant-collapse-item {
                height: 100%;
                display: flex;
                flex-direction: column;
                > .ant-collapse-content {
                    flex: 1;
                    position: relative;
                    > .ant-collapse-content-box {
                        position: absolute;
                        inset: 0;
                        > .operation-instance {
                            position: absolute;
                            inset: 0;
                        }
                    }
                }
            }
        }
    }
    .operation-instance {
        // background: black;
        height: 100%;
        text-align: left;
        position: relative;

        .ant-collapse-extra {
            pointer-events: none;
        }
        .class-header {
            position: absolute;
            inset: 0;
            padding-left: 36px;
            line-height: 30px;
            &.active {
                background: #424d6d;
            }
        }
        .class-title {
            display: inline-block;
            max-width: 100px;
            line-height: 1;
            vertical-align: middle;
            margin-left: 8px;
        }

        .iconfont {
            font-size: 14px;
        }

        .title1 {
            color: white;
            font-size: 16px;
            margin-right: 10px;
        }

        .title2 {
            color: white;
            font-size: 14px;
        }

        .pre-box {
            display: inline-block;
            vertical-align: -0.2em;
            width: 16px;
            height: 16px;
            background: rgba(191, 191, 191, 0.3);
            border: 1px solid #bfbfbf;
        }

        .list {
            .invisible {
                font-size: 12px;
                color: #d19114;
                margin-left: 4px;
            }
            // padding: 2px 0px;
            .item {
                padding-left: 36px;
                padding-right: 4px;
                cursor: pointer;
                height: 30px;
                line-height: 30px;
                color: #bdbdbd;
                font-size: 12px;

                .tool-icon {
                    // display: none;
                    font-size: 14px;
                    float: right;
                    margin-left: 6px;
                    margin-top: 10px;
                    color: rgba(177, 177, 177, 0.85);
                    line-height: 1;
                    // color: rgb(87, 204, 239);
                }
                &:hover .tool-icon {
                    display: block;
                    color: white;
                    &:hover {
                        color: #ed4014;
                    }
                }
            }

            .item:hover {
                background: #353841;
            }
            .item.active {
                background: #353c50;
            }
        }
        .extra-tool {
            pointer-events: visible;
            height: 100%;
            float: right;
            padding-right: 8px;
            .anticon,
            .iconfont {
                margin-left: 6px;
                &:hover {
                    color: #ed4014;
                }
            }
        }

        //
        .ant-collapse > .ant-collapse-item {
            margin-bottom: 0px;
        }

        .ant-collapse > .ant-collapse-item > .ant-collapse-header {
            background: transparent;
            height: 30px;
            .ant-collapse-arrow {
                z-index: 2;
            }
            // background: #2a2a2c;
        }
        .ant-collapse > .ant-collapse-item {
            background: transparent;
        }

        // .ant-collapse > .ant-collapse-item > .ant-collapse-header .ant-collapse-extra {
        //     float: left;
        //     margin-right: 4px;
        // }
        // .ant-collapse > .ant-collapse-item > .ant-collapse-header {
        //     padding-left: 60px;
        // }
        .ant-collapse .ant-collapse-extra {
            position: absolute !important;
            top: 0px !important;
            left: 40px !important;
            right: 0px !important;
            bottom: 0px !important;
            line-height: 30px !important;
        }
    }
</style>
