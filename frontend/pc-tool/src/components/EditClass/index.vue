<template>
    <!-- <div class="edit-class-common"> -->
    <div class="edit-class-common" v-show="state.objectId">
        <div class="view-class-wrap" ref="container">
            <a-collapse v-model:activeKey="state.activeTab">
                <a-collapse-panel key="cuboid">
                    <template #header="{ isActive }">
                        <span class="item-header">
                            <span class="title1">{{ 'Cuboid' + ' ' + state.trackName }}</span>
                            <template v-if="!state.isBatch && !state.isInvisible">
                                <EyeInvisibleOutlined
                                    @click.stop="onToggleTrackVisible"
                                    v-if="!state.trackVisible"
                                    class="title-icon"
                                />
                                <EyeOutlined
                                    @click.stop="onToggleTrackVisible"
                                    v-else
                                    class="title-icon"
                                />
                            </template>
                        </span>
                    </template>
                    <div v-show="state.modelClass">
                        <div class="sub-header">{{ $$('predict-class') }}</div>
                        <div>
                            <span class="item limit active"
                                ><FileMarkdownOutlined />{{ state.modelClass }}
                            </span>
                        </div>
                    </div>
                    <ObjectClass @change="onClassChange" :state="state" />
                </a-collapse-panel>

                <a-collapse-panel v-show="state.attrs.length > 0" key="attribute">
                    <template #header="{ isActive }">
                        <span class="item-header">
                            <span class="title1">
                                {{ 'Attributes' }}
                            </span>
                        </span>
                    </template>
                    <ObjectAttr :state="state" @change="onAttChange" @copy-from="copyAttrFrom" />
                </a-collapse-panel>
                <a-collapse-panel key="objects" v-if="TState.imgViews.length > 0">
                    <template #header="{ isActive }">
                        <span class="item-header">
                            <span class="title1">
                                {{ 'Objects' }}
                            </span>
                        </span>
                    </template>
                    <ObjectItem
                        v-for="item in state.resultInstances"
                        :data="item"
                        @remove="onObjectInstanceRemove(item)"
                    />
                </a-collapse-panel>
            </a-collapse>
        </div>
        <CloseCircleOutlined v-show="showClose" @click="onClose" class="close" />
    </div>
</template>

<script setup lang="ts">
    import { useInjectEditor } from '../../state';
    import {
        EyeOutlined,
        DeleteOutlined,
        CloseCircleOutlined,
        FileMarkdownOutlined,
        EyeInvisibleOutlined,
        CopyOutlined,
    } from '@ant-design/icons-vue';
    import * as _ from 'lodash';
    import * as locale from './lang';
    import { Const } from 'pc-editor';

    import ObjectItem from './ObjectItem.vue';
    import ObjectClass from './ObjectClass.vue';
    import ObjectAttr from './ObjectAttr.vue';

    import useUI from '../../hook/useUI';
    import useEditClass from './useEditClass';
    import { computed, ref, onMounted } from 'vue';

    interface IProps {
        // option: IClassOption;
        showClose: boolean;
    }

    // ***************Props and Emits***************
    let props = defineProps<IProps>();
    // let emit = defineEmits(['close']);
    // let props = defineProps<IProps>();
    // *********************************************

    let container = ref(null as any as HTMLDivElement);
    let { canEdit } = useUI();
    let editor = useInjectEditor();
    let TState = editor.state;
    // let EState = editor.state;
    let $$ = editor.bindLocale(locale);

    onMounted(() => {
        container.value.addEventListener('scroll', editor.blurPage);
    });

    let statusList = computed(() => {
        const data = [
            { value: Const.True_Value, label: $$('True-Value') },
            { value: Const.Predicted, label: $$('Predicted') },
            { value: Const.Copied, label: $$('Copied') },
        ];
        return data;
    });

    // function onStatusChange(e: any) {
    //     editor.blurPage();
    //     onObjectStatusChange(e.target.value);
    // }

    function onClose() {
        // emit('close');
        control.close();
    }

    let {
        state,
        update,
        control,
        onAttChange,
        onClassChange,
        onInstanceRemove,
        onToggleObjectsVisible,
        onRemoveObjects,
        // onObjectStatusChange,
        onObjectInstanceRemove,
        copyAttrFrom,
        onToggleTrackVisible,
        // toggleStandard,
    } = useEditClass();
    defineExpose({
        update,
    });
</script>

<style lang="less">
    .edit-class-common {
        position: relative;
        height: 100%;

        .view-class-wrap {
            overflow: auto;
            max-height: calc(100vh - 300px);
            min-height: 200px;
            padding: 0px 32px;
        }

        .attr-container {
            margin-top: 4px;
            max-height: 300px;
            overflow: auto;
        }

        .instance-list {
            max-height: 200px;
            overflow-y: auto;
            // min-height: 100px;
        }

        .close {
            position: absolute;
            right: 10px;
            top: 10px;
            font-size: 20px;
        }

        .class-list {
            text-align: left;
        }

        .attr-item {
            text-align: left;
            .name {
                font-size: 14px;
                line-height: 34px;
            }

            .value {
                padding: 4px 0px;
            }
        }

        .item {
            background: #303036;
            padding: 4px 6px;
            margin-right: 8px;
            margin-bottom: 8px;
            white-space: nowrap;
            border-radius: 3px;
            display: inline-block;
            cursor: pointer;
            vertical-align: middle;
            max-width: 140px;

            .anticon,
            .iconfont {
                margin-right: 4px;
            }

            &.active,
            &:hover {
                background: #2e8cf0;
                color: white !important;
            }
        }

        .item-header {
            height: 40px;
            display: flex;
            align-items: center;
            color: #d5d5d5;
        }

        .sub-header {
            height: 40px;
            display: flex;
            align-items: center;
            color: white;
        }

        .item-content {
            padding-left: 20px;
        }

        .title-icon {
            font-size: 18px;
            margin-left: 4px;
            cursor: pointer;
        }

        .title1 {
            font-size: 14px;
            font-weight: bold;
        }
        .title2 {
            font-size: 12px;
            line-height: 20px;
            color: #bfbfbf;
        }

        .copy {
            font-size: 16px;
            margin-left: 6px;
            cursor: pointer;
        }

        .ant-input,
        .no-attrs,
        .ant-select-single .ant-select-selector .ant-select-selection-item,
        .ant-radio-button-wrapper,
        .attr-item .name,
        .ant-radio-wrapper {
            color: #cbcbcb;
        }

        .ant-radio-button-wrapper,
        .ant-radio-button-wrapper:first-child {
            border: 1px solid #177ddc;
        }

        .ant-radio-button-wrapper:hover {
            border: 1px solid #177ddc;
            color: white;
        }

        .ant-radio-button-wrapper-checked {
            background: #177ddc;
            color: white;
        }

        .class-msg-box {
            padding: 10px;
            border: 1px solid #3a3a3a;
            margin-top: 10px;

            .content-wrap {
                color: #b1b1b1;
            }

            .btn {
                text-align: right;
                margin-top: 10px;
            }
        }

        .pick {
            font-size: 18px;
            margin-left: 10px;
            cursor: pointer;
        }

        // ant
        .ant-collapse-header {
            padding: 0px !important;
        }
        .ant-collapse {
            border: none;
            background-color: #1e1f23;
        }
        .ant-collapse-content-box {
            background: #1e1f23 !important;
        }

        .ant-collapse-content {
            border: none;
            background-color: #1e1f23;
        }

        .ant-collapse > .ant-collapse-item > .ant-collapse-header .ant-collapse-arrow {
            left: -15px;
        }
    }
</style>
