<template>
  <div class="basic-form">
    <FormHeader
      :dataSchema="props.dataSchema"
      :indexList="props.indexList"
      @back="handleBack"
      @del="handleDelete"
      :isDisabled="props.isDisabled"
    />
    <BasicForm
      @register="registerForm"
      :showActionButtonGroup="false"
      hideRequiredMark
      :disabled="props.isDisabled"
    />
    <Divider style="margin: 10px 0" />
    <OptionEditor
      type="attributes"
      :showRequired="showEditorRequired"
      :dataSchema="currentData"
      :isDisabled="props.isDisabled"
    />
    <FormDiscard
      :showModal="showDiscardModal"
      @cancel="handleCancelDiscard"
      @discard="handleConfirmDiscard"
    />
  </div>
</template>
<script lang="ts" setup>
  import { ref, onMounted, inject, provide, nextTick } from 'vue';
  import { Divider } from 'ant-design-vue';
  import { BasicForm, useForm } from '/@/components/Form';
  import OptionEditor from './OptionEditor.vue';
  import FormHeader from './FormHeader.vue';
  import FormDiscard from './FormDiscard.vue';
  import emitter from 'tiny-emitter/instance';
  import { optionBase } from './formSchemas';
  import { getSchema } from './utils';
  import { ClassTypeEnum } from '/@/api/business/model/classesModel';
  import { attributeOptionEnum } from './typing';

  const emits = defineEmits([
    'done',
    'del',
    'changeIndexList',
    'createSave',
    'valid',
    'update',
    'close',
  ]);
  const props = defineProps<{
    dataSchema?: any;
    indexList?: number[];
    activeTab?: ClassTypeEnum;
    isDisabled: boolean;
  }>();

  const handleSetDataSchema = inject('handleSetDataSchema', Function, true);
  const handleAddIndex = inject('handleAddIndex', Function, true);
  const changeShowEdit = inject('changeShowEdit', Function, true);

  const currentData = ref<any>();
  currentData.value = getSchema(props.dataSchema, props.indexList);

  const list = ref<string[]>([]);
  const newIndexList = [...(props.indexList ?? [])];
  newIndexList.pop();
  const parentData = getSchema(props.dataSchema, newIndexList);
  list.value = parentData.options
    .map((item) => item.name)
    .filter((item) => item != currentData.value.name);

  /** FormHeader */
  // Return to the previous level, you need to judge the length of options
  const handleBack = () => {
    emitter.emit('validateForm', {
      type: attributeOptionEnum.BACK,
    });
  };
  const handleDelete = () => {
    emits('del');
  };

  /** FormDiscard */
  // whether to display InnerDiscardModal
  const showDiscardModal = ref<boolean>(false);
  // cancel discard
  const handleCancelDiscard = () => {
    showDiscardModal.value = false;
  };
  // confirm discard
  const handleConfirmDiscard = () => {
    handleDelete();
  };

  // Whether to display the prompt information of Options
  const showEditorRequired = ref<boolean>(false);

  // register Form
  const [registerForm, { setFieldsValue, validate, clearValidate, getFieldsValue }] = useForm({
    schemas: optionBase(list.value),
  });
  provide('getFieldsValue', getFieldsValue);
  const isInit = ref<boolean>(true);
  onMounted(() => {
    isInit.value = true;

    setFieldsValue({ ...currentData.value });

    nextTick(() => {
      isInit.value = false;
    });
  });

  // validation form - name
  const validateOptionForm = async () => {
    clearValidate();
    try {
      await validate();
      return true;
    } catch {
      return false;
    }
  };

  emitter.off('validateForm');
  emitter.on('validateForm', async (config: { type: attributeOptionEnum; [prop: string]: any }) => {
    // 校验表单
    const res = await validateOptionForm();

    if (res) {
      // 没有需要保存的
      changeShowEdit(false);
      showEditorRequired.value = false;
      showDiscardModal.value = false;

      switch (config.type) {
        case attributeOptionEnum.NEXT:
          handleAddIndex(config?.index);
          break;
        case attributeOptionEnum.TREE_CLICK:
          emits('changeIndexList', config.indexList);
          break;
        case attributeOptionEnum.BACK:
          emits('done');
          break;
        case attributeOptionEnum.CONFIRM:
          emits('update');
          break;
        case attributeOptionEnum.CLOSE:
          emits('close');
          break;
      }
    } else {
      // 取消当前操作，弹窗
      showDiscardModal.value = true;
      if (config?.type == attributeOptionEnum.TREE_CLICK) {
        emitter.emit('changeSelected', config.selectList);
      }
    }
  });

  emitter.off('handleSaveForm');
  emitter.on('handleSaveForm', async () => {
    if (isInit.value) return;

    handleSetDataSchema({
      setType: 'update',
      setValue: getFieldsValue() as any,
    });
  });
</script>
<style lang="less" scoped>
  @import url(./index.less);
</style>
