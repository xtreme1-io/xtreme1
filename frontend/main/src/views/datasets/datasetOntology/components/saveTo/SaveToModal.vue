<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="t('business.ontology.sync.saveToOntology')"
    destroyOnClose
    centered
    @cancel="afterCancel"
    :minHeight="70"
  >
    <div class="saveTo__content">
      <div class="content__select">
        <span class="mr-10px">Select an ontology to save into</span>
        <Select
          v-model:value="selectedOntologyId"
          optionFilterProp="label"
          @select="handleSelectOntology"
        >
          <Select.Option v-for="item in ontologyList" :key="item.id">
            {{ item.name }}
          </Select.Option>
        </Select>
      </div>
      <!-- Conflict -->
      <div v-show="conflictList.length > 0" class="content__table">
        <div class="header">
          <div class="icon">
            <Icon icon="fluent:info-16-filled" color="#FCB17A" class="mr-10px" size="20px" />
            <span class="title"> {{ 'Conflicts' }} </span>
          </div>
          <span v-if="props.activeTab == ClassTypeEnum.CLASS">
            Some Classes have already existed in Destination ontology. To resolve these conflicts,
            please choose to Keep Destination or to Replace Destination with New Classes.
          </span>
          <span v-else>
            Some Classifications have already existed in Destination ontology. To resolve these
            conflicts, please choose to Keep Destination or to Replace Destination with New
            Classifications.
          </span>
        </div>
        <div class="title">
          {{ props.activeTab == ClassTypeEnum.CLASS ? 'Classes' : 'Classifications' }}
        </div>
        <div class="action">
          <span class="highLight" @click="handleToggleKeepAll(ICopySelectEnum.REPLACE)">
            Replace All
          </span>
          <span class="highLight" @click="handleToggleKeepAll(ICopySelectEnum.KEEP)">
            Keep All
          </span>
        </div>
        <div class="custom_table">
          <CustomTable ref="tableRef" class="table" :type="props.activeTab" :list="conflictList" />
        </div>
      </div>
    </div>
    <!-- 重写按钮 -->
    <template #footer>
      <Button @click="handleCancel">
        {{ t('common.cancelText') }}
      </Button>
      <Button
        type="primary"
        @click="handleSaveTo"
        :disabled="!isConfirmDisabled"
        :loading="isLoading"
      >
        {{ t('common.confirmText') }}
      </Button>
    </template>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, inject, watch } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Select } from 'ant-design-vue';
  import { Button } from '/@@/Button';
  import { Icon } from '/@/components/Icon';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import CustomTable from '../copy-modal/CustomTable.vue';
  // import SaveToConflictModal from './SaveToConflictModal.vue';

  import { getAllOntologyApi } from '/@/api/business/ontology';
  import { ClassTypeEnum, getOntologyClassesParams } from '/@/api/business/model/classesModel';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';

  import {
    saveClassToOntologyApi,
    saveClassificationToOntologyApi,
    getOntologyClassApi,
    getOntologyClassificationApi,
  } from '/@/api/business/classes';

  import { ICopySelectEnum } from '../copy-modal/data';
  import { validateClassConflict, validateClassificationConflict } from '../utils';

  const { createMessage } = useMessage();
  const { t } = useI18n();
  const props = defineProps<{
    activeTab: ClassTypeEnum;
    datasetType: datasetTypeEnum;
    datasetId: string | number;
    selectedList: any[];
  }>();
  const handleRefresh = inject('handleRefresh', Function, true);

  /** Modal */
  const [registerModal, { closeModal, changeLoading }] = useModalInner(() => {
    getOntologyList();
  });
  const handleCancel = () => {
    afterCancel();
    closeModal();
  };
  const afterCancel = () => {
    selectedOntologyId.value = undefined;
    conflictList.value = [];
    noConflictList.value = [];
  };

  /** Ontology List */
  const selectedOntologyId = ref<number>();
  const ontologyList = ref();
  const getOntologyList = async () => {
    const res = await getAllOntologyApi({ type: props.datasetType });
    ontologyList.value = [...res];
    return res;
  };
  const handleSelectOntology = (e) => {
    selectedOntologyId.value = e;
    handleToConflict(e);
    isConfirmDisabled.value = false;
  };

  const isConfirmDisabled = ref<boolean>(false);
  const isLoading = ref<boolean>(false);
  /** Conflict */
  const handleToggleKeepAll = (isKeep: ICopySelectEnum) => {
    conflictList.value.forEach((item) => (item.isKeep = isKeep));
  };
  const conflictList = ref<any[]>([]);
  const noConflictList = ref<any[]>([]);
  watch(
    conflictList,
    () => {
      isConfirmDisabled.value = conflictList.value.every(
        (item) => item.isKeep != ICopySelectEnum.NONE,
      );
    },
    { deep: true },
  );
  const handleToConflict = async (ontologyId) => {
    if (!ontologyId) return;
    changeLoading(true);
    isConfirmDisabled.value = true;

    const postData: getOntologyClassesParams = {
      pageNo: 1,
      pageSize: 100,
      ontologyId: Number(ontologyId),
    };

    let res: any = [];
    if (props.activeTab == ClassTypeEnum.CLASS) {
      const { list: classList } = await getOntologyClassApi(postData);
      res = validateClassConflict(props.selectedList, classList);
    } else {
      const { list: classificationList } = await getOntologyClassificationApi(postData);
      res = validateClassificationConflict(props.selectedList, classificationList);
    }
    setTimeout(() => {
      noConflictList.value = [...res.noConflictList];
      conflictList.value = [...res.conflictList];
      if (conflictList.value.length > 0) {
        conflictList.value = conflictList.value.map((item) => {
          item.isKeep = ICopySelectEnum.NONE;
          return item;
        });
      }
      changeLoading(false);
      isConfirmDisabled.value = false;
    }, 500);
  };

  /** SaveTo */
  const handleSaveTo = async () => {
    if (selectedOntologyId.value) {
      const ontologyId = selectedOntologyId.value;

      const replaceList = conflictList.value.filter(
        (item) => item.isKeep == ICopySelectEnum.REPLACE,
      );
      const list: any = [...replaceList, ...noConflictList.value];

      await handleConfirm(ontologyId, list);
    }
  };

  /** Confirm */
  const handleConfirm = async (ontologyId: number, list: any[] = []) => {
    isLoading.value = true;
    try {
      if (props.activeTab == ClassTypeEnum.CLASS) {
        const params = {
          datasetId: props.datasetId,
          ontologyId: ontologyId,
          classIds: list.map((item) => item.id),
        };
        list.length > 0 && (await saveClassToOntologyApi(params));
      } else {
        const params = {
          datasetId: props.datasetId,
          ontologyId: ontologyId,
          classificationIds: list.map((item) => item.id),
        };
        list.length > 0 && (await saveClassificationToOntologyApi(params));
      }

      if (props.activeTab == ClassTypeEnum.CLASS) {
        createMessage.success(`Copied ${list.length} Class(es)`);
      } else {
        createMessage.success(`Copied ${list.length} Classification(s)`);
      }
      handleCancel();
      handleRefresh();
    } catch (error: any) {
      createMessage.error(String(error));
    }

    isLoading.value = false;
  };
</script>
<style scoped lang="less">
  .saveTo__content {
    max-height: 600px;
    width: 100%;
    display: flex;
    flex-direction: column;
    // text-align: center;
    margin: 0 auto;
    padding: 26px 26px 0;
    .content__select {
      height: 40px;
    }
    .content__table {
      height: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 20px;
      .header {
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        color: #666666;
        margin-bottom: 14px;
        .icon {
          display: flex;
          align-items: center;
        }
      }
      .title {
        font-weight: 500;
        font-size: 16px;
        line-height: 24px;
        color: #333;
      }
      .action {
        display: flex;
        gap: 20px;
        height: 16px;
        font-weight: 400;
        font-size: 14px;
        line-height: 16px;
        color: @primary-color;
        cursor: pointer;
      }
      .custom_table {
        flex: 1;
        overflow-y: overlay;
        &::-webkit-scrollbar-track {
          background-color: transparent;
        }
        .table {
          height: 100%;
          width: 100%;
        }
      }
    }
  }

  :deep(.ant-select) {
    width: 160px;
  }

  .btn {
    width: auto !important;
    min-width: 90px;
  }
</style>
