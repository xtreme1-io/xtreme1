<template>
    <a-tooltip trigger="click" placement="right" v-model:visible="iState.visible">
        <span
            class="item"
            :style="{
                'border-top-right-radius': 0,
                'border-top-left-radius': 0,
                'padding-bottom': '2px',
                'padding-top': 0,
                'margin-top': 0,
                color: iState.visible ? 'rgb(23, 125, 220)' : '',
            }"
            title="Setting"
        >
            <EllipsisOutlined style="font-size: 14px; border-top: 1px solid #4e4e4e" />
        </span>
        <template #title>
            <div
                ref="containerRef"
                class="tool-info-tooltip"
                style="width: 230px; padding: 0 4px 0 4px"
            >
                <div
                    style="
                        font-size: 14px;
                        color: white;
                        border-bottom: 1px solid gray;
                        padding-bottom: 4px;
                    "
                    >AI Annotation Setting</div
                >
                <div class="title2">
                    <span style="vertical-align: middle; margin-right: 10px">Model</span>
                    <!-- <div class="divider"></div> -->
                </div>
                <div class="title2">
                    <a-select
                        :getPopupContainer="() => containerRef"
                        v-model:value="modelConfig.model"
                        style="width: 100%; font-size: 12px"
                        :options="options"
                    >
                    </a-select>
                </div>
                <div class="title2">
                    <a-checkbox v-model:checked="modelConfig.predict"
                        >Predict all in Model</a-checkbox
                    >
                </div>
                <div v-show="!modelConfig.predict">
                    <div class="title2">Confidence</div>
                    <div class="title2" style="display: flex; flex-direction: row">
                        <div>
                            <a-input-number
                                v-model:value="modelConfig.confidence[0]"
                                size="small"
                                :min="0"
                                :max="modelConfig.confidence[1]"
                                :step="0.1"
                                style="width: 60px"
                            ></a-input-number>
                        </div>
                        <div style="flex: 1">
                            <a-slider
                                range
                                style="margin-right: 10px; padding: 0"
                                v-model:value="modelConfig.confidence"
                                :min="0"
                                :max="1"
                                :step="0.1"
                            />
                        </div>
                        <div>
                            <a-input-number
                                v-model:value="modelConfig.confidence[1]"
                                size="small"
                                :min="modelConfig.confidence[0]"
                                :max="1"
                                :step="0.1"
                                style="width: 60px"
                            />
                        </div>
                    </div>
                    <!-- <div class="title2">
                        <a-slider
                            range
                            style="margin-right: 10px"
                            v-model:value="modelConfig.confidence"
                            :min="0"
                            :max="1"
                            :step="0.1"
                        />
                    </div> -->
                    <div class="title2">
                        <span style="margin-right: 10px">Classes</span>
                        <a @click.prevent.stop="() => onSelectAll()">{{
                            flag ? 'Select all' : 'Unselect all'
                        }}</a>
                    </div>
                    <div class="title2" style="max-height: 60vh; overflow-y: auto">
                        <a-tag
                            style="user-select: none; cursor: pointer"
                            :color="tag.selected ? '#177ddc' : ''"
                            v-for="tag in curClasses"
                            :key="tag.value"
                            @click="() => onTagSwitch(tag.value)"
                        >
                            {{ tag.label }}
                            <CloseOutlined />
                        </a-tag>
                    </div>
                </div>
                <div
                    class="title2"
                    style="
                        text-align: right;
                        border-top: 1px solid gray;
                        margin-top: 10px;
                        padding-top: 6px;
                    "
                >
                    <a-button size="small" @click="onReset" style="margin-right: 10px"
                        >Reset</a-button
                    >
                    <a-button :loading="loading" size="small" @click="onModelRun" type="primary"
                        >Apply and Run</a-button
                    >
                </div>
            </div>
        </template>
    </a-tooltip>
</template>
<script lang="ts" setup>
    import { CloseOutlined, CaretRightOutlined, EllipsisOutlined } from '@ant-design/icons-vue';
    import { computed, watch, ref, reactive } from 'vue';
    import { useInjectTool } from '../../state';
    import useTool from './useTool';
    import { IModel } from '../../type';
    // ***************Props and Emits***************
    const emit = defineEmits(['cancel', 'ok']);
    const { runModel } = useTool();
    const containerRef = ref(null);
    const iState = reactive({
        visible: false,
    });
    // ***************Props and Emits***************
    let tool = useInjectTool();
    let modelConfig = tool.state.modelConfig;
    const loading = computed(() => {
        let state = tool.state;
        let dataInfo = state.dataList[state.dataIndex];
        return dataInfo && !!dataInfo.model && dataInfo.model.state === 'loading';
    });
    watch(
        () => modelConfig.model,
        () => {
            const model = tool.state.models.find((e) => e.name === modelConfig.model) as IModel;
            const classes = model?.classes || [];
            if (modelConfig.model && !modelConfig.classes[modelConfig.model]) {
                modelConfig.classes[modelConfig.model] = classes.map((e) => {
                    return {
                        label: e.label,
                        value: e.value,
                        selected: true,
                    };
                });
            }
        },
        { immediate: true },
    );
    watch(
        () => tool.state.models,
        () => {
            const model = tool.state.models[0];
            const modelConfig = tool.state.modelConfig;
            if (!modelConfig.model && model) {
                modelConfig.model = model.name;
            }
        },
        { immediate: true },
    );
    const onTagSwitch = function (value: string) {
        const classes = modelConfig.classes[modelConfig.model];
        if (classes) {
            const tag = classes.find((item) => item.value === value);
            if (tag) {
                tag.selected = !tag.selected;
            }
        }
    };
    const curClasses = computed(() => {
        return modelConfig.classes[modelConfig.model] || [];
    });
    const flag = computed(() => {
        return !!curClasses.value.find((item) => !item.selected);
    });
    function onSelectAll(selected?: boolean) {
        const _flag = typeof selected === 'boolean' ? selected : flag.value;
        (modelConfig.classes[modelConfig.model] || []).forEach((item) => {
            item.selected = _flag;
        });
    }
    let options = computed(() => {
        return tool.state.models.map((e) => {
            return { value: e.name, label: e.name };
        });
    });
    function onReset() {
        modelConfig.confidence = [0.5, 1];
        onSelectAll(true);
    }
    function onModelRun() {
        runModel();
    }
</script>
