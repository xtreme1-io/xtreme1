<template>
  <div :class="`${prefixCls}`" v-loading="loadingRef">
    <div class="classes__left">
      <div class="header">
        <VirtualTab :list="tabListDataset" />
        <VirtualTab :list="tabListOntology" />
      </div>
      <div class="btn">
        <HeaderDropdown :activeTab="activeTab" :datasetType="datasetType" />
      </div>
      <div class="mb-15px">
        <Action
          :selectedList="selectedList"
          :list="cardList"
          @selectAll="handleSelectAll"
          @unSelect="handleUnSelect"
        />
      </div>
      <div style="height: calc(100vh - 154px)">
        <ScrollContainer ref="scrollRef">
          <ClassCard
            :selectedList="selectedList"
            :cardType="CardTypeEnum.selector"
            :cardList="cardList"
            :activeTab="activeTab"
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
      />
    </div>
    <!-- Modal -->
    <CreateClass
      @register="registerCreateClassModal"
      :detail="detail"
      :activeTab="activeTab"
      :datasetType="datasetType"
      :datasetId="datasetId"
      :classId="classId"
      @fetchList="handleRefresh"
    />
    <CreateClassification
      @register="registerCreateClassificationModal"
      :detail="detail"
      :activeTab="activeTab"
      :datasetType="datasetType"
      :datasetId="datasetId"
      :classificationId="classificationId"
      @fetchList="handleRefresh"
    />
  </div>
</template>
<script lang="ts" setup>
  import { ref, unref, provide, onBeforeMount } from 'vue';
  import { VirtualTab } from '/@@/VirtualTab';
  import SearchForm from '/@/views/ontology/classes/components/SearchForm.vue';
  // import SearchForm1 from '/@/views/ontology/classes/components/SearchForm.vue';
  import ClassCard from '/@/views/ontology/classes/components/ClassCard.vue';
  import { ScrollContainer, ScrollActionType } from '/@/components/Container/index';
  import Action from './components/Action.vue';
  import HeaderDropdown from './components/HeaderDropdown.vue';
  import CreateClass from '/@/views/ontology/classes/create/CreateClass.vue';
  import CreateClassification from '/@/views/ontology/classes/create/CreateClassification.vue';

  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useRoute } from 'vue-router';
  import { useModal } from '/@/components/Modal';
  import { handleScroll } from '/@/utils/business/scrollListener';
  import { RouteChildEnum } from '/@/enums/routeEnum';
  import { ClassTypeEnum, datasetTypeEnum } from '/@/api/business/model/ontologyClassesModel';
  import {
    getClassApi,
    getClassByIdApi,
    getClassificationApi,
    getClassificationByIdApi,
  } from '/@/api/business/datasetOntology';
  import {
    GetListParams,
    ClassItem,
    ClassificationItem,
  } from '/@/api/business/model/datasetOntologyModel';
  import { datasetItemDetail } from '/@/api/business/dataset';
  import Scenario from '/@/assets/svg/tags/scenario.svg';
  import ScenarioActive from '/@/assets/svg/tags/scenarioActive.svg';
  import Data from '/@/assets/svg/tags/data.svg';
  import DataActive from '/@/assets/svg/tags/dataActive.svg';
  import Ontology from '/@/assets/svg/tags/class.svg';
  import OntologyActive from '/@/assets/svg/tags/classActive.svg';
  import { setDatasetBreadcrumb } from '/@/utils/business';
  import { CardTypeEnum } from '/@/views/ontology/classes/attributes/data';

  const { t } = useI18n();
  const { prefixCls } = useDesign('datasetOntology');
  const { createMessage } = useMessage();
  const loadingRef = ref<boolean>(false);

  const route = useRoute();
  const pathArr = route.path.split('/');
  // The page path should be consistent with ClassTypeEnum
  const pageType = pathArr[pathArr.length - 1].toLocaleUpperCase();

  const datasetId = Number(route.query.id);
  const ontologyId = ref<Nullable<number>>();
  const classId = ref<number>();
  const classificationId = ref<number>();

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

  /** Clicked Detail */
  const detail = ref<ClassItem | ClassificationItem>();
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
      console.log(detail, activeTab, datasetType, ontologyId);
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
        detail.value = await getClassByIdApi({ id: id });
      } else {
        detail.value = await getClassificationByIdApi({ id: id });
      }

      ontologyId.value = detail.value?.ontologyId;
      classId.value = detail.value?.classId;
      classificationId.value = detail.value?.classificationId;

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
  const cardList = ref<Array<ClassItem | ClassificationItem>>([]);
  const total = ref<number>(0);
  const pageNo = ref<number>(1);
  const getList = async (isConcat = false) => {
    loadingRef.value = true;
    const postData: GetListParams = {
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
        res = await getClassApi(postData);
      } else {
        res = await getClassificationApi(postData);
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
  onBeforeMount(() => {
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

    .classes__left {
      flex: 1;
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
