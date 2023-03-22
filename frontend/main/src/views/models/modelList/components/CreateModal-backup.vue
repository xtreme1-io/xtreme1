<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="t('business.models.create.createModels')"
    destroyOnClose
  >
    <!-- 内部 -->
    <Form name="custom-validation" ref="formRef" :model="formState" :rules="rules" v-bind="layout">
      <Form.Item :label="t('business.models.create.modelsName')" name="name">
        <Input
          autocomplete="off"
          v-model:value="formState.name"
          type="input"
          allow-clear
          @blur="handleBlur"
          @change="handleChange"
          :placeholder="t('business.models.create.createHolder')"
        />
      </Form.Item>
    </Form>
    <!-- 重写按钮 -->
    <template #footer>
      <Button @click="handleCancel">
        {{ t('common.cancelText') }}
      </Button>
      <Button type="primary" @click="handleSubmit" :disabled="!isValid">
        {{ t('common.confirmText') }}
      </Button>
    </template>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, reactive, inject } from 'vue';
  // 组件
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Form, Input, Button } from 'ant-design-vue';
  // 工具
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  // 接口
  // import { createEditOntologyApi } from '/@/api/business/ontology';
  // import { validateCreateName } from './formSchemas';
  // import { SaveOntologyParams } from '/@/api/business/model/ontologyModel';

  interface SaveParams {
    name: string;
  }
  const validateCreateName = () => {};

  const { t } = useI18n();
  const { createMessage } = useMessage();
  const handleRefresh = inject('handleRefresh', Function, true); // 刷新列表页面

  // 弹窗
  const [registerModal, { closeModal }] = useModalInner(() => {
    formState.name = '';
    isValid.value = false;
  });
  // 表单
  const rules = {
    name: [
      { required: true, validator: validateCreateName, trigger: 'blur' },
      { max: 256, message: t('business.ontology.maxLength') },
    ],
  };
  const layout = {
    labelCol: { span: 4, offset: 5 },
    wrapperCol: { span: 10 },
  };
  const formRef = ref();
  const formState: SaveParams = reactive({ name: '' });

  // 取消
  const handleCancel = () => {
    closeModal();
  };
  // 提交 - 创建
  const handleSubmit = async () => {
    try {
      await formRef.value.validate();

      let postData: SaveParams = { name: formState.name };
      // await createEditOntologyApi(postData);

      const successText =
        t('business.ontology.ontology') +
        ` "${postData.name}" ` +
        t('business.ontology.successCreated');
      createMessage.success(successText);

      handleRefresh();
      closeModal();
    } catch (error) {
      console.log(error);
    }
  };
  // 校验
  const isValid = ref<boolean>(false);
  const handleBlur = () => {
    formRef.value
      .validate()
      .then((res) => {
     
        if (typeof res == 'boolean') {
          isValid.value = false;
        } else {
          isValid.value = true;
        }
      })
      .catch((error) => {
        isValid.value = false;
        console.log(error);
      });
  };
  const handleChange = () => {
    isValid.value = false;
  };
</script>

<style lang="less" scoped>
  .ant-form {
    padding-top: 80px;
  }
</style>
