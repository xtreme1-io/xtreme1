<template>
    <Collapse header="Classifications">
        <a-popover placement="bottomRight">
            <template #content>
                <p>Please fill in as required</p>
            </template>
            <i v-if="state.showVerify" class="verify iconfont icon-remind"></i>
        </a-popover>
        <div class="operation-classification">
            <Form layout="vertical" :model="attrMap" ref="formRef">
                <template v-if="state.classifications.length > 0">
                    <div
                        ref="classificationWrap"
                        class="classification-wrap"
                        v-for="item in getDataClassification()"
                        :key="item.id"
                    >
                        <AttrValue
                            v-for="attr in item.attrs"
                            :key="attr.id + '#' + state.dataIndex"
                            v-show="isAttrVisible(attr)"
                            :visible="isAttrVisible(attr)"
                            @change="onAttChange"
                            :item="attr"
                            @toggle="handleToggle"
                            @validate="handleValidate"
                        />
                    </div>
                </template>
                <div v-else class="no-info">No Data</div>
            </Form>
        </div>
    </Collapse>
</template>

<script setup lang="ts">
    import { computed, watch, ref, onMounted } from 'vue';
    import { Form, message } from 'ant-design-vue';
    import type { FormInstance } from 'ant-design-vue';
    import { useInjectTool } from '../../../state';
    import { IClassificationAttr } from '../../../type';
    import { AttrType } from 'editor';

    import AttrValue from './AttrValue.vue';
    import Collapse from '../../Collapse/index.vue';

    let tool = useInjectTool();
    let state = tool.state;
    const formRef = ref<FormInstance>();
    onMounted(() => {
        state.classificationForm = formRef.value;
    });
    let attrMap = computed(() => {
        let dataInfo = tool.state.dataList[tool.state.dataIndex] || {};

        let attrMap = {} as Record<string, IClassificationAttr>;
        (dataInfo.classifications || []).forEach((e) => {
            e.attrs.forEach((attr) => {
                attrMap[attr.id] = attr;
            });
        });

        return attrMap;
    });
    function getDataClassification() {
        let dataInfo = tool.state.dataList[tool.state.dataIndex];
        let classifications = dataInfo ? dataInfo.classifications : [];
        return classifications;
    }

    function onAttChange(name: string, value: any) {
        let dataInfo = tool.state.dataList[tool.state.dataIndex];
        dataInfo.needSave = true;

        validateArr.value = [];
        state.classificationForm.validate();
    }

    function isItemVisible(attr: IClassificationAttr): boolean {
        let parentAttr = attrMap.value[attr.parent];
        return parentAttr.type !== AttrType.MULTI_SELECTION
            ? parentAttr.value === attr.parentValue
            : (parentAttr.value as any[]).indexOf(attr.parentValue) >= 0;
    }

    function isAttrVisible(attr: IClassificationAttr): boolean {
        if (!attr.parent) return true;
        let parentAttr = attrMap.value[attr.parent];
        return isItemVisible(attr) && isAttrVisible(parentAttr);
    }

    const classificationWrap = ref(null);
    const handleToggle = (id: string | number) => {
        return;
        const index = getDataClassification().findIndex((item) => item.id == id);
        // console.log(index);
        // return;
        if ((classificationWrap.value as any)[index].style.height == '28px') {
            (classificationWrap.value as any)[index].style.height = 'auto';
            (classificationWrap.value as any)[index].style.overflow = 'unset';
        } else {
            (classificationWrap.value as any)[index].style.height = '28px';
            (classificationWrap.value as any)[index].style.overflow = 'hidden';
        }
    };

    const validateArr = ref<boolean[]>([]);
    const handleValidate = (isValid: boolean) => {
        validateArr.value.push(isValid);
    };
    const showVerify = computed<boolean>(() => {
        // console.log(validateArr.value);
        return !validateArr.value.every((item) => item);
    });
    watch(showVerify, () => {
        state.showVerify = showVerify.value as any;
    });

    const checkValueForIcon = () => {
        const res = getDataClassification();
        res.forEach((item) => {
            item.attrs.forEach((target) => {
                if (!isAttrVisible(target)) return;

                if (!target.required) {
                    handleValidate(true);
                }

                if (target.required && target.value.length) {
                    handleValidate(true);
                }

                handleValidate(false);
            });
        });
    };
</script>

<style lang="less">
    .operation-classification {
        position: relative;
        text-align: left;
        padding: 4px 10px;
        max-height: 350px;
        overflow-y: overlay;
        overflow-x: hidden;
        .ant-form-item {
            margin-bottom: 0;
        }
        .ant-form-item-label
            > label.ant-form-item-required:not(.ant-form-item-required-mark-optional)::before {
            position: relative;
            top: 0px;
            font-size: 18px;
        }
    }
    .ant-collapse-item {
        position: relative;
    }
    .verify {
        position: absolute;
        top: 14px;
        z-index: 999;
        right: 10px;
        color: #f00;
        font-size: 12px;
    }
</style>
