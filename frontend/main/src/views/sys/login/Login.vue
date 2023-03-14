<template>
  <div :class="prefixCls">
    <div class="content">
      <div class="logo">
        <img class="logo-img" :src="logoImg" alt="" />
        <div class="split"> </div>
        <img class="logo-qlf" :src="logoQlf" alt="" />
      </div>

      <div class="info">
        <span class="link cursor-pointer" @click="handleGoPortal">BasicAI </span> x1 Community
        Edition is an open-source platform optimizing your data labeling and accelerating AI and
        machine learning with MLOps
      </div>
      <img class="rect-mask" :src="rectMask" alt="" />
      <img class="bg-tip" :src="bgTip" alt="" />
      <!-- <img class="show-img" :src="showImg" alt="" /> -->
      <div id="show-img" class="show-img"></div>
    </div>
    <!-- <SignIn />
    <SignUp /> -->
    <Component :is="getPage" />
    <ResetPwd />
    <!-- <ForgetPwd /> -->
    <ResetSuccess />
    <TeamBridge />
    <JoinTeam @handleSearchTeam="handleSearchTeam" />
    <JoinTeamConfirm :info="info" />
    <JoinTeamFeed />
    <CreateTeam />
    <CreateTeamFeed />
    <SignUpFeed />
  </div>
</template>
<script lang="ts" setup>
  import { ref, onMounted, computed, unref } from 'vue';
  import SignIn from './SignIn.vue';
  import SignUp from './SignUp.vue';
  import ForgetPwd from './ForgetPwd.vue';
  import ResetPwd from './ResetPwd.vue';
  import ResetSuccess from './ResetSuccess.vue';
  import TeamBridge from './TeamBridge.vue';
  import JoinTeam from './JoinTeam.vue';
  import JoinTeamConfirm from './JoinTeamConfirm.vue';
  import JoinTeamFeed from './JoinTeamFeed.vue';
  import CreateTeam from './CreateTeam.vue';
  import CreateTeamFeed from './CreateTeamFeed.vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { LoginStateEnum, useLoginState } from '/@/views/sys/login/useLogin';
  import { getToken } from '/@/utils/auth';
  import { useUserStore } from '/@/store/modules/user';
  import { Team } from '/@/api/business/model/teamModel';
  import { getTeamInfoApi } from '/@/api/business/team';
  import { useGo } from '/@/hooks/web/usePage';
  import { PageEnum } from '/@/enums/pageEnum';
  // import { fetchUser } from '/@/api/sys/user';
  import { useRoute } from 'vue-router';
  import SignUpFeed from './SignUpFeed.vue';
  import { loginErrorType } from './typing';
  import bgTip from '/@/assets/images/bg-tip.png';
  // import showImg from '/@/assets/images/show-img.png';
  import logoImg from '/@/assets/images/logo-img.png';
  import logoQlf from '/@/assets/images/logo-qlf.png';
  import rectMask from '/@/assets/images/rect-mask.png';
  import { handleGoPortal } from '/@/utils/business';
  import lottie from 'lottie-web';
  const { query } = useRoute();
  // const { token: tokenStr, teamId, teamName, email } = query;
  const { token: tokenStr, errorType } = query;
  const { setLoginState, getLoginState } = useLoginState();
  const go = useGo();
  const userStore = useUserStore();
  const info = ref<Nullable<Team>>(null);

  onMounted(async () => {
    const animate = lottie.loadAnimation({
      container: document.getElementById('show-img') as HTMLElement,
      renderer: 'svg',
      loop: true,
      path: '/resource/animate/login/data.json',
    });
    animate.play();
    const token = getToken();
    console.log(errorType);
    if (errorType) {
      switch (errorType) {
        case loginErrorType.REGISTERED:
          setLoginState(LoginStateEnum.LOGIN);
          break;
        case loginErrorType.HAS_CHANGE_PASSWORD:
          setLoginState(LoginStateEnum.FORGET_PASSWORD);
          break;
      }
      return;
    }
    if (tokenStr) {
      setLoginState(LoginStateEnum.SIGNUP_FEED);
      return;
    }
    if (!token) {
      // setLoginState(LoginStateEnum.SIGNUP_FEED);
      setLoginState(LoginStateEnum.LOGIN);
    } else {
      await userStore.getUserInfoAction();
      const info = userStore.getUserInfo;
      console.log(info);
      if (!info) {
        userStore.setToken(undefined);
        userStore.logout(true);
        setLoginState(LoginStateEnum.LOGIN);
      } else {
        go(PageEnum.BASE_HOME);
        // const res = await fetchUser({ id: info?.user?.id || 0 });
        // if (!res.teams || res.teams.length === 0) {
        //   setLoginState(LoginStateEnum.TEAM_BRIDGE);
        // } else if (
        //   res.teams[0].status == TeamStatusEnum.JOINING ||
        //   res.teams[0].status == TeamStatusEnum.PENDING
        // ) {
        //   setLoginState(LoginStateEnum.JOIN_TEAM_FEED);
        // }
      }
    }
  });

  const pageMap = {
    [LoginStateEnum.LOGIN]: SignIn,
    [LoginStateEnum.REGISTER]: SignUp,
    [LoginStateEnum.FORGET_PASSWORD]: ForgetPwd,
  };

  const getPage = computed(() => {
    return pageMap[unref(getLoginState)];
  });

  const handleSearchTeam = async (id, callback) => {
    try {
      info.value = await getTeamInfoApi({ teamId: id });
      callback();
    } catch (e) {
      console.log(e);
    }
  };
  defineProps({
    sessionTimeout: {
      type: Boolean,
    },
  });

  const { prefixCls } = useDesign('login');
</script>
<style lang="less">
  @import url(./index.less);
</style>
