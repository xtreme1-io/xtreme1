<template>
  <div class="h-36px inline-flex gap-10px items-center">
    <Dropdown placement="bottomRight" trigger="click" overlayClassName="headerDropdown">
      <div class="ellipsis_box">
        <Icon class="ellipsis_box-icon" icon="gridicons:ellipsis" :size="18" />
      </div>
      <template #overlay>
        <Menu>
          <Menu.Item @click="handleOpenCopy">
            <div class="flex gap-10px items-center">
              <SvgIcon class="icon" name="ontology-copy" />
              <div class="title">
                {{ 'Copy from Ontology Center' }}
              </div>
            </div>
          </Menu.Item>
          <Menu.Item @click="handleImport">
            <div class="flex gap-10px items-center">
              <SvgIcon class="icon" name="ontology-import" />
              <div class="title">
                {{ 'Import by Json' }}
              </div>
            </div>
          </Menu.Item>
          <Menu.Item @click="handleExport">
            <div class="flex gap-10px items-center">
              <SvgIcon class="icon" name="ontology-export" />
              <div class="title">
                {{ 'Export as Json' }}
              </div>
            </div>
          </Menu.Item>
        </Menu>
      </template>
    </Dropdown>
  </div>
  <!-- Modal -->
  <ImportModal
    @register="importRegister"
    @fetchList="
      () => {
        emits('fetchList');
      }
    "
  />
  <!-- Copy -->
  <ChooseOntology
    @register="registerChooseOntologyModal"
    :datasetType="props.datasetType"
    @next="handleToClasses"
    @copyAll="handleCopyAll"
  />
  <ChooseClass
    @register="registerChooseClassModal"
    @back="handleBack"
    @next="handleToConflict"
    @copyAll="handleCopyAll"
  />
  <ConflictModal @register="registerConflictModal" @back="handleBack" @confirm="handleConfirm" />
</template>
<script lang="ts" setup>
  // import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import Icon, { SvgIcon } from '/@/components/Icon';
  import { Dropdown, Menu } from 'ant-design-vue';
  import ImportModal from './import-modal/ImportModal.vue';
  import ChooseOntology from './copy-modal/ChooseOntology.vue';
  import ChooseClass from './copy-modal/ChooseClass.vue';
  import ConflictModal from './copy-modal/ConflictModal.vue';
  import { useModal } from '/@/components/Modal';
  import { onMounted, ref } from 'vue';
  import { ICopyEnum } from './copy-modal/data';
  import {
    getDatasetClassesParams,
    getOntologyClassesParams,
    ICopyClassificationParams,
    ICopyClassParams,
  } from '/@/api/business/model/classesModel';
  import {
    getOntologyClassApi,
    getOntologyClassificationApi,
    copyClassFromOntologyApi,
    copyClassificationFromOntologyApi,
    getDatasetClassApi,
    getDatasetClassificationApi,
  } from '/@/api/business/classes';
  import { validateClassConflict, validateClassificationConflict } from './utils';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';

  // const { t } = useI18n();
  const { createMessage } = useMessage();

  const props = defineProps<{
    datasetId: string | number;
    datasetType: datasetTypeEnum;
    selectedList: any[];
  }>();
  const emits = defineEmits(['fetchList']);

  const selectedOntologyId = ref<number | string>();
  /** Copy Modal */
  const [
    registerChooseOntologyModal,
    { openModal: openChooseOntologyModal, closeModal: closeChooseOntologyModal },
  ] = useModal();
  const [
    registerChooseClassModal,
    { openModal: openChooseClassModal, closeModal: closeChooseClassModal },
  ] = useModal();
  const [registerConflictModal, { openModal: openConflictModal, closeModal: closeConflictModal }] =
    useModal();
  const handleOpenCopy = () => {
    openChooseOntologyModal(true, { isClear: true });
  };
  const handleToClasses = (ontologyId, ontologyName) => {
    closeChooseOntologyModal();

    selectedOntologyId.value = ontologyId;
    openChooseClassModal(true, { ontologyId: selectedOntologyId.value, ontologyName });
  };
  const handleBack = (type: ICopyEnum) => {
    closeChooseClassModal();
    closeConflictModal();

    if (type == ICopyEnum.ONTOLOGY) {
      openChooseOntologyModal(true, {});
    } else if (type == ICopyEnum.CLASSES) {
      openChooseClassModal(true, { ontologyId: selectedOntologyId.value });
    }
  };
  const handleToConflict = async ({ ClassSelectedList, ClassificationSelectedList }) => {
    const { conflictClassList, conflictClassificationList } = await getAllConflictResolution(
      ClassSelectedList,
      ClassificationSelectedList,
    );

    closeChooseClassModal();

    if (conflictClassList.length > 0 || conflictClassificationList.length > 0) {
      openConflictModal(true, {
        type: ICopyEnum.CLASSES,
        conflictClassList,
        conflictClassificationList,
      });
    } else {
      handleConfirm();
    }
  };
  const handleCopyAll = async (type: ICopyEnum, ontologyId?: number) => {
    if (ontologyId) selectedOntologyId.value = ontologyId;

    await getSelectedOntologyList();

    const { conflictClassList, conflictClassificationList } = await getAllConflictResolution(
      ontologyClassList.value,
      ontologyClassificationList.value,
    );

    closeChooseOntologyModal();
    closeChooseClassModal();

    // console.log('conflict result: ', conflictClassList, conflictClassificationList);
    if (conflictClassList.length > 0 || conflictClassificationList.length > 0) {
      // console.log(conflictClassList, conflictClassificationList);
      openConflictModal(true, {
        type: type,
        conflictClassList,
        conflictClassificationList,
      });
    } else {
      handleConfirm();
    }
  };

  // Confirm Copy
  const handleConfirm = async (classList: any[] = [], classificationList: any[] = []) => {
    // copy class
    const tempClassList = [...classList, ...noConflictClassList.value];
    tempClassList.length > 0 && (await copyClass(tempClassList));

    // copy classification
    const tempClassificationList = [...classificationList, ...noConflictClassificationList.value];
    tempClassificationList.length > 0 && (await copyClassification(tempClassificationList));

    createMessage.success(
      `Copied ${tempClassList.length} Class(es) and ${tempClassificationList.length} Classification(s)`,
    );
    emits('fetchList');
  };
  const copyClass = async (list: any[]) => {
    const params: ICopyClassParams = {
      datasetId: props.datasetId,
      ontologyId: selectedOntologyId.value as string,
      classIds: list.map((item) => item.id),
    };
    await copyClassFromOntologyApi(params);
  };
  const copyClassification = async (list: any[]) => {
    const params: ICopyClassificationParams = {
      datasetId: props.datasetId,
      ontologyId: selectedOntologyId.value as string,
      classificationIds: list.map((item) => item.id),
    };
    await copyClassificationFromOntologyApi(params);
  };

  /** noConflict list */
  const noConflictClassList = ref<any[]>([]);
  const noConflictClassificationList = ref<any[]>([]);
  const getAllConflictResolution = async (classList, classificationList) => {
    await getDatasetOntologyList();

    const classRes = validateClassConflict(classList, datasetClassList.value);
    const classificationRes = validateClassificationConflict(
      classificationList,
      datasetClassificationList.value,
    );

    noConflictClassList.value = classRes.noConflictList;
    noConflictClassificationList.value = classificationRes.noConflictList;

    return {
      conflictClassList: classRes.conflictList,
      conflictClassificationList: classificationRes.conflictList,
    };
  };

  // get ontology classList and classificationList, max 100
  const ontologyClassList = ref<any[]>([]);
  const ontologyClassificationList = ref<any[]>([]);
  const getSelectedOntologyList = async () => {
    const postData: getOntologyClassesParams = {
      pageNo: 1,
      pageSize: 100,
      ontologyId: Number(selectedOntologyId.value),
    };

    const classRes = await getOntologyClassApi(postData);
    ontologyClassList.value = classRes.list ?? [];

    const classificationRes = await getOntologyClassificationApi(postData);
    ontologyClassificationList.value = classificationRes.list ?? [];
  };

  // get datasetOntology list
  const datasetClassList = ref<any[]>([]);
  const datasetClassificationList = ref<any[]>([]);
  const getDatasetOntologyList = async () => {
    const postData: getDatasetClassesParams = {
      pageNo: 1,
      pageSize: 100,
      datasetId: props.datasetId as number,
    };

    const datasetClassRes = await getDatasetClassApi(postData);
    datasetClassList.value = datasetClassRes.list ?? [];

    const datasetClassificationRes = await getDatasetClassificationApi(postData);
    datasetClassificationList.value = datasetClassificationRes.list ?? [];
  };

  onMounted(() => {
    getDatasetOntologyList();
  });

  /** Import */
  const [importRegister, { openModal: openImportModal }] = useModal();
  const handleImport = () => {
    openImportModal();
  };

  const handleExport = async () => {
    // const res = await exportClass({
    //   sourceId: props.datasetId,
    //   sourceType: 'DATASET',
    // });
    window.open(
      window.location.origin +
        '/api/ontology/exportAsJson' +
        `?sourceId=${props.datasetId}&sourceType=DATASET`,
    );
    // downloadByData(res, 111);
    // downloadByUrl()
  };
</script>
<style lang="less" scoped>
  .ellipsis_box {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    width: 44px;
    border-radius: 8px;
    border-width: 4px;
    background-color: #ddebff;
    border-color: #fff;
    box-shadow: 0 0 0 1px #ccc;
    transition: all 0.3s;
    &:hover {
      box-shadow: 0 0 0 1px @primary-color;
    }
    cursor: pointer;
    &-icon {
      color: @primary-color;
    }
  }
</style>
<style lang="less">
  .headerDropdown {
    // width: 220px;
    border-radius: 8px;
    overflow: hidden;
    background-color: #ffffff;
    box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.15);
    .ant-dropdown-menu {
      padding: 8px 0;
      overflow: hidden;
      box-shadow: none;
      .ant-dropdown-menu-item {
        &:hover {
          background: #e6f0fe;
        }
      }
    }
  }
</style>
