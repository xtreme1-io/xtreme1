<template>
  <div :class="`${prefixCls}`">
    <div class="task-footer">
      <div><TaskLeft /></div>
      <div><TaskCenter /></div>
      <div><TaskRight /></div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import TaskLeft from './components/task-footer-left.vue';
  import TaskCenter from './components/task-footer-center.vue';
  import TaskRight from './components/task-footer-right.vue';
  // import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
  const { setMenuSetting } = useMenuSetting();
  // const { t } = useI18n();
  const { prefixCls } = useDesign('claimDetail');
  // import { useRoute } from 'vue-router';
  // const { query } = useRoute();
  // const { id } = query;
  setMenuSetting({
    show: false,
  });
</script>

<style lang="less" scoped>
  @import url(./index.less);
</style>
