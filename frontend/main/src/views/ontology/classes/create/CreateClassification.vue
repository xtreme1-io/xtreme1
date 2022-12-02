<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="t('business.ontology.createOntology')"
    :width="640"
    :height="450"
    destroyOnClose
    @cancel="handleCancel"
    @ok="handleCreate"
  >
    <div class="content">
      <div class="title">Basic Info - classification</div>
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
          <div class="w-260px">
            <Form.Item :label="t('common.nameText')" name="name">
              <TheNameInput
                style="width: 160px"
                v-bind="$attrs"
                v-model:name="formState.name"
                :activeTab="ClassTypeEnum.CLASS"
                :datasetId="props.datasetId"
                :isCenter="props.isCenter"
                :baseFormName="baseFormName"
              />
            </Form.Item>
          </div>
          <div class="flex-1">
            <Form.Item :label="t('business.class.inputType')">
              <Select v-model:value="formState.inputType">
                <Select.Option v-for="item in inputTypeList" :key="item.key" :value="item.value">
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
          <div class="w-260px">
            <Form.Item :label="t('business.class.isRequired')">
              <Switch v-model:checked="formState.isRequired" />
            </Form.Item>
          </div>
        </div>
      </Form>
      <div class="title">Related by (999)</div>
      <div class="title">
        <span>Attributes (N)</span>
        <Button type="primary" @click="handleManageAttr">
          {{ 'Manage attributes' }}
        </Button>
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, reactive, watch, unref } from 'vue';
  // components
  import { Form, Select, Switch } from 'ant-design-vue';
  // import { RuleObject } from 'ant-design-vue/es/form/interface';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Button } from '/@@/Button';
  import TheNameInput from './class-form/TheNameInput.vue';
  import { inputTypeList } from './class-form/data';
  // utils
  import { useI18n } from '/@/hooks/web/useI18n';
  // import { useMessage } from '/@/hooks/web/useMessage';
  import emitter from 'tiny-emitter/instance';
  import { IClassificationForm } from './typing';
  import { ClassTypeEnum } from '/@/api/business/model/classModel';
  import { inputTypeEnum } from '/@/api/business/model/ontologyClassesModel';

  const { t } = useI18n();
  // const { createMessage } = useMessage();
  // const handleRefresh = inject('handleRefresh', Function, true);
  const props = defineProps<{
    detail?: any;
    handleSet?: Function;
    isCenter?: boolean;
    datasetId?: number;
  }>();
  const emits = defineEmits(['submit', 'valid', 'changed', 'manage']);

  const baseFormName = ref<string>('');
  const [registerModal, { closeModal }] = useModalInner((config) => {
    // Initial page load
    console.log(config);
    if (config.isKeep) {
      console.log(formState);
      return;
    }
    console.log(props.detail);
    if (config.isEdit) {
      formState.name = props.detail.name;
      formState.inputType = props.detail.inputType;
      formState.isRequired = props.detail.isRequired;

      baseFormName.value = props.detail.name;
      emitter.emit('changeRootName', props.detail.name);

      defaultFormState.value = JSON.parse(JSON.stringify(unref(props.detail)));
    } else {
      formState.name = undefined;
      formState.inputType = inputTypeEnum.RADIO;
      formState.isRequired = false;
      defaultFormState.value = JSON.parse(JSON.stringify(unref(formState)));
    }
    console.log(formState);
  });

  /** Form */
  const labelCol = { span: 8 };
  const wrapperCol = { span: 12, offset: 1 };
  const formRef = ref();
  let formState: IClassificationForm = reactive({
    name: undefined,
    inputType: inputTypeEnum.RADIO,
    isRequired: false,
  });
  defineExpose({ formState });
  watch(formState, () => {
    console.log(formState);
  });

  const rules = {
    name: [
      // { required: true, validator: validateName, trigger: 'blur' },
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

  // isChanged?
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
      // emitter.emit('handleSaveForm', { type: 'change' });
    }
  });
  // Check if objects are equal
  const isObjectChange = (source, comparison): boolean => {
    const _source = JSON.stringify(source);
    const _comparison = JSON.stringify({ ...source, ...comparison });

    return _source == _comparison;
  };

  /** Cancel */
  const handleCancel = () => {
    closeModal();
  };

  /** Manage */
  const handleManageAttr = () => {
    emits('manage');
  };
  /** Create */
  const isLoading = ref<boolean>(false);
  const handleCreate = () => {
    isLoading.value = true;
  };
</script>

<style lang="less" scoped>
  @import url(./index.less);
</style>
