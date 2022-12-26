import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';
import { RouteEnum } from '/@/enums/routeEnum';

const currentActiveMenu = `${RouteEnum.DATASETS}/list`;

const dataset: AppRouteModule = {
  path: RouteEnum.DATASETS,
  name: 'Datasets',
  component: LAYOUT,
  redirect: `${RouteEnum.DATASETS}/list`,
  meta: {
    hideChildrenInMenu: true,
    icon: 'dataset|svg',
    title: t('routes.datasets.datasets'),
    orderNo: 10,
  },
  children: [
    {
      path: 'list',
      name: 'DatasetsPage',
      component: () => import('/@/views/datasets/datasetList/index.vue'),
      meta: {
        title: t('routes.datasets.datasets'),
        // affix: true,
        hideMenu: true,
      },
    },
    {
      path: 'data',
      name: 'DatasetsDataPage',
      component: () => import('/@/views/datasets/datasetContent/index.vue'),
      meta: {
        sessionTitle: 'breadcrumbTitle',
        sessionInfo: 'breadcrumbType',
        title: t('routes.datasets.data'),
        // affix: true,
        hideMenu: true,
        currentActiveMenu: currentActiveMenu,
      },
    },
    {
      path: 'detail',
      name: 'DatasetsDetailPage',
      component: () => import('/@/views/datasets/datasetDetail/index.vue'),
      meta: {
        title: t('routes.datasets.detail'),
        // affix: true,
        hideMenu: true,
        currentActiveMenu: currentActiveMenu,
      },
    },
    // {
    //   path: 'class',
    //   name: 'DatasetsClassPage',
    //   component: () => import('/@/views/datasets/datasetClass/index.vue'),
    //   meta: {
    //     title: t('routes.datasets.datasets'),
    //     // affix: true,
    //     hideMenu: true,
    //   },
    // },
    // {
    //   path: 'task',
    //   name: 'DatasetsTaskPage',
    //   component: () => import('/@/views/datasets/datasetTask/index.vue'),
    //   meta: {
    //     title: t('routes.datasets.task'),
    //     // affix: true,
    //     hideMenu: true,
    //     currentActiveMenu: currentActiveMenu,
    //   },
    // },
    {
      path: 'overview',
      name: 'DatasetsOverviewPage',
      component: () => import('/@/views/datasets/datasetOverview/index.vue'),
      meta: {
        title: t('routes.datasets.overview'),
        // affix: true,
        hideMenu: true,
        currentActiveMenu: currentActiveMenu,
      },
    },
    // ontology 子模块
    {
      path: 'class',
      name: 'DatasetsClassPage',
      component: () => import('/@/views/datasets/datasetOntology/OntologyClass.vue'),
      meta: {
        sessionTitle: 'breadcrumbTitle',
        sessionInfo: 'breadcrumbType',
        title: t('routes.datasets.ontology'),
        // affix: true,
        hideMenu: true,
        currentActiveMenu: currentActiveMenu,
      },
    },
    {
      path: 'classification',
      name: 'DatasetsClassificationPage',
      component: () => import('/@/views/datasets/datasetOntology/Classification.vue'),
      meta: {
        sessionTitle: 'breadcrumbTitle',
        sessionInfo: 'breadcrumbType',
        title: t('routes.datasets.ontology'),
        // affix: true,
        hideMenu: true,
        currentActiveMenu: currentActiveMenu,
      },
    },
    {
      path: 'searchScenario',
      name: 'searchScenario',
      component: () => import('/@/views/datasets/datasetSearch/searchScenario.vue'),
      meta: {
        sessionTitle: 'breadcrumbTitle',
        sessionInfo: 'breadcrumbType',
        title: 'searchScenario',
        // affix: true,
        hideMenu: true,
        currentActiveMenu: currentActiveMenu,
      },
    },
  ],
};

export default dataset;
