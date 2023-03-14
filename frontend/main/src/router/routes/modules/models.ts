import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';
import { RouteEnum, RouteNameEnum } from '/@/enums/routeEnum';
// import { PermissionCodeEnum } from '/@/enums/permissionCodeEnum';

const dataset: AppRouteModule = {
  path: RouteEnum.MODELS,
  name: RouteNameEnum.MODEL,
  component: LAYOUT,
  redirect: `${RouteEnum.MODELS}/list`,
  meta: {
    hideChildrenInMenu: true,
    icon: 'models|svg',
    title: t('routes.models.models'),
    orderNo: 10,
    // hideMenu: true,
  },
  children: [
    {
      path: 'list',
      name: RouteNameEnum.MODEL_LIST,
      component: () => import('/@/views/models/modelList/index.vue'),
      meta: {
        title: t('routes.models.models'),
        // affix: true,
        hideMenu: true,
      },
    },
    {
      path: 'detail',
      name: RouteNameEnum.MODEL_DETAIL,
      component: () => import('/@/views/models/modelDetail/index.vue'),
      meta: {
        title: t('routes.models.details'),
        // affix: true,
        hideMenu: true,
        currentActiveMenu: `${RouteEnum.MODELS}/list`,
      },
    },
  ],
};

export default dataset;
