import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';
import { RouteEnum } from '/@/enums/routeEnum';

const profile: AppRouteModule = {
  path: RouteEnum.PROFILE,
  name: 'Profile',
  component: LAYOUT,
  redirect: `${RouteEnum.PROFILE}/index`,
  meta: {
    hideChildrenInMenu: true,
    icon: 'ant-design:user-outlined',
    title: t('routes.profile.profile'),
    orderNo: 20,
    hideMenu: true,
  },
  children: [
    {
      path: 'index',
      name: 'ProfilePage',
      component: () => import('/@/views/profile/profile/index.vue'),
      meta: {
        title: t('routes.profile.profile'),
        // affix: true,
        hideMenu: true,
        hideBreadcrumb: false,
        currentActiveMenu: `${RouteEnum.PROFILE}/index`,
      },
    },
  ],
};

export default profile;
