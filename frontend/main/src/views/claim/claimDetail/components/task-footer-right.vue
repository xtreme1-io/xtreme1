<template>
  <div :class="`${prefixCls}`">
    <div class="task-footer-right">
      <div><Icon style="" icon="ic:baseline-keyboard" size="25" /></div>
      <div><Icon style="" icon="mdi:document" size="25" /></div>
      <div>Save<Icon style="margin-left:5px" icon="ic:round-save" size="25" /></div>
      <div style="background-color: #454d6a;padding: 6px;border-radius: 4px;cursor: pointer">Submit<Icon style="margin-left:5px" icon="ic:round-save" size="25" /></div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  // import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
  import Icon from '/@/components/Icon/index';
  const { setMenuSetting } = useMenuSetting();
  // const { t } = useI18n();
  const { prefixCls } = useDesign('taskRight');
  setMenuSetting({
    show: false,
  });
</script>

<style lang="less" scoped>
  @import url(../index.less);
</style>
