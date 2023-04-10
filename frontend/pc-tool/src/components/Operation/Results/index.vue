<template>
    <Collapse :header="$$('resultsSource')">
        <div class="operation-results">
            <div class="filter-wrap">
                <a-select
                    :disabled="editor.state.status === StatusType.Play"
                    v-model:value="state.sourceFilters"
                    mode="multiple"
                    :maxTagCount="1"
                    :maxTagTextLength="60"
                    style="width: 100%"
                    :options="filters"
                    @deselect="onDeselect"
                    @select="onSelect"
                >
                </a-select>
            </div>
            <!-- <div class="result-source-wrap">
                <div
                    @click="onClick(item)"
                    :class="
                        item.sourceId === state.activeSourceData
                            ? 'source-item active'
                            : 'source-item'
                    "
                    v-for="item in filterTabs"
                >
                    <i
                        class="iconfont icon-file"
                        v-if="item.sourceType === SourceType.DATA_FLOW"
                    ></i>
                    <i class="iconfont icon-a-122" v-else></i>
                    <span class="name limit" :title="itemName(item)">{{ itemName(item) }}</span>
                    <CloseOutlined
                        :style="{ opacity: item.sourceId === state.activeSourceData ? '0' : '1' }"
                        class="remove"
                        @click.stop="
                            item.sourceId === state.activeSourceData ? null : onRemove(item)
                        "
                    />
                </div>
            </div> -->
        </div>
    </Collapse>
</template>

<script setup lang="ts">
    import { computed, watch } from 'vue';
    import { useInjectEditor } from '../../../state';
    import { StatusType, SourceType, IResultSource } from 'pc-editor';
    import { CloseOutlined } from '@ant-design/icons-vue';
    import Collapse from '../../Collapse/index.vue';
    import * as locale from './lang';

    export interface IFilter {
        value?: string;
        label: string;
        // type: SourceType;
        options?: { value: string; label: string }[];
    }

    let editor = useInjectEditor();
    let $$ = editor.bindLocale(locale);
    let { state } = editor;

    let filterTabs = computed(() => {
        let { FILTER_ALL } = state.config;
        let filterMap = {};
        let hasAll = false;
        state.sourceFilters.forEach((e) => {
            if (e === FILTER_ALL) hasAll = true;
            else filterMap[e] = true;
        });

        let tabs = state.sources.filter((e) => hasAll || filterMap[e.sourceId]);

        return tabs;
    });

    watch(
        () => filterTabs.value,
        () => {
            if (
                filterTabs.value.length > 0 &&
                !filterTabs.value.find((e) => e.sourceId === state.activeSourceData)
            ) {
                state.activeSourceData = filterTabs.value[0].sourceId;
            }
        },
    );

    let filters = computed(() => {
        let { FILTER_ALL, withoutTaskId } = state.config;
        let sources = state.sources || [];
        let all: IFilter = { value: FILTER_ALL, label: $$('labelAll') };
        let groundTruth: IFilter = { value: withoutTaskId, label: $$('labelGroundTruth') };
        // let model: IFilter = { label: $$('labelModelRuns'), options: [] };

        let filters = [all, groundTruth] as IFilter[];
        let modelMap = {};
        sources.forEach((s) => {
            let { sourceId, sourceType, modelId = '', modelName = '', name } = s;
            if (sourceType === SourceType.TASK) {
                (groundTruth.options as any).push({ value: sourceId, label: 'Task ' + s.name });
            } else if (sourceType === SourceType.MODEL) {
                let options = modelMap[modelId];
                if (!options) {
                    options = [];
                    modelMap[modelId] = options;
                    filters.push({
                        options: options,
                        label: modelName,
                    });
                }
                options.push({ value: sourceId, label: name });
            }
        });
        return filters;
    });

    function onSelect(value: string) {
        let ALL = state.config.FILTER_ALL;
        if (value === ALL && state.sourceFilters.length > 1) {
            state.sourceFilters = [ALL];
        } else if (value !== ALL && state.sourceFilters.indexOf(ALL) >= 0) {
            state.sourceFilters = state.sourceFilters.filter((v) => v !== ALL);
        }

        updateData();
    }
    function onDeselect(value: string) {
        let ALL = state.config.FILTER_ALL;

        if (state.sourceFilters.length === 0) {
            state.sourceFilters = [ALL];
        }
        updateData();
    }

    function updateData() {
        editor.selectObject();
        editor.dataManager.loadDataFromManager();
    }
</script>

<style lang="less">
    .operation-results {
        // height: 40px;
        background: #1e1f23;

        padding: 4px 8px;
        // padding-left: 12px;
        margin-bottom: 6px;

        .ant-select-selection-overflow-item-suffix {
            display: none;
        }

        .filter-wrap {
            display: flex;
            align-items: center;
            .title {
                // color: rgba(177, 177, 177, 0.85);
                margin-right: 6px;
            }

            .ant-select-multiple .ant-select-selection-item {
                max-width: 70px;
            }
        }

        .result-source-wrap {
            // min-height: 100px;
            background: #1e1f23;
            padding: 10px 0px;

            .source-item {
                display: inline-block;
                font-size: 14px;
                line-height: 16px;
                border: 1px solid rgba(222, 229, 235, 1);
                padding: 4px 6px;
                border-radius: 4px;
                margin-right: 4px;
                margin-top: 4px;
                cursor: pointer;
                user-select: none;

                .iconfont {
                    vertical-align: middle;
                    font-size: 12px;
                    margin-right: 4px;
                }
                .remove {
                    font-size: 12px;
                    vertical-align: middle;
                }

                .name {
                    display: inline-block;
                    max-width: 85px;
                    vertical-align: middle;
                }

                &.active {
                    background: red;
                    color: white;
                    border-color: transparent;
                }
            }
        }
    }
</style>
