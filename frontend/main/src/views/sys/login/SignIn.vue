<template>
  <div class="login-wrapper signIn" v-if="getShow">
    <div class="wrapper">
      <div>
        <div class="logo-title"> Sign in </div>
        <div class="info">
          Not a member?
          <span class="cursor-pointer link" @click="setLoginState(LoginStateEnum.REGISTER)">
            Sign up
          </span>
        </div>
        <div v-if="errorType === loginErrorType.REGISTERED" class="description">
          You already have an account associated with this email. Please log in or reset your
          password if you forget it.
        </div>
        <div v-if="getLoginErrorState" class="description inline-flex">
          <div class="mr-2 mt-1">
            <Icon icon="gridicons:info-outline" size="20" color="#AAA" />
          </div>
          <div style="word-spacing: -2px">
            It looks like you've already got an account . Log in instead or reset your password in
            case you've forgotten it
          </div>
        </div>
      </div>
      <Form
        labelAlign="left"
        :model="formData"
        :rules="getFormRules"
        ref="formRef"
        layout="vertical"
        :hideRequiredMark="true"
        v-show="getShow"
        @keypress.enter="handleLogin"
      >
        <FormItem
          :label="t('sys.login.email')"
          name="account"
          class="enter-x"
          :validateStatus="validateError"
          :help="validateHelp"
          validateFirst
        >
          <Input
            autocomplete="off"
            size="large"
            :disabled="emailVerify"
            v-model:value="formData.account"
            :placeholder="t('sys.login.email')"
            class="fix-auto-fill"
            @change="handleChange"
          />
        </FormItem>
        <div class="mt-7">
          <FormItem
            name="password"
            :label="t('sys.login.password')"
            class="enter-x"
            :validateStatus="validatePwdError"
            :help="validatePwdHelp"
          >
            <InputPassword
              size="large"
              visibilityToggle
              v-model:value="formData.password"
              :placeholder="t('sys.login.password')"
              @change="handleChange"
            />
          </FormItem>
        </div>

        <FormItem class="box enter-x">
          <Button
            :size="ButtonSize.LG"
            type="primary"
            block
            @click="handleLogin"
            :loading="loading"
          >
            {{ t('sys.login.loginButton') }}
          </Button>
        </FormItem>
      </Form>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, ref, unref, computed, onMounted } from 'vue';
  import { Form, Input } from 'ant-design-vue';
  import { ButtonSize } from '/@@/Button/typing';
  import Button from '/@@/Button/index.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import { LoginStateEnum, useLoginState, useFormRules, useFormValid } from './useLogin';
  import Icon from '/@/components/Icon';
  import { getLocalTeamId } from '/@/utils/business/userUtil';
  import { useRoute } from 'vue-router';
  import { loginConfirmApi } from '/@/api/sys/user';
  import { loginErrorType } from './typing';
  const { notification } = useMessage();
  const { setLoginState, getLoginState, getLoginErrorState } = useLoginState();

  const formRef = ref();
  const loading = ref(false);
  const validateError = ref();
  const validatePwdError = ref();
  const validatePwdHelp = ref();
  const validateHelp = ref();
  const emailVerify = ref<boolean>(false);

  const { getFormRules } = useFormRules();
  const { validForm } = useFormValid(formRef);
  const { t } = useI18n();
  const FormItem = Form.Item;
  const InputPassword = Input.Password;
  const formData = reactive({
    account: '',
    password: '',
  });
  const userStore = useUserStore();
  const { query } = useRoute();
  const { errorType } = query;
  onMounted(() => {
    if (window.sessionStorage.getItem('loginEmail')) {
      formData.account = window.sessionStorage.getItem('loginEmail') as string;
    }
  });

  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.LOGIN);

  async function handleLogin() {
    const data = await validForm();
    if (!data) return;
    try {
      loading.value = true;
      const userInfo = await userStore.login({
        password: data.password,
        username: data.account,
        mode: 'none', //不要默认的错误提示
        teamId: getLocalTeamId() || undefined,
      });
      if (userInfo) {
        notification.success({
          message: t('sys.login.loginSuccessTitle'),
          description: `${t('sys.login.loginSuccessDesc')}: ${userInfo && userInfo.nickname}`,
          duration: 3,
        });
      }
    } catch (error) {
      // createMessage.error(String(error));
      if (String(error).includes('password')) {
        validatePwdError.value = 'error';
        validatePwdHelp.value = String(error).split(':')[1];
      } else {
        validateError.value = 'error';
        validateHelp.value = String(error).split(':')[1];
      }
    } finally {
      loading.value = false;
    }
  }

  const handleContinue = async () => {
    const data = await validForm();
    if (!data) return;
    window.sessionStorage.setItem('loginEmail', formData.account);
    try {
      await loginConfirmApi({ email: formData.account });
      emailVerify.value = true;
    } catch (error) {
      console.log(error);
      if ((error as unknown as any).message.includes('account')) {
        setLoginState(LoginStateEnum.REGISTER);
      }
    }
  };

  const handleChange = () => {
    validateError.value = undefined;
    validateHelp.value = undefined;
    validatePwdError.value = undefined;
    validatePwdHelp.value = undefined;
  };

  const handleEnter = () => {
    emailVerify.value ? handleLogin() : handleContinue();
  };
</script>
<style lang="less" scoped>
  @import url(./index.less);
</style>
