<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    :title="t('business.dataset.renameDataset')"
    :okText="t('common.confirmText')"
    @ok="handleRename"
    @visible-change="handleVisible"
  >
    <Form
      ref="form"
      hideRequiredMark
      class="form"
      :rules="rules"
      :model="formState"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
    >
      <Form.Item name="name" :label="t('common.newName')">
        <Input
          class="input-element"
          ref="inputRef"
          autocomplete="off"
          v-model:value="formState.name"
          @focus="handleFocus"
        />
      </Form.Item>
    </Form>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, defineProps, inject, unref, onMounted } from 'vue';
  import { Form, Input } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { updateDataset } from '/@/api/business/dataset';
  import { useMessage } from '/@/hooks/web/useMessage';
  const form = ref();
  const inputRef = ref(null);
  const { createMessage } = useMessage();
  const [register, { closeModal, changeOkLoading }] = useModalInner();
  const { t } = useI18n();
  const props = defineProps<{ id: string | number; name: string }>();
  const formState = ref({
    name: props.name,
  });
  const rules = {
    name: [
      { required: true, message: 'Please input name', trigger: 'blur' },
      { max: 20, message: 'Please enter less than 20' },
    ],
  };

  onMounted(() => {
    // console.log(inputRef.value);
  });

  const labelCol = { span: 9 };
  const wrapperCol = { span: 9 };
  const fetchList: any = inject('fetchList');

  const handleVisible = () => {
    formState.value = { name: props.name };
    setTimeout(() => {
      if (document.getElementsByClassName('input-element').length > 0) {
        document.getElementsByClassName('input-element')['name'].focus();
      }
    }, 100);
  };

  const handleFocus = function (e) {
    e.target.setSelectionRange(0, e.target.value.length);
  };
  const handleRename = async () => {
    changeOkLoading(true);

    try {
      await unref(form)
        .validateFields()
        .then(async (values) => {
          await updateDataset({
            id: props.id,
            ...values,
          });
          createMessage.success(t('action.renameSuccess'));
          closeModal();
          changeOkLoading(false);
          fetchList();
        })
        .catch((errorInfo) => {
          changeOkLoading(false);
        
        });
    } catch (e) {
      changeOkLoading(false);
    }
  };
</script>
<style scoped>
  .form {
    padding-top: 80px;
  }
</style>
