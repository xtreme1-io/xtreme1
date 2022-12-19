<template>
  <div class="app-loading">
    <div class="app-loading-wrap">
      <img src="../../../assets/images/logo.png" class="app-loading-logo" alt="Logo" />
      <div class="app-loading-title">Xtreme1</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { unref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '/@/store/modules/user';
  import { getUserInfo } from '/@/api/sys/user';
  import { switchTeam } from '/@/api/business/team';
  import { setLocalTeamId, getLocalTeamId } from '/@/utils/business/userUtil';

  const { currentRoute } = useRouter();
  const userStore = useUserStore();

  onMounted(() => {
    // 获取、保存 token
    getPathToken();
    // 判断、切换 team
    judgeTeam();
  });

  // 获取 token
  function getPathToken() {
    // console.log('获取Token =====> ');
    const { query } = unref(currentRoute);
    const { jwt } = query;
    saveToken(jwt as string);
  }

  // 保存 token
  function saveToken(token: string) {
    // console.log('保存Token =====> ');
    window.document.cookie = `${document.domain} token=${token};domain=${document.domain};expires=Fri, 31 Dec 9999 23:59:59 GMT`;
    userStore.setToken(token);
  }

  // 跳转首页
  function goHome() {
    // console.log('前往首页 =====> ');
    userStore.afterLoginAction(true);
  }

  // 获取团队信息判断 team 是否一致
  async function judgeTeam() {
    try {
      const userInfo = await getUserInfo();
      // console.log('获取用户信息成功 =====> ');
      const { team } = userInfo;

      const tokenTeamId = team?.id;
      const localTeamId = Number(getLocalTeamId());
      // console.log('比较团队信息 =====> ');

      if (tokenTeamId == localTeamId) {
        // console.log('团队信息相同');
        goHome();
      } else {
        // console.log('团队信息不同');
        changeTeam(localTeamId);
      }
    } catch (error: any) {
      console.log(error);
      goHome();
    }
  }

  // 切换团队
  async function changeTeam(teamId: number) {
    try {
      const res = await switchTeam({ id: teamId, autoSwitch: 1 });
      // console.log('切换团队成功 =====> ');

      saveToken(res.token); // 保存 Token
      setLocalTeamId(String(res?.team?.id)); // 保存 teamId

      goHome();
    } catch (error) {
      console.log(error);
      goHome();
    }
  }
</script>
<style lang="less" scoped>
  html[data-theme='dark'] .app-loading {
    background-color: #2c344a;
  }

  html[data-theme='dark'] .app-loading .app-loading-title {
    color: rgba(255, 255, 255, 0.85);
  }

  .app-loading {
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background-color: #f4f7f9;

    .app-loading-wrap {
      position: absolute;
      top: 50%;
      left: 50%;
      display: flex;
      -webkit-transform: translate3d(-50%, -50%, 0);
      transform: translate3d(-50%, -50%, 0);
      justify-content: center;
      align-items: center;
      flex-direction: column;

      .app-loading-logo {
        display: block;
        width: 90px;
        margin: 0 auto;
        margin-bottom: 20px;
      }

      .app-loading-title {
        display: flex;
        margin-top: 30px;
        font-size: 30px;
        color: rgba(0, 0, 0, 0.85);
        justify-content: center;
        align-items: center;
      }
    }
  }
</style>
