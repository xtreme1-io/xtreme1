<template>
  <Icon @click="handleCopy" style="color: #ccc" icon="ic:baseline-file-copy" size="20" />
</template>
<script lang="ts" setup>
  import { defineProps } from 'vue';
  import { message } from 'ant-design-vue';

  import { Icon } from '/@/components/Icon';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { copyTextToClipboard } from '/@/hooks/web/useCopyToClipboard';
  const { t } = useI18n();

  const props = defineProps<{
    text: string;
  }>();

  function handleCopy() {
    const isSuccessRef = copyTextToClipboard(props.text);
    isSuccessRef &&
      message.success({
        content: t('sys.login.teamIDCopiedTips'),
        duration: 5,
      });
  }
</script>
<style lang="less" scoped>
  // @import url(./index.less);
</style>
