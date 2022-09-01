<template>
  <div :class="prefixCls">
    <Dropdown placement="bottomLeft" :overlayClassName="`${prefixCls}-dropdown-overlay`">
      <div class="action">
        <img :src="img" alt="" />
        <Icon class="-ml-1" style="color: #aaa" size="20" icon="ic:sharp-arrow-drop-down" />
      </div>
      <template #overlay>
        <Menu>
          <MenuItem
            v-for="item in menuList"
            :key="item.id"
            @click="
              () => {
                handleGo(item.link);
              }
            "
          >
            <span class="flex items-center">
              <img :src="item.img" />
              <span>{{ item.text }}</span>
            </span>
          </MenuItem>
        </Menu>
      </template>
    </Dropdown>
    <div class="route-name">{{ name }}</div>
  </div>
</template>
<script lang="tsx" setup>
  import { ref, computed } from 'vue';
  import { Dropdown, Menu } from 'ant-design-vue';
  import Icon from '/@/components/Icon';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useRouter } from 'vue-router';
  import { listenerRouteChange } from '/@/logics/mitt/routeChange';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useGo } from '/@/hooks/web/usePage';
  import { RouteEnum } from '/@/enums/routeEnum';
  import { PageEnum } from '/@/enums/pageEnum';
  import homeImg from '/@/assets/images/common/home.png';
  import datasetImg from '/@/assets/images/common/dataset.png';
  import taskImg from '/@/assets/images/common/tasks.png';
  import { useUserStore } from '/@/store/modules/user';
  import { RoleEnum } from '/@/enums/roleEnum';
  const userStore = useUserStore();
  const go = useGo();
  const MenuItem = Menu.Item;
  const { t } = useI18n();
  const { prefixCls } = useDesign('header-menu');
  const { currentRoute } = useRouter();
  let routePath = ref(currentRoute.value.path);
  listenerRouteChange((route) => {
    routePath.value = route.path;
  });
  let menuList = [
    {
      id: 1,
      text: t('routes.basic.home'),
      img: homeImg,
      link: PageEnum.BASE_HOME,
    },
    {
      id: 2,
      text: t('routes.datasets.datasets'),
      img: datasetImg,
      link: RouteEnum.DATASETS,
    },
    {
      id: 3,
      text: 'Tasks',
      img: taskImg,
      link: RouteEnum.CLAIM,
    },
  ];
  if (userStore.getUserInfo?.roles[0]?.name === RoleEnum.WORKER) {
    menuList = menuList.filter((item) => item.id !== 2);
  }
  enum MenuListEnum {
    HOME,
    DATASET,
    TASKS,
  }
  const current = computed(() => {
    if (routePath.value.includes('/dataset')) {
      return MenuListEnum.DATASET;
    } else if (routePath.value.includes(RouteEnum.CLAIM)) {
      return MenuListEnum.TASKS;
    } else {
      return MenuListEnum.HOME;
    }
  });
  const img = computed(() => {
    if (current.value === MenuListEnum.DATASET) {
      return taskImg;
    } else {
      return homeImg;
    }
  });
  const name = computed(() => {
    if (current.value === MenuListEnum.DATASET) {
      return t('routes.datasets.datasets');
    } else {
      return t('routes.basic.home');
    }
  });

  const handleGo = (link) => {
    go(link);
  };
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-header-menu';
  .@{prefix-cls}-dropdown-overlay {
    color: red;
    // display: flex;
    .ant-dropdown-menu {
      width: 200px;
      border-radius: 6px;
    }

    .ant-dropdown-menu-item {
      min-width: 200px;
    }

    .items-center {
      font-size: 18px;
    }

    img {
      width: 36px;
      margin-right: 12px;
    }
  }
  .@{prefix-cls} {
    display: flex;

    .action {
      display: flex;
      align-items: center;

      &:hover {
        background: #e6f7fd;
      }
    }

    .route-name {
      margin-left: 10px;
      font-size: 18px;
    }

    img {
      width: 36px;
    }

    .menu-list {
      position: fixed;
      top: 60px;
      z-index: 1188;
      line-height: 1;
    }
  }
</style>
