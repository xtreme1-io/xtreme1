<template>
  <div class="success__content">
    <Icon icon="ep:success-filled" color="#7FF0B3" size="50" />
    <div class="success__content--tip">
      Imported {{ infoNum?.validClassSize }} Class(es) and
      {{ infoNum?.validClassificationSize }} Classification(s)
    </div>
    <div class="success__content--fail">
      Failed to import {{ infoNum?.classTotalSize - infoNum?.validClassSize }} Class(es) and
      {{ infoNum?.classificationTotalSize - infoNum?.validClassificationSize }} Classification(s),
      because they don't fit the required format.
    </div>
    <Button type="primary" ghost @click="handleReupload"> Close </Button>
  </div>
</template>
<script lang="ts" setup>
  // import { useI18n } from '/@/hooks/web/useI18n';
  import Icon from '/@/components/Icon';
  import { Button } from '/@@/Button';
  const emits = defineEmits(['close']);
  // const { t } = useI18n();
  defineProps<{
    infoNum: any;
  }>();
  const handleReupload = () => {
    emits('close');
  };
</script>
<style lang="less" scoped>
  .success__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;

    &--tip {
      width: 390px;
      font-weight: 500;
      font-size: 16px;
      line-height: 19px;
      color: #333;
      text-align: center;
      margin-bottom: 10px;
    }

    &--fail {
      width: 420px;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      color: #f8827b;
      text-align: center;
      margin-bottom: 20px;
    }

    button {
      border: 1px solid;
    }
  }
</style>
