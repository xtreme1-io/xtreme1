<template>
  <div :class="`${prefixCls}`">
    <div class="task-footer-center">
      <div>
        <p><Icon style="color: #57CCEF" icon="ic:baseline-arrow-drop-down" size="16" /></p>
        <div class="center-info">
          <label>1/10</label>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  // import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
  const { setMenuSetting } = useMenuSetting();
  // const { t } = useI18n();
  const { prefixCls } = useDesign('taskCenter');
  setMenuSetting({
    show: false,
  });
</script>

<style lang="less" scoped>
  @import url(../index.less);
</style>
