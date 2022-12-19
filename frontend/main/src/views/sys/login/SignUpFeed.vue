<template>
  <div class="login-wrapper join-team-feed" v-if="getShow">
    <div class="wrapper">
      <div>
        <div class="logo-title"> Set up your account </div>
        <div class="logo-title" v-if="teamName">
          You are going to join <span class="text-primary">{{ teamName }}</span>
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
      >
        <FormItem name="email" class="enter-x mb-7" :label="t('sys.login.email')" validateFirst>
          <Input
            autocomplete="off"
            :disabled="!!email"
            size="large"
            v-model:value="formData.email"
            :placeholder="t('sys.login.email')"
          />
        </FormItem>
        <FormItem
          name="account"
          class="enter-x mb-7"
          :label="t('sys.login.userName')"
          validateFirst
        >
          <Input
            autocomplete="off"
            size="large"
            v-model:value="formData.account"
            :placeholder="t('sys.login.userName')"
          />
        </FormItem>
        <FormItem
          name="password"
          ref="pwdItem"
          class="formContent enter-x"
          :validateFirst="true"
          :label="t('sys.login.password')"
        >
          <Tooltip placement="right" trigger="focus">
            <template #title>
              <div>Password must contain: </div>
              <div>
                <Icon
                  icon="material-symbols:check-circle-rounded"
                  :color="lengthVali ? '#7FF0B3' : '#CCCCCC'"
                />
                8 and 64 characters
              </div>
              <div>
                <Icon
                  icon="material-symbols:check-circle-rounded"
                  :color="numberVali ? '#7FF0B3' : '#CCCCCC'"
                />
                Number
              </div>
              <div>
                <Icon
                  icon="material-symbols:check-circle-rounded"
                  :color="letterVali ? '#7FF0B3' : '#CCCCCC'"
                />
                Letter
              </div>
            </template>
            <InputPassword
              autocomplete="new-password"
              size="large"
              visibilityToggle
              v-model:value="formData.password"
              :placeholder="t('sys.login.password')"
              @blur="
                () => {
                  ($refs.pwdItem as any).onFieldBlur();
                }
              "
              @change="
                () => {
                  ($refs.pwdItem as any).onFieldChange();
                }
              "
            />
          </Tooltip>
        </FormItem>
        <FormItem class="box enter-x">
          <Button size="large" type="primary" block @click="handleSignUp" :loading="loading">
            {{ t('sys.login.registerButton') }}
          </Button>
        </FormItem>
        <div class="mt-5">
          <FormItem class="text-sm text-left">
            Registration means that I agree to the Xtreme1
            <span class="tips"> Privacy Policy </span> and <span class="tips"> Terms </span>
          </FormItem>
        </div>
      </Form>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { unref, computed, reactive, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { LoginStateEnum, useLoginState, useFormRules, useFormValid } from './useLogin';
  import { Form, Input, Tooltip, Button } from 'ant-design-vue';
  import { signUpApi } from '/@/api/sys/user';
  import { useUserStore } from '/@/store/modules/user';
  // import { useMessage } from '/@/hooks/web/useMessage';
  import { useRoute } from 'vue-router';
  import Icon from '/@/components/Icon';
  import { letterVali, numberVali, lengthVali } from '/@/utils/validator';
  import { PageEnum } from '/@/enums/pageEnum';
  import { useGo } from '/@/hooks/web/usePage';
  const FormItem = Form.Item;
  const InputPassword = Input.Password;
  const { query } = useRoute();
  const { token: tokenStr, teamName, email, teamCode } = query;
  const { getLoginState } = useLoginState();
  const { t } = useI18n();
  const userStore = useUserStore();
  // const { createErrorModal } = useMessage();
  const formRef = ref();
  const loading = ref(false);
  const go = useGo();

  const { validForm } = useFormValid(formRef);

  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.SIGNUP_FEED);

  const formData = reactive({
    account: '',
    password: '',
    email: (email as string) || '',
  });
  const { getFormRules } = useFormRules(formData);

  async function handleSignUp() {
    const data = await validForm();
    if (!data) return;
    try {
      loading.value = true;
      const res = await signUpApi({
        password: data.password,
        nickname: data.account,
        email: data.email,
        token: tokenStr as string,
        teamCode: (teamCode as string) || undefined,
      });
      userStore.setToken(res.token);
      await userStore.afterLoginAction(true);
      go(PageEnum.BASE_HOME);
      return;
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
