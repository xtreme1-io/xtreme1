<template>
  <ActionSelect
    :selectedList="selectedItemIds"
    :actionList="datasetType === datasetTypeEnum.TEXT ? textActionList : actionList"
    :functionMap="functionMap"
  />
  <SaveToModal
    @register="registerSaveToModal"
    :activeTab="activeTab"
    :datasetType="datasetType"
    :datasetId="props.datasetId"
    :selectedList="props.selectedList"
  />
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  // import { useMessage } from '/@/hooks/web/useMessage';
  import { useModal } from '/@/components/Modal';
  import SaveToModal from './saveTo/SaveToModal.vue';

  import { ActionSelect } from '/@/components/BasicCustom/ActionSelect';
  import { actionList, textActionList } from './actionList';
  import {
    deleteSelectedDatasetClassApi,
    deleteSelectedDatasetClassificationApi,
  } from '/@/api/business/classes';
  import { ClassTypeEnum } from '/@/api/business/model/classesModel';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  import { ModalConfirmCustom } from '/@/utils/business/confirm';

  const { t } = useI18n();
  // const { createMessage } = useMessage();

  const props = defineProps<{
    activeTab: ClassTypeEnum;
    datasetType: datasetTypeEnum;
    datasetId: string | number;
    selectedList: any[];
  }>();
  const emits = defineEmits(['selectAll', 'unSelect', 'fetchList']);

  const selectedItemIds = computed(() => {
    return props.selectedList.map((item) => item.id);
  });

  /** Select */
  const handleSelectAll = () => {
    emits('selectAll');
  };
  const handleUnselectAll = () => {
    emits('unSelect');
  };

  /** Save To */
  const [registerSaveToModal, { openModal: openSaveToModal }] = useModal();
  const handleSaveToOntology = () => {
    openSaveToModal(true, {});
  };

  /** Delete */
  const handleDeleted = async () => {
    ModalConfirmCustom({
      title: 'Delete Data',
      content: 'Are you sure to delete the selected items or series?This action is irreversible',
      okText: t('common.delText'),
      okButtonProps: { type: 'primary', danger: true },
      onOk: async () => {
        if (props.activeTab == ClassTypeEnum.CLASS) {
          await deleteSelectedDatasetClassApi(selectedItemIds.value);
        } else {
          await deleteSelectedDatasetClassificationApi(selectedItemIds.value);
        }
        emits('fetchList');
      },
    });
  };

  const functionMap = {
    handleSelectAll,
    handleUnselectAll,
    handleSaveToOntology,
    handleDeleted,
  };
</script>
