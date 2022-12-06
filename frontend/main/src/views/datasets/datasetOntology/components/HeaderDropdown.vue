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
  <ImportModal @register="importRegister" />
  <!-- Copy -->
  <ChooseOntology
    @register="registerChooseOntologyModal"
    @next="handleNext"
    @copyAll="handleCopyAll"
  />
  <ChooseClass
    @register="registerChooseClassModal"
    @back="handleBack"
    @next="handleToConflict"
    @copyAll="handleCopyAll"
  />
  <ConflictModal @register="registerConflictModal" @back="handleBack" />
</template>
<script lang="ts" setup>
  // import { useI18n } from '/@/hooks/web/useI18n';
  import Icon, { SvgIcon } from '/@/components/Icon';
  import { Dropdown, Menu } from 'ant-design-vue';
  import ImportModal from './import-modal/ImportModal.vue';
  import ChooseOntology from './copy-modal/ChooseOntology.vue';
  import ChooseClass from './copy-modal/ChooseClass.vue';
  import ConflictModal from './copy-modal/ConflictModal.vue';
  // import { ClassTypeEnum } from '/@/api/business/model/ontologyClassesModel';
  // import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  import { useModal } from '/@/components/Modal';
  import { onMounted, ref } from 'vue';
  import { ICopyEnum } from './copy-modal/data';
  import { GetListParams } from '/@/api/business/model/ontologyClassesModel';
  import { getClassApi, getClassificationApi } from '/@/api/business/ontologyClasses';
  import { validateClassConflict, validateClassificationConflict } from './utils';

  // const { t } = useI18n();

  // const props = defineProps<{ activeTab: ClassTypeEnum; datasetType: datasetTypeEnum }>();
  // const emits = defineEmits(['copy', 'create']);

  const selectedOntologyId = ref<number | string>();
  /** Copy Modal */
  const [registerChooseOntologyModal, { openModal: openChooseOntologyModal }] = useModal();
  const [registerChooseClassModal, { openModal: openChooseClassModal }] = useModal();
  const [registerConflictModal, { openModal: openConflictModal }] = useModal();
  const handleOpenCopy = () => {
    openChooseOntologyModal(true, {});
  };
  const handleNext = (ontologyId) => {
    console.log(ontologyId);
    selectedOntologyId.value = ontologyId;
    openChooseClassModal(true, { ontologyId: selectedOntologyId.value });
  };
  const handleBack = (type: ICopyEnum) => {
    if (type == ICopyEnum.ONTOLOGY) {
      openChooseOntologyModal(true, {});
    } else if (type == ICopyEnum.CLASSES) {
      openChooseClassModal(true, { ontologyId: selectedOntologyId.value });
    }
  };
  const handleToConflict = ({ ClassSelectedList, ClassificationSelectedList }) => {
    const { conflictClassList, conflictClassificationList } = getAllConflictResolution(
      ClassSelectedList,
      ClassificationSelectedList,
    );

    console.log(conflictClassList, conflictClassificationList);
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
  const handleCopyAll = async (type: ICopyEnum) => {
    await getSelectedOntologyList();

    const { conflictClassList, conflictClassificationList } = getAllConflictResolution(
      ontologyClassList.value,
      ontologyClassificationList.value,
    );

    if (conflictClassList.length > 0 || conflictClassificationList.length > 0) {
      openConflictModal(true, {
        type: type,
        conflictClassList,
        conflictClassificationList,
      });
    } else {
      handleConfirm();
    }
  };
  // TODO
  const handleConfirm = async (classList: any[] = [], classificationList: any[] = []) => {
    const tempClassList = [...classList, ...noConflictClassList.value];
    const tempClassificationList = [...classificationList, ...noConflictClassificationList.value];

    const params = {
      classIds: tempClassList.map((item) => item.id),
      classificationIds: tempClassificationList.map((item) => item.id),
    };

    console.log(params);
  };

  const noConflictClassList = ref<any[]>([]);
  const noConflictClassificationList = ref<any[]>([]);
  const getAllConflictResolution = (classList, classificationList) => {
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

  const ontologyClassList = ref<any[]>([]);
  const ontologyClassificationList = ref<any[]>([]);

  // TODO get ontology classList and classificationList, max 100
  const getSelectedOntologyList = async () => {
    const postData: GetListParams = {
      pageNo: 1,
      pageSize: 100,
      ontologyId: Number(selectedOntologyId.value),
    };
    const classRes = await getClassApi(postData);
    ontologyClassList.value = classRes.list ?? [];

    const classificationRes = await getClassificationApi(postData);
    ontologyClassificationList.value = classificationRes.list ?? [];
  };

  // TODO get datasetOntology list
  const datasetClassList = ref<any[]>([]);
  const datasetClassificationList = ref<any[]>([]);
  const getDatasetOntologyList = async () => {
    datasetClassList.value = [];
    datasetClassificationList.value = [];
  };

  onMounted(() => {
    getDatasetOntologyList();
  });

  /** Import */
  const [importRegister, { openModal: openImportModal }] = useModal();
  const handleImport = () => {
    openImportModal();
  };
  const handleExport = () => {};
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
