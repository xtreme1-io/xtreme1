<template>
    <div v-for="item in dataList" :key="item.id" class="pc-editor-tool">
        <TextItem :item="item" />
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import { Event, ITextItem } from 'pc-editor';
    import { useInjectEditor } from '../../state';

    import TextItem from './text-item.vue'

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

        & > div {
            width: 100%;
            .thumbs {
                text-align: right;
                padding-top: 10px;
                svg {
                    margin: 0 6px;
                    cursor: pointer;
                }
            }
            .prompter {
                // word-break: break-all;
                max-width: calc(100% - 150px);
                color: #fff;
                font-size: 16px;
                line-height: 26px;
                padding: 16px;
                background: #555b76;
                border-radius: 0px 24px 24px 24px;
                margin-bottom: 20px;
            }
            .assistant {
                max-width: calc(100% - 150px);
                color: #fff;
                font-size: 16px;
                line-height: 26px;
                padding: 16px;
                background: #5e80a9;
                border-radius: 24px 0px 24px 24px;
                margin-bottom: 20px;
            }
            .user {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                border: 1px solid #aaa;
                text-align: center;
                line-height: 30px;
                margin: 0 10px;
                background: #fff;
            }
        }
    }
</style>
