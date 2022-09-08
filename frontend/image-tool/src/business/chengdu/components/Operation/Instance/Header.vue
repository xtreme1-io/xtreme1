<template>
    <div class="header-content">
        <span>{{ props.title }}</span>
        <div class="tool">
            <!-- Filter -->
            <Popover
                title="Filter"
                placement="bottomRight"
                v-model:visible="filterVisible"
                :trigger="['click']"
                v-if="canEdit()"
            >
                <i
                    title="Filter"
                    class="iconfont icon-filter icon"
                    :class="{ filterActive: hasFilter }"
                    @click.stop
                />
                <template #content>
                    <div class="filter__body">
                        <Filter ref="filterRef" />
                    </div>
                    <div class="filter__divider"></div>
                    <div class="filter__footer">
                        <a-button size="small" @click="handleReset">Reset</a-button>
                        <a-button size="small" type="primary" @click="handleConfirm">
                            Confirm
                        </a-button>
                    </div>
                </template>
            </Popover>
            <i
                title="Hide"
                class="iconfont icon-visible icon"
                v-if="editorState.allVisible"
                @click.stop="toggleVisible"
            />
            <i title="Show" class="iconfont icon-hidden icon" v-else @click.stop="toggleVisible" />
            <i
                title="Delete"
                class="iconfont icon-delete icon"
                @click.stop="onDelete"
                v-if="canEdit()"
            />
            <a-popover
                title="Setting"
                placement="bottomRight"
                :trigger="['click']"
                v-if="canEdit()"
            >
                <i class="iconfont icon-more icon" @click.stop></i>
                <template #content>
                    <a-row class="setting-item">
                        <a-col :span="12" class="title"
                            ><span class="item-title">Show Size</span></a-col
                        >
                        <a-col :span="8">
                            <a-switch
                                v-model:checked="editorState.showSize"
                                checked-children="On"
                                un-checked-children="Off"
                            />
                        </a-col>
                    </a-row>
                    <a-row class="setting-item">
                        <a-col :span="12" class="title"
                            ><span class="item-title">Show Attr</span></a-col
                        >
                        <a-col :span="8">
                            <a-switch
                                v-model:checked="editorState.showAttrs"
                                checked-children="On"
                                un-checked-children="Off"
                            />
                        </a-col>
                    </a-row>
                </template>
            </a-popover>
        </div>
        <div v-show="!canOperate()" class="over-not-allowed"></div>
    </div>
</template>

<script setup lang="ts">
    import { ref, nextTick, watch, inject } from 'vue';
    import { Popover } from 'ant-design-vue';
    import useUI from '../../../hook/useUI';
    import * as _ from 'lodash';
    import { useInjectTool } from '../../../state';
    import Filter from './Filter.vue';
    import { FilterEnum } from './type';
    import { Event } from 'editor';

    // ***************Props and Emits***************
    const props = defineProps<{ title: string; state: any }>();
    // *********************************************
    const hasFilter = ref<boolean>(false);
    watch(
        () => props.title,
        (newVal) => {
            console.log(newVal);
            if (newVal.includes('/')) hasFilter.value = true;
            else hasFilter.value = false;
        },
    );

    const { canEdit, canOperate } = useUI();
    const tool = useInjectTool();
    const editor = tool.editor;
    const editorState = editor.state;

    function onDelete() {
        editor.showConfirm({ title: 'Delete', subTitle: 'Delete All Results?' }).then(
            () => {
                editor.cmdManager.execute('delete-object', {
                    object: editor.tool?.toJSON(),
                    id: editor.tool?.toJSON().map((item: any) => item.uuid),
                });
                editor.tool?.removeAll();
            },
            () => {},
        );
    }

    function toggleVisible() {
        editorState.allVisible = !editorState.allVisible;
        console.log(editorState.allVisible);
        editor.emit(Event.FILTER_TOGGLE, editorState.allVisible);
    }

    // filter --------------------------
    const filterValue: any = inject('filterValue');
    watch(filterValue, (newVal) => {
        lastUserChecked.value = lastUserChecked.value ?? [FilterEnum.class];
        lastModelChecked.value = lastModelChecked.value ?? [FilterEnum.predictedClass];
        if (_.isEqual(newVal, [FilterEnum.class, FilterEnum.predictedClass])) {
            lastUserChecked.value = [FilterEnum.class];
            lastModelChecked.value = [FilterEnum.predictedClass];
        }
        if (filterRef.value) {
            lastUserChecked.value = lastUserChecked.value.filter((item) => newVal.includes(item));
            lastModelChecked.value = lastModelChecked.value.filter((item) => newVal.includes(item));

            (filterRef.value as any).userCheckedKeys = lastUserChecked.value;
            (filterRef.value as any).modelCheckedKeys = lastModelChecked.value;
        }
    });
    const filterVisible = ref<boolean>(false);
    watch(filterVisible, (newVal) => {
        if (!newVal) {
            resetFilter();
        } else {
            console.log('State:', props.state);
            const tempUser: any[] = [];
            const tempModel: any[] = [];
            if (
                props.state?.noClassList.data.length > 0 &&
                props.state?.noClassList.filterVisible
            ) {
                tempUser.push(FilterEnum.noClass);
            }
            props.state?.list.forEach((item: any) => {
                if (item.isModel && item.filterVisible) {
                    tempModel.push(item.classType);
                } else if (!item.isModel && item.filterVisible) {
                    tempUser.push(item.classType);
                }
            });
            const isAllModel = props.state?.list.every((item: any) => item.isModel);
            if (props.state.list.length == 0 || isAllModel) {
                tempUser.push(FilterEnum.class);
            }
            if (filterRef.value) {
                (filterRef.value as any).userCheckedKeys = tempUser;
                (filterRef.value as any).modelCheckedKeys = tempModel;
            }
        }
    });
    const handleReset = () => {
        resetFilter(true);
        handleFilter();
        filterVisible.value = false;
    };
    const handleConfirm = () => {
        props.state.select = [];
        if (editor.tool) editor.tool.selectedShape = null;
        editor.state.showClassView = false;
        console.log(editor);

        confirmFilter();
        handleFilter();
        filterVisible.value = false;
    };
    const handleFilter = () => {
        nextTick(() => {
            editor.emit(Event.FILTER_CHANGE, defaultSelectedKeys.value);
            editor.emit(Event.FILTER_TOGGLE);
        });
    };

    const defaultSelectedKeys = ref<string[]>([FilterEnum.class, FilterEnum.predictedClass]);
    const lastUserChecked = ref<string[]>([FilterEnum.class]);
    const lastModelChecked = ref<string[]>([FilterEnum.predictedClass]);
    const filterRef = ref(null);
    const confirmFilter = () => {
        defaultSelectedKeys.value = [];
        defaultSelectedKeys.value.push(...(filterRef.value as any).userCheckedKeys);
        defaultSelectedKeys.value.push(...(filterRef.value as any).modelCheckedKeys);
        lastUserChecked.value = (filterRef.value as any).userCheckedKeys;
        lastModelChecked.value = (filterRef.value as any).modelCheckedKeys;
    };
    const resetFilter = (isDefault?: boolean) => {
        if (isDefault) {
            defaultSelectedKeys.value = [FilterEnum.class, FilterEnum.predictedClass];
            (filterRef.value as any).userCheckedKeys = [FilterEnum.class];
            (filterRef.value as any).modelCheckedKeys = [FilterEnum.predictedClass];
            lastUserChecked.value = [FilterEnum.class];
            lastModelChecked.value = [FilterEnum.predictedClass];
        } else {
            (filterRef.value as any).userCheckedKeys = lastUserChecked.value;
            (filterRef.value as any).modelCheckedKeys = lastModelChecked.value;
        }
    };
</script>

<style lang="less">
    .header-content {
        display: flex;
        justify-content: space-between;
    }
    .tool .icon {
        margin-left: 6px;
        width: 26px;
        &:hover {
            color: #ed4014;
        }
    }
    .filterActive {
        color: #57ccef;
    }
    .ant-dropdown {
        background: #333;
        .ant-menu {
            background-color: transparent;
        }

        .ant-menu-vertical > .ant-menu-item {
            height: 30px;
            line-height: 30px;
            color: #a7a7a7;
        }
    }
    .tool {
        // position: relative;
    }
    // filter --
    .filter {
        position: absolute;
        top: 40px;
        right: 16px;
        z-index: 10;
        padding: 12px 16px;
        color: rgba(255, 255, 255, 0.85);
        background-color: #1f1f1f;
        border-radius: 4px;
        overflow-x: hidden;
    }
    .filter__title {
        min-width: 177px;
        min-height: 32px;
        margin: 0;
        padding: 5px 16px 4px;
        color: rgba(255, 255, 255, 0.85);
        font-weight: 500;
        border-bottom: 1px solid #303030;
    }
    .filter__body {
        max-height: 200px;
        color: rgba(255, 255, 255, 0.85);
        overflow: overlay;
    }
    .filter__divider {
        margin-top: 10px;
        width: 100%;
        height: 1px;
        background-color: #303030;
        // transform: scaleX(2);
    }
    .filter__footer {
        padding-top: 10px;
        display: flex;
        justify-content: space-between;
    }
</style>
