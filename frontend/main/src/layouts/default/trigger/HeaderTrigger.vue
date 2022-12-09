<template>
  <span :class="[prefixCls, theme]" @click="toggleCollapsed">
    <!-- <Icon
      style="transform: rotate(180deg); color: #57ccef; font-size: 20px; cursor: pointer"
      icon="line-md:arrow-open-left"
      v-if="getCollapsed"
    />
    <img style="width: 22px; height: auto" :src="backIcon" alt="" v-else /> -->

    <!-- <MenuUnfoldOutlined v-if="getCollapsed" /> <MenuFoldOutlined v-else /> -->
  </span>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { propTypes } from '/@/utils/propTypes';
  import backIcon from '/@/assets/images/backIcon.png';
  import Icon from '/@/components/Icon';

  export default defineComponent({
    name: 'HeaderTrigger',
    components: { Icon },
    props: {
      theme: propTypes.oneOf(['light', 'dark']),
    },
    setup() {
      const { getCollapsed, toggleCollapsed } = useMenuSetting();
      const { prefixCls } = useDesign('layout-header-trigger');
      return { getCollapsed, toggleCollapsed, prefixCls, backIcon };
    },
  });
</script>
