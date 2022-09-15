<template>
    <Collapse>
        <template #header>
            <Header :title="`Instance(${resultNum})`" :state="state" />
        </template>
        <div class="operation-instance">
            <div style="height: 100%; max-height: 400px; overflow-y: auto; user-select: none">
                <a-collapse v-model:activeKey="state.activeKey" :bordered="false">
                    <template #expandIcon="{ isActive }">
                        <CaretRightOutlined :rotate="isActive ? 90 : 0" />
                    </template>
                    <template v-if="hasClass">
                        <a-collapse-panel
                            :key="noClassKey"
                            :header="`Class Required(${noClassList.length})`"
                            v-if="noClassList.length > 0"
                        >
                            <div class="list">
                                <Item
                                    v-for="subItem in noClassList"
                                    :key="subItem.id"
                                    :data="subItem"
                                    @tool="onItemTool"
                                    :select="state.select"
                                />
                            </div>
                            <template #extra>
                                <WarningOutlined style="color: #ffa900" />
                                <div class="extra-tool">
                                    <i
                                        class="iconfont icon-visible"
                                        title="Hide"
                                        @click.stop="onToggleClassVisible(state.noClassList)"
                                        v-if="state.noClassList.visible"
                                    />
                                    <i
                                        class="iconfont icon-hidden"
                                        title="Show"
                                        @click.stop="onToggleClassVisible(state.noClassList)"
                                        v-else
                                    />
                                    <i
                                        class="iconfont icon-delete icon"
                                        title="Delete"
                                        @click.stop="onDeleteClassObject(state.noClassList)"
                                        v-if="canEdit()"
                                    />
                                </div>
                            </template>
                        </a-collapse-panel>
                        <a-collapse-panel v-for="item in hasClassList" :key="item.classType">
                            <div class="list">
                                <Item
                                    v-for="subItem in item.data"
                                    :key="subItem.id"
                                    :data="subItem"
                                    @tool="onItemTool"
                                    :select="state.select"
                                />
                            </div>
                            <template #header>
                                <span class="class-title limit" :title="item.classType">
                                    {{ item.classType }}
                                </span>
                                <span>{{ `(${item.data.length})` }}</span>
                            </template>
                            <template #extra>
                                <i
                                    :class="`iconfont icon-${item.annotateType}`"
                                    :style="{ color: item.color }"
                                ></i>
                                <div class="extra-tool" v-show="item.data.length > 0">
                                    <EditOutlined
                                        v-show="item.isModel"
                                        @click.stop="onEditModelClass(item)"
                                    />
                                    <i
                                        class="iconfont icon-visible"
                                        title="Hide"
                                        @click.stop="onToggleClassVisible(item)"
                                        v-if="item.visible"
                                    />
                                    <i
                                        class="iconfont icon-hidden"
                                        title="Show"
                                        @click.stop="onToggleClassVisible(item)"
                                        v-else
                                    />
                                    <i
                                        class="iconfont icon-delete"
                                        title="Delete"
                                        @click.stop="onDeleteClassObject(item)"
                                        v-if="canEdit()"
                                    />
                                </div>
                            </template>
                        </a-collapse-panel>
                    </template>
                    <div v-else class="no-info" style="padding: 4px 10px">No Data</div>
                </a-collapse>
            </div>
            <div v-show="!canOperate()" class="over-not-allowed"></div>
        </div>
    </Collapse>
</template>

<script setup lang="ts">
    import { provide, ref, watch } from 'vue';
    import { CaretRightOutlined, WarningOutlined, EditOutlined } from '@ant-design/icons-vue';
    import useUI from '../../../hook/useUI';
    import useInstance from './useInstance';
    import Header from './Header.vue';
    import Item from './Item.vue';
    import Collapse from '../../Collapse/index.vue';

    let { canEdit, canOperate } = useUI();
    let {
        state,
        noClassKey,
        onDeleteClassObject,
        onItemTool,
        onToggleClassVisible,
        onEditModelClass,
        filterValue,
    } = useInstance();

    // *********************************************
    provide('state', state);
    provide('filterValue', filterValue);

    const noClassList = ref<any>(state.noClassList.data);
    const hasClassList = ref<any>(state.list);

    const resultNum = ref<string>('');
    const hasClass = ref<boolean>(false);

    watch(state, () => {
        console.log('finally --- ', state);
        noClassList.value = state.noClassList.filterVisible ? state.noClassList.data : [];
        hasClassList.value = state.list.filter((item: any) => item.filterVisible);

        const noClassListNum = noClassList.value.length;
        const hasClassListNum = hasClassList.value.reduce(
            (previousValue: any, currentValue: any) =>
                previousValue + (currentValue?.data?.length ?? 0),
            0,
        );
        const showListNum = noClassListNum + hasClassListNum;
        resultNum.value =
            state.objectN == showListNum ? state.objectN + '' : showListNum + '/' + state.objectN;

        hasClass.value = hasClassList.value.length > 0 || noClassListNum > 0;
    });
</script>

<style lang="less" scoped>
    .operation-instance {
        // background: black;
        height: calc(100% - 300px);
        text-align: left;
        position: relative;
        overflow-y: overlay;
        overflow-x: hidden;
        padding: 8px 7px 10px;

        .list {
            .class-title {
                display: inline-block;
                max-width: 100px;
                line-height: 1;
                vertical-align: middle;
            }
        }
        // tool
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

        :deep(.ant-collapse-borderless) {
            background-color: transparent;
            .ant-collapse-item {
                &:last-child {
                    .ant-collapse-header {
                        display: flex;
                        align-items: center;
                        border: 0;
                        border-bottom: 1px solid #1e1f22;
                        border-radius: 4px;
                    }
                }
                &.ant-collapse-item-active {
                    border-bottom: 1px solid #1e1f22 !important;
                }
            }
        }
        :deep(.ant-collapse) {
            margin-bottom: unset;
            background-color: #303036 !important;
            // border: 1px solid #1e1f22 !important;
            border-radius: 4px;
            // overflow: hidden;
            border: 0 !important;
            .ant-collapse-item {
                margin-bottom: 3px;
                background: #303036;
                border-radius: 4px 4px 5px 5px;
                border: 1px solid #1e1f22 !important;
                border-bottom: 0 !important;
                overflow: hidden;
                &.ant-collapse-item-active {
                    border-radius: 4px;
                    border-bottom: 1px solid #1e1f22 !important;
                }
                .ant-collapse-header {
                    display: flex;
                    align-items: center;
                    font-weight: 500;
                    font-size: 14px;
                    color: #bec1ca;
                    padding: 4px;
                    padding-left: 46px;
                    text-align: left;
                    background: #3e4047;
                    border-radius: 4px;
                    border: 0;
                    border-bottom: 1px solid #1e1f22;
                }
                .ant-collapse-content {
                    color: white;
                    border-radius: 0 0 4px 4px;
                    overflow-x: hidden;
                    .ant-collapse-content-box {
                        background: #303036;
                        padding: 0px;
                    }
                }
                // &:nth-child(n + 2) {
                //     transform: translateY(-1px);
                // }
            }
            .ant-collapse-extra {
                pointer-events: none;
                position: absolute !important;
                top: 4px !important;
                left: 28px !important;
                right: 0px !important;
                bottom: 0px !important;
                line-height: 30px !important;
            }
        }
    }
</style>
