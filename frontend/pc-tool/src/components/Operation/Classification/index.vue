<template>
    <Collapse header="Classifications">
        <div class="operation-classification">
            <template v-if="state.classifications.length > 0">
                <div class="classification-wrap" v-for="item in classifications" :key="item.id">
                    <AttrValue
                        v-for="attr in item.attrs"
                        :key="attr.id + '#' + state.frameIndex"
                        v-show="isAttrVisible(attr)"
                        @change="onAttChange"
                        :item="attr"
                    />
                </div>
            </template>
            <div v-else class="no-info">No Data</div>
            <div v-show="!canOperate() || isPlay()" class="over-not-allowed"></div>
        </div>
    </Collapse>
</template>

<script setup lang="ts">
    import { computed, reactive, watch, onMounted, onBeforeUnmount } from 'vue';
    import { useInjectEditor } from '../../../state';
    import { IClassificationAttr, IClassification } from 'pc-editor';
    import { AttrType, StatusType } from 'pc-editor';
    import useUI from '../../../hook/useUI';

    import AttrValue from './AttrValue.vue';
    import Collapse from '../../Collapse/index.vue';

    let editor = useInjectEditor();
    let state = editor.state;
    let attrMap = {} as Record<string, IClassificationAttr>;
    let { canOperate, isPlay } = useUI();
    // let iState = reactive({
    //     classifications: [] as IClassification[],
    // });

    onMounted(() => {
        // tool.playManger.addEventListener(ToolEvent.PLAY_STOP, onPlayStop);
    });

    onBeforeUnmount(() => {
        // tool.playManger.removeEventListener(ToolEvent.PLAY_STOP, onPlayStop);
    });

    // watch(() => tool.state.dataIndex, updateDataClassification);

    // function onPlayStop() {
    //     updateDataClassification();
    // }

    let oldDatas = [] as IClassification[];
    const classifications = computed(() => {
        let frame = editor.getCurrentFrame();
        let datas = frame ? frame.classifications : [];

        datas.forEach((e) => {
            e.attrs.forEach((attr) => {
                attrMap[attr.id] = attr;
            });
        });

        // if (tool.editor.state.status === StatusType.Play) return oldDatas;

        oldDatas = datas;
        return datas;
    });

    // function updateDataClassification() {
    //     if (tool.editor.state.status === StatusType.Play) return;

    //     let dataInfo = tool.state.dataList[tool.state.dataIndex];
    //     iState.classifications = dataInfo ? dataInfo.classifications : [];

    //     // attrMap

    //     // return classifications;
    // }

    function onAttChange(name: string, value: any) {
        console.log(name, value);
        let dataInfo = editor.getCurrentFrame();
        dataInfo.needSave = true;
    }

    function isItemVisible(attr: IClassificationAttr): boolean {
        let parentAttr = attrMap[attr.parent];
        return parentAttr.type !== AttrType.MULTI_SELECTION
            ? parentAttr.value === attr.parentValue
            : (parentAttr.value as any[]).indexOf(attr.parentValue) >= 0;
    }

    function isAttrVisible(attr: IClassificationAttr): boolean {
        if (!attr.parent) return true;
        let parentAttr = attrMap[attr.parent];
        return isItemVisible(attr) && isAttrVisible(parentAttr);
    }
</script>

<style lang="less">
    .operation-classification {
        text-align: left;
        padding: 4px 10px;
        max-height: 350px;
        overflow: auto;
        position: relative;

        .attr-item {
            text-align: left;
            .name {
                font-size: 16px;
                line-height: 34px;
            }

            .value {
                padding: 4px 0px;
            }
        }
    }
</style>
