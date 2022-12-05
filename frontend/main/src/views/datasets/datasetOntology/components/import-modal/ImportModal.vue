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
      <UploadContent />
      <!-- <ErrorContent /> -->
      <!-- <SuccessContent /> -->
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  // import { useI18n } from '/@/hooks/web/useI18n';
  // import { useMessage } from '/@/hooks/web/useMessage';

  import { BasicModal, useModalInner } from '/@/components/Modal';
  import UploadContent from './UploadContent.vue';
  // import ErrorContent from './ErrorContent.vue';
  // import SuccessContent from './SuccessContent.vue';

  // const { t } = useI18n();
  // const { createMessage } = useMessage();

  const modalTitle = 'Import Class/Classifications by Excel';

  const [registerModal] = useModalInner();
</script>
<style scoped lang="less">
  .import__modal {
    padding: 40px 50px 20px;
  }
</style>
