<template>
  <div :class="prefixCls">
    <Member />
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, provide, ref } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import Member from './components/Member/Member.vue';
  import { useRoute, useRouter } from 'vue-router';
  import { tabKey } from './typing';
  const { currentRoute } = useRouter();
  const activeKey = ref(tabKey.MEMBER);
  const { prefixCls } = useDesign('team');
  const { query } = useRoute();
  const { key } = query;

  onMounted(() => {
    activeKey.value = key as any;
  });

  const handleChangeTab = (key) => {
    window.localStorage.setItem('memberSearchRole', '');
    window.localStorage.setItem('groupSearchUserId', '');
    console.log(
      'tabChange',
      key,
      '--',
      window.localStorage.getItem('memberSearchRole'),
      '+++',
      window.localStorage.getItem('groupSearchUserId'),
    );

    const uri = window.location.origin + '/#' + currentRoute.value.path + '?key=' + key;
    window.history.pushState(null, '', uri);
    activeKey.value = key;
  };
  provide('handleChangeTab', handleChangeTab);
</script>

<style lang="less" scoped>
  @import './index.less';
</style>
