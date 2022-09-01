<template>
  <div :class="`${prefixCls}-title`">{{ t('business.recents.models') }}</div>
  <div :class="`${prefixCls}-card-list`">
    <ModelCard />
    <ModelCard />
    <ModelCard />
    <ModelCard />
    <div :class="`${prefixCls}-card-item action`"> See all... </div>
  </div>
</template>
<script lang="ts" setup>
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import ModelCard from './ModelCard.vue';
  const { t } = useI18n();
  const { prefixCls } = useDesign('recents');
</script>
<style lang="less" scoped>
  @import '../index.less';
</style>
