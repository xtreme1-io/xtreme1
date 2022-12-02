<template>
  <div :class="`${prefixCls}`" v-loading="loadingRef">
    <div class="classes__left">
      <div class="header">
        <VirtualTab :list="tabListOntology" />
        <VirtualTab :list="tabListClasses" />
      </div>
      <div class="btn">
        <HeaderAction :activeTab="activeTab" :datasetType="datasetType" />
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
            :cardList="cardList"
            :activeTab="activeTab"
            @edit="handleEdit"
            @create="handleOpenCreate"
          />
        </ScrollContainer>
      </div>
    </div>
    <div class="classes__right">
      <SearchForm @search="handleSearch" :activeTab="activeTab" :datasetType="datasetType" />
    </div>
    <!-- Modal -->
    <CreateClass
      @register="registerCreateClassModal"
      @fetchList="handleRefresh"
      :detail="detail"
      :activeTab="activeTab"
      :datasetType="datasetType"
      :ontologyId="ontologyId"
      @manage="handleOpenFormModal"
    />
    <CreateClassification
      @register="registerCreateClassificationModal"
      @fetchList="handleRefresh"
      :detail="detail"
      :activeTab="activeTab"
      :datasetType="datasetType"
      :ontologyId="ontologyId"
      @manage="handleOpenFormModal"
    />
    <FormModal
      @register="registerFormModal"
      @fetchList="handleRefresh"
      @back="handleBack"
      :detail="detail"
      :activeTab="activeTab"
      :datasetType="datasetType"
      :ontologyId="ontologyId"
    />
  </div>
</template>
<script lang="ts" setup>
  // vue
  import { ref, unref, onMounted, provide } from 'vue';
  // components
  import { VirtualTab } from '/@@/VirtualTab';
  import SearchForm from './components/SearchForm.vue';
  import ClassCard from './components/ClassCard.vue';
  import HeaderAction from './components/HeaderAction.vue';
  import Action from './components/Action.vue';
  import CreateClass from './create/CreateClass.vue';
  import CreateClassification from './create/CreateClassification.vue';
  import FormModal from './create/FormModal.vue';
  import { ScrollContainer, ScrollActionType } from '/@/components/Container/index';
  import { handleScroll } from '/@/utils/business/scrollListener';
  // icons
  import Ontology from '/@/assets/svg/tags/ontology.svg';
  import OntologyActive from '/@/assets/svg/tags/ontologyActive.svg';
  import Scenario from '/@/assets/svg/tags/scenario.svg';
  import ScenarioActive from '/@/assets/svg/tags/scenarioActive.svg';
  // utils
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useRoute } from 'vue-router';
  import { useModal } from '/@/components/Modal';
  // api
  import { RouteChildEnum } from '/@/enums/routeEnum';
  import {
    getClassApi,
    getClassByIdApi,
    getClassificationApi,
    getClassificationByIdApi,
  } from '/@/api/business/ontologyClasses';
  import { getOntologyInfoApi } from '/@/api/business/ontology';
  import {
    GetListParams,
    ClassTypeEnum,
    SearchItem,
    ClassItem,
    ClassificationItem,
  } from '/@/api/business/model/ontologyClassesModel';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  import { setDatasetBreadcrumb } from '/@/utils/business';

  const { t } = useI18n();
  const { prefixCls } = useDesign('ontologyClasses');
  const { createMessage } = useMessage();
  const loadingRef = ref<boolean>(false);
  const route = useRoute();
  const pathArr = route.path.split('/');
  const pageType = pathArr[pathArr.length - 1].toLocaleUpperCase();
  const ontologyId = Number(route.query.id);
  const datasetType = ref<datasetTypeEnum>(datasetTypeEnum.LIDAR_BASIC);

  /** Virtual Tab */
  const tabListOntology = [
    {
      name: t('business.ontology.ontology'),
      url:
        pageType == ClassTypeEnum.CLASS
          ? RouteChildEnum.DATASETS_CLASS
          : RouteChildEnum.DATASETS_CLASSIFICATION,
      active: true,
      params: {},
      icon: Ontology,
      activeIcon: OntologyActive,
    },
    {
      name: t('business.ontology.scenario'),
      url: RouteChildEnum.ONTOLOGY_SCENARIO,
      active: false,
      params: {},
      icon: Scenario,
      activeIcon: ScenarioActive,
    },
  ];

  const tabListClasses = [
    {
      name: t('business.class.class'),
      url: RouteChildEnum.ONTOLOGY_CLASS,
      active: pageType == ClassTypeEnum.CLASS,
      params: { id: ontologyId },
    },
    {
      name: t('business.class.classification'),
      url: RouteChildEnum.ONTOLOGY_CLASSIFICATION,
      active: pageType == ClassTypeEnum.CLASSIFICATION,
      params: { id: ontologyId },
    },
  ];

  type detailItem = ClassItem | ClassificationItem;
  const detail = ref<detailItem>();

  const updateDetail = (newDetail) => {
    detail.value = Object.assign(Object(detail.value), newDetail);
  };
  provide('updateDetail', updateDetail);
  const activeTab = ref<ClassTypeEnum>(pageType as ClassTypeEnum);

  /** Class Modal */
  const [
    registerCreateClassModal,
    { openModal: openCreateClassModal, closeModal: closeCreateClassModal },
  ] = useModal();

  /** Classification Modal */
  const [
    registerCreateClassificationModal,
    { openModal: openCreateClassificationModal, closeModal: closeCreateClassificationModal },
  ] = useModal();

  /** Form Modal */
  const [registerFormModal, { openModal: openFormModal, closeModal: closeFormModal }] = useModal();
  const handleOpenFormModal = () => {
    closeCreateClassModal();
    closeCreateClassificationModal();
    openFormModal();
  };
  const handleBack = () => {
    closeFormModal();
    if (pageType == ClassTypeEnum.CLASS) {
      openCreateClassModal(true, { isKeep: true });
    } else {
      openCreateClassificationModal(true, { isKeep: true });
    }
  };

  /** Create */
  const handleOpenCreate = (isEdit = false) => {
    if (!isEdit) {
      (detail.value as any) = null;
    }
    if (pageType == ClassTypeEnum.CLASS) {
      openCreateClassModal();
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
        console.log(detail.value);
      }
      handleOpenCreate(true);
    } catch (error: any) {
      createMessage.error(String(error));
    }
  };

  /** Search */
  const searchFormValue = ref<SearchItem>({});
  const handleSearch = (formValue) => {
    searchFormValue.value = formValue.value;
    getList();
  };

  /** List */
  const cardList = ref<Array<ClassItem | ClassificationItem>>([]);
  const total = ref<number>(0);
  const pageNo = ref<number>(1);
  const getList = async (isConcat = false) => {
    loadingRef.value = true;

    if (!isConcat) {
      pageNo.value = 1;
      cardList.value = [];
    }

    const postData: GetListParams = {
      pageNo: pageNo.value,
      pageSize: 30,
      ontologyId: ontologyId,
      ...searchFormValue.value,
    };

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

  /** Info */
  const getOntologyInfo = async () => {
    const res = await getOntologyInfoApi({ id: String(ontologyId) });
    datasetType.value = res.type;
    setDatasetBreadcrumb(res.name);
  };

  /** Scroll */
  const scrollRef = ref<Nullable<ScrollActionType>>(null);
  onMounted(() => {
    handleScroll(scrollRef, () => {
      if (total.value > cardList.value.length) {
        pageNo.value++;
        getList(true);
      }
    });
    getList();
    getOntologyInfo();
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
  const selectedList = ref<string[]>([]);
  const handleSelectAll = () => {};
  const handleUnSelect = () => {};
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-ontologyClasses';
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
