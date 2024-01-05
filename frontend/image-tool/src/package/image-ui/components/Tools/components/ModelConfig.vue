<template>
  <a-tooltip
    trigger="click"
    placement="right"
    v-model:visible="iState.visible"
    @visibleChange="updateMapClassList()"
  >
    <span
      class="tool-trigger"
      :style="{
        color: iState.visible ? 'rgb(23, 125, 220)' : '',
      }"
      title="Setting"
    >
      <EllipsisOutlined style="font-size: 14px; border-top: 1px solid #4e4e4e" />
    </span>
    <template #title>
      <div ref="containerRef" class="tool-info-tooltip" style="width: 230px; padding: 0 4px">
        <div
          style="padding-bottom: 4px; font-size: 14px; color: white; border-bottom: 1px solid gray"
        >
          {{ editor.lang('AI Annotation Setting') }}
        </div>
        <div class="title2">
          <span style="vertical-align: middle; margin-right: 10px">
            {{ editor.lang('Model') }}
          </span>
        </div>
        <div class="title2">
          <a-select
            :getPopupContainer="() => containerRef"
            v-model:value="modelConfig.model"
            style="width: 100%; font-size: 12px"
            :options="options"
            :field-names="{ label: 'name', value: 'name' }"
          >
          </a-select>
        </div>
        <div class="title2">
          <a-checkbox v-model:checked="modelConfig.predict">
            {{ editor.lang('Predict all in Model') }}
          </a-checkbox>
        </div>
        <div v-show="!modelConfig.predict">
          <div v-show="modelConfig.confidence.length > 1">
            <div class="title2">{{ editor.lang('Confidence') }}</div>
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
          </div>
          <div class="title2">
            <span style="margin-right: 10px">{{ editor.lang('Model Classes') }}</span>
            <a @click.prevent.stop="() => onSelectAll()">
              {{ flag ? editor.lang('Select all') : editor.lang('Unselect all') }}
            </a>
          </div>
          <div class="title2" style="max-height: 60vh; overflow-y: auto">
            <a-tag
              style="user-select: none; cursor: pointer"
              :color="tag.selected ? '#177ddc' : ''"
              v-for="tag in curClasses"
              :key="tag.value"
              v-show="tag.isShow"
              @click="() => onTagSwitch(tag)"
            >
              {{ tag.label }}
              <CloseOutlined />
            </a-tag>
          </div>
        </div>
        <div
          class="title2"
          style="margin-top: 10px; padding-top: 6px; text-align: right; border-top: 1px solid gray"
        >
          <a-button size="small" @click="onReset" style="margin-right: 10px">
            {{ editor.lang('Reset') }}
          </a-button>
          <a-button :loading="loading" size="small" @click="onModelRun" type="primary">
            {{ editor.lang('Apply and Run') }}
          </a-button>
        </div>
      </div>
    </template>
  </a-tooltip>
</template>
<script lang="ts" setup>
  import { CloseOutlined, EllipsisOutlined } from '@ant-design/icons-vue';
  import { computed, watch, ref, reactive } from 'vue';
  import { useInjectEditor } from '../../../context';
  import { IModel, IModelClass, LoadStatus } from 'image-editor';

  // ***************Props and Emits***************
  const emit = defineEmits(['cancel', 'ok']);

  const editor = useInjectEditor();
  const { state } = editor;
  const containerRef = ref(null);
  const iState = reactive({
    visible: false,
    mapClassList: [] as IModelClass[],
  });
  const modelConfig = state.modelConfig;
  const loading = computed(() => {
    const frame = editor.getCurrentFrame();
    return frame?.model?.state === LoadStatus.LOADING;
  });
  const options = computed(() => {
    return state.models;
  });
  const updateMapClassList = () => {
    if (!iState.visible) return;
    const model = state.models.find((e) => e.name === modelConfig.model) as IModel;
    let list = [] as IModelClass[];
    if (model && model.mapClass) {
      const curClassMap = modelConfig.classes[modelConfig.model];
      list = Object.values(model.mapClass).map((e) => {
        const mapClass = e.modelClasses.map((mc: any) => {
          if (curClassMap[mc.code]) curClassMap[mc.code].isShow = false;
          return mc.code;
        });
        return {
          label: e.className,
          value: e.classId,
          selected: true,
          isShow: true,
          mapClass,
        } as IModelClass;
      });
    }
    iState.mapClassList = list;
  };
  watch(
    () => modelConfig.model,
    () => {
      const model = state.models.find((e) => e.name === modelConfig.model) as IModel;
      modelConfig.code = model?.code || '';
      modelConfig.confidence = [0.5, 1];
      const classes = model?.classes || [];
      if (modelConfig.model && !modelConfig.classes[modelConfig.model]) {
        const classMap: Record<string, IModelClass> = {};
        classes.forEach((modelClass) => {
          classMap[modelClass.code] = {
            code: modelClass.code,
            name: modelClass.name,
            label: modelClass.name,
            value: modelClass.code,
            selected: true,
            isShow: true,
          };
        });
        modelConfig.classes[modelConfig.model] = classMap;
      }
      if (model) updateMapClassList();
    },
    { immediate: true },
  );
  watch(
    () => [options.value],
    () => {
      const model = options.value[0];
      if (model) modelConfig.model = model.name;
    },
    { immediate: true },
  );
  /**
   * model class
   */
  const curClasses = computed(() => {
    return (Object.values(modelConfig.classes[modelConfig.model]) || []) as IModelClass[];
  });
  const flag = computed(() => {
    return !!curClasses.value.find((item) => !item.selected && item.isShow);
  });

  const onTagSwitch = function (classTag: IModelClass) {
    if (!classTag.isShow) return;
    classTag.selected = !classTag.selected;
    if (classTag.mapClass) {
      classTag.mapClass.forEach((code) => {
        const item = modelConfig.classes[modelConfig.model][code];
        item && (item.selected = classTag.selected);
      });
    }
  };
  function onSelectAll(selected?: boolean) {
    const _flag = typeof selected === 'boolean' ? selected : flag.value;
    Object.values(modelConfig.classes[modelConfig.model]).forEach((item) => {
      item.isShow && (item.selected = _flag);
    });
  }
  function onReset() {
    modelConfig.confidence = [0.5, 1];
    onSelectAll(true);
  }
  function onModelRun() {
    editor.runModel();
  }
</script>
