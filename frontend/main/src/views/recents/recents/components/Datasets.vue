<template>
  <div :class="`${prefixCls}-title`">{{ t('business.recents.datasets') }}</div>
  <div :class="`${prefixCls}-card-list`">
    <DatasetCard />
    <DatasetCard />
    <DatasetCard />
    <DatasetCard />
    <a :class="`${prefixCls}-card-item action`" @click="handleGo"> See all... </a>
  </div>
</template>
<script lang="ts" setup>
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import DatasetCard from './DatasetCard.vue';
  import { useGo } from '/@/hooks/web/usePage';
  import { RouteEnum } from '/@/enums/routeEnum';
  const { t } = useI18n();
  const { prefixCls } = useDesign('recents');
  const go = useGo();
  const handleGo = () => {
    go(RouteEnum.DATASETS);
  };
</script>
<style lang="less" scoped>
  @import '../index.less';
</style>
