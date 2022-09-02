<template>
  <div class="login-wrapper signIn" v-if="getShow">
    <div class="wrapper">
      <div class="logo-title"> Reset password </div>
      <Form
        :model="formData"
        :rules="getFormRules"
        ref="formRef"
        layout="vertical"
        :hideRequiredMark="true"
        v-show="getShow"
        @keypress.enter="handleReset"
      >
        <FormItem
          ref="pwdItem"
          :label="t('sys.login.newPassword')"
          name="password"
          class="formContent enter-x"
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
        <FormItem
          :label="t('sys.login.confirmPassword')"
          name="confirmPassword"
          class="formContent enter-x"
        >
          <InputPassword
            size="large"
            visibilityToggle
            v-model:value="formData.confirmPassword"
            :placeholder="t('sys.login.confirmPassword')"
          />
        </FormItem>

        <FormItem class="enter-x mt-3">
          <Button
            :size="ButtonSize.LG"
            type="primary"
            block
            @click="handleReset"
            :loading="loading"
          >
            {{ t('sys.login.resetPwdButton') }}
          </Button>
        </FormItem>
      </Form>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, ref, unref, computed } from 'vue';
  import { Form, Input, Tooltip } from 'ant-design-vue';
  import { ButtonSize } from '/@@/Button/typing';
  import Button from '/@@/Button/index.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { LoginStateEnum, useLoginState, useFormRules, useFormValid } from './useLogin';
  import { useRoute } from 'vue-router';
  import { resetPwdApi } from '/@/api/sys/user';
  import { letterVali, numberVali, lengthVali } from '/@/utils/validator';
  import Icon from '/@/components/Icon';
  const { query } = useRoute();
  const { token } = query;
  const { createErrorModal } = useMessage();
  const InputPassword = Input.Password;
  const { setLoginState, getLoginState } = useLoginState();

  const formRef = ref();
  const loading = ref(false);
  const formData = reactive({
    password: '',
    confirmPassword: '',
  });
  const { getFormRules } = useFormRules(formData);
  const { validForm } = useFormValid(formRef);
  const { t } = useI18n();
  const FormItem = Form.Item;

  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.RESET_PASSWORD);

  async function handleReset() {
    const data = await validForm();
    if (!data) return;
    try {
      loading.value = true;
      await resetPwdApi({ token: token as string, newPassword: formData.password });
      setLoginState(LoginStateEnum.RESET_SUCCESS);
    } catch (error) {
      createErrorModal({
        title: t('sys.api.errorTip'),
        content: (error as unknown as Error).message || t('sys.api.networkExceptionMsg'),
        getContainer: () => document.body,
      });
    } finally {
      loading.value = false;
    }
  }
</script>
<style lang="less" scoped>
  @import url(./index.less);
</style>
