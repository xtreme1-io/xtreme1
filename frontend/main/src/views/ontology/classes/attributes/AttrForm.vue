<template>
  <div class="basic-form">
    <FormHeader
      :dataSchema="props.dataSchema"
      :indexList="props.indexList"
      :isDisabled="props.isDisabled"
      @back="handleBack"
      @del="handleDelete"
    />
    <BasicForm
      @register="registerForm"
      :showActionButtonGroup="false"
      hideRequiredMark
      :disabled="props.isDisabled"
    >
      <template #inputType="{ model, field }">
        <Select
          v-model:value="model[field]"
          @change="handleChangeType"
          :disabled="props.isDisabled"
        >
          <Select.Option v-for="item in inputTypeList" :key="item.key" :value="item.value">
            <div class="img-tool">
              <img :src="item.img" alt="" />
              <span>{{ item.label }}</span>
            </div>
          </Select.Option>
        </Select>
      </template>
    </BasicForm>
    <Divider style="margin: 10px 0" />
    <OptionEditor
      v-if="isShow"
      type="options"
      v-model:showRequired="showEditorRequired"
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
  import { ref, onMounted, watch, inject, provide, nextTick } from 'vue';
  import { Divider, Select } from 'ant-design-vue';
  import { BasicForm, useForm } from '/@/components/Form';
  import OptionEditor from './OptionEditor.vue';
  import FormHeader from './FormHeader.vue';
  import FormDiscard from './FormDiscard.vue';
  import emitter from 'tiny-emitter/instance';
  import { attributeBase } from './formSchemas';
  import { getSchema } from './utils';
  import { ClassTypeEnum, inputTypeEnum } from '/@/api/business/model/classesModel';
  import { inputTypeList } from './data';
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
  list.value = parentData.attributes
    .map((item) => item.name)
    .filter((item) => item != currentData.value.name);

  // There must be option under attrForm
  watch(currentData.value.options, (newData) => {
    if (newData.length > 0) {
      showEditorRequired.value = false;
    }
  });

  const isShow = ref<boolean>(true);

  /** FormHeader */
  // Return to the previous level, you need to judge the length of options
  const handleBack = () => {
    emitter.emit('validateForm', {
      type: attributeOptionEnum.BACK,
    });
  };
  // Delete
  const handleDelete = () => {
    emits('del');
  };

  /** FormDiscard */
  // whether to display InnerDiscardModal
  const showDiscardModal = ref<boolean>(false);
  // Cancel Discard
  const handleCancelDiscard = () => {
    showDiscardModal.value = false;
  };
  // Confirm Discard
  const handleConfirmDiscard = () => {
    handleDelete();
  };
  // Whether to display the prompt information of Options
  // -- Required flag for optionEditor,
  const showEditorRequired = ref<boolean>(false);

  /** BasicForm */
  // register Form
  const [registerForm, { setFieldsValue, validate, clearValidate, getFieldsValue }] = useForm({
    schemas: attributeBase(list.value),
  });
  provide('getFieldsValue', getFieldsValue);
  const isInit = ref<boolean>(true);
  onMounted(() => {
    isInit.value = true;
    console.log('attr form mounted', currentData.value);

    setFieldsValue({ ...currentData.value });
    handleChangeType(currentData.value.type);

    nextTick(() => {
      isInit.value = false;
    });
  });
  // validation form - name
  const validateAttrForm = async () => {
    clearValidate();
    try {
      await validate();
      return true;
    } catch {
      return false;
    }
  };
  defineExpose({ validateForm: validateAttrForm });

  // Drop-down box toggle selection event
  const handleChangeType = (val) => {
    if (val === inputTypeEnum.TEXT) {
      isShow.value = false;
      // options need to be cleared
      handleSetDataSchema({
        setType: 'update',
        setValue: { options: [] },
      });
      currentData.value = getSchema(props.dataSchema, props.indexList);
    } else {
      isShow.value = true;
      currentData.value = getSchema(props.dataSchema, props.indexList);
    }
    emitter.emit('handleSaveForm');
  };

  emitter.off('validateForm');
  emitter.on('validateForm', async (config: { type: attributeOptionEnum; [prop: string]: any }) => {
    // 校验表单
    const res = await validateAttrForm();

    if (res) {
      // 没有需要保存的
      changeShowEdit(false);

      const formValue = getFieldsValue();
      console.log(formValue);
      // config?.type != attributeOptionEnum.FORM_UPDATE
      // 校验 options
      if (formValue.type != inputTypeEnum.TEXT && currentData.value.options.length == 0) {
        showEditorRequired.value = true;
        showDiscardModal.value = true;

        // If you click on the tree node, you need to prevent the tree selected node from changing
        if (config?.type == attributeOptionEnum.TREE_CLICK) {
          emitter.emit('changeSelected', config.selectList);
        }
      } else {
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
      }
      // 放行
    } else {
      // 取消当前操作，弹窗
      showDiscardModal.value = true;
      if (config?.type == attributeOptionEnum.TREE_CLICK) {
        emitter.emit('changeSelected', config.selectList);
      }
    }
  });

  emitter.off('handleSaveForm');
  emitter.on('handleSaveForm', async (params) => {
    if (isInit.value) return;
    let attrFormValue = await getFieldsValue();
    if (params) {
      attrFormValue = { ...attrFormValue, ...params };
    }
    console.log('attrFormValue =>', attrFormValue);

    handleSetDataSchema({
      setType: 'update',
      setValue: attrFormValue,
    });
  });
</script>
<style lang="less" scoped>
  @import url(./index.less);
</style>
