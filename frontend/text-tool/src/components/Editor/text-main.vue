<template>
    <div v-for="item in dataList" :key="item.id" class="pc-editor-tool">
        <TextItem :item="item" />
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
        let dataMap = editor.dataManager.textMap;
        dataList.value = Array.from(dataMap.values());
        console.log('==============>', dataList);
    }
</script>

<style lang="less">
    .pc-editor-tool {
        padding: 20px 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        width: calc(100% - 350px);
    }
</style>
