import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';
import { RouteEnum } from '/@/enums/routeEnum';

const recents: AppRouteModule = {
  path: RouteEnum.RECENTS,
  name: 'Home',
  component: LAYOUT,
  redirect: `${RouteEnum.RECENTS}/index`,
  meta: {
    hideChildrenInMenu: true,
    icon: 'home|svg',
    title: t('routes.recents.recents'),
    orderNo: 0,
  },
  children: [
    {
      path: 'index',
      name: 'RecentsPage',
      component: () => import('/@/views/recents/recents/index.vue'),
      meta: {
        title: t('routes.recents.recents'),
        // affix: true,
        hideMenu: true,
      },
    },
  ],
};

export default recents;
