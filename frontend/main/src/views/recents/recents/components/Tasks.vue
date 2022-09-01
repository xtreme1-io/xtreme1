<template>
  <div :class="`${prefixCls}-title`">{{ t('business.recents.tasks') }}</div>
  <div :class="`${prefixCls}-card-list`">
    <TaskCard />
    <TaskCard />
    <div :class="`${prefixCls}-card-item-plus action`"> See all... </div>
  </div>
</template>
<script lang="ts" setup>
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import TaskCard from './TaskCard.vue';
  const { t } = useI18n();
  const { prefixCls } = useDesign('recents');
</script>
<style lang="less" scoped>
  @import '../index.less';
</style>
