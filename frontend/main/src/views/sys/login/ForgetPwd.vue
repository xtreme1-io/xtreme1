<template>
  <div class="login-wrapper signIn" v-if="getShow">
    <div class="wrapper">
      <template v-if="!isSuccess">
        <div>
          <div class="logo-title"> Forget password？ </div>
          <div class="info">
            Not a member?
            <span class="cursor-pointer link" @click="setLoginState(LoginStateEnum.REGISTER)">
              Sign up
            </span>
          </div>
          <div v-if="errorType === loginErrorType.HAS_CHANGE_PASSWORD" class="description">
            This link has been used to change your password. Please resubmit your new email address
          </div>
          <div class="description">
            We will send the reset password link to the following email address :
          </div>
        </div>
        <Form
          :model="formData"
          :rules="getFormRules"
          ref="formRef"
          v-show="getShow"
          @keypress.enter="handleReset"
          validateFirst
        >
          <FormItem name="account" class="content-box enter-x">
            <Input
              autocomplete="off"
              size="large"
              v-model:value="formData.account"
              :placeholder="t('sys.login.email')"
            />
          </FormItem>

          <FormItem class="enter-x">
            <Button
              :size="ButtonSize.LG"
              type="primary"
              block
              :disabled="isSuccess"
              @click="handleReset"
              :loading="loading"
            >
              {{ t('common.sendText') }}
            </Button>
          </FormItem>
        </Form>
      </template>
      <template v-else>
        <div>
          <div class="logo-title"> Forget password？ </div>
          <div class="description">
            We will send the reset password link to the following email address :
          </div>
          <div class="mt-4 text-xl text-primary">{{ formData.account }}</div>
        </div>
        <Divider />
        <div class="flex justify-between mt-4">
          <div>
            Oops!
            <span class="cursor-pointer text-primary" @click="isSuccess = false">
              wrong email
            </span>
          </div>
          <div class="cursor-pointer text-primary" @click="handleResend"> Resend</div>
        </div>
      </template>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, ref, unref, computed, onMounted } from 'vue';
  import { Divider, Form, Input, message } from 'ant-design-vue';
  import { ButtonSize } from '/@@/Button/typing';
  import Button from '/@@/Button/index.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  // import { useMessage } from '/@/hooks/web/useMessage';
  import { LoginStateEnum, useLoginState, useFormRules, useFormValid } from './useLogin';
  import { resetPwdSendEmail } from '/@/api/sys/user';
  import { useRoute } from 'vue-router';
  import { loginErrorType } from './typing';
  // const { createErrorModal } = useMessage();
  const { getLoginState, setLoginState } = useLoginState();
  const { query } = useRoute();
  const { email, errorType } = query;
  const formRef = ref();
  const loading = ref(false);
  const isSuccess = ref(false);
  const { getFormRules } = useFormRules();
  const { validForm } = useFormValid(formRef);
  const { t } = useI18n();
  const FormItem = Form.Item;
  const formData = reactive({
    account: '',
  });

  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.FORGET_PASSWORD);

  onMounted(() => {
    if (email) {
      formData.account = email as string;
    } else if (window.sessionStorage.getItem('loginEmail')) {
      formData.account = window.sessionStorage.getItem('loginEmail') as string;
    }
  });

  async function handleReset() {
    const data = await validForm();
    if (!data) return;
    try {
      loading.value = true;
      await resetPwdSendEmail({ email: formData.account });
      isSuccess.value = true;
    } catch (error) {
      // createErrorModal({
      //   title: t('sys.api.errorTip'),
      //   content: (error as unknown as Error).message || t('sys.api.networkExceptionMsg'),
      //   getContainer: () => document.body,
      // });
    } finally {
      loading.value = false;
    }
  }

  async function handleResend() {
    try {
      loading.value = true;
      await resetPwdSendEmail({ email: formData.account });
      message.success('Email resent successfully');
      isSuccess.value = true;
    } catch (error) {
      // createErrorModal({
      //   title: t('sys.api.errorTip'),
      //   content: (error as unknown as Error).message || t('sys.api.networkExceptionMsg'),
      //   getContainer: () => document.body,
      // });
    } finally {
      loading.value = false;
    }
  }
</script>
<style lang="less" scoped>
  @import url(./index.less);
</style>
