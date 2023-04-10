<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    :title="t('business.models.deleteModel.title')"
    :okButtonProps="{ danger: true, loading: isLoading }"
    :okText="t('common.delText')"
    :centered="true"
    :width="600"
    :height="330"
    @ok="handleDelete"
  >
    <div class="text-center pt-100px">
      <div>{{ t('business.models.deleteModel.text') }}</div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  // 组件
  import { BasicModal, useModalInner } from '/@/components/Modal';
  // 接口
  import { deleteModelRunByIdApi } from '/@/api/business/models';

  const { createMessage } = useMessage();

  const [register, { closeModal }] = useModalInner();
  const { t } = useI18n();
  const props = defineProps<{ id: string | number }>();
  const emits = defineEmits(['delete', 'register']);

  // 删除
  const isLoading = ref<boolean>(false);
  const handleDelete = async () => {
    try {
      isLoading.value = true;
      await deleteModelRunByIdApi({ id: props.id });
      setTimeout(() => {
        isLoading.value = false;
      }, 300);
      const successText = t('business.models.deleteModel.hasDeleted');
      createMessage.success(successText);

      closeModal();
      emits('delete');
    } catch (error) {
      setTimeout(() => {
        isLoading.value = false;
      }, 300);
      console.log('error', error);
    }
  };
</script>
