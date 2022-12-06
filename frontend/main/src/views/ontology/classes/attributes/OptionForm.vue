<template>
  <div class="basic-form">
    <FormHeader
      :dataSchema="props.dataSchema"
      :indexList="props.indexList"
      @back="handleBack"
      @del="handleDelete"
    />
    <BasicForm @register="registerForm" :showActionButtonGroup="false" hideRequiredMark />
    <Divider style="margin: 10px 0" />
    <OptionEditor type="attributes" :showRequired="showEditorRequired" :dataSchema="data" />
    <FormDiscard
      :showModal="showDiscardModal"
      @cancel="handleCancelDiscard"
      @discard="handleConfirmDiscard"
    />
  </div>
</template>
<script lang="ts" setup>
  import { ref, onMounted, inject, provide } from 'vue';
  import { Divider } from 'ant-design-vue';
  import { BasicForm, useForm } from '/@/components/Form';
  import OptionEditor from './OptionEditor.vue';
  import FormHeader from './FormHeader.vue';
  import FormDiscard from './FormDiscard.vue';
  import emitter from 'tiny-emitter/instance';
  import { optionBase } from './formSchemas';
  import { getSchema, handleMutiTabAction, setClassSchema, setSchema } from './utils';
  import { ClassTypeEnum } from '/@/api/business/model/classesModel';

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
  }>();

  const handleAddIndex = inject('handleAddIndex', Function, true);
  const changeShowEdit = inject('changeShowEdit', Function, true);

  const data = getSchema(props.dataSchema, props.indexList);

  const list = ref<string[]>([]);
  const newIndexList = [...(props.indexList ?? [])];
  newIndexList.pop();
  const parentData = getSchema(props.dataSchema, newIndexList);
  list.value = parentData.options.map((item) => item.name).filter((item) => item != data.name);

  /** FormHeader */
  // Return to the previous level, you need to judge the length of options
  const handleBack = () => {
    emitter.emit('handleSaveForm', {
      type: 'back',
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
  onMounted(() => {
    setFieldsValue({
      ...data,
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

  emitter.off('handleSaveForm');
  emitter.on('handleSaveForm', async (params?) => {
    const res = await validateOptionForm();
    if (res) {
      changeShowEdit(false);

      handleMutiTabAction(
        props.activeTab,
        () => {
          setClassSchema(props.dataSchema, props.indexList, {
            setType: 'update',
            setValue: getFieldsValue() as any,
          });
        },
        () => {
          setSchema(props.dataSchema, props.indexList, {
            setType: 'update',
            setValue: getFieldsValue() as any,
          });
        },
      );

      // If it's Go , go to index
      if (params?.type == 'go') {
        handleAddIndex(params?.index);
      }

      // If it is a tree data click, update the indexList value, to update the data on the right
      if (params?.type == 'tree') {
        emits('changeIndexList', params.indexList);
      }

      // If it returns, throw done
      if (params?.type == 'back') {
        emits('done');
      }

      // create or save
      if (params?.type == 'create') {
        emits('createSave', params.data);
      }

      if (params?.type == 'confirm') {
        emits('update');
      }
      if (params?.type == 'close') {
        emits('close');
      }
    } else {
      showDiscardModal.value = true;
      // Prevent tree selected node from changing
      if (params?.type == 'tree') {
        emitter.emit('changeSelected', params.selectList);
      }
    }
  });
</script>
<style lang="less" scoped>
  @import url(./index.less);
</style>
