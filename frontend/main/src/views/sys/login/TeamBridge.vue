<template>
  <div class="login-wrapper signIn" v-if="getShow">
    <LoginLogo />
    <div class="wrapper">
      <div class="choose-list">
        <div class="choose-item" @click="handleChangeJoin">
          <div :class="getJoinCheckboxClass">
            <Icon style="color: #57ccef" icon="mdi:check-circle" size="20" />
          </div>
          <span class="text">Join an existing team</span>
        </div>
        <div class="choose-item" @click="handleChangeCreate">
          <div :class="getCreateCheckboxClass">
            <Icon style="color: #57ccef" icon="mdi:check-circle" size="20" />
          </div>
          <span class="text">Create a new team</span>
        </div>
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
  import { ref, unref, computed } from 'vue';
  import { Form } from 'ant-design-vue';
  import { Icon } from '/@/components/Icon';
  import { ButtonSize } from '/@@/Button/typing';
  import Button from '/@@/Button/index.vue';
  import LoginLogo from './LoginLogo.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { LoginStateEnum, useLoginState } from './useLogin';
  const { setLoginState, getLoginState } = useLoginState();
  const { t } = useI18n();
  const FormItem = Form.Item;
  const loading = ref(false);

  const joinChecked = ref<boolean>(false);
  const createChecked = ref<boolean>(false);
  const getJoinCheckboxClass = computed(() => {
    return unref(joinChecked) ? 'checkbox' : 'checkbox hidden';
  });
  const getCreateCheckboxClass = computed(() => {
    return unref(createChecked) ? 'checkbox' : 'checkbox hidden';
  });

  const handleChangeJoin = () => {
    joinChecked.value = !unref(joinChecked);
    createChecked.value = false;
  };

  const handleChangeCreate = () => {
    createChecked.value = !unref(createChecked);
    joinChecked.value = false;
  };

  const handleGo = () => {
    if (unref(joinChecked)) {
      setLoginState(LoginStateEnum.JOIN_TEAM);
    } else {
      setLoginState(LoginStateEnum.CREATE_TEAM);
    }
  };

  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.TEAM_BRIDGE);
</script>
<style lang="less" scoped>
  @import url(./index.less);
</style>
