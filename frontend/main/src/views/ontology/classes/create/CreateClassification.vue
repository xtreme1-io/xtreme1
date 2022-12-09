<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="modalTitle"
    :width="640"
    :height="450"
    destroyOnClose
    @cancel="handleCancel"
    @ok="handleCreateSave"
    :okText="okText"
  >
    <div class="create_content">
      <div class="content-item">
        <div class="title">Basic Info</div>
        <div class="content">
          <Form
            ref="formRef"
            :model="formState"
            :rules="rules"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            hideRequiredMark
            labelAlign="left"
          >
            <div class="form-wrapper">
              <div class="form-wrapper-left">
                <Form.Item :label="t('common.nameText')" name="name">
                  <Input
                    style="width: 160px"
                    autocomplete="off"
                    v-model:value="formState.name"
                    :placeholder="t('business.ontology.createHolder')"
                    allow-clear
                  />
                </Form.Item>
              </div>
              <div class="form-wrapper-right">
                <Form.Item :label="t('business.class.inputType')">
                  <Select v-model:value="formState.inputType">
                    <Select.Option
                      v-for="item in inputTypeList"
                      :key="item.key"
                      :value="item.value"
                    >
                      <div class="img-tool">
                        <img :src="item.img" alt="" />
                        <span>{{ item.label }}</span>
                      </div>
                    </Select.Option>
                  </Select>
                </Form.Item>
              </div>
            </div>
            <div class="form-wrapper">
              <div class="form-wrapper-left">
                <Form.Item :label="t('business.class.isRequired')">
                  <Switch v-model:checked="formState.isRequired" />
                </Form.Item>
              </div>
            </div>
          </Form>
        </div>
      </div>
      <div class="content-item">
        <div class="title">Related by (999)</div>
      </div>
      <div class="content-item">
        <div class="title">
          <span>Attributes (N)</span>
          <Button type="primary" @click="handleManageAttr">
            {{ 'Manage attributes' }}
          </Button>
        </div>
      </div>
    </div>
  </BasicModal>
  <!-- Modal -->
  <TheAttributes
    @register="registerAttrModal"
    @back="handleBack"
    @update="handleUpdateDataSchema"
    :formState="formState"
    :dataSchema="dataSchema"
    :activeTab="ClassTypeEnum.CLASSIFICATION"
    :datasetType="props.datasetType"
    :datasetId="props.datasetId"
    :ontologyId="props.ontologyId"
    :isCenter="props.isCenter"
    :classificationId="props.classificationId"
    :title="`${modalTitle}/Options`"
  />
</template>

<script lang="ts" setup>
  import { ref, reactive, watch, unref } from 'vue';
  // components
  import { Form, Select, Switch, Input } from 'ant-design-vue';
  // import { RuleObject } from 'ant-design-vue/es/form/interface';
  import { useModal, BasicModal, useModalInner } from '/@/components/Modal';
  import { Button } from '/@@/Button';
  import TheAttributes from '../attributes/TheAttributes.vue';
  import { inputTypeList } from '../attributes/data';
  // utils
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import emitter from 'tiny-emitter/instance';
  import _ from 'lodash';
  import { handleAddUuid, validateName } from './utils';
  // interface
  import { IClassificationForm, IDataSchema } from './typing';
  import { inputTypeEnum } from '/@/api/business/model/classesModel';
  import { ClassTypeEnum } from '/@/api/business/model/classModel';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  import {
    updateOntologyClassificationApi,
    createOntologyClassificationApi,
    createDatasetClassificationApi,
    updateDatasetClassificationApi,
  } from '/@/api/business/classes';

  const { t } = useI18n();
  const { createMessage } = useMessage();
  // const handleRefresh = inject('handleRefresh', Function, true);
  const props = defineProps<{
    detail?: any;
    handleSet?: Function;
    isCenter?: boolean;
    datasetType?: datasetTypeEnum;
    datasetId?: number;
    ontologyId?: number | null;
    classificationId?: number;
  }>();
  const emits = defineEmits(['fetchList', 'submit', 'valid', 'changed', 'manage']);

  /** Init */
  const baseFormName = ref<string>('');
  const modalTitle = ref<string>('Create New Classification');
  const okText = ref<string>('Create');
  const [registerModal, { closeModal, changeOkLoading, setModalProps }] = useModalInner(
    (config) => {
      console.log(config);
      // from attributes
      if (config.isKeep) {
        console.log(formState);
        return;
      }
      console.log(props.detail);
      // from Edit
      if (config.isEdit) {
        modalTitle.value = 'Edit Classification';
        okText.value = 'Save';
        setModalProps({
          title: 'Edit Classification',
          okText: 'Save',
        });
        formState.name = props.detail.name;

        formState.inputType = props.detail.inputType;
        formState.isRequired = props.detail.isRequired;

        baseFormName.value = props.detail.name;
        emitter.emit('changeRootName', props.detail.name);

        dataSchema.value = {
          options: props.detail.options ?? [],
        };

        defaultFormState.value = JSON.parse(JSON.stringify(unref(props.detail)));
      } else {
        modalTitle.value = 'Create New Classification';
        okText.value = 'Create';
        setModalProps({
          title: 'Create New Classification',
          okText: 'Create',
        });
        dataSchema.value = {
          options: [],
        };
        formState.name = undefined;
        formState.inputType = inputTypeEnum.RADIO;
        formState.isRequired = false;
        defaultFormState.value = JSON.parse(JSON.stringify(unref(formState)));
      }
      console.log(formState);
    },
  );

  /** Form */
  const labelCol = { span: 8 };
  const wrapperCol = { span: 12, offset: 1 };
  const formRef = ref();
  const formState: IClassificationForm = reactive({
    name: undefined,
    inputType: inputTypeEnum.RADIO,
    isRequired: false,
  });
  defineExpose({ formState });
  /** Rules */
  const rules = {
    name: [
      { required: true, validator: validateName, trigger: 'change' },
      { max: 256, message: t('business.ontology.maxLength') },
    ],
  };

  // Watch inputType changes
  const isShow = ref<boolean>(true);
  watch(
    () => formState.inputType,
    (newVal) => {
      // console.log('inputType changed');
      if (newVal === inputTypeEnum.TEXT) {
        isShow.value = false;
        // need clear options
        props.handleSet &&
          props.handleSet({
            setType: 'update',
            setValue: { options: [] },
          });
      } else {
        isShow.value = true;
      }
    },
  );

  /** isChanged */
  // The default FormState
  const defaultFormState = ref<any>({});
  // Watch data changes
  const stopWatchFormState = watch(formState, (value) => {
    const flag = isObjectChange(unref(defaultFormState), unref(value));
    if (!flag) {
      // Throws a change state event
      emits('changed');
      // Stop Watch
      stopWatchFormState();
    }
  });
  // Check if objects are equal
  const isObjectChange = (source, comparison): boolean => {
    const _source = JSON.stringify(source);
    const _comparison = JSON.stringify({ ...source, ...comparison });

    return _source == _comparison;
  };

  /** Manage Attributes */
  const dataSchema = ref<IDataSchema>({ options: [] });
  const handleUpdateDataSchema = (newDataSchema: IDataSchema) => {
    dataSchema.value = newDataSchema;
  };

  const [registerAttrModal, { openModal: openAttrModal, closeModal: closeAttrModal }] = useModal();
  const handleManageAttr = () => {
    openAttrModal(true, {});
  };
  const handleBack = () => {
    closeAttrModal();
  };

  /** Cancel */
  const handleCancel = () => {
    closeModal();
  };
  const handleReset = () => {
    dataSchema.value = { options: [] };
  };

  /** Create */
  const handleCreateSave = async (data) => {
    console.log('createSave: ', data);

    await formRef.value.validate();

    handleAddUuid(dataSchema.value.options);
    const params: any = {
      id: props.detail?.id ?? undefined,
      ontologyId: props.ontologyId ?? undefined,
      name: formState.name as string,
      inputType: formState.inputType,
      isRequired: formState.isRequired,
      options: dataSchema.value.options as any[],
      datasetId: props.datasetId ?? undefined,
      classificationId: props.classificationId ?? undefined,
    };
    console.log('The create/save params is :', params);

    try {
      changeOkLoading(true);
      if (props.isCenter) {
        if (params.id) {
          await updateOntologyClassificationApi(params);
        } else {
          await createOntologyClassificationApi(params);
        }
      } else {
        if (params.id) {
          await updateDatasetClassificationApi(params);
        } else {
          await createDatasetClassificationApi(params);
        }
      }
      handleReset();
      closeModal();
      emits('fetchList');
    } catch (error) {
      createMessage.error(String(error));
    }
    changeOkLoading(false);
  };
</script>

<style lang="less" scoped>
  @import url(./index.less);
</style>
