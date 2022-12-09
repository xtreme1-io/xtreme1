<template>
  <div class="tools">
    <UploadModal
      @register="registerUploadModal"
      :datasetType="props.datasetType"
      :id="(id as unknown as number)"
      @closeUpload="handleCloseUploadModal"
    />
    <ProgressModal
      @register="registerProgressModal"
      :datasetType="props.datasetType"
      :id="(id as unknown as number)"
      @visibleChange="handleProgressVisible"
      @fetchList="reloadList"
    />
    <ExportModal
      @register="registerExportModal"
      :modelrunOption="modelrunOption"
      :groundTruthsOption="groundTruthsOption"
      :filterForm="filterForm"
      @setExportRecord="setExportRecord"
    />
    <Modal
      :title="t('business.datasetContent.terminateExport')"
      @register="registerCancelExportModal"
      :visible="false"
      :cancelText="t('common.cancelText')"
      :okText="t('business.datasetContent.terminate')"
      :okButtonProps="{ danger: true }"
      @ok="handleCloseExportCancelModal"
      wrapClassName="terminateModal"
    >
      <div class="text-center" :style="{ lineHeight: '210px' }">
        {{ t('business.datasetContent.terminateExportPlaceholder') }}
      </div>
    </Modal>
    <div class="wrapper">
      <div class="actions">
        <VirtualTab :list="tabList" />
      </div>
      <div class="view-actions">
        <Button class="mr-2" type="default" @click="handleGoSearch" :size="ButtonSize.LG">
          <Icon icon="ic:twotone-manage-search" size="20" />
          Scenario Search
        </Button>
        <Button type="primary" @click="handleOpenUpload" :size="ButtonSize.LG" noBorder>
          {{ t('business.datasetContent.upload') }}
        </Button>
        <Button class="ml-2" type="default" @click="handleOpenExport" :size="ButtonSize.LG">
          {{ t('common.exportText') }}
        </Button>
      </div>
    </div>
    <div class="wrapper">
      <div class="actions">
        <Dropdown placement="bottomLeft">
          <div class="actionSelect">
            <div class="label">
              <span class="count">{{ selectedList.length }}</span>
              <span class="tips">
                Selected
                <Icon icon="ri:arrow-down-s-fill" />
              </span>
            </div>
          </div>
          <template #overlay>
            <Menu>
              <template
                v-for="(item, index) in pageType === PageTypeEnum.frame
                  ? actionListFrame
                  : datasetType === datasetTypeEnum.IMAGE
                  ? actionImageList
                  : actionList"
                :key="item.text"
              >
                <Authority :value="item.permission ? [item.permission] : undefined">
                  <Menu.Item
                    @click="
                    () => {
                      emits(item.function as any);
                    }
                  "
                    :disabled="
                      (selectedList.length === 0 && index > 1) ||
                      (item.isDisabledFlag && flagReactive[item.isDisabledFlag])
                    "
                  >
                    <div class="action-item">
                      <Icon v-if="item.icon" style="color: #57ccef" size="20" :icon="item.icon" />
                      <img width="20" height="20" v-if="item.img" :src="item.img" alt="" />
                      <span style="display: inline-block; margin-left: 5px">{{ item.text }} </span>
                    </div>
                  </Menu.Item>
                </Authority>
                <Divider v-if="item.hasDivider" style="margin: 5px" />
              </template>
            </Menu>
          </template>
        </Dropdown>
      </div>
      <div class="view-actions" v-if="false">
        <div class="num-wrapper">
          <div class="num-input">1000</div>
          <div class="num-count">/10000</div>
        </div>
        <div class="utils-wrapper">
          <div class="silder">
            <Slider :value="sliderValue" @change="setSlider" :min="1" :max="8" />
          </div>
        </div>
      </div>
      <div
        class="bg-white h-28px w-36px text-center leading-7 rounded cursor-pointer"
        @click="reloadList"
      >
        <SvgIcon name="reload" />
      </div>
    </div>
    <!-- Export -->
    <div v-if="hasExportTask" class="upload-list" :style="!collState ? { height: 'auto' } : {}">
      <div class="header">
        <div class="title">
          <Icon class="download-icon" icon="whh:download" size="18" />
          <span>
            {{ t('common.exportText') }}
            {{
              exportList.filter(
                (item) =>
                  item.status === ExportStatus.COMPLETED || item.status === ExportStatus.FAILED,
              ).length
            }}/{{ exportList.length }}
          </span>
        </div>
        <div class="actions">
          <Icon
            :style="!collState ? { transform: 'rotate(180deg)' } : {}"
            @click="handleColl"
            class="action-coll"
            icon="ph:caret-down"
            size="24"
          />
          <Icon @click="handleCancelExport" class="action-close" icon="mdi:close" size="24" />
        </div>
      </div>
      <div v-if="collState" class="list-wrapper">
        <div v-for="item in exportList" :key="item.id" class="item">
          <div class="name">{{ item.fileName }}</div>
          <div v-if="item.status === ExportStatus.COMPLETED" class="status">
            <Tooltip placement="top" color="rgba(0, 0, 0, 0.6)">
              <template #title>
                <span>Download</span>
              </template>
              <img
                :src="DownloadIcon"
                class="mr-10px ml-10px"
                alt="download"
                @click="handleDownload(item.filePath, item.fileName)"
              />
            </Tooltip>
            <CheckCircleFilled style="color: #7ff0b3" />
          </div>
          <div v-else-if="item.status === ExportStatus.FAILED" class="status">
            <span class="mr-6px text-12px" style="color: #f8827b">
              {{ t('business.datasetContent.process.invalidFormat') }}
            </span>
            <CloseCircleFilled style="color: #f8827b" />
          </div>
          <Progress
            v-else
            style="width: 58px"
            :strokeColor="{ '0%': '#57CCEF', '100%': '#86E5C9' }"
            :percent="exportProgress"
            :strokeWidth="6"
            :showInfo="false"
            trailColor="#F3F3F3"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, unref, defineProps, computed, watch, defineEmits, reactive } from 'vue';
  // import emitter from 'tiny-emitter/instance';
  // import { LoadingOutlined } from '@ant-design/icons-vue';

  import { useI18n } from '/@/hooks/web/useI18n';
  import { useRoute } from 'vue-router';
  import { RouteChildEnum } from '/@/enums/routeEnum';

  import { Slider, Dropdown, Menu, Divider, Progress, Tooltip } from 'ant-design-vue';
  import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons-vue';
  import Icon, { SvgIcon } from '/@/components/Icon/index';
  import { Button, ButtonSize } from '/@@/Button';
  import { VirtualTab } from '/@@/VirtualTab';

  import Modal from '/@@/Modal/index.vue';
  import { useModal } from '/@/components/Modal';
  import UploadModal from './upload/UploadModal.vue';
  import ProgressModal from './upload/ProgressModal.vue';
  import ExportModal from './ExportModal.vue';

  import { exportDataRecordCallBack } from '/@/api/business/dataset';
  import { actionList, actionListFrame, actionImageList, PageTypeEnum } from './data';
  import {
    dataTypeEnum,
    exportFileRecord,
    ExportStatus,
    datasetTypeEnum,
    UploadSourceEnum,
  } from '/@/api/business/model/datasetModel';
  import { ModelListItem } from '/@/api/business/model/modelsModel';
  import { downloadByCorsUrl } from '/@/utils/file/download';

  import Scenario from '/@/assets/svg/tags/scenario.svg';
  import ScenarioActive from '/@/assets/svg/tags/scenarioActive.svg';
  import Data from '/@/assets/svg/tags/data.svg';
  import DataActive from '/@/assets/svg/tags/dataActive.svg';
  import Ontology from '/@/assets/svg/tags/class.svg';
  import OntologyActive from '/@/assets/svg/tags/classActive.svg';
  import DownloadIcon from '/@/assets/svg/dataset/download.svg';
  import { Authority } from '/@/components/Authority';
  import { useGo } from '/@/hooks/web/usePage';

  const go = useGo();
  const makeFrameDisable = ref<boolean>(false);
  const annotateAndModelRun = ref<boolean>(false);
  const flagReactive = reactive({
    makeFrameDisable,
    annotateAndModelRun,
  });
  const { query } = useRoute();
  const { id } = query;
  const { t } = useI18n();

  const tabList = [
    {
      name: t('business.dataset.overview'),
      url: RouteChildEnum.DATASETS_OVERVIEW,
      params: { id: id },
      icon: Scenario,
      activeIcon: ScenarioActive,
    },
    {
      name: t('business.datasetContent.data'),
      url: RouteChildEnum.DATASETS_DATA,
      active: true,
      icon: Data,
      activeIcon: DataActive,
    },
    {
      name: t('business.ontology.ontology'),
      url: RouteChildEnum.DATASETS_CLASS,
      params: { id: id },
      icon: Ontology,
      activeIcon: OntologyActive,
    },
  ];

  const props = defineProps<{
    sliderValue: number;
    setSlider: (val) => void;
    selectedList: string[];
    dataList: any[];
    pageType: PageTypeEnum | undefined;
    groundTruthsOption: any;
    modelrunOption: ModelListItem[];
    filterForm: any;
    datasetType: datasetTypeEnum | undefined;
  }>();

  watch(props, (curr) => {
    const data = unref(props.dataList).filter((item) => {
      return curr.selectedList.some((record) => record === item.id);
    });
    makeFrameDisable.value = !data.every((item) => {
      console.log(item, item.type);
      return item.type === dataTypeEnum.SINGLE_DATA;
    });
    annotateAndModelRun.value =
      data.every((item) => {
        return item.type === dataTypeEnum.FRAME_SERIES;
      }) && data.length > 1;
  });

  const emits = defineEmits([
    'handleSelectAll',
    'handleUnselectAll',
    'fetchList',
    'handleMakeFrame',
    'handleMultipleFrame',
    'handleModelRun',
  ]);

  const reloadList = () => {
    emits('fetchList');
  };

  /** Upload */
  const [registerUploadModal, { openModal: openUploadModal, closeModal: closeUploadModal }] =
    useModal();
  const handleOpenUpload = () => {
    openUploadModal(true, {});
  };
  const [registerProgressModal, { openModal: openProgressModal }] = useModal();

  const fileList = ref<any[]>([]);
  const uploadUrl = ref<string>('');
  const handleCloseUploadModal = (data, source) => {
    console.log('handleCloseUploadModal', data);
    if (source == UploadSourceEnum.LOCAL) {
      fileList.value = data;
      openProgressModal(true, { fileList: fileList.value, source: source });
    } else if (source == UploadSourceEnum.URL) {
      uploadUrl.value = data;
      openProgressModal(true, { uploadUrl: uploadUrl.value, source: source });
    }

    closeUploadModal();
  };
  // Reset fileList after ProgressModal closed
  const handleProgressVisible = (visible: boolean) => {
    if (!visible) {
      fileList.value = [];
      uploadUrl.value = '';
    }
  };

  const handleGoSearch = () => {
    go(RouteChildEnum.SEARCH_SCENARIO);
  };

  /** Export */
  const exportResultList = ref<exportFileRecord[]>([]);
  const [registerExportModal, { openModal: openExportModal }] = useModal();
  const [
    registerCancelExportModal,
    { openModal: openExportCancelModal, closeModal: closeExportCancelModal },
  ] = useModal();
  // Open
  const handleOpenExport = async () => {
    openExportModal();
  };
  // Cancel
  const handleCancelExport = () => {
    if (successExportFilesNum.value != exportList.value.length) {
      openExportCancelModal();
    } else {
      handleCloseExportCancelModal();
    }
  };
  // Close
  const handleCloseExportCancelModal = () => {
    closeExportCancelModal();
    exportList.value = [];
    exportResultList.value = [];
    clearTimeout(exportTimer);
  };

  const exportProgress = ref<any>(0);
  let exportTimer;
  const exportFunc = async (list) => {
    // Current file
    const exportFileList =
      list.filter(
        (item) => item.status !== ExportStatus.COMPLETED && item.status !== ExportStatus.FAILED,
      ) || [];
    if (exportFileList.length > 0) {
      clearTimeout(exportTimer);
      let fileItem = exportFileList[0];
      const getStatus = async () => {
        if (exportFileList.length === 0) {
          clearTimeout(exportTimer);
          return;
        }
        try {
          // If the interface fails, the file information cannot be obtained, and the file name on the page will display pending
          const res = await exportDataRecordCallBack({
            serialNumbers: [fileItem.serialNumber] + '',
          });

          exportList.value = exportList.value.map((item) =>
            item.serialNumber === res[0].serialNumber ? res[0] : item,
          );
          // Calculate progress
          let { generatedNum, totalNum } = res[0];
          generatedNum = (generatedNum ?? 0) * 100;
          totalNum = totalNum ?? 1;
          exportProgress.value = parseInt(generatedNum / totalNum);

          if (res[0].status !== ExportStatus.COMPLETED) {
            exportProgress.value = exportProgress.value == 100 ? 99 : exportProgress.value;
            QueryExport();
          }
        } catch (e) {
          fileItem.status = ExportStatus.FAILED;
        }
      };
      function QueryExport() {
        exportTimer = setTimeout(getStatus, 5000);
      }
      QueryExport();
    } else {
      clearTimeout(exportTimer);
    }
  };

  const setExportRecord = (res) => {
    console.log('setExportRecord', res);
    // File information cannot be obtained here. The current information is custom
    exportList.value = exportList.value.concat([
      { serialNumber: res, status: ExportStatus.GENERATING, fileName: 'pending...' },
    ]);
  };

  const exportList = ref<any>([]);
  watch(
    exportList,
    (list) => {
      exportFunc(list);
    },
    { deep: true },
  );
  // Show Export
  const hasExportTask = computed(
    () => unref(exportList).length > 0 || unref(exportResultList).length > 0,
  );
  // Export Num
  const successExportFilesNum = computed<number>(() => {
    return exportList.value.filter(
      (item) => item.status === ExportStatus.COMPLETED || item.status === ExportStatus.FAILED,
    ).length;
  });
  // Download
  let downloadTimer;
  const handleDownload = (url, fileName) => {
    clearTimeout(downloadTimer);
    downloadTimer = setTimeout(() => {
      downloadByCorsUrl({ url, fileName });
    }, 300);
  };

  const collState = ref(true);
  const handleColl = () => {
    collState.value = !unref(collState);
  };
</script>
<style lang="less" scoped>
  @import url('../index.less');
</style>
