<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    :title="t('business.dataset.deleteDataset')"
    :okText="t('common.delText')"
    :ok-button-props="{ danger: true }"
    @ok="handleDelete"
  >
    <div class="info-text text-center">
      Are you sure to delete dataset “{{ name }}”? All data and annotation results will be removed.
    </div>
    <div class="text-center mb-2"> Please enter dataset name to do double-verification </div>
    <Form ref="formRef" class="form" :model="formState" :rules="rules">
      <Form.Item name="name" class="input-item">
        <Input autocomplete="off" v-model:value="formState.name" />
      </Form.Item>
    </Form>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { RuleObject } from 'ant-design-vue/es/form/interface';
  import { ref, defineProps, inject } from 'vue';
  import { Form, Input } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { deleteDatasetApi } from '/@/api/business/dataset';
  import { useMessage } from '/@/hooks/web/useMessage';

  const { createMessage } = useMessage();

  const [register, { closeModal }] = useModalInner();
  const { t } = useI18n();
  const formRef = ref();
  const formState = ref({
    name: '',
  });
  let validateName = async (_rule: RuleObject, value: string) => {
    if (value === '') {
      return Promise.reject('Please input the name');
    } else {
      if (props.name !== value) {
        return Promise.reject("Dataset name didn't match, try again!");
      }
      return Promise.resolve();
    }
  };
  const rules = {
    name: [{ required: true, validator: validateName, trigger: 'change' }],
  };
  const props = defineProps<{ id: string | number; name: string }>();
  const fetchList: any = inject('fetchList');
  const handleDelete = async () => {
    formRef.value
      .validate()
      .then(async () => {
        try {
          await deleteDatasetApi({
            id: props.id,
          });
          createMessage.success(t('action.deleteSuccess'));
          closeModal();
          fetchList({});
        } catch (e) {}
      })
      .catch((error) => {
        console.log('error', error);
      });
  };
</script>
<style scoped>
  .info-text {
    width: 368px;
    margin: 0 auto 10px;
    padding-top: 52px;
  }

  .input-item {
    width: 200px;
    margin: 0 auto;
  }
</style>
