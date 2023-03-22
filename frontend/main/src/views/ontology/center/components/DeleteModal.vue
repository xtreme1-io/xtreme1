<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    :title="t('business.ontology.deleteOntology')"
    :ok-text="t('common.confirmText')"
    :ok-button-props="{ danger: true }"
    destroyOnClose
  >
    <div class="info-text">
      <div>{{ t('business.ontology.sure') + ' “' + name + '” ?' }}</div>
      <div>{{ t('business.ontology.removed') }}</div>
      <div class="mt-10px mb-10px">{{ t('business.ontology.verify') }}</div>
      <!-- 内部 -->
      <Form
        name="custom-validation"
        ref="formRef"
        :model="formState"
        :rules="rules"
        v-bind="layout"
      >
        <Form.Item name="name">
          <Input
            autocomplete="off"
            v-model:value="formState.name"
            :placeholder="t('business.ontology.deletePlace')"
            allow-clear
            @change="handleChange"
            style="width: 220px"
          />
        </Form.Item>
      </Form>
    </div>
    <!-- 重写按钮 -->
    <template #footer>
      <Button @click="handleCancel">
        {{ t('common.cancelText') }}
      </Button>
      <Button type="primary" danger @click="handleDelete" :disabled="!isValid" :loading="isLoading">
        {{ t('common.delText') }}
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
  import { RuleObject } from 'ant-design-vue/es/form/interface';
  import { deleteOntologyApi } from '/@/api/business/ontology';

  const { t } = useI18n();
  const { createMessage } = useMessage();
  const props = defineProps<{ id: string | number; name: string }>();
  const handleRefresh = inject('handleRefresh', Function, true);

  const [register, { closeModal }] = useModalInner(() => {
    resetForm();
  });

  // 表单
  const validateDeleteName = (_rule: RuleObject, value: string) => {
    if (value === '') {
      return Promise.reject('Please input the name');
    } else {
      if (value != props.name) {
        return Promise.reject('name error');
      }
      return Promise.resolve();
    }
  };
  const rules = { name: [{ validator: validateDeleteName, trigger: 'blur' }] };

  const layout = { wrapperCol: { span: 24 } };
  const formRef = ref();
  const formState = reactive({
    name: '',
  });
  const resetForm = () => {
    formState.name = '';
    isValid.value = false;
  };

  // 取消
  const handleCancel = () => {
    closeModal();
    resetForm();
  };
  // 删除
  const isLoading = ref<boolean>(false);
  const handleDelete = async () => {
    try {
      isLoading.value = true;
      await formRef.value.validate();

      await deleteOntologyApi({ id: props.id });

      const successText =
        t('business.ontology.ontology') +
        ` "${props.name}" ` +
        t('business.ontology.hasBeenDeleted');
      createMessage.success(successText);

      isLoading.value = false;
      handleRefresh();
      closeModal();
      resetForm();
    } catch (error) {
      setTimeout(() => {
        isLoading.value = false;
      }, 300);
    
    }
  };

  // 校验
  const isValid = ref<boolean>(false);
  const handleChange = () => {
    if (!formState.name) isValid.value = false;
    else isValid.value = true;
  };

  // 0.3 改为点击校验
  // const handleBlur = () => {
  //   formRef.value
  //     .validate()
  //     .then((res) => {
  //       if (typeof res.name == 'boolean') {
  //         isValid.value = false;
  //       } else {
  //         isValid.value = true;
  //       }
  //     })
  //     .catch((error) => {
  //       isValid.value = false;
  //       console.log(error);
  //     });
  // };
  // let timeout;
  // const handleChange = () => {
  //   isValid.value = false;
  //   clearTimeout(timeout);
  //   timeout = setTimeout(() => {
  //     handleBlur();
  //   }, 500);
  // };
</script>
<style scoped>
  .info-text {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    padding-top: 50px;
    font-size: 16px;
    color: #333;
    line-height: 24px;
  }
</style>
