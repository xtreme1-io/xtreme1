<template>
  <ActionSelect
    :selectedList="selectedItemIds"
    :actionList="actionList"
    :functionMap="functionMap"
  />
  <SaveToModal :datasetType="datasetType" :activeTab="activeTab" @register="registerSaveToModal" />
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  // import { useMessage } from '/@/hooks/web/useMessage';
  import { Modal } from 'ant-design-vue';
  import { useModal } from '/@/components/Modal';
  import SaveToModal from './copy-modal/SaveToModal.vue';

  import { ActionSelect } from '/@/components/BasicCustom/ActionSelect';
  import { actionList } from './actionList';
  import { deleteSelectedDatasetClassApi } from '/@/api/business/classes';
  import { ClassTypeEnum } from '/@/api/business/model/classesModel';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';

  const { t } = useI18n();
  // const { createMessage } = useMessage();

  const props = defineProps<{
    selectedList: any[];
    datasetType: datasetTypeEnum;
    activeTab: ClassTypeEnum;
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
    openSaveToModal();
  };

  /** Delete */
  const handleDeleted = async () => {
    Modal.confirm({
      title: 'Delete',
      content: 'Are you sure to delete the selected items or series?This action is irreversible',
      okText: t('common.delText'),
      okButtonProps: { danger: true },
      onOk: async () => {
        await deleteSelectedDatasetClassApi(selectedItemIds.value);
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
