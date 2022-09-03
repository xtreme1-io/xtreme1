<template>
    <div class="modal-model-run">
        <a-row>
            <a-col>
                <span style="margin-right: 10px; font-size: 16px">Model</span>
            </a-col>
            <a-col :flex="1">
                <a-select v-model:value="state.model" style="width: 100%" :options="options">
                </a-select>
            </a-col>
        </a-row>
        <!-- predict  -->
        <a-row>
            <a-col>
                <a-checkbox v-model:checked="state.predict">Predict all In Model</a-checkbox>
            </a-col>
        </a-row>
        <div v-show="!state.predict">
            <!-- confidence -->
            <a-row>
                <a-col
                    ><span style="margin-right: 10px; font-size: 16px">Confidence</span>
                    <a-input-number
                        v-model:value="state.confidence[0]"
                        size="small"
                        :min="0"
                        :max="state.confidence[1]"
                        :step="0.1"
                        style="width: 60px"
                    ></a-input-number
                ></a-col>
                <a-col :flex="1" style="padding: 0 18px 0 8px">
                    <a-slider
                        range
                        style="width: 100%; display: inline-block"
                        v-model:value="state.confidence"
                        size="small"
                        :min="0"
                        :max="1"
                        :step="0.1"
                /></a-col>
                <a-col>
                    <a-input-number
                        v-model:value="state.confidence[1]"
                        size="small"
                        :min="state.confidence[0]"
                        :max="1"
                        :step="0.1"
                        style="width: 60px"
                    />
                </a-col>
            </a-row>
            <!-- Classes / Select all -->
            <a-row>
                <a-col>
                    <span style="margin-right: 10px; font-size: 16px">Classes</span>
                    <a @click.prevent.stop="onSelectAll" style="font-size: 16px">Select all</a>
                </a-col>
            </a-row>
            <a-row>
                <a-col :span="24" style="line-height: 30px">
                    <a-tag
                        style="user-select: none; cursor: pointer"
                        :color="tag.selected ? '#177ddc' : ''"
                        v-for="tag in curClasses"
                        :key="tag.code"
                        @click="() => onTagSwitch(tag.code)"
                    >
                        {{ tag.name }}
                        <CloseOutlined />
                    </a-tag>
                </a-col>
            </a-row>
        </div>
        <div style="text-align: right; margin-top: 20px">
            <a-button style="width: 100px" @click="onCancel">Cancel</a-button>
            <a-button
                type="primary"
                style="width: 100px; margin-left: 10px"
                :loading="state.loading"
                :disabled="!state.model"
                @click="onOk"
                >Run</a-button
            >
        </div>
    </div>
</template>

<script setup lang="ts">
    import { CloseOutlined } from '@ant-design/icons-vue';
    import { reactive, computed, watch } from 'vue';
    import { useInjectTool } from '../../state';
    import * as api from '../../api';
    import { IModel } from '../../type';
    // ***************Props and Emits***************
    const emit = defineEmits(['cancel', 'ok']);
    const props = withDefaults(
        defineProps<{
            data: {};
        }>(),
        {
            data: () => {
                return {};
            },
        },
    );
    // ***************Props and Emits***************
    interface IClass {
        name: string;
        code: string;
        selected: boolean;
    }
    let tool = useInjectTool();
    let state = reactive({
        confidence: [0.5, 1],
        predict: true,
        classes: {} as { [key: string]: IClass[] },
        model: '',
        loading: false,
    });
    watch(
        () => state.model,
        () => {
            const model = tool.state.models.find((e) => e.name === state.model) as IModel;
            const classes = model?.classes || ([] as IClass[]);
            if (!state.classes[state.model]) {
                state.classes[state.model] = classes.map((klass) => {
                    return {
                        ...klass,
                        selected: true,
                    };
                });
            }
        },
        { immediate: true },
    );
    const onTagSwitch = function (code: string) {
        const classes = state.classes[state.model];
        if (classes) {
            const tag = classes.find((item: any) => item.code === code);
            if (tag) {
                tag.selected = !tag.selected;
            }
        }
    };
    const curClasses = computed(() => {
        return state.classes[state.model] || [];
    });
    function onSelectAll() {
        (state.classes[state.model] || []).forEach((item) => {
            item.selected = true;
        });
    }
    let options = computed(() => {
        return tool.state.models.map((e) => {
            return { value: e.name, label: e.name };
        });
    });

    function valid(): Promise<boolean> {
        return Promise.resolve(true);
    }

    function onCancel() {
        emit('cancel');
    }

    async function onOk() {
        let toolState = tool.state;

        let data = toolState.dataList[toolState.dataIndex];
        let model = toolState.models.find((e) => e.name === state.model) as IModel;
        const resultFilterParam = {
            minConfidence: 0.5,
            maxConfidence: 1,
            classes: model?.classes.map((item) => item.code),
        };
        if (!state.predict) {
            const selectedClasses = (state.classes[state.model] || []).reduce((classes, item) => {
                if (item.selected) {
                    classes.push(item.code);
                }
                return classes;
            }, [] as string[]);
            resultFilterParam.minConfidence = state.confidence[0];
            resultFilterParam.maxConfidence = state.confidence[1];
            resultFilterParam.classes = selectedClasses;
        }
        let config = {
            datasetId: data.datasetId,
            dataIds: [+data.dataId],
            modelId: +model.id,
            modelVersion: model?.version,
            dataType: 'SINGLE_DATA',
            modelCode: model.code,
            // annotationRecordId: +toolState.recordId,
            resultFilterParam,
        };

        state.loading = true;
        try {
            let result = await api.runModel(config);
            if (!result.data) throw new Error('Model Run Error');
            data.model = {
                recordId: result.data,
                id: model.id,
                version: model.version,
                state: 'loading',
            };
        } catch (error) {
            tool.editor.showMsg('error', 'Model Run Error');
        }
        state.loading = false;

        tool.dataManager.pollDataModelResult();
        emit('ok');
    }

    function getData(): any {
        return {
            ...state,
        };
    }

    defineExpose({
        valid,
        getData,
    });
</script>

<style lang="less">
    .modal-model-run {
        padding: 0 40px;
        .ant-row {
            display: flex;
            align-items: center;
            min-height: 40px;
        }
    }
</style>
