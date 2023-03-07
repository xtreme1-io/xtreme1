<template>
  <div :class="`${prefixCls}`" v-loading="loadingRef">
    <div class="classes__left">
      <div class="header">
        <VirtualTab :list="tabListDataset" />
        <VirtualTab :list="tabListOntology" />
        <Input
          style="margin-right: 60px; flex: 1"
          size="large"
          autocomplete="off"
          v-model:value="searchName"
          :placeholder="t('business.ontology.searchForm.searchItems')"
        >
          <template #prefix>
            <Icon icon="ic:twotone-manage-search" style="color: #aaa" size="16" />
          </template>
        </Input>
      </div>
      <div class="btn">
        <HeaderDropdown
          :datasetType="datasetType"
          :datasetId="datasetId"
          @fetchList="handleRefresh"
          :selectedList="selectedList"
        />
      </div>
      <div class="mb-15px">
        <Action
          :activeTab="activeTab"
          :datasetType="datasetType"
          :datasetId="datasetId"
          :selectedList="selectedList"
          @selectAll="handleSelectAll"
          @unSelect="handleUnSelect"
          @fetchList="handleRefresh"
        />
      </div>
      <div style="height: calc(100vh - 200px)">
        <ScrollContainer ref="scrollRef">
          <ClassCard
            :selectedList="selectedList"
            :cardType="CardTypeEnum.selector"
            :cardList="cardList"
            :activeTab="activeTab"
            :isCenter="false"
            @edit="handleEdit"
            @create="handleOpenCreate"
            @handleSelected="handleSelected"
          />
        </ScrollContainer>
      </div>
    </div>
    <div class="classes__right">
      <SearchForm
        @search="handleSearch"
        :isCenter="false"
        :activeTab="activeTab"
        :datasetType="datasetType"
        :searchName="searchName"
      />
    </div>
    <!-- Modal -->
    <CreateClass
      @register="registerCreateClassModal"
      :detail="detail"
      :datasetType="datasetType"
      :datasetId="datasetId"
      @fetchList="handleRefresh"
    />
    <CreateClassification
      @register="registerCreateClassificationModal"
      :detail="detail"
      :datasetType="datasetType"
      :datasetId="datasetId"
      @fetchList="handleRefresh"
    />
  </div>
</template>
<script lang="ts" setup>
  import { Input } from 'ant-design-vue';
  import { ref, unref, provide, onMounted } from 'vue';
  import { VirtualTab } from '/@@/VirtualTab';
  import SearchForm from '/@/views/ontology/classes/components/SearchForm.vue';
  // import SearchForm1 from '/@/views/ontology/classes/components/SearchForm.vue';
  import ClassCard from '/@/views/ontology/classes/components/ClassCard.vue';
  import { ScrollContainer, ScrollActionType } from '/@/components/Container/index';
  import Action from './components/Action.vue';
  import HeaderDropdown from './components/HeaderDropdown.vue';
  import CreateClass from '/@/views/ontology/classes/create/CreateClass.vue';
  import CreateClassification from '/@/views/ontology/classes/create/CreateClassification.vue';
  import Icon, { SvgIcon } from '/@/components/Icon/index';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useRoute } from 'vue-router';
  import { useModal } from '/@/components/Modal';
  import { handleScroll } from '/@/utils/business/scrollListener';
  import { RouteChildEnum } from '/@/enums/routeEnum';
  import {
    getDatasetClassApi,
    getDatasetClassByIdApi,
    getDatasetClassificationApi,
    getDatasetClassificationByIdApi,
  } from '/@/api/business/classes';
  import {
    ClassTypeEnum,
    getDatasetClassesParams,
    datasetClassItem,
    datasetClassificationItem,
  } from '/@/api/business/model/classesModel';
  import { datasetItemDetail } from '/@/api/business/dataset';
  import Scenario from '/@/assets/svg/tags/scenario.svg';
  import ScenarioActive from '/@/assets/svg/tags/scenarioActive.svg';
  import Data from '/@/assets/svg/tags/data.svg';
  import DataActive from '/@/assets/svg/tags/dataActive.svg';
  import Ontology from '/@/assets/svg/tags/ontology.svg';
  import OntologyActive from '/@/assets/svg/tags/ontologyActive.svg';
  import { setDatasetBreadcrumb } from '/@/utils/business';
  import { CardTypeEnum } from '/@/views/ontology/classes/attributes/data';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';

  const { t } = useI18n();
  const { prefixCls } = useDesign('datasetOntology');
  const { createMessage } = useMessage();
  const loadingRef = ref<boolean>(false);

  const route = useRoute();
  const pathArr = route.path.split('/');
  // The page path should be consistent with ClassTypeEnum
  const pageType = pathArr[pathArr.length - 1].toLocaleUpperCase();

  const datasetId = Number(route.query.id);

  /** Tab */
  const tabListDataset = [
    {
      name: t('business.dataset.overview'),
      url: RouteChildEnum.DATASETS_OVERVIEW,
      params: { id: datasetId },
      icon: Scenario,
      activeIcon: ScenarioActive,
    },
    {
      name: t('business.dataset.data'),
      url: RouteChildEnum.DATASETS_DATA,
      params: { id: datasetId },
      icon: Data,
      activeIcon: DataActive,
    },
    {
      name: t('business.ontology.ontology'),
      url:
        pageType == ClassTypeEnum.CLASS
          ? RouteChildEnum.DATASETS_CLASS
          : RouteChildEnum.DATASETS_CLASSIFICATION,
      active: true,
      params: { id: datasetId },
      icon: Ontology,
      activeIcon: OntologyActive,
    },
  ];
  const tabListOntology = [
    {
      name: t('business.class.class'),
      url: RouteChildEnum.DATASETS_CLASS,
      active: pageType == ClassTypeEnum.CLASS,
      params: { id: datasetId },
    },
    {
      name: t('business.class.classification'),
      url: RouteChildEnum.DATASETS_CLASSIFICATION,
      active: pageType == ClassTypeEnum.CLASSIFICATION,
      params: { id: datasetId },
    },
  ];

  let searchName = ref<string>('');
  /** Clicked Detail */
  const detail = ref<datasetClassItem | datasetClassificationItem>();
  const updateDetail = (newDetail) => {
    detail.value = Object.assign(Object(detail.value), newDetail);
  };
  provide('updateDetail', updateDetail);

  const activeTab = ref<ClassTypeEnum>(pageType as ClassTypeEnum);

  /** Create */
  const [registerCreateClassModal, { openModal: openCreateClassModal }] = useModal();
  const [registerCreateClassificationModal, { openModal: openCreateClassificationModal }] =
    useModal();
  const handleOpenCreate = (isEdit = false) => {
    if (!isEdit) {
      (detail.value as any) = null;
    }
    if (pageType == ClassTypeEnum.CLASS) {
      openCreateClassModal(true, { isEdit });
    } else {
      console.log('handleOpenCreate', isEdit);
      openCreateClassificationModal(true, { isEdit });
    }
  };

  /** Edit */
  const handleEdit = async (id) => {
    try {
      if (pageType == ClassTypeEnum.CLASS) {
        detail.value = await getDatasetClassByIdApi({ id: id });
      } else {
        detail.value = await getDatasetClassificationByIdApi({ id: id });
      }

      handleOpenCreate(true);
    } catch (error: any) {
      createMessage.error(String(error));
    }
  };

  /** Search */
  const searchFormValue = ref({});
  const handleSearch = (formValue?) => {
    searchFormValue.value = formValue?.value;
    getList();
  };

  /** List */
  const cardList = ref<Array<datasetClassItem | datasetClassificationItem>>([]);
  const total = ref<number>(0);
  const pageNo = ref<number>(1);
  const getList = async (isConcat = false) => {
    loadingRef.value = true;
    const postData: getDatasetClassesParams = {
      pageNo: pageNo.value,
      pageSize: 30,
      datasetId: datasetId,
      ...searchFormValue.value,
    };

    if (!isConcat) {
      pageNo.value = 1;
      cardList.value = [];
    }

    let res;
    try {
      if (pageType == ClassTypeEnum.CLASS) {
        res = await getDatasetClassApi(postData);
      } else {
        res = await getDatasetClassificationApi(postData);
      }
      cardList.value = cardList.value.concat(res.list);

      total.value = res.total;
    } catch (error: any) {
      createMessage.error(String(error));
      cardList.value = [];
      total.value = 0;
    }
    loadingRef.value = false;
  };

  /** DatasetType */
  const datasetType = ref<datasetTypeEnum>(datasetTypeEnum.IMAGE);
  const getDatasetType = async () => {
    const res = await datasetItemDetail({ id: datasetId });
    datasetType.value = res.type;
    setDatasetBreadcrumb(res.name, res.type);
  };

  const scrollRef = ref<Nullable<ScrollActionType>>(null);
  onMounted(() => {
    handleScroll(scrollRef, () => {
      if (total.value > cardList.value.length) {
        pageNo.value++;
        getList(true);
      }
    });
    getList();
    getDatasetType();
  });

  /** Refresh */
  const handleRefresh = () => {
    unref(scrollRef)?.scrollTo(0);
    pageNo.value = 1;
    cardList.value = [];
    selectedList.value = [];
    getList();
  };
  provide('handleRefresh', handleRefresh);

  /** Selected */
  const selectedList = ref<any[]>([]);
  const handleSelectAll = () => {
    selectedList.value = [...cardList.value];
  };
  const handleUnSelect = () => {
    selectedList.value = [];
  };
  const handleSelected = (selectItem: any) => {
    const index = unref(selectedList).findIndex((item: any) => selectItem.id === item.id);

    if (index === -1) {
      unref(selectedList).push(selectItem);
    } else {
      unref(selectedList).splice(index, 1);
    }

    console.log(unref(selectedList));
  };

  /** Sync */
  // const [syncRegister, { openModal: openSyncModal }] = useModal();
  // const itemId = ref('');
  // const itemName = ref('');
  // const toSync = (item) => {
  //   // 获取点击项的 id 和 name
  //   itemId.value = item.id;
  //   itemName.value = item.name;
  //   openSyncModal(true, {});
  // };
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-datasetOntology';
  .@{prefix-cls} {
    display: flex;
    height: 100%;
    // height: calc(100% - 30px);

    .classes__left {
      flex: 1;
      // height: 100%;
      // height: calc(100% - 30px);
      position: relative;
      display: flex;
      flex-direction: column;
      padding: 15px 20px;

      .header {
        display: flex;
        margin-bottom: 15px;

        & > div {
          margin-right: 20px;
        }
      }

      .classes__left--header {
        position: absolute;
        right: 20px;
      }

      .btn {
        position: absolute;
        right: 20px;
      }
      .empty {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;

        .empty-wrapper {
          width: 282px;
          display: flex;
          align-items: center;
          flex-direction: column;

          .tip {
            font-size: 16px;
            margin-top: 15px;
            margin-bottom: 15px;
            color: @primary-color;
          }
        }
      }
    }

    .classes__right {
      width: 220px;
      height: 100%;
      background-color: #fff;
    }
  }
</style>
