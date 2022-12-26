<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    :title="t('business.ontology.modal.discardChanges')"
    :ok-button-props="{ danger: true }"
    :ok-text="t('business.ontology.modal.discard')"
    @ok="handleConfirm"
    centered
    wrapClassName="inner-modal"
  >
    <div class="info-text text-center">
      <div>{{ t('business.ontology.modal.optionValid') }}</div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';

  const [register, { closeModal }] = useModalInner();
  const { t } = useI18n();

  const emits = defineEmits(['close']);
  const handleConfirm = async () => {
    closeModal();
    emits('close');
  };
</script>
<style scoped>
  .info-text {
    padding-top: 100px;
    font-size: 16px;
    color: #333333;
  }
</style>
