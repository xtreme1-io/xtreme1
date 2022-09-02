import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';
import { RouteEnum } from '/@/enums/routeEnum';

const claim: AppRouteModule = {
  path: RouteEnum.CLAIM,
  name: 'Claim',
  component: LAYOUT,
  redirect: `${RouteEnum.CLAIM}/index`,
  meta: {
    hideChildrenInMenu: true,
    icon: 'ant-design:user-outlined',
    title: t('routes.claim.claim'),
    orderNo: 20,
    hideMenu: true,
  },
  children: [
    {
      path: 'index',
      name: 'ClaimPage',
      component: () => import('/@/views/claim/claim/index.vue'),
      meta: {
        title: t('routes.claim.claim'),
        // affix: true,
        hideMenu: true,
      },
    },
    {
      path: 'detail',
      name: 'ClaimDetailPage',
      component: () => import('/@/views/claim/claimDetail/index.vue'),
      meta: {
        title: t('routes.claim.claim'),
        // affix: true,
        hideMenu: true,
      },
    },
  ],
};

export default claim;
