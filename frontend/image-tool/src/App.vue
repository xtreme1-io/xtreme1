<template>
  <ConfigProvider :locale="enUS">
    <!-- <router-view></router-view> -->
    <component :is="component()"></component>
  </ConfigProvider>
</template>

<script setup lang="ts">
  import { ConfigProvider } from 'ant-design-vue';
  import enUS from 'ant-design-vue/es/locale/en_US';
  // import zhCN from 'ant-design-vue/es/locale/zh_CN';
  // import Editor from '@/business/chengdu/Editor.vue';
  import Editor from '@/business/chengduNew/Editor.vue';

  import Preview from '@/business/chengduNew/components/Common/preview.vue';
  import Pdf from '@/business/chengduNew/components/Common/pdf.vue';

  const pathMap = {
    preview: Preview,
    pdf: Pdf,
  };
  function component() {
    const path = window.location.pathname.split('/').pop() as keyof typeof pathMap;
    return pathMap[path] || Editor;
  }
</script>
