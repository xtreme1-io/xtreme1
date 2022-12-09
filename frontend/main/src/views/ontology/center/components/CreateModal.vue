<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="t('business.ontology.createOntology')"
    destroyOnClose
  >
    <!-- 内部 -->
    <Form
      name="custom-validation"
      ref="formRef"
      :model="formState"
      :rules="rules"
      v-bind="layout"
      hideRequiredMark
    >
      <Form.Item :label="t('business.ontology.ontologyName')" name="name">
        <Input
          autocomplete="off"
          v-model:value="formState.name"
          type="input"
          allow-clear
          @change="handleChange"
          :placeholder="t('business.ontology.createHolder')"
        />
      </Form.Item>
      <Form.Item :label="t('business.ontology.ontologyType')" required>
        <Select v-model:value="formState.type" :options="datasetTypeList" />
      </Form.Item>
    </Form>
    <!-- 重写按钮 -->
    <template #footer>
      <Button @click="handleCancel">
        {{ t('common.cancelText') }}
      </Button>
      <Button type="primary" @click="handleSubmit" :disabled="!isValid" :loading="isLoading">
        {{ t('common.confirmText') }}
      </Button>
    </template>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, reactive, inject, watch } from 'vue';
  // 组件
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Form, Input, Button, Select } from 'ant-design-vue';
  // 工具
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage'; // 类型
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  // 接口
  import { createOntologyApi, validateOntologyNameApi } from '/@/api/business/ontology';
  import { SaveOntologyParams } from '/@/api/business/model/ontologyModel';
  import { datasetTypeList } from '../../classes/attributes/data';
  import { RuleObject } from 'ant-design-vue/es/form/interface';

  const { t } = useI18n();
  const { createMessage } = useMessage();
  const handleRefresh = inject('handleRefresh', Function, true); // 刷新列表页面

  // 弹窗
  const [registerModal, { closeModal }] = useModalInner(() => {
    formState.name = '';
    formState.type = datasetTypeEnum.LIDAR_BASIC;
    isValid.value = false;
  });
  // 表单
  const layout = {
    labelCol: { span: 5, offset: 5 },
    wrapperCol: { span: 10 },
  };
  const formRef = ref();
  const formState: SaveOntologyParams = reactive({
    name: '',
    type: datasetTypeEnum.LIDAR_BASIC,
  });
  const validateCreateName = async (_rule: RuleObject, value: string) => {
    if (value === '') {
      return Promise.reject(t('business.ontology.noOntologyName'));
    }
    const res = await validateOntologyNameApi({ name: value, type: formState.type });

    if (!res) {
      return Promise.resolve();
    } else {
      const text = t('business.ontology.duplicate');
      return Promise.reject(text);
    }
  };
  const rules = {
    name: [
      { validator: validateCreateName, trigger: 'change' },
      { max: 256, message: t('business.ontology.maxLength') },
    ],
  };
  watch(
    () => formState.type,
    () => {
      formRef.value.validate();
    },
  );

  // 取消
  const handleCancel = () => {
    closeModal();
  };
  // 提交 - 创建
  const isLoading = ref<boolean>(false);
  const handleSubmit = async () => {
    try {
      isLoading.value = true;
      await formRef.value.validate();

      let postData: SaveOntologyParams = { name: formState.name, type: formState.type };
      await createOntologyApi(postData);

      const successText =
        t('business.ontology.ontology') +
        ` "${postData.name}" ` +
        t('business.ontology.successCreated');
      createMessage.success(successText);

      isLoading.value = false;
      handleRefresh();
      closeModal();
    } catch (error) {
      isLoading.value = false;
      console.log(error);
    }
  };
  // 校验
  const isValid = ref<boolean>(false);
  const handleChange = () => {
    if (!formState.name) isValid.value = false;
    else isValid.value = true;
  };
</script>

<style lang="less" scoped>
  .ant-form {
    padding-top: 60px;
    :deep(.ant-form-item) {
      height: 28px;
      margin-bottom: 20px;
      .ant-form-item-label {
        & > label {
          height: 28px;
        }
      }
      .ant-form-item-control-input {
        min-height: 28px;
        .ant-input-affix-wrapper {
          padding: 4px 10px;
          .ant-input {
            height: 18px;
          }
        }
      }
      .ant-select {
        .ant-select-selector {
          height: 28px;
        }
      }
    }
  }
</style>
