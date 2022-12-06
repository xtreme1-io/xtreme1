import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';
import { RouteEnum } from '/@/enums/routeEnum';
// import { PermissionCodeEnum } from '/@/enums/permissionCodeEnum';

const dataset: AppRouteModule = {
  path: RouteEnum.ONTOLOGY,
  name: 'Ontology',
  component: LAYOUT,
  redirect: `${RouteEnum.ONTOLOGY}/center`,
  meta: {
    hideChildrenInMenu: true,
    icon: 'ontology|svg',
    title: t('routes.ontology.ontology'),
    orderNo: 10,
    // hideMenu: true,
    // permCode: [PermissionCodeEnum.ONTOLOGY_ONTOLOGY_QUERY],
  },
  children: [
    {
      path: 'center',
      name: 'OntologyCenter',
      component: () => import('/@/views/ontology/center/index.vue'),
      meta: {
        title: t('routes.ontology.ontology'),
        // affix: true,
        hideMenu: true,
      },
    },
    {
      path: 'class',
      name: 'OntologyClass',
      component: () => import('/@/views/ontology/classes/OntologyClass.vue'),
      meta: {
        title: t('routes.ontology.class'),
        sessionTitle: 'breadcrumbTitle',
        // affix: true,
        hideMenu: true,
        currentActiveMenu: `${RouteEnum.ONTOLOGY}/center`,
      },
    },
    {
      path: 'classification',
      name: 'OntologyClassification',
      component: () => import('/@/views/ontology/classes/Classification.vue'),
      meta: {
        title: t('routes.ontology.classification'),
        sessionTitle: 'breadcrumbTitle',
        // affix: true,
        hideMenu: true,
        currentActiveMenu: `${RouteEnum.ONTOLOGY}/center`,
      },
    },
    {
      path: 'scenario',
      name: 'OntologyScenario',
      component: () => import('/@/views/ontology/scenario/index.vue'),
      meta: {
        title: t('routes.ontology.scenario'),
        sessionTitle: 'breadcrumbTitle',
        // affix: true,
        hideMenu: true,
        currentActiveMenu: `${RouteEnum.ONTOLOGY}/center`,
      },
    },
  ],
};

export default dataset;
