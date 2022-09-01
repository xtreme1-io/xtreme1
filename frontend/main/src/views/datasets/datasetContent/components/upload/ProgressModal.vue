<template>
  <BasicModal
    v-bind="$attrs"
    :title="t('business.datasetContent.uploadData')"
    :width="600"
    :height="450"
    :showCancelBtn="false"
    okText="Done"
    :okButtonProps="{ danger: true }"
    destroyOnClose
    @register="register"
    @ok="handleDone"
  >
    <div class="flex justify-center">
      <UploadProgress
        ref="progressRef"
        :datasetType="props.datasetType"
        :id="props.id"
        :file="fileList"
        :uploadUrl="uploadUrl"
        :source="source"
        @fetchList="handleFetchList"
      />
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ModalConfirmCustom } from '/@/utils/business/confirm';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import UploadProgress from './UploadProgress.vue';
  import { datasetTypeEnum, UploadSourceEnum } from '/@/api/business/model/datasetModel';
  import { UploadResultStatus } from '/@/components/Upload/src/typing';

  const { t } = useI18n();
  const props = defineProps<{
    datasetType: datasetTypeEnum | undefined;
    id: number;
  }>();
  const emits = defineEmits(['fetchList']);

  const handleFetchList = () => {
    emits('fetchList');
  };

  const source = ref<UploadSourceEnum>(UploadSourceEnum.LOCAL);

  const fileList = ref<any[]>([]);
  const uploadUrl = ref<string>('');
  const [register, { closeModal }] = useModalInner((data: any) => {
    console.log('inner', fileList);
    source.value = data.source;
    if (source.value == UploadSourceEnum.LOCAL) {
      fileList.value = data.fileList;
    } else if (source.value == UploadSourceEnum.URL) {
      uploadUrl.value = data.uploadUrl;
    }
  });

  const progressRef = ref();
  const handleDone = () => {
    const { fileList: file, reset } = progressRef.value;

    const isCompleted = file.every(
      (item) =>
        item.status != UploadResultStatus.PROCESSING &&
        item.status != UploadResultStatus.PENDING &&
        item.status != UploadResultStatus.UPLOADING,
    );
    console.log('isCompleted', isCompleted);
    if (isCompleted) {
      closeModal();
      reset();
    } else {
      ModalConfirmCustom({
        title: 'Reminder',
        content: 'You have files are uploading, do you want to discard them all?',
        okText: 'Discard',
        onOk: async () => {
          console.log('modal discard');
          closeModal();
          reset();
        },
      });
    }
  };
</script>
