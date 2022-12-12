<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    destroyOnClose
    :title="t('business.ontology.renameOntology')"
  >
    <!-- 内部 -->
    <Form name="custom-validation" ref="formRef" :model="formState" :rules="rules" v-bind="layout">
      <Form.Item :label="t('business.ontology.newName')" name="name">
        <Input
          ref="inputRef"
          autocomplete="off"
          v-model:value="formState.name"
          type="input"
          allow-clear
          @change="handleChange"
          @focus="handleFocus"
          :placeholder="t('business.ontology.createHolder')"
        />
      </Form.Item>
    </Form>
    <!-- 重写按钮 -->
    <template #footer>
      <Button @click="handleCancel">
        {{ t('common.cancelText') }}
      </Button>
      <Button type="primary" @click="handleRename" :disabled="!isValid" :loading="isLoading">
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
  import { updateOntologyApi, validateOntologyNameApi } from '/@/api/business/ontology';
  import { SaveOntologyParams, UpdateOntologyParams } from '/@/api/business/model/ontologyModel';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  import { RuleObject } from 'ant-design-vue/es/form/interface';

  const { t } = useI18n();
  const { createMessage } = useMessage();
  const handleRefresh = inject('handleRefresh', Function, true);
  const props = defineProps<{ id: number | string; name: string }>();

  // 弹窗
  const inputRef = ref();
  const [registerModal, { closeModal }] = useModalInner((data) => {
    formState.name = data.name;
    formState.type = data.type;
    isValid.value = true;
    setTimeout(() => {
      inputRef.value.focus();
    });
  });
  const handleFocus = (e) => {
    e.target.setSelectionRange(0, e.target.value.length);
  };
  // 表单
  const validateReName = async (_rule: RuleObject, value: string) => {
    if (value === '') {
      return Promise.reject(t('business.ontology.noOntologyName'));
    }

    const res = await validateOntologyNameApi({
      name: value,
      id: props.id as string,
      type: formState.type,
    });

    if (!res) {
      return Promise.resolve();
    } else {
      const text =
        t('business.ontology.ontology') + ` “${value}” ` + t('business.ontology.hasExist');
      return Promise.reject(text);
    }
  };
  const rules = {
    name: [
      { validator: validateReName, trigger: 'change' },
      { max: 256, message: t('business.ontology.maxLength') },
    ],
  };
  const layout = {
    labelCol: { span: 4, offset: 5 },
    wrapperCol: { span: 10 },
  };
  const formRef = ref();
  const formState: SaveOntologyParams = reactive({ name: '', type: datasetTypeEnum.LIDAR_BASIC });

  // 取消
  const handleCancel = () => {
    closeModal();
  };
  // 提交 - 重命名
  const isLoading = ref<boolean>(false);
  const handleRename = async () => {
    try {
      isLoading.value = true;
      if (formState.name == props.name) {
        closeModal();
        isLoading.value = false;
        return;
      }

      await formRef.value.validate();

      let postData: UpdateOntologyParams = {
        id: props.id as string,
        name: formState.name,
        type: formState.type,
      };
      await updateOntologyApi(postData);

      const successText = t('business.ontology.ontology') + t('business.ontology.hasBeenRenamed');
      createMessage.success(successText);

      isLoading.value = false;
      handleRefresh();
      closeModal();
    } catch {
      isLoading.value = false;
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
    padding-top: 80px;
  }
</style>
