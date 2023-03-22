<template>
    <Collapse header="Results source">
        <div class="operation-results">
            <div class="filter-wrap">
                <a-select
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
        </div>
    </Collapse>
</template>
<script lang="ts" setup>
    import Collapse from '../../Collapse/index.vue';
    import { computed, watch } from 'vue';
    import { useInjectTool } from '../../../state';
    import { SourceType } from '../../../type';

    export interface IFilter {
        value?: string;
        label: string;
        // type: SourceType;
        options?: { value: string; label: string }[];
    }
    let tool = useInjectTool();
    let state = tool.state;

    let filterTabs = computed(() => {
        let { FILTER_ALL } = state;
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
                !filterTabs.value.find((e) => e.sourceId == state.activeSourceData)
            ) {
                state.activeSourceData = filterTabs.value[0].sourceId;
            }
        },
    );

    let filters = computed(() => {
        let { FILTER_ALL, withoutTaskId } = state;
        let sources = state.sources || [];
        let all: IFilter = { value: FILTER_ALL, label: 'All' };
        let groundTruth: IFilter = { value: withoutTaskId, label: 'Ground Truth' };
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
        let ALL = state.FILTER_ALL;
        if (value === ALL && state.sourceFilters.length > 1) {
            state.sourceFilters = [ALL];
        } else if (value !== ALL && state.sourceFilters.indexOf(ALL) >= 0) {
            state.sourceFilters = state.sourceFilters.filter((v) => v !== ALL);
        }

        updateData();
    }
    function onDeselect(value: string) {
        let ALL = state.FILTER_ALL;

        if (state.sourceFilters.length === 0) {
            state.sourceFilters = [ALL];
        }
        updateData();
    }

    function updateData() {
        // tool.();
        tool.loadDataFromManager(true);
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
