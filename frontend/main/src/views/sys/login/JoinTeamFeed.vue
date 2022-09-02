<template>
  <div class="login-wrapper join-team-feed" v-if="getShow">
    <LoginLogo />
    <div class="wrapper">
      <div class="description">{{ t('sys.login.joinSuccessFeedDescription') }}</div>
      <div class="description">{{ t('sys.login.joinSuccessFeedDescription2') }}</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { unref, computed } from 'vue';
  import LoginLogo from './LoginLogo.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { LoginStateEnum, useLoginState } from './useLogin';
  const { getLoginState } = useLoginState();

  const { t } = useI18n();

  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.JOIN_TEAM_FEED);
</script>
<style lang="less" scoped>
  @import url(./index.less);
</style>
