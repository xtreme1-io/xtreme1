<template>
  <div class="flex flex-col items-center gap-10px">
    <img :src="ChartEmpty" alt="empty" />
    <span>{{ props.tip ?? 'No Data' }}</span>
  </div>
</template>
<script lang="ts" setup>
  // import { useI18n } from '/@/hooks/web/useI18n';
  import ChartEmpty from '/@/assets/images/ontology/empty.svg';

  // const { t } = useI18n();
  const props = defineProps<{ tip?: string }>();
</script>
<style lang="less" scoped></style>
