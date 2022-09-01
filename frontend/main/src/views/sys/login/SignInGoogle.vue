<template>
  <div class="google__btn">
    <div id="g_id_signin" class="g_id_signin"></div>
  </div>
</template>
<script lang="ts" setup>
  import { onBeforeMount, onUnmounted } from 'vue';
  // @ts-ignore
  import jwtDecode from 'https://esm.run/jwt-decode';

  const clientId = '492352217396-vch83bbqt1iqtoq2htj6tfeo5g4rfrqg.apps.googleusercontent.com';
  const googleClient = 'https://accounts.google.com/gsi/client';
  const loginUri = 'http://localhost:3100/#/login';

  // 创建引入 script
  const createScript = () => {
    const googleSignInScript = document.createElement('script');
    googleSignInScript.setAttribute('src', googleClient);
    googleSignInScript.setAttribute('id', 'googleSignIn');
    document.head.appendChild(googleSignInScript);
    googleSignInScript.onload = function () {
      googleInit();
    };
  };
  // 移除 script
  const removeScript = () => {
    const googleSignInScript = document.getElementById('googleSignIn');
    googleSignInScript && document.head.removeChild(googleSignInScript);
  };
  // google
  const googleInit = () => {
    const { google } = window as any;
    // 初始化
    google.accounts.id.initialize({
      client_id: clientId,
      login_uri: loginUri,
      ux_mode: 'redirect',
      callback: handleCredentialResponse,
    });
    // 渲染按钮
    google.accounts.id.renderButton(
      // 容器
      document.querySelector('#g_id_signin'),
      // 样式
      {
        type: 'icon',
        theme: 'outline',
        size: 'medium',
        text: 'signin_with',
        shape: 'rectangular',
        width: '280',
      },
    );
    // google.accounts.id.prompt();
  };
  // 登录回调 -- 处理返回参数
  function handleCredentialResponse(response) {
    // 获取 JWT
    const credential = response.credential;
    console.log(credential);
    // jwtDecode 后面不需要，交给后台处理
    const responsePayload = jwtDecode(response.credential);
    console.log(responsePayload);
  }
  // 加载
  onBeforeMount(() => {
    createScript();
    // googleInit();
  });
  // 销毁后 移除 script
  onUnmounted(() => {
    removeScript();
  });
</script>
<style lang="less" scoped>
  .google__btn {
    display: flex;
    justify-content: center;
  }
</style>
