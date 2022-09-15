<template>
  <div class="login-wrapper signIn" v-if="getShow">
    <LoginLogo />
    <div class="wrapper">
      <Form
        :model="formData"
        :rules="getFormRules"
        ref="formRef"
        v-show="getShow"
        @keypress.enter="handleCreate"
      >
        <div class="formItem mb-5">
          <div class="formTitle enter-x">{{ t('sys.login.teamName') }}</div>
          <FormItem name="name" class="formContent enter-x">
            <Input
              autocomplete="off"
              class="mint"
              size="large"
              visibilityToggle
              v-model:value="formData.name"
              :placeholder="t('sys.login.teamName')"
            />
          </FormItem>
        </div>

        <FormItem class="enter-x">
          <Button
            :size="ButtonSize.LG"
            type="primary"
            block
            :gradient="true"
            @click="handleCreate"
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
  import { reactive, ref, unref, computed } from 'vue';
  import { Form, Input } from 'ant-design-vue';
  import { ButtonSize } from '/@@/Button/typing';
  import Button from '/@@/Button/index.vue';
  import LoginLogo from './LoginLogo.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { LoginStateEnum, useLoginState, useFormRules, useFormValid } from './useLogin';
  import { createTeamApi } from '/@/api/business/team';
  import { useUserStore } from '/@/store/modules/user';
  import { GetUserInfoModel } from '/@/api/sys/model/userModel';
  import { TeamStatusEnum } from '/@/api/business/model/teamModel';
  const { createErrorModal } = useMessage();
  const { setLoginState, getLoginState } = useLoginState();
  const userStore = useUserStore();
  const formRef = ref();
  const loading = ref(false);

  const { getFormRules } = useFormRules();
  const { validForm } = useFormValid(formRef);
  const { t } = useI18n();
  const FormItem = Form.Item;
  const formData = reactive({
    name: '',
  });

  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.CREATE_TEAM);

  async function handleCreate() {
    const data = await validForm();
    if (!data) return;
    try {
      loading.value = true;
      const res = await createTeamApi(data);
      const userInfo: GetUserInfoModel = userStore.getUserInfo as GetUserInfoModel;
      userStore.setUserInfo({
        ...userInfo,
        team: {
          id: res.id,
          name: res.name,
          status: TeamStatusEnum.ACTIVE,
        },
      });
      await userStore.getUserInfoAction();
      setLoginState(LoginStateEnum.CREATE_TEAM_FEED);
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
