<template>
  <div :class="`${prefixCls}`">
    <div class="task-footer-left">
      <div class="task-footer-info">
        <span class="edit-icon">
          <Icon style="color: #fff" icon="ic:baseline-edit" size="16" />
        </span>
        <!-- <div style=""></div> -->
        Annotate
      </div>
      <div style="padding-top: 3px"><Icon style="color: #F3F3F3" icon="ic:baseline-arrow-right" size="20" /></div>
      <span class="tooptip-edit">
        <Icon style="color: #fff" icon="mdi:tooltip-edit" size="16" />
      </span>
      <div style="padding-top: 3px"><Icon style="color: #F3F3F3" icon="ic:baseline-arrow-right" size="20" /></div>
      <span class="tooptip-edit">
        <Icon style="color: #fff" icon="mdi:tooltip-edit" size="16" />
      </span>
      <div style="padding-top: 3px"><Icon style="color: #F3F3F3" icon="ic:baseline-arrow-right" size="20" /></div>  
      <span class="tooptip-right">
        <Icon style="color: #fff" icon="ic:baseline-check" size="16" />
      </span>
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
  const { prefixCls } = useDesign('taskLeft');
  setMenuSetting({
    show: false,
  });
</script>

<style lang="less" scoped>
  @import url(../index.less);
</style>
