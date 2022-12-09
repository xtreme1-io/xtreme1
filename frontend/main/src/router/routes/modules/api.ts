import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';
import { RouteEnum } from '/@/enums/routeEnum';
import { RoleEnum } from '/@/enums/roleEnum';

const recents: AppRouteModule = {
  path: RouteEnum.Apis,
  name: 'Api',
  component: LAYOUT,
  redirect: `${RouteEnum.Apis}/index`,
  meta: {
    hideChildrenInMenu: true,
    icon: 'ant-design:team-outlined',
    title: 'Api',
    orderNo: 30,
    hideMenu: true,
    roles: [RoleEnum.TEAMOWNER, RoleEnum.ADMIN],
  },
  children: [
    {
      path: 'index',
      name: 'ApiPage',
      component: () => import('/@/views/sys/Api/index.vue'),
      meta: {
        title: 'Api',
        // affix: true,
        hideMenu: true,
        hideBreadcrumb: false,
        currentActiveMenu: `${RouteEnum.TEAM}/index`,
        roles: [RoleEnum.TEAMOWNER, RoleEnum.ADMIN],
      },
    },
  ],
};

export default recents;
