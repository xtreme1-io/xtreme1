<template>
  <div class="error__content">
    <Icon icon="ion:close-circle" color="#F8827B" size="50" />
    <div class="error__content--tip">
      Failed to import. Please make sure your file match the required format.
    </div>
    <div class="error__content--help">
      <span @click="handleDownload">Download Excel Template</span>
      <span @click="handleView"> View Help Document</span>
    </div>

    <Button type="primary" ghost @click="handleReupload"> Reupload </Button>
  </div>
</template>
<script lang="ts" setup>
  // import { useI18n } from '/@/hooks/web/useI18n';
  import Icon from '/@/components/Icon';
  import { openWindow } from '/@/utils';
  import { Button } from '/@@/Button';
  const emits = defineEmits(['callback']);

  // const { t } = useI18n();

  const handleDownload = () => {};
  const handleView = () => {
    openWindow(
      'https://docs.xtreme1.io/xtreme1-docs/product-guides/ontology/import-class-classification',
    );
  };
  const handleReupload = () => {
    emits('callback', 'upload');
  };
</script>
<style lang="less" scoped>
  .error__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;

    &--tip {
      width: 390px;
      font-weight: 500;
      font-size: 16px;
      line-height: 19px;
      color: #f8827b;
      text-align: center;
      margin-bottom: 10px;
    }

    &--help {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 4px;
      color: @primary-color;
      cursor: pointer;
      margin-bottom: 10px;
    }

    button {
      border: 1px solid;
    }
  }
</style>
