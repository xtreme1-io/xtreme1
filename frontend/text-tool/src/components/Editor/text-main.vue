<template>
    <div class="text-editor-tool">
        <div
            :class="index === dataList.length - 1 ? 'text-card-last' : ''"
            v-for="(item, index) in dataList"
            :key="item.id"
            class="pc-editor-tool"
        >
            <TextItem :item="item" @changed="onItemDirection" />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import { Event, ITextItem } from 'pc-editor';
    import { useInjectEditor } from '../../state';

    import TextItem from './text-item.vue';

    const editor = useInjectEditor();
    editor.addEventListener(Event.ANNOTATE_LOADED, () => {
        updateData();
    });
    const dataList = ref<ITextItem[]>([]);

    function updateData() {
        dataList.value = editor.dataManager.getTextItemsByFrame();
    }
    function onItemDirection(item: ITextItem, type: 'up' | 'down' | '') {
        editor.dataManager.onTextChange(item, type);
    }
</script>

<style lang="less">
    .text-editor-tool {
        padding: 20px 10px;
        position: relative;
        min-width: 300px;
        width: calc(100% - 270px);
        height: 100%;
        overflow-y: auto;
        .pc-editor-tool {
            padding: 20px 10px;
            position: relative;
            min-width: 300px;
        }
        .text-card-last {
            .assistant,
            .prompter {
                border: 1px solid #57ccef;
            }
        }
    }
</style>
