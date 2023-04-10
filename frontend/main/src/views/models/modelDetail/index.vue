<template>
  <div :class="`${prefixCls}`">
    <DetailHeader :headerData="headerData" />
    <div class="body">
      <Tabs v-model:activeKey="activeKey">
        <Tabs.TabPane v-for="item in tabPane" :key="item.key" :tab="item.tab" force-render>
          <!-- 组件 -->
          <Overview
            v-if="item.key == detailType.overview"
            :overviewData="overviewData"
            :datasetType="datasetType"
          />
          <Runs
            @setActiveKey="setActiveKey"
            v-if="item.key == detailType.runs"
            :modelId="modelId"
            :datasetType="datasetType"
            :isLimit="isLimit"
            @reload="handleRefreshQuota"
            :overviewData="overviewData"
          />
          <Settings
            :datasetType="datasetType"
            :overviewData="overviewData"
            v-if="item.key == detailType.settings"
            :modelId="modelId"
            @reload="handleRefreshQuota"
          />
        </Tabs.TabPane>
      </Tabs>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, reactive, computed, onBeforeMount, onMounted, provide, watch } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useRoute, useRouter } from 'vue-router';
  // 组件
  import { Tabs } from 'ant-design-vue';
  import DetailHeader from './components/DetailHeader.vue';
  import Overview from './components/Overview.vue';
  import Runs from './components/Runs.vue';
  import Settings from './components/Settings.vue';
  // 接口
  import { getModelByIdApi, getModelQuotaApi } from '/@/api/business/models';
  import { detailType, IOverview, IHeader } from './components/typing';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  import { RouteNameEnum } from '/@/enums/routeEnum';

  const { prefixCls } = useDesign('modelsDetail');
  const { t } = useI18n();
  const datasetType = ref<datasetTypeEnum>(datasetTypeEnum.LIDAR_BASIC);

  const isInteractive = ref<boolean>(true);
  const activeKey = ref<detailType>(detailType.overview);

  watch(
    () => activeKey.value,
    (tabId) => {
      let query = { tabId, id: modelId };
      // router.push({
      //   name: RouteNameEnum.MODEL_DETAIL,
      //   query,
      //   // params,
      // });
      // 不刷新页面
      window.history.pushState('', '', `/#/models/detail?id=${query.id}&tabId=${query.tabId}`);
    },
  );

  let setActiveKey = (val) => {
    activeKey.value = val;
  };
  // notify 消息跳转携带的一次性参数
  const router = useRouter();
  const { currentRoute } = useRouter();
  activeKey.value = currentRoute.value.query.tabId as any;
  let routeParams = currentRoute.value.params;
  if (routeParams && routeParams.tabId) {
    activeKey.value = routeParams.tabId as detailType.runs;
  }

  const tabPane = computed(() => {
    const arr = [
      { key: detailType.overview, tab: t('business.models.detail.overview') },
      // { key: detailType.runs, tab: t('business.models.detail.runs') },
      // { key: detailType.settings, tab: t('business.models.detail.settings') }
    ];

    // if (!isInteractive?.value){

    // }
    arr.push({ key: detailType.runs, tab: t('business.models.detail.runs') });
    arr.push({ key: detailType.settings, tab: t('business.models.detail.settings') });
    return arr;
  });

  const route = useRoute();
  const modelId = String(route?.query?.id);

  let overviewData: IOverview = reactive({
    isType: false,
    description: '',
    scenario: '',
    classes: [],
    url: '',
  });
  const headerData: IHeader = reactive({
    type: '',
    name: '',
    creator: '',
    createTime: new Date(),
    quotaProgress: 0,
    quotaText: '',
  });

  // 获取当前 Model 详情
  const getModel = async () => {
    const res = await getModelByIdApi({ id: modelId });

    isInteractive.value = res.isInteractive;

    datasetType.value = res.datasetType ?? datasetTypeEnum.LIDAR_BASIC;

    overviewData.isType = res.isType;
    overviewData.description = res.description;
    overviewData.scenario = res.scenario;
    overviewData.classes = res.classes ?? [];
    overviewData.url = res.url ?? '';

    headerData.type = res?.datasetType;
    headerData.name = res.name;
    headerData.creator = res.creatorName;
    headerData.createTime = res.createdAt;
  };

  /** Get ModelQuota */
  const isLimit = ref<boolean>(false);
  const getModelQuota = async () => {
    try {
      const res = await getModelQuotaApi();
      headerData.quotaProgress = (Number(res.usedQuota) / Number(res.totalQuota) ?? 0) * 100;
      headerData.quotaText = `${res.usedQuota || 0}/${res.totalQuota || 0}`;
      isLimit.value = Number(res.usedQuota) == Number(res.totalQuota);
    } catch (error) {}
  };
  const handleRefreshQuota = () => {
    // getModelQuota();
  };

  provide('refreshList', getModel);
  provide('overviewData', overviewData);
  // setInterval(() => {
  //   console.log(overviewData);
  //   overviewData.url = Math.random();
  // }, 1000);

  onBeforeMount(() => {
    getModel();
  });
  onMounted(() => {
    // TODO
    // getModelQuota();
  });
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-modelsDetail';
  .@{prefix-cls} {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    // padding: 20px;
    // background: linear-gradient(180deg, #ebfafe 0%, #f1fdf9 100%);
    background-color: #fff;

    .body {
      flex: 1;

      :deep(.ant-tabs) {
        width: 100%;
        height: 100%;

        .ant-tabs-bar {
          margin-bottom: 0;
          margin-left: 20px;

          .ant-tabs-nav .ant-tabs-tab {
            font-weight: 500; //font-weight: 600;

            font-size: 18px;
            background: linear-gradient(135deg, #57ccef 0%, #86e5c9 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            padding: 0 5px 20px;
            height: 46px;
          }

          .ant-tabs-ink-bar {
            height: 4px;
            background: linear-gradient(180deg, #57ccef 0%, #86e5c9 100%);
          }
        }

        .ant-tabs-content {
          width: 100%;
          height: 100%;

          .ant-tabs-tabpane {
            // padding: 20px;
            width: 100%;
            // height: 100%;
            background: linear-gradient(180deg, #ebfafe 0%, #f1fdf9 100%);

            .overview,
            .runs {
              margin: 20px;
              padding: 20px;
              background-color: #fff;
              border-radius: 20px;
            }
          }
        }
      }
    }
  }
</style>
