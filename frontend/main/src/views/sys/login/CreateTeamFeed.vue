<template>
  <div class="login-wrapper signIn" v-if="getShow">
    <LoginLogo />
    <div class="wrapper">
      <div class="desc">
        {{ t('sys.login.team') }}
        <span class="text-primary">{{ userInfo?.team?.name }}</span>
        {{ t('sys.login.createSuccessFeedDescription') }}
      </div>
      <div class="desc">
        {{ t('sys.login.createSuccessFeedDescription2') }}
        <span class="text-primary">
          {{ userInfo?.team?.id }}
        </span>
        <Icon @click="handleCopy" style="color: #ccc" icon="ic:baseline-file-copy" size="20" />
      </div>

      <FormItem class="enter-x">
        <Button
          :size="ButtonSize.LG"
          type="primary"
          block
          :gradient="true"
          @click="handleGo"
          :loading="loading"
        >
          {{ t('sys.login.continueButton') }}
        </Button>
      </FormItem>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, unref, computed, onBeforeUpdate } from 'vue';
  import { Form, message } from 'ant-design-vue';
  import { ButtonSize } from '/@@/Button/typing';
  import Button from '/@@/Button/index.vue';
  import { Icon } from '/@/components/Icon';
  import LoginLogo from './LoginLogo.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { LoginStateEnum, useLoginState } from './useLogin';
  import { useUserStore } from '/@/store/modules/user';
  const userStore = useUserStore();

  const { getLoginState } = useLoginState();

  const loading = ref(false);

  const { t } = useI18n();
  const FormItem = Form.Item;

  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.CREATE_TEAM_FEED);

  const userInfo = ref();
  console.log(userStore.getUserInfo);
  onBeforeUpdate(() => {
    userInfo.value = userStore.getUserInfo;
  });

  function handleCopy() {
    const { isSuccessRef } = useCopyToClipboard(String(userInfo.value?.team?.id) || '');
    unref(isSuccessRef) &&
      message.success({
        content: t('sys.login.teamIDCopiedTips'),
        duration: 5,
      });
  }

  const handleGo = () => {
    window.location.reload();
  };
</script>
<style lang="less" scoped>
  @import url(./index.less);
</style>
