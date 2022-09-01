<template>
  <div class="login-wrapper signIn" v-if="getShow">
    <LoginLogo />
    <div class="wrapper">
      <Form
        :model="formData"
        :rules="getFormRules"
        ref="formRef"
        v-show="getShow"
        @keypress.enter="handleLogin"
      >
        <div class="title">{{ t('sys.login.joinTeamTitle') }}</div>
        <FormItem name="teamID" class="content-box enter-x">
          <Input
            autocomplete="off"
            size="large"
            v-model:value="formData.teamID"
            :placeholder="t('sys.login.joinTeamPlaceholder')"
            class="mint"
          />
        </FormItem>

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
      </Form>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, ref, unref, computed, defineEmits } from 'vue';
  import { Form, Input } from 'ant-design-vue';
  import { ButtonSize } from '/@@/Button/typing';
  import Button from '/@@/Button/index.vue';
  import LoginLogo from './LoginLogo.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { LoginStateEnum, useLoginState, useFormRules, useFormValid } from './useLogin';
  const { createErrorModal } = useMessage();
  const { setLoginState, getLoginState } = useLoginState();

  const formRef = ref();
  const loading = ref(false);

  const { getFormRules } = useFormRules();
  const { validForm } = useFormValid(formRef);
  const { t } = useI18n();
  const FormItem = Form.Item;
  const formData = reactive({
    teamID: '',
  });
  const emits = defineEmits(['handleSearchTeam']);

  const handleChange = () => {
    emits('handleSearchTeam', formData.teamID, () => {
      setLoginState(LoginStateEnum.JOIN_TEAM_CONFIRM);
    });
  };

  const handleGo = () => {
    handleChange();
  };
  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.JOIN_TEAM);

  async function handleLogin() {
    const data = await validForm();
    if (!data) return;
    try {
      loading.value = true;
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
