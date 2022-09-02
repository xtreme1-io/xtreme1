import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';
import { RouteEnum } from '/@/enums/routeEnum';
import { RoleEnum } from '/@/enums/roleEnum';

const recents: AppRouteModule = {
  path: RouteEnum.TEAM,
  name: 'Team',
  component: LAYOUT,
  redirect: `${RouteEnum.TEAM}/index`,
  meta: {
    hideChildrenInMenu: true,
    icon: 'ant-design:team-outlined',
    title: t('routes.team.team'),
    orderNo: 30,
    hideMenu: true,
    roles: [RoleEnum.TEAMOWNER, RoleEnum.ADMIN],
  },
  children: [
    {
      path: 'index',
      name: 'TeamPage',
      component: () => import('/@/views/team/team/index.vue'),
      meta: {
        title: t('routes.team.team'),
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
