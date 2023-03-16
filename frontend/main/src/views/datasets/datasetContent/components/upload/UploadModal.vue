<template>
  <BasicModal
    v-bind="$attrs"
    :title="t('business.datasetContent.uploadData')"
    :width="600"
    :height="650"
    :showOkBtn="false"
    :cancelButtonProps="{ type: 'default' }"
    destroyOnClose
    @register="register"
  >
    <div class="flex justify-center">
      <UploadContent v-bind="$attrs" :datasetType="props.datasetType" :id="props.id" />
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import UploadContent from './UploadContent.vue';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';

  const { t } = useI18n();
  const props = defineProps<{ id: number; datasetType: datasetTypeEnum | undefined }>();

  const [register] = useModalInner();
</script>
