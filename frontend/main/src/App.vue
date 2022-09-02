<template>
  <ConfigProvider :locale="getAntdLocale">
    <AppProvider>
      <RouterView />
    </AppProvider>
  </ConfigProvider>
</template>

<script lang="ts" setup>
  // import { provide } from 'vue';
  // import { DefaultApolloClient } from '@vue/apollo-composable';
  import { ConfigProvider } from 'ant-design-vue';
  import { AppProvider } from '/@/components/Application';
  import { useTitle } from '/@/hooks/web/useTitle';
  import { useLocale } from '/@/locales/useLocale';
  import mixpanel from 'mixpanel-browser';
  // support Multi-language
  const { getAntdLocale } = useLocale();
  let token = 'd26602b8c457915fdd009ef6bf7b165c';
  mixpanel.init(token, { debug: false });
  useTitle();
</script>
