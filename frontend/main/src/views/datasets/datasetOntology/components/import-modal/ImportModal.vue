<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="modalTitle"
    centered
    destroyOnClose
    :footer="null"
    :width="600"
    :height="400"
  >
    <div class="import__modal">
      <UploadContent v-if="content === 'upload'" @callback="callBack" :type="type" @close="close" />
      <ErrorContent v-else-if="content === 'error'" @callback="callBack" />
      <SuccessContent v-else :infoNum="infoNum" @close="close" />
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  // import { useI18n } from '/@/hooks/web/useI18n';
  // import { useMessage } from '/@/hooks/web/useMessage';

  import { BasicModal, useModalInner } from '/@/components/Modal';
  import UploadContent from './UploadContent.vue';
  import ErrorContent from './ErrorContent.vue';
  import { ref } from 'vue';
  import SuccessContent from './SuccessContent.vue';
  defineProps<{
    type?: string;
  }>();
  const emits = defineEmits(['fetchList']);
  // const { t } = useI18n();
  // const { createMessage } = useMessage();
  const content = ref('upload');
  const infoNum = ref<any>();
  const modalTitle = 'Import Class/Classifications by Json';

  const [registerModal, { closeModal }] = useModalInner();
  const callBack = (type, data) => {
    content.value = type;
    if (data) {
      infoNum.value = data;
    }
  };
  const close = () => {
    closeModal();
    emits('fetchList');
    content.value = 'upload';
  };
</script>
<style scoped lang="less">
  .import__modal {
    padding: 40px 50px 20px;
  }
</style>
