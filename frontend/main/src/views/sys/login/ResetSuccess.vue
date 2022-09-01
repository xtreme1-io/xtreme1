<template>
  <div class="login-wrapper signIn" v-if="getShow">
    <div class="wrapper">
      <div class="title">{{ t('sys.login.resetSuccessTitle') }}</div>
      <!-- <div class="desc">{{ t('sys.login.resetSuccessTips') }}</div> -->

      <FormItem class="enter-x">
        <Button :size="ButtonSize.LG" type="primary" block @click="handleGo" :loading="loading">
          {{ t('sys.login.returnButton') }}
        </Button>
      </FormItem>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, unref, computed } from 'vue';
  import { Form } from 'ant-design-vue';
  import { ButtonSize } from '/@@/Button/typing';
  import Button from '/@@/Button/index.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { LoginStateEnum, useLoginState } from './useLogin';
  import { useGo } from '/@/hooks/web/usePage';
  import { PageEnum } from '/@/enums/pageEnum';
  const { setLoginState, getLoginState } = useLoginState();
  console.log(unref(getLoginState));
  const loading = ref(false);
  const go = useGo();
  const { t } = useI18n();
  const FormItem = Form.Item;

  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.RESET_SUCCESS);
  const handleGo = () => {
    setLoginState(LoginStateEnum.LOGIN);
    go(PageEnum.BASE_LOGIN);
  };
</script>
<style lang="less" scoped>
  @import url(./index.less);
</style>
