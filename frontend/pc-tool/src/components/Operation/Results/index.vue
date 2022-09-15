<template>
    <div class="operation-results">
        <span class="title collapse-title">Results</span>
        <a-select
            :disabled="editor.state.status === StatusType.Play"
            v-model:value="state.filterActive"
            mode="multiple"
            :maxTagCount="1"
            :maxTagTextLength="60"
            style="width: 180px"
            :options="state.filters"
            @select="onSelect"
        >
        </a-select>
    </div>
</template>

<script setup lang="ts">
    import { reactive, watch } from 'vue';
    import { useInjectEditor } from '../../../state';
    import { StatusType } from 'pc-editor';

    let editor = useInjectEditor();
    let { state } = editor;
    // let state = reactive({
    //     active: [] as string[],
    //     list: options,
    // });

    function onSelect(value: string) {
        let ALL = state.config.FILTER_ALL;
        if (value === ALL && state.filterActive.length > 1) {
            state.filterActive = [ALL];
        } else if (value !== ALL && state.filterActive.indexOf(ALL) >= 0) {
            state.filterActive = state.filterActive.filter((v) => v !== ALL);
        }
    }
</script>

<style lang="less">
    .operation-results {
        height: 40px;
        background: #1e1f23;
        display: flex;
        align-items: center;
        padding: 4px;
        padding-left: 12px;
        margin-bottom: 6px;

        .title {
            color: rgba(177, 177, 177, 0.85);
            margin-right: 6px;
        }

        .ant-select-multiple .ant-select-selection-item {
            max-width: 90px;
        }
    }
</style>
