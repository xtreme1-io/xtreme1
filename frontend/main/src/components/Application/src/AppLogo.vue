<!--
 * @Author: liujians
 * @Description: logo component
-->
<template>
  <div class="anticon" :class="getAppLogoClass">
    <div class="wrapper" :style="!getCollapsed ? { width: '100%', marginLeft: '7px' } : {}">
      <img width="117" v-if="!getCollapsed" src="../../../assets/images/logo.png" @click="goHome" />
      <!-- <img v-else class="logo" src="../../../assets/images/logo-sm.png" @click="goHome" /> -->
      <SvgIcon
        v-else
        style="
          transform: rotate(180deg);
          color: #57ccef;
          font-size: 20px;
          cursor: pointer;
          margin-left: 13px;
        "
        name="menuIcon"
        @click="handleColl"
      />
    </div>
    <div v-if="!getCollapsed" @click="handleColl">
      <SvgIcon style="color: #57ccef; font-size: 20px; cursor: pointer" name="menuIcon" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, unref } from 'vue';
  import { useGo } from '/@/hooks/web/usePage';
  import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { SvgIcon } from '/@/components/Icon';
  import { PageEnum } from '/@/enums/pageEnum';
  // import { useUserStore } from '/@/store/modules/user';

  const props = defineProps({
    /**
     * The theme of the current parent component
     */
    theme: { type: String, validator: (v: string) => ['light', 'dark'].includes(v) },
    /**
     * Whether to show title
     */
    showTitle: { type: Boolean, default: true },
    /**
     * The title is also displayed when the menu is collapsed
     */
    alwaysShowTitle: { type: Boolean },
  });

  const { prefixCls } = useDesign('app-logo');
  const { getCollapsedShowTitle, getCollapsed, toggleCollapsed } = useMenuSetting();
  // const userStore = useUserStore();
  const go = useGo();

  const getAppLogoClass = computed(() => [
    prefixCls,
    props.theme,
    { 'collapsed-show-title': unref(getCollapsedShowTitle) },
  ]);

  function goHome() {
    go(PageEnum.BASE_HOME);
  }

  function handleColl() {
    toggleCollapsed();
  }
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-app-logo';

  .@{prefix-cls} {
    padding-left: 9px;
    transition: all 0.2s ease;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .wrapper {
      display: flex;
      align-items: center;
      cursor: pointer;

      .title-text {
        background: linear-gradient(162.3deg, #57ccef 0%, #86e5c9 83.83%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: bold;
        // text-fill-color: transparent;
      }
    }

    // &.light {
    //   border-bottom: 1px solid @border-color-base;
    // }

    &.collapsed-show-title {
      padding-left: 20px;
    }

    &.light &__title {
      color: @primary-color;
    }

    &.dark &__title {
      color: @white;
    }

    &__title {
      font-size: 16px;
      font-weight: 700;
      transition: all 0.5s;
      line-height: normal;
    }
  }
</style>
