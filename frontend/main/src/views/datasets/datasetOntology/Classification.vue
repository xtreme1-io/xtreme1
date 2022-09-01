<template>
  <div :class="`${prefixCls}`" v-loading="loadingRef">
    <div class="classes__left">
      <div class="actions">
        <VirtualTab :list="tabListDataset" />
        <VirtualTab :list="tabListOntology" />
      </div>
      <div class="classes__left--header inline-flex">
        <!-- 按钮 -->
        <Button class="mr-10px" type="default" @click="handleCopy" :size="ButtonSize.LG">
          {{ t('business.ontology.copy.copyFrom') }}
        </Button>
        <!-- 按钮 -->
        <Button gradient @click="handleCreate" :size="ButtonSize.LG" noBorder>
          {{ t('common.createText') }}
        </Button>
      </div>
      <!-- 卡片式列表 -->
      <div v-show="cardList.length > 0" style="height: calc(100vh - 154px)">
        <ScrollContainer ref="scrollRef">
          <ClassCard
            type="dataset"
            :cardList="cardList"
            @edit="handleEdit"
            :activeTab="activeTab"
            :isCenter="false"
          />
        </ScrollContainer>
      </div>
      <!-- 空页面 -->
      <div class="empty" v-if="cardList.length == 0">
        <div class="empty-wrapper">
          <img src="../../../assets/images/class/empty-place.png" alt="" />
          <div v-if="pageType == ClassTypeEnum.CLASS" class="tip">
            {{ t('business.ontology.emptyClass') }}
          </div>
          <div v-else class="tip">
            {{ t('business.ontology.emptyClassification') }}
          </div>
          <Button gradient @click="handleCreate" :size="ButtonSize.LG" noBorder>
            {{ t('common.createText') }}
          </Button>
        </div>
      </div>
    </div>
    <!-- v-show="cardList.length > 0" -->
    <div class="classes__right">
      <SearchForm
        @search="handleSearch"
        :isCenter="false"
        :activeTab="activeTab"
        :datasetType="datasetType"
      />
    </div>
    <!-- 弹窗 -->
    <FormModal
      @register="register"
      @fetchList="handleRefresh"
      :detail="detail"
      :activeTab="activeTab"
      :isCenter="false"
      :datasetType="datasetType"
      :datasetId="datasetId"
      :ontologyId="ontologyId"
      :classId="classId"
      :classificationId="classificationId"
    />
    <CopyModal
      @register="copyRegister"
      @copy="handleCopyFrom"
      :activeTab="activeTab"
      :datasetType="datasetType"
    />
  </div>
</template>
<script lang="ts" setup>
  // vue
  import { ref, unref, provide, onBeforeMount } from 'vue';
  // 组件
  import { Button, ButtonSize } from '/@@/Button';
  import { VirtualTab } from '/@@/VirtualTab';
  import SearchForm from './components/SearchForm.vue';
  import ClassCard from './components/ClassCard.vue';
  import FormModal from './components/FormModal.vue';
  import { ScrollContainer, ScrollActionType } from '/@/components/Container/index';
  import CopyModal from './copy-from/CopyModal.vue';
  // 工具
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useRoute } from 'vue-router';
  import { useModal } from '/@/components/Modal';
  import { handleScroll } from '/@/utils/business/scrollListener';
  // 接口
  import { RouteChildEnum } from '/@/enums/routeEnum';
  import { ClassTypeEnum, datasetTypeEnum } from '/@/api/business/model/ontologyClassesModel';
  import {
    getClassApi,
    getClassByIdApi,
    getClassificationApi,
    getClassificationByIdApi,
  } from '/@/api/business/datasetOntology';
  import {
    getClassByIdApi as getOntologyClassByIdApi,
    getClassificationByIdApi as getOntologyClassificationByIdApi,
  } from '/@/api/business/ontologyClasses';
  import {
    GetListParams,
    ClassItem,
    ClassificationItem,
  } from '/@/api/business/model/datasetOntologyModel';
  import { datasetItemDetail } from '/@/api/business/dataset';
  // 图标
  import Data from '/@/assets/svg/tags/data.svg';
  import DataActive from '/@/assets/svg/tags/dataActive.svg';
  import Ontology from '/@/assets/svg/tags/class.svg';
  import OntologyActive from '/@/assets/svg/tags/classActive.svg';
  import { setDatasetBreadcrumb } from '/@/utils/business';
  const [register, { openModal }] = useModal();
  const [copyRegister, { openModal: openCopyModal }] = useModal();

  const { t } = useI18n();
  const { prefixCls } = useDesign('datasetOntology');
  const { createMessage } = useMessage();
  const loadingRef = ref<boolean>(false);

  const route = useRoute();
  const pathArr = route.path.split('/');
  // 这里页面 path 要和 ClassTypeEnum 保持一致
  const pageType = pathArr[pathArr.length - 1].toLocaleUpperCase();
  // console.log('pageType', pageType);

  const datasetId = Number(route.query.id);
  const ontologyId = ref<Nullable<number>>();
  // class
  const datasetType = ref<datasetTypeEnum>(datasetTypeEnum.IMAGE); // dataset的type
  const classId = ref<Nullable<number>>();
  // classification
  const classificationId = ref<Nullable<number>>();

  const tabListDataset = [
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

  const detail = ref<ClassItem | ClassificationItem>();

  const updateDetail = (newDetail) => {
    detail.value = Object.assign(Object(detail.value), newDetail);
  };
  provide('updateDetail', updateDetail);

  // const activeTab = ref<ClassTypeEnum>(ClassTypeEnum.CLASS);
  // const activeTab = ref<ClassTypeEnum>(ClassTypeEnum.CLASSIFICATION);
  const activeTab = ref<ClassTypeEnum>(pageType as ClassTypeEnum);
  // 复制
  const handleCopy = () => {
    openCopyModal(true, {});
  };
  const handleCopyFrom = async (id) => {
    // console.log(id);

    // 根据 id 获取 ontology 内部的 class | classification
    try {
      if (pageType == ClassTypeEnum.CLASS) {
        detail.value = (await getOntologyClassByIdApi({ id: id })) as any;
        // class
        classId.value = detail.value?.id;
      } else {
        detail.value = await getOntologyClassificationByIdApi({ id: id });
        // classification
        classificationId.value = detail.value?.id;
      }
      ontologyId.value = detail.value?.ontologyId;
      // console.log(detail.value);

      detail.value!.id = undefined as any;
      openModal();
    } catch (error: any) {
      createMessage.error(String(error));
    }
  };
  // 新建
  const handleCreate = () => {
    // 重置一些可能来自编辑、继承的修改了的数据
    ontologyId.value = null;
    classificationId.value = null;
    classId.value = null;
    (detail.value as any) = null;
    openModal();
  };
  // 编辑
  const handleEdit = async (id) => {
    try {
      if (pageType == ClassTypeEnum.CLASS) {
        detail.value = await getClassByIdApi({ id: id });
      } else {
        detail.value = await getClassificationByIdApi({ id: id });
      }
      ontologyId.value = detail.value?.ontologyId;
      // class
      classId.value = detail.value?.classId;
      // classification
      classificationId.value = detail.value?.classificationId;
      openModal();
    } catch (error: any) {
      createMessage.error(String(error));
    }
  };

  let cardList = ref<Array<ClassItem | ClassificationItem>>([]);
  const total = ref<number>(0);
  const pageNo = ref<number>(1);

  // 搜索表单
  const searchFormValue = ref({});
  // 搜索事件
  const handleSearch = (formValue?) => {
    searchFormValue.value = formValue?.value;
    getList();
  };
  // 获取列表
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
  // 获取 datasetType
  const getDatasetType = async () => {
    const res = await datasetItemDetail({ id: datasetId });
    datasetType.value = res.type;
    // NOTE 面包屑
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
    // 0.3调整为都获取 datasetType, 因为 copy from 需要 datasetType
    // if (pageType == ClassTypeEnum.CLASS) {
    //   getDatasetType();
    // }
    getDatasetType();
  });
  // 刷新列表
  const handleRefresh = () => {
    unref(scrollRef)?.scrollTo(0);
    pageNo.value = 1;
    cardList.value = [];
    getList();
  };
  provide('handleRefresh', handleRefresh);
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

      .actions {
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
