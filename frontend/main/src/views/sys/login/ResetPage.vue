<template>
  <div :class="prefixCls">
    <div class="content">
      <img class="logo-img" :src="logoImg" alt="" />
      <div class="info">
        At <span class="link cursor-pointer" @click="handleGoPortal">Xtreme1</span> we are committed
        to building the world’s most seamless training data platform to help your team collect,
        annotate, and deploy custom ML data sets at scale.
      </div>
      <img class="rect-mask" :src="rectMask" alt="" />
      <img class="bg-tip" :src="bgTip" alt="" />
      <img class="show-img" :src="showImg" alt="" />
    </div>
    <ResetPwd />
    <ResetSuccess />
    <SignUpFeed />
  </div>
</template>
<script lang="ts" setup>
  import { unref, onBeforeMount } from 'vue';
  import ResetPwd from './ResetPwd.vue';
  import ResetSuccess from './ResetSuccess.vue';
  import SignUpFeed from './SignUpFeed.vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { LoginStateEnum, useLoginState } from './useLogin';
  import bgTip from '/@/assets/images/bg-tip.png';
  import showImg from '/@/assets/images/show-img.png';
  import logoImg from '/@/assets/images/logo-img.png';
  import rectMask from '/@/assets/images/rect-mask.png';
  import { handleGoPortal } from '/@/utils/business';
  const { setLoginState, getLoginState } = useLoginState();
  onBeforeMount(() => {
    setLoginState(LoginStateEnum.RESET_PASSWORD);
    console.log(unref(getLoginState));
  });
  defineProps({
    sessionTimeout: {
      type: Boolean,
    },
  });

  const { prefixCls } = useDesign('login');
</script>
<style lang="less">
  @import url(./index.less);
</style>
