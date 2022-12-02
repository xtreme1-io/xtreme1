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
    <OptionEditor
      type="attributes"
      :showRequired="showEditorRequired"
      :dataSchema="data"
      :handleSet="handleSet"
      :handleAddIndex="handleAddIndex"
    />
    <FormDiscard
      :showModal="showDiscardModal"
      @cancel="handleCancelDiscard"
      @discard="handleConfirmDiscard"
    />
  </div>
</template>
<script lang="ts" setup>
  import { ref, unref, onMounted, inject } from 'vue';
  import { Divider } from 'ant-design-vue';
  import { BasicForm, useForm } from '/@/components/Form';
  import OptionEditor from './OptionEditor.vue';
  import FormHeader from './FormHeader.vue';
  import FormDiscard from './FormDiscard.vue';
  import emitter from 'tiny-emitter/instance';
  import { optionBase } from './formSchemas';
  import { getSchema, handleMutiTabAction, setClassSchema, setSchema } from './utils';
  import { ClassTypeEnum } from '/@/api/business/model/ontologyClassesModel';

  const emits = defineEmits(['done', 'del', 'changeIndexList', 'createSave', 'valid']);
  const props = defineProps<{
    dataSchema?: any;
    handleSet?: Function;
    handleAddIndex?: Function;
    indexList?: number[];
    activeTab?: ClassTypeEnum;
  }>();

  const data = getSchema(props.dataSchema, props.indexList);
  const { handleSet, handleAddIndex } = unref(props);

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
  const [registerForm, { setFieldsValue, validate, getFieldsValue }] = useForm({
    schemas: optionBase,
  });
  // validation form - name
  const validateOptionForm = async () => {
    try {
      await validate();
      return true;
    } catch {
      return false;
    }
  };

  const isShowEdit = inject('isShowEdit');

  emitter.off('handleSaveForm');
  emitter.on('handleSaveForm', async (params?) => {
    const res = await validateOptionForm();
    if (res) {
      if ((isShowEdit as any).value) {
        showDiscardModal.value = true;
        if (params?.type == 'tree') {
          emitter.emit('changeSelected', params.selectList);
        }
        return;
      }
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
        props.handleAddIndex && props.handleAddIndex(params?.index);
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
    } else {
      showDiscardModal.value = true;
      // Prevent tree selected node from changing
      if (params?.type == 'tree') {
        emitter.emit('changeSelected', params.selectList);
      }
    }
  });
  onMounted(() => {
    setFieldsValue({
      ...data,
    });
  });
</script>
<style lang="less" scoped>
  @import url(./index.less);
</style>
