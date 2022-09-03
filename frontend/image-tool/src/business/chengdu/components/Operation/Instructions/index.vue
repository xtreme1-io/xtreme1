<template>
    <Collapse header="Instructions">
        <div class="operation-instructions">
            <!-- <a-select
            v-model:value="toolState.resultActive"
            mode="multiple"
            :maxTagCount="1"
            :maxTagTextLength="60"
            style="width: 180px"
            :options="toolState.resultFilter"
            @select="onSelect"
        >
        </a-select> -->
        </div>
        <div class="no-info" style="padding: 8px 10px; text-align: left">No Data</div>
    </Collapse>
</template>

<script setup lang="ts">
    import { reactive, watch } from 'vue';
    import Collapse from '../../Collapse/index.vue';
    // import { useInjectTool } from '../../../state';

    // let tool = useInjectTool();
    // let toolState = tool.state;
    // let state = reactive({
    //     active: [] as string[],
    //     list: options,
    // });

    // watch(
    //     () => toolState.resultActive,
    //     () => {
    //         console.log('onChange', toolState.resultActive);
    //         if (toolState.resultActive.length === 0) toolState.resultActive = [tool.config.FILTER_ALL];
    //         tool.loadDataFromManager(true);
    //     },
    // );

    function onSelect(value: string) {
        let ALL = tool.config.FILTER_ALL;
        if (value === ALL && toolState.resultActive.length > 1) {
            toolState.resultActive = [ALL];
        } else if (value !== ALL && toolState.resultActive.indexOf(ALL) >= 0) {
            toolState.resultActive = toolState.resultActive.filter((v) => v !== ALL);
        }
    }
</script>

<style lang="less">
    .operation-instructions {
        height: 0;
        background: #1e1f23;
        display: flex;
        align-items: center;
        .title {
            color: rgba(177, 177, 177, 0.85);
            margin-right: 10px;
        }

        .ant-select-multiple .ant-select-selection-item {
            max-width: 90px;
        }
    }
</style>
