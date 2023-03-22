<template>
    <ConfigProvider :locale="zhCN">
        <Editor />
    </ConfigProvider>
</template>

<script setup lang="ts">
    import { ConfigProvider } from 'ant-design-vue';
    import Editor from '/@/business/beijing/Editor.vue';

    import enUS from 'ant-design-vue/es/locale/en_US';

    import zhCN from 'ant-design-vue/es/locale/zh_CN';
    // const { getAntdLocale } = useLocale();
</script>
