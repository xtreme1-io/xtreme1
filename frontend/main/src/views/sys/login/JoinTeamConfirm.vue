<template>
  <div class="login-wrapper join-team-confirm" v-if="getShow">
    <LoginLogo />
    <div class="wrapper">
      <div class="teamInfo">
        <div class="avatar">S</div>
        <div class="info">
          <div class="name">Team Name: {{ info?.name }}</div>
          <div class="id">Team ID: {{ info?.id }}</div>
        </div>
      </div>

      <FormItem class="enter-x">
        <div class="flex">
          <div class="btn">
            <Button
              :size="ButtonSize.LG"
              type="primary"
              block
              :gradient="true"
              @click="setLoginState(LoginStateEnum.JOIN_TEAM)"
              :loading="loading"
            >
              {{ t('sys.login.backButton') }}
            </Button>
          </div>
          <div class="btn">
            <Button
              :size="ButtonSize.LG"
              type="primary"
              block
              :gradient="true"
              @click="handleJoin"
              :loading="loading"
            >
              {{ t('sys.login.joinButton') }}
            </Button>
          </div>
        </div>
      </FormItem>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, unref, computed, defineProps } from 'vue';
  import { Form } from 'ant-design-vue';
  import { ButtonSize } from '/@@/Button/typing';
  import Button from '/@@/Button/index.vue';
  import LoginLogo from './LoginLogo.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { LoginStateEnum, useLoginState } from './useLogin';
  import { Team } from '/@/api/business/model/teamModel';
  import { joinTeamApi } from '/@/api/business/team';
  const { setLoginState, getLoginState } = useLoginState();
  const props = defineProps<{
    info: Nullable<Team>;
  }>();

  const handleJoin = async () => {
    try {
      await joinTeamApi({ teamId: props.info?.inviteCode || '1' });
      setLoginState(LoginStateEnum.JOIN_TEAM_FEED);
    } catch (e) {}
  };

  const loading = ref(false);

  const { t } = useI18n();
  const FormItem = Form.Item;

  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.JOIN_TEAM_CONFIRM);
</script>
<style lang="less" scoped>
  @import url(./index.less);
</style>
