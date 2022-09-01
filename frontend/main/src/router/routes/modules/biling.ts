import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';
import { RouteEnum } from '/@/enums/routeEnum';

const recents: AppRouteModule = {
  path: RouteEnum.BILING,
  name: 'Biling',
  component: LAYOUT,
  redirect: `${RouteEnum.BILING}/index`,
  meta: {
    hideChildrenInMenu: true,
    icon: 'ant-design:dollar-outlined',
    title: t('routes.biling.biling'),
    orderNo: 40,
    hideMenu: true,
  },
  children: [
    {
      path: 'index',
      name: 'BilingPage',
      component: () => import('/@/views/recents/recents/index.vue'),
      meta: {
        title: t('routes.biling.biling'),
        // affix: true,
        hideMenu: true,
      },
    },
  ],
};

export default recents;
