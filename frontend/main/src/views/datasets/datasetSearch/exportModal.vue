<template>
  <div :class="`${prefixCls}`">
    <BasicModal
      v-bind="$attrs"
      @register="register"
      class="modal"
      :width="450"
      :title="t('common.exportText')"
      @ok="handleSubmit"
      ok-text="Export"
      :okButtonProps="{
        loading: isLoading,
      }"
    >
      <BasicForm @register="registerForm" />
    </BasicModal>
  </div>
</template>
<script lang="ts" setup>
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form';
  import { formSchema } from './schema';
  import {
    createByScenario,
    exportDataRecordCallBack,
    exportScenario,
  } from '/@/api/business/dataset';
  import { downloadByCorsUrl } from '/@/utils/file/download';
  import { useMessage } from '/@/hooks/web/useMessage';
  const [register, { closeModal }] = useModalInner();
  const { createMessage } = useMessage();
  const [registerForm, { validate }] = useForm({
    labelWidth: 90,
    schemas: formSchema,
    showActionButtonGroup: false,
  });
  const props = defineProps<{
    info: any;
    classId: any;
    classification: any;
    type?: string;
  }>();
  const { prefixCls } = useDesign('export-modal');
  const { t } = useI18n();
  const isLoading = ref<boolean>(false);
  const handleSubmit = async () => {
    const data = await validate();
    console.log(data);
    if (data.type === 'Json') {
      const res = await exportScenario({
        pageNo: 1,
        pageSize: 9999,
        datasetType: props.info.type,
        classId: props.classId.toString(),
        source: props.type || 'DATASET_CLASS',
      });

      const getFile = async () => {
        const data = await exportDataRecordCallBack({ serialNumbers: res });
        console.log(data);
        if (data[0]?.status === 'GENERATING') {
          setTimeout(getFile, 5000);
        } else if (data[0]?.status === 'COMPLETED') {
          downloadByCorsUrl({
            url: data[0].filePath,
            fileName: data[0].fileName,
          });
          createMessage.success('exporting...');
        }
      };

      getFile();
    } else {
      await createByScenario({
        datasetType: props.info.type,
        classId: props.classId.toString(),
        source: props.type || 'DATASET_CLASS',
        datasetName: data.datasetName,
        attributeIds: props.classification
          ? props.classification.map((item) => item.split('^')[0]).toString()
          : undefined,
        optionNames: props.classification
          ? props.classification.map((item) => item.split('^')[1]).toString()
          : undefined,
      });
    }
    closeModal();
  };
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-export-modal';
  .@{prefix-cls} {
    color: #333;
  }
</style>
