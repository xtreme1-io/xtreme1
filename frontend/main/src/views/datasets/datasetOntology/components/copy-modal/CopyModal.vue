<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="modalTitle"
    :okText="t('business.ontology.copy.next')"
    centered
    destroyOnClose
    @ok="handleNext"
    :okButtonProps="{ disabled: canNotNext }"
    :width="1000"
    :height="750"
  >
    <div class="copy-modal">
      <!-- <ChooseClass :ontologyId="selectedOntology"  @copyAll="handleCopyAll" /> -->
      <ChooseOntology @copyAll="handleCopyAll" @select="handleSelectOntology" />
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  // 组件
  import { BasicModal, useModalInner } from '/@/components/Modal';
  // import ChooseClass from './ChooseClass.vue';
  import ChooseOntology from './ChooseOntology.vue';

  const [registerModal, { closeModal }] = useModalInner();
  const { t } = useI18n();

  // 当前标题，根据 activeTab 判断
  const modalTitle = ref<string>('Copy from Ontology Center');

  /** Copy All */
  const handleCopyAll = () => {};

  /** Ontology */
  const selectedOntology = ref<string>();
  const handleSelectOntology = (id: string) => {
    selectedOntology.value = id;
  };

  /** Next */
  const canNotNext = ref<boolean>(true);
  const handleNext = () => {
    closeModal();
  };
</script>
<style scoped lang="less">
  .copy-modal {
    padding: 20px;
    padding-bottom: 12px;
  }
</style>
