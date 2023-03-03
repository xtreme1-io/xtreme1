<template>
  <div>
    <div :class="`${prefixCls}`">
      <!-- <WarningModalVue
        @register="warningRegister"
        :lockedId="lockedId"
        :lockedNum="lockedNum"
        :type="(info?.type as datasetTypeEnum)"
      /> -->
      <div class="lockedMask" v-if="lockedNum && lockedNum > 0">
        <div class="flex-1 flex">
          <Icon icon="ant-design:info-circle-outlined" color="#FCB17A" class="mt-1" />
          <span class="ml-2">
            You have {{ lockedNum }} data occupied,please unlock them or continue your annotation
          </span>
        </div>
        <div class="actions">
          <Button type="default" @click="handleContinue">Annotate</Button>
          <Button type="primary" @click="handleUnlock">Unlock</Button>
        </div>
      </div>
      <TipModal @register="tipRegister" />
      <ModelRun
        @register="registerRunModel"
        :selectName="selectName"
        :title="title"
        :modelId="(modelId as number)"
        @run="handleRun"
      >
        <template #select>
          <Select v-model:value="modelId" optionFilterProp="label">
            <Select.Option v-for="item in selectOptions" :key="item.id">
              {{ item.name }}
            </Select.Option>
          </Select>
          <!-- <ApiSelect
          :api="(getModelAllApi as any)"
          v-model:value="modelId"
          :params="{ pageSize: 999, isInteractive: 0, datasetType: info?.type }"
          labelField="name"
          valueField="id"
          resultField="list"
        /> -->
        </template>
      </ModelRun>
      <div :class="`${prefixCls}-content`">
        <MergeModal @register="register" :selectedList="selectedList" @fetchList="fixedFetchList" />
        <FrameMultipleModal
          @register="frameRegister"
          :selectedList="selectedList"
          @fetchList="fixedFetchList"
        />
        <Tools
          :sliderValue="sliderValue"
          :setSlider="setSlider"
          :selectedList="selectedList"
          :dataList="list"
          :pageType="type"
          :modelrunOption="modelrunOption"
          :groundTruthsOption="groundTruthsOption"
          :filterForm="filterForm"
          :datasetType="info?.type"
          v-model:showAnnotation="showAnnotation"
          @handleMakeFrame="handleMakeFrame"
          @handleSelectAll="handleSelectAll"
          @handleAnnotate="handleAnnotate"
          @handleUnselectAll="handleUnselectAll"
          @handleUngroup="handleUngroup"
          @handleDelete="handleDelete"
          @handleMerge="openModal"
          @handleMultipleFrame="openFrameModal"
          @handleModelRun="handleModelRun"
          @fetchList="fixedFetchList"
        />
        <div
          class="list"
          v-show="list.length > 0"
          :style="type === PageTypeEnum.frame ? 'height:calc(100vh - 230px)' as any : null"
        >
          <ScrollContainer ref="scrollRef">
            <ImgCard
              class="listcard"
              v-for="i in list"
              :key="i.id"
              :object="objectMap[i.id]"
              @handleSelected="handleSelected"
              :showAnnotation="showAnnotation"
              :isSelected="selectedList.filter((item) => item === i.id).length > 0"
              :data="i"
              :info="info"
              :type="type"
              @handleDelete="handleDeleteSingle"
              @handleSingleAnnotate="handleSingleAnnotate"
              @handleAnotateFrame="handleAnotateFrame"
            />
          </ScrollContainer>
        </div>
        <div v-if="list.length === 0" class="empty">
          <div class="text-center wrapper">
            <img class="inline-block mb-4" width="136" :src="datasetEmpty" alt="" />
            <div class="mb-4 text-primary">No items in this dataset yet.</div>
            <!-- <Button :size="ButtonSize.LG" gradient @click="handleUpload">Upload Data</Button> -->
          </div>
        </div>
      </div>
      <div class="sider">
        <Input
          autocomplete="off"
          v-model:value="name"
          :placeholder="t('business.ontology.searchForm.searchItems')"
        >
          <template #suffix>
            <Icon icon="ant-design:search-outlined" style="color: #aaa" size="16" />
          </template>
        </Input>
        <div class="custom-item">
          <div class="custom-label font-bold">Sort</div>
          <Select style="flex: 1" size="small" v-model:value="sortField">
            <Select.Option v-for="item in dataSortOption" :key="item.value" :value="item.value">
              {{ item.label }}
            </Select.Option>
          </Select>
        </div>
        <div class="custom-item">
          <Radio.Group name="sortType" v-model:value="sortType">
            <Radio v-for="item in SortTypeOption" :key="item.value" :value="item.value">
              <span class="radioText">{{ item.label }}</span>
            </Radio>
          </Radio.Group>
        </div>
        <div class="filter">
          <div class="font-bold mb-2 flex justify-between">
            <div>Filter</div>
            <div>
              <SvgIcon @click="resetFilter" name="reload" />
            </div>
          </div>
          <CollContainer icon="mdi:calendar-month" title="Uploaded date">
            <DatePicker v-model:start="start" v-model:end="end" />
          </CollContainer>
          <CollContainer icon="mdi:calendar-month" title="Status">
            <Radio.Group name="status" v-model:value="annotationStatus">
              <Radio :value="undefined">
                <SvgIcon name="annotated" />
                <span class="ml-2">All</span>
              </Radio>
              <Radio value="ANNOTATED">
                <SvgIcon name="annotated" />
                <span class="ml-2">Annotated({{ countFormat(statusInfo.annotatedCount) }})</span>
              </Radio>
              <Radio value="NOT_ANNOTATED">
                <SvgIcon name="notAnnotated" />
                <span class="ml-2"
                  >Not Annotated({{ countFormat(statusInfo.notAnnotatedCount) }})</span
                >
              </Radio>
              <Radio value="INVALID">
                <SvgIcon name="invalid" />
                <span class="ml-2">Invalid({{ countFormat(statusInfo.invalidCount) }})</span>
              </Radio>
            </Radio.Group>
          </CollContainer>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import {
    ref,
    // computed,
    unref,
    onBeforeMount,
    reactive,
    watch,
    onMounted,
    onUnmounted,
  } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import {
    datasetApi,
    datasetObjectApi,
    deleteBatchDataset,
    getLockedByDataset,
    getStatusNum,
    hasOntologyApi,
    makeFrameSeriesApi,
    takeRecordByData,
    takeRecordByDataModel,
    ungroupFrameSeriesApi,
    unLock,
  } from '/@/api/business/dataset';
  import { ScrollContainer, ScrollActionType } from '/@/components/Container/index';
  import { useRoute } from 'vue-router';
  import {
    DatasetGetResultModel,
    DatasetItem,
    DatasetListItem,
    datasetTypeEnum,
    SortFieldEnum,
  } from '/@/api/business/model/datasetModel';
  import { dataSortOption, SortTypeOption, PageTypeEnum } from './components/data';
  // import emitter from 'tiny-emitter/instance';
  import ImgCard from './components/ImgCard.vue';
  import Tools from './components/Tools.vue';
  import { Select, Radio, Input, Modal } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { datasetItemDetail } from '/@/api/business/dataset';
  import { dataTypeEnum } from '/@/api/business/model/datasetModel';
  import CollContainer from '/@@/CollContainer/index.vue';
  import DatePicker from '/@@/DatePicker/index.vue';
  import type { Dayjs } from 'dayjs';
  import { SortTypeEnum } from '/@/api/model/baseModel';
  import { useModal } from '/@/components/Modal';
  import Icon, { SvgIcon } from '/@/components/Icon';
  import MergeModal from './components/MergeModal.vue';
  import FrameMultipleModal from './components/FrameMultipleModal.vue';
  import { handleScroll } from '/@/utils/business/scrollListener';
  import datasetEmpty from '/@/assets/images/dataset/data_empty.png';
  // import WarningModalVue from './components/WarningModal.vue';
  import { ModelRun } from '/@@/ModelRun';
  import { PreModelParam } from '/@/api/business/model/modelsModel';
  import { countFormat, goToTool, setDatasetBreadcrumb } from '/@/utils/business';
  import { useLoading } from '/@/components/Loading';
  import { setEndTime, setStartTime } from '/@/utils/business/timeFormater';
  import TipModal from './components/TipModal.vue';
  import { Button } from '/@/components/BasicCustom/Button';
  import { getModelAllApi } from '/@/api/business/models';
  import { useFlowLayout } from '/@/hooks/web/useFlowLayout';
  // import { VScroll } from '/@/components/VirtualScroll/index';
  // const [warningRegister, { openModal: openWarningModal, closeModal: closeWarningModal }] =
  //   useModal();
  const [tipRegister, { openModal: openTipModal }] = useModal();
  const [registerRunModel, { openModal: openRunModal }] = useModal();
  const [open, close] = useLoading({});
  const { query } = useRoute();
  const { t } = useI18n();
  const { prefixCls } = useDesign('datasetContent');
  //TODO 暂时不确定数据类型，使用any占位
  const list = ref<DatasetItem[]>([]);
  const selectedList: any = ref([]);
  const sliderValue = ref<number>(4);
  const info = ref<DatasetListItem>();
  const start = ref<Nullable<Dayjs>>(null);
  const end = ref<Nullable<Dayjs>>(null);
  const showAnnotation = ref<boolean>(false);
  const name = ref<string>('');
  const sortField = ref<SortFieldEnum>(SortFieldEnum.NAME);
  const sortType = ref<SortTypeEnum>(SortTypeEnum.ASC);
  const lockedId = ref<number>(0);
  const lockedNum = ref<number>(0);

  const type = ref<PageTypeEnum>();
  const { id, dataId } = query;
  const [register, { openModal }] = useModal();
  const [frameRegister, { openModal: openFrameModal }] = useModal();
  const scrollRef = ref<Nullable<ScrollActionType>>(null);
  const total = ref<number>(0);
  const pageNo = ref<number>(1);
  const modelrunOption = ref<any>();
  const annotationStatus = ref<any>();
  const selectName = t('business.models.models');
  const title = t('business.models.run.runModel');
  const modelId = ref<number>();
  const selectOptions = ref<any>();
  const statusInfo = ref<any>({});
  const groundTruthsOption = ref([
    {
      label: 'Without Project',
      value: '-1',
    },
  ]);
  const objectMap = ref<Record<string, any>>({});
  onBeforeMount(async () => {
    // fetchList({});
    // max.value = await getMaxCountApi({ datasetId: id as unknown as number });
    // endCount.value = max.value;
    info.value = await datasetItemDetail({ id: id as string });
    getSelectOptions();
    setDatasetBreadcrumb(info.value.name, info.value.type);
  });

  let filterForm = reactive({
    name,
    createStartTime: start,
    sortField,
    ascOrDesc: sortType,
    createEndTime: end,
    annotationStatus: annotationStatus,
  });
  let timeout;
  onMounted(async () => {
    console.log(scrollRef.value);
    fetchStatusNum();
    getLockedData();
    fetchList(filterForm);
    document.addEventListener('visibilitychange', getLockedData);
    handleScroll(scrollRef, () => {
      if (total.value > list.value.length) {
        pageNo.value++;
        fetchList(filterForm, true);
      }
    });
    watch(filterForm, () => {
      /* ... */
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        fetchFilterFun(filterForm);
      }, 400);
    });
  });

  const fetchStatusNum = async () => {
    statusInfo.value = await getStatusNum({ datasetId: id as unknown as number });
  };

  onUnmounted(async () => {
    document.removeEventListener('visibilitychange', getLockedData);
    // window.sessionStorage.removeItem('breadcrumbTitle');
    // window.sessionStorage.removeItem('breadcrumbType');
  });

  const getLockedData = async () => {
    const res = await getLockedByDataset({
      datasetId: id,
    });
    if (res) {
      // openWarningModal();
      lockedId.value = res.recordId;
      lockedNum.value = res.lockedNum || 0;
      // fixedFetchList();
    } else {
      lockedNum.value = 0;
      // closeWarningModal();
      // fixedFetchList();
    }
  };

  const fetchFilterFun = async (filter) => {
    handleReset();
    fetchList(filter, false);
  };

  const resetFilter = () => {
    filterForm.name = '';
    filterForm.createStartTime = null;
    filterForm.sortField = SortFieldEnum.NAME;
    filterForm.ascOrDesc = SortTypeEnum.ASC;
    filterForm.createEndTime = null;
    filterForm.annotationStatus = undefined;
  };

  const getSelectOptions = async () => {
    const res = await getModelAllApi({
      pageSize: 999,
      isInteractive: 0,
      datasetType: info.value?.type as datasetTypeEnum,
    });
    selectOptions.value = res;
    modelId.value = selectOptions.value?.[0]?.id;
  };

  const fetchList = async (filter?, fetchType?) => {
    open();
    let params = {
      pageNo: pageNo.value,
      pageSize: 100,
      datasetId: id as string,
      // listType: listTypeEnum.list,

      ...filter,
      createStartTime:
        filter.createStartTime && filter.createEndTime
          ? setStartTime(filter.createStartTime)
          : undefined,
      createEndTime:
        filter.createEndTime && filter.createStartTime
          ? setEndTime(filter.createEndTime)
          : undefined,
    };
    if (dataId) {
      params.ids = [dataId].toString();
    }

    try {
      let tempList: DatasetItem[];
      if (fetchType) {
        const res: DatasetGetResultModel = await datasetApi(params);
        tempList = res.list;
        list.value = list.value.concat(res.list);
        total.value = res.total;
      } else {
        const res: DatasetGetResultModel = await datasetApi(params);
        tempList = res.list;
        list.value = res.list;
        total.value = res.total;
      }
      const dataIds = tempList.map((e) => e.id);
      if (dataIds.length)
        datasetObjectApi({ dataIds: dataIds.toString() }).then((res) => {
          const map = {};
          res.reduce((res, item) => {
            const { objects, dataId } = item;
            if (!res[dataId]) {
              res[dataId] = [];
            }
            res[dataId] = objects.map((o) => o.classAttributes);
            return map;
          }, map);
          Object.assign(objectMap.value, map);
        });

      fetchStatusNum();
    } catch (error) {
      console.log(error);
    }
    close();
  };

  const fixedFetchList = () => {
    fetchFilterFun(filterForm);
  };

  const handleMakeFrame = async () => {
    await makeFrameSeriesApi({
      datasetId: id as unknown as number,
      dataIds: selectedList.value,
    });
    fixedFetchList();
  };

  const handleUngroup = async () => {
    await ungroupFrameSeriesApi({
      datasetId: id as unknown as number,
      dataIds: selectedList.value,
    });
    fixedFetchList();
  };

  const handleDelete = async () => {
    Modal.confirm({
      title: () => 'Delete Data',
      content: () =>
        'Are you sure to delete the selected items or series?This action is irreversible',
      okText: t('common.delText'),
      okButtonProps: {
        danger: true,
      },
      onOk() {
        console.log(id);
        return new Promise(async (resolve) => {
          await deleteBatchDataset({
            ids: selectedList.value,
            datasetId: id as unknown as number,
          });
          fixedFetchList();
          resolve(1);
        }).catch(() => console.log('Oops errors!'));
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onCancel() {},
    });
  };

  const handleDeleteSingle = async (dataId, callback) => {
    try {
      await deleteBatchDataset({
        ids: [dataId],
        datasetId: id as unknown as number,
      });
    } catch (e) {}
    fixedFetchList();
    if (callback) callback();
  };

  const handleUnlock = async () => {
    await unLock({ id: lockedId.value });
    window.location.reload();
  };

  const handleContinue = async () => {
    goToTool({ recordId: lockedId.value }, info.value?.type as datasetTypeEnum);
    window.location.reload();
  };

  // const getWidth = computed(() => {
  //   return 100 / unref(sliderValue);
  // });

  const setSlider = (val) => {
    sliderValue.value = val;
  };

  // const handleUpload = () => {
  //   console.log(emitter);
  //   emitter.emit('handleUploadModal');
  // };

  const handleSelected = (flag: boolean, id: string) => {
    console.log(flag, id);
    const index = unref(selectedList).findIndex((item: string) => id === item);

    if (index === -1 && flag) {
      unref(selectedList).push(id);
    }

    if (index > -1 && !flag) {
      unref(selectedList).splice(index, 1);
    }
    console.log(unref(selectedList));
  };

  const handleSelectAll = () => {
    selectedList.value = list.value.filter((item) => !item.lockedBy).map((item) => item.id);
  };
  const handleUnselectAll = () => {
    selectedList.value = [];
  };

  const handleAnnotate = async () => {
    let templist: DatasetItem[] = [];
    let type = dataTypeEnum.SINGLE_DATA;
    const data = unref(list).filter((item) => {
      return unref(selectedList).some((record) => record === item.id);
    });
    if (data.some((item) => item.type === dataTypeEnum.SINGLE_DATA)) {
      templist = data.filter((item) => item.type === dataTypeEnum.SINGLE_DATA);
    } else {
      type = dataTypeEnum.FRAME_SERIES;
      templist = selectedList.value;
    }
    const flag = await handleEmpty(templist.map((item) => item.id || item) as string[], type);
    if (!flag) {
      return;
    }

    const res = await takeRecordByData({
      datasetId: id as unknown as number,
      dataIds: templist.map((item) => item.id || item) as string[],
      dataType: type,
    });
    goToTool({ recordId: res }, info.value?.type);
    fixedFetchList();
  };

  const handleSingleAnnotate = async (dataId) => {
    const flag = await handleEmpty([dataId], dataTypeEnum.SINGLE_DATA);
    if (!flag) {
      return;
    }
    const res = await takeRecordByData({
      datasetId: id as unknown as number,
      dataIds: [dataId],
      dataType: dataTypeEnum.SINGLE_DATA,
    });
    getLockedData();
    goToTool({ recordId: res }, info.value?.type);
    fixedFetchList();
  };

  const handleEmpty = async (list, type) => {
    const res = await hasOntologyApi({ datasetId: id as unknown as number });
    if (!res) {
      openTipModal(true, {
        callback: async () => {
          const res = await takeRecordByData({
            datasetId: id as unknown as number,
            dataIds: list,
            dataType: type,
          });
          goToTool({ recordId: res }, info.value?.type);
        },
      });
    }
    return res;
  };

  const handleAnotateFrame = async (dataId) => {
    const res = await takeRecordByData({
      datasetId: id as unknown as number,
      dataIds: [dataId],
      dataType: dataTypeEnum.FRAME_SERIES,
    });
    goToTool({ recordId: res });
    // window.location.reload();
  };

  const handleModelRun = async () => {
    openRunModal(true, {});
  };

  const handleRun = async (params: Nullable<PreModelParam>) => {
    let templist: DatasetItem[] = [];
    let type = dataTypeEnum.SINGLE_DATA;
    const data = unref(list).filter((item) => {
      return unref(selectedList).some((record) => record === item.id);
    });
    if (data.some((item) => item.type === dataTypeEnum.SINGLE_DATA)) {
      templist = data.filter((item) => item.type === dataTypeEnum.SINGLE_DATA);
    } else {
      type = dataTypeEnum.FRAME_SERIES;
      templist = selectedList.value;
    }

    const res = await takeRecordByDataModel({
      datasetId: id as unknown as number,
      dataIds: templist.map((item) => item.id || item) as string[],
      dataType: type,
      modelId: modelId.value as number,
      modelCode: selectOptions.value.filter((item) => item.id === modelId.value)[0].modelCode,
      resultFilterParam: params,
    });
    goToTool({ recordId: res, type: 'modelRun' }, info.value?.type);
    // window.location.reload();
  };

  const handleReset = async () => {
    // list.value = [];
    unref(scrollRef)?.scrollTo(0);
    pageNo.value = 1;
    selectedList.value = [];
  };
  let { cardHeight, cardWidth, paddingX } = useFlowLayout('list', 30);

  // watch(sliderWidthValue, (count) => {
  //   changeWidth(count);
  // });
  // watch(cardWidth, (count) => {
  //   sliderWidthValue.value = parseInt(count);
  // });
  // watchEffect(() => {
  //   cardHeight, paddingX;
  // });
</script>
<style lang="less" scoped>
  @import url(./index.less);
  .list {
    margin: 0 -10px;
    position: relative;
    display: flex;
    height: calc(100vh - 187px);

    :deep(.scrollbar__view) {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(auto-fill, v-bind(cardWidth)) !important;
      gap: 0px !important;
      justify-content: center;
    }

    .listcard {
      // margin: 0 !important;

      margin: v-bind(paddingX) !important;
      height: v-bind(cardHeight) !important;
    }
  }
</style>
