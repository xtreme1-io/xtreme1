<template>
  <div :class="`${prefixCls}`" v-loading="loadingRef">
    <div class="actions">
      <VirtualTab :list="tabList" />
    </div>
    <div class="content">
      <TheProgress :datasetId="(id as unknown as number)" />
      <TheSimilarity
        v-if="datasetType == datasetTypeEnum.IMAGE"
        :datasetId="id as unknown as number"
      />
      <TheDistribution :datasetId="(id as unknown as number)" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  // vue
  import { onMounted, ref } from 'vue';
  // components
  import { VirtualTab } from '/@@/VirtualTab';
  import TheProgress from './components/TheProgress.vue';
  import TheSimilarity from './components/TheSimilarity.vue';
  import TheDistribution from './components/TheDistribution.vue';
  // icons
  import Scenario from '/@/assets/svg/tags/scenario.svg';
  import ScenarioActive from '/@/assets/svg/tags/scenarioActive.svg';
  import Data from '/@/assets/svg/tags/data.svg';
  import DataActive from '/@/assets/svg/tags/dataActive.svg';
  import Ontology from '/@/assets/svg/tags/ontology.svg';
  import OntologyActive from '/@/assets/svg/tags/ontologyActive.svg';
  // utils
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { RouteChildEnum } from '/@/enums/routeEnum';
  import { useRoute } from 'vue-router';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  import { datasetItemDetail } from '/@/api/business/dataset';
  import { setDatasetBreadcrumb } from '/@/utils/business';

  const { t } = useI18n();
  const { prefixCls } = useDesign('datasetOverview');
  const { query } = useRoute();
  const { id } = query;
  const datasetId = Number(id);

  const loadingRef = ref<boolean>(false);

  /** Virtual Tab */
  const tabList = [
    {
      name: t('business.dataset.overview'),
      url: RouteChildEnum.DATASETS_OVERVIEW,
      active: true,
      icon: Scenario,
      activeIcon: ScenarioActive,
    },
    {
      name: t('business.datasetContent.data'),
      url: RouteChildEnum.DATASETS_DATA,
      params: { id: id },
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

  /** DatasetType */
  const datasetType = ref<datasetTypeEnum>(datasetTypeEnum.IMAGE);
  const getDatasetType = async () => {
    const res = await datasetItemDetail({ id: datasetId });
    datasetType.value = res.type;
    setDatasetBreadcrumb(res.name, res.type);
  };

  onMounted(() => {
    getDatasetType();
  });
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-datasetOverview';
  .@{prefix-cls} {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    height: 100%;
    padding: 15px 20px;
    .content {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
  }
</style>
