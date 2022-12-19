<template>
  <div class="login-wrapper signIn" v-if="getShow">
    <!-- <div v-if="teamName" class="mb-4 text-center text-blue-400">
      You are going to join {{ teamName }}
    </div> -->
    <div class="wrapper">
      <div>
        <div class="logo-title"> Create an account </div>
        <div class="info">
          Already have an account?
          <span class="cursor-pointer link" @click="setLoginState(LoginStateEnum.LOGIN)">
            Sign In
          </span>
        </div>
      </div>
      <Form
        labelAlign="left"
        layout="vertical"
        :hideRequiredMark="true"
        :model="formData"
        :rules="getFormRules"
        ref="formRef"
        v-show="getShow"
        @keypress.enter="handleSignUp"
        validateFirst
      >
        <FormItem :label="t('sys.login.email')" name="username" class="enter-x" validateFirst>
          <Input
            autocomplete="off"
            size="large"
            v-model:value="formData.username"
            :placeholder="t('sys.login.email')"
            class="fix-auto-fill"
          />
        </FormItem>

        <div class="mt-7">
          <FormItem name="password" :label="t('sys.login.password')" class="enter-x">
            <InputPassword
              size="large"
              visibilityToggle
              v-model:value="formData.password"
              :placeholder="t('sys.login.password')"
            />
          </FormItem>
        </div>

        <div class="mt-7">
          <FormItem name="subscribe" label="" class="enter-x">
            <Checkbox v-model:checked="subscribe">Subscribe newsletter from us</Checkbox>
          </FormItem>
        </div>

        <FormItem class="box enter-x">
          <Button
            :size="ButtonSize.LG"
            type="primary"
            block
            :disabled="isSuccess"
            @click="handleSignUp"
            :loading="loading"
          >
            Sign Up and Login
          </Button>
        </FormItem>
        <FormItem class="text-center" v-if="isSuccess">
          <span class="tips">Registration Link Sent! Please check your email</span>
        </FormItem>
        <FormItem class="text-sm text-left">
          Registration means that I agree to the Xtreme1
          <a target="_blank" class="tips" href="https://www.basic.ai/privacypolicy">
            Privacy Policy
          </a>
          and
          <a target="_blank" class="tips" href="https://www.basic.ai/termsofservice/"> Terms </a>
        </FormItem>
      </Form>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, ref, unref, computed, onMounted } from 'vue';
  import { Form, Input, Checkbox } from 'ant-design-vue';
  import { ButtonSize } from '/@@/Button/typing';
  import Button from '/@@/Button/index.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { LoginStateEnum, useLoginState, useFormRules, useFormValid } from './useLogin';
  import { signUpApi } from '/@/api/sys/user';
  import { useUserStore } from '/@/store/modules/user';
  import mixpanel from 'mixpanel-browser';
  const InputPassword = Input.Password;

  const { setLoginState, getLoginState, setLoginErrorState } = useLoginState();

  const formRef = ref();
  const loading = ref(false);
  const isSuccess = ref(false);
  const subscribe = ref(true);
  const { t } = useI18n();
  const userStore = useUserStore();
  const FormItem = Form.Item;
  const formData = reactive({
    username: '',
    password: '',
  });
  onMounted(() => {
    if (window.sessionStorage.getItem('loginEmail')) {
      formData.username = window.sessionStorage.getItem('loginEmail') as string;
    }
    console.log(formData);
  });

  const { getFormRules } = useFormRules(formData);
  const { validForm } = useFormValid(formRef);

  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.REGISTER);

  async function handleSignUp() {
    const data = await validForm();
    console.log(data);
    if (!data) return;

    loading.value = true;
    try {
      const res = await signUpApi({
        ...formData,
      });
      if (subscribe.value) {
        mixpanel.track('signUp', { email: formData.username });
      }
      userStore.setToken(res.token);
      // isSuccess.value = true;
      userStore.afterLoginAction(true);
    } catch (error) {
      console.log(error);
      if ((error as unknown as any).message.includes('account')) {
        setLoginState(LoginStateEnum.LOGIN);
        setLoginErrorState(true);
      }
    }
    loading.value = false;
  }
</script>
<style lang="less" scoped>
  @import url(./index.less);
</style>
