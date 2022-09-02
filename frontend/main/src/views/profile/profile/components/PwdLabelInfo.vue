<template>
  <div :class="`${prefixCls}`">
    <div>{{ t('sys.login.password') }}</div>
    <PwdTooltip />
  </div>
</template>
<script lang="ts" setup>
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { PwdTooltip } from '/@@/PwdTooltip';
  const { prefixCls } = useDesign('pwd-label');
  const { t } = useI18n();
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-pwd-label';
  .@{prefix-cls} {
    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
    color: #333;

    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .info-icon {
      color: #ccc;
    }
  }
</style>
