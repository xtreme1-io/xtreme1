<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="modalTitle"
    :width="640"
    destroyOnClose
    @cancel="handleCancel"
    @ok="handleCreateSave"
    :okText="okText"
  >
    <div class="create_content classification_create">
      <div class="content-item">
        <div class="title">Basic Info</div>
        <div class="content">
          <Form ref="formRef" :model="formState" :rules="rules" hideRequiredMark labelAlign="left">
            <div class="form-wrapper">
              <div class="form-wrapper-left">
                <Form.Item :label="t('common.nameText')" name="name">
                  <Input
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
                      <Tooltip :title="item.label">
                        <div class="img-tool">
                          <img :src="item.img" alt="" />
                          <span>{{ item.label }}</span>
                        </div>
                      </Tooltip>
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
      <!-- <div class="content-item">
        <div class="title">Related by (999)</div>
      </div> -->
      <div class="content-item">
        <div class="title">
          <span>Options ({{ optionsNum }})</span>
          <Button type="primary" @click="handleManageAttr" :disabled="isDisabled">
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
    :isCenter="props.isCenter"
    :title="`${modalTitle}/Options`"
  />
</template>

<script lang="ts" setup>
  import { ref, reactive, watch, unref, inject, computed } from 'vue';
  // components
  import { Form, Select, Switch, Input, Tooltip } from 'ant-design-vue';
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
  import {
    handleAddUuid,
    getCreateClassificationParams,
    getDefaultCreateClassificationFormState,
    isObjectChanged,
  } from './utils';
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
    validateOntologyClassificationNameApi,
    validateDatasetClassificationNameApi,
  } from '/@/api/business/classes';
  import { RuleObject } from 'ant-design-vue/es/form/interface';

  const { t } = useI18n();
  const { createMessage } = useMessage();
  // const handleRefresh = inject('handleRefresh', Function, true);
  const props = defineProps<{
    detail?: any;
    datasetType?: datasetTypeEnum;
    datasetId?: number;
    ontologyId?: number | null;
    isCenter?: boolean;
  }>();
  const emits = defineEmits(['fetchList', 'submit', 'valid', 'changed', 'manage']);
  const updateDetail = inject('updateDetail', Function, true);

  /** Init */
  const baseFormName = ref<string>('');
  const modalTitle = ref<string>('Create New Classification');
  const okText = ref<string>('Create');
  const [registerModal, { closeModal, changeOkLoading, setModalProps }] = useModalInner(
    (config) => {
      // from attributes
      if (config.isKeep) {
        return;
      }
      console.log('createClassification detail', props.detail);
      // from Edit
      if (config.isEdit) {
        modalTitle.value = 'Edit Classification';
        okText.value = 'Save';
        setModalProps({
          title: 'Edit Classification',
          okText: 'Save',
        });

        baseFormName.value = props.detail.name;
        emitter.emit('changeRootName', props.detail.name);

        formState.name = props.detail.name;
        formState.inputType = props.detail.inputType;
        formState.isRequired = props.detail.isRequired;

        dataSchema.value = { options: props.detail?.attribute?.options ?? [] };
        defaultFormState.value = JSON.parse(JSON.stringify(unref(props.detail)));
      } else {
        modalTitle.value = 'Create New Classification';
        okText.value = 'Create';
        setModalProps({
          title: 'Create New Classification',
          okText: 'Create',
        });

        formState.name = undefined;
        formState.inputType = inputTypeEnum.RADIO;
        formState.isRequired = false;

        dataSchema.value = { options: [] };
        defaultFormState.value = JSON.parse(JSON.stringify(unref(formState)));
      }
    },
  );

  /** Form */
  const formRef = ref();
  const formState: IClassificationForm = reactive({});
  getDefaultCreateClassificationFormState(formState);
  defineExpose({ formState });
  /** Rules */
  const validateName = async (_rule: RuleObject, value: string) => {
    if (!value) {
      return Promise.reject(t('business.ontology.modal.nameRequired'));
    } else {
      const params: any = {
        id: props.detail?.id,
        ontologyId: props.ontologyId ?? undefined,
        datasetId: props.datasetId ?? undefined,
        name: formState.name,
      };
      let res;
      if (props.isCenter) {
        res = await validateOntologyClassificationNameApi(params);
      } else {
        res = await validateDatasetClassificationNameApi(params);
      }

      if (!res) {
        return Promise.resolve();
      } else {
        return Promise.reject('Duplicated name');
      }
    }
  };
  const rules = {
    name: [
      { required: true, validator: validateName, trigger: 'change' },
      { max: 256, message: t('business.ontology.maxLength') },
    ],
  };

  // Watch inputType changes
  watch(
    () => formState.inputType,
    (newVal) => {
      if (newVal === inputTypeEnum.TEXT || newVal === inputTypeEnum.LONG_TEXT) {
        isDisabled.value = true;
        dataSchema.value = { options: [] };
      } else {
        isDisabled.value = false;
      }
    },
  );

  /** isChanged */
  // The default FormState
  const defaultFormState = ref<any>({});
  // Watch data changes
  const stopWatchFormState = watch(formState, (value) => {
    const flag = isObjectChanged(unref(defaultFormState), unref(value));
    if (!flag) {
      emits('changed');
      stopWatchFormState();
    }
  });

  /** Manage Attributes */
  const isDisabled = ref<boolean>(false);
  const dataSchema = ref<IDataSchema>({ options: [] });
  const optionsNum = computed(() => {
    return dataSchema.value.options!.length ?? 0;
  });
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
    getDefaultCreateClassificationFormState(formState);
    updateDetail({});
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

    const params: any = getCreateClassificationParams({
      formState: _.cloneDeep(formState),
      props: _.cloneDeep(props),
      dataSchema: _.cloneDeep(unref(dataSchema)),
    });
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
      handleCancel();
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
