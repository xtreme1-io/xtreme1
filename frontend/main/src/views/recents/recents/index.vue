<template>
  <div :class="`${prefixCls}`">
    <div class="wrapper">
      <div class="welcome">Welcome to Xtreme1!</div>

      <div class="text-center href-card mb-7">
        <div
          class="card-item"
          @click="
            () => {
              handleGo(RouteEnum.DATASETS);
            }
          "
        >
          <img :src="dataset" alt="" />
          <div class="item-name">{{ t('routes.datasets.datasets') }}</div>
        </div>
      </div>
      <div class="user-href-card">
        <div
          class="card-item"
          @click="
            () => {
              handleGo(RouteEnum.PROFILE);
            }
          "
        >
          <img :src="userImg" alt="" />
          <div class="item-name">{{ t('routes.profile.profile') }}</div>
        </div>
        <div class="card-item" @click="handleGoDocs">
          <img :src="documentImg" alt="" />
          <div class="item-name">Docs</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useI18n } from '/@/hooks/web/useI18n';
  import dataset from '/@/assets/images/home/dataset.png';
  import userImg from '/@/assets/images/home/user.png';
  import documentImg from '/@/assets/images/home/document.png';
  import { useGo } from '/@/hooks/web/usePage';
  import { RouteEnum } from '/@/enums/routeEnum';

  const go = useGo();

  onMounted(() => {});

  const { t } = useI18n();
  const { prefixCls } = useDesign('recents');
  const handleGo = (route: RouteEnum) => {
    go(route);
  };

  const handleGoDocs = () => {
    window.open('https://docs.xtreme1.io/');
  };
</script>
<style lang="less" scoped>
  @import './index.less';
</style>
