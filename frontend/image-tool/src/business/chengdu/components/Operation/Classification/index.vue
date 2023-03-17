<template>
    <Collapse header="Classifications">
        <div class="operation-classification">
            <template v-if="state.classifications.length > 0">
                <div class="classification-wrap" v-for="item in classifications" :key="item.id">
                    <AttrValue
                        v-for="attr in item.attrs"
                        :key="attr.id + '#' + state.dataIndex"
                        v-show="isAttrVisible(attr)"
                        @change="onAttChange"
                        :item="attr"
                    />
                </div>
            </template>
            <div v-else class="no-info">No Data</div>
        </div>
    </Collapse>
</template>

<script setup lang="ts">
    import { computed, watch, ref, onMounted } from 'vue';
    import { Form, message } from 'ant-design-vue';
    // import type { FormInstance } from 'ant-design-vue';
    import { useInjectTool } from '../../../state';
    import { IClassificationAttr } from '../../../type';
    import { AttrType } from 'editor';

    import AttrValue from './AttrValue.vue';
    import Collapse from '../../Collapse/index.vue';

    let tool = useInjectTool();
    let state = tool.state;
    // const formRef = ref<FormInstance>();
    let attrMap = {} as Record<string, IClassificationAttr>;
    const classifications = computed(() => {
        let frame = tool.getCurrentFrame();
        let datas = frame?.classifications || [];

        datas.forEach((e) => {
            e.attrs.forEach((attr) => {
                attrMap[attr.id] = attr;
            });
        });

        // if (tool.editor.state.status === StatusType.Play) return oldDatas;

        return datas;
    });

    function getDataClassification() {
        let dataInfo = tool.state.dataList[tool.state.dataIndex];
        let classifications = dataInfo ? dataInfo.classifications : [];
        return classifications;
    }

    function onAttChange(name: string, value: any) {
        console.log(name, value);
        let dataInfo = tool.getCurrentFrame();
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
