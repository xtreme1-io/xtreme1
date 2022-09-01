<template>
  <div :class="`${prefixCls}`">
    <BasicModal
      v-bind="$attrs"
      @register="register"
      class="modal"
      :width="600"
      :title="t('common.exportText')"
      @ok="handleSubmit"
      ok-text="Export"
      :okButtonProps="{
        loading: isLoading,
      }"
    >
      <div class="content">
        <div class="flex items-center gap-8px">
          <Icon icon="eva:info-fill" size="20" color="#57CCEF" />
          <span style="color: #666">Click here to check out our data format explanation</span>
        </div>
        <div class="flex items-center gap-10px">
          <div class="whitespace-nowrap" style="color: #333">Export Format</div>
          <Select v-model:value="selectValue" style="width: 240px" allowClear>
            <Select.Option v-for="item in selectOption" :key="item.value" :value="item.value">
              {{ item.label }}
            </Select.Option>
          </Select>
        </div>
      </div>
    </BasicModal>
  </div>
</template>
<script lang="ts" setup>
  import { defineEmits, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';

  import { Select } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Icon } from '/@/components/Icon';

  import { exportData } from '/@/api/business/dataset';

  const { query } = useRoute();
  const { id } = query;
  const { prefixCls } = useDesign('exportModal');
  const { t } = useI18n();
  const [register, { closeModal }] = useModalInner();
  const emit = defineEmits(['setExportRecord']);

  const selectValue = ref<string>('');
  const selectOption = [
    {
      value: 'Basic AI Community V1.0',
      label: 'Basic AI Community V1.0',
    },
  ];

  const isLoading = ref<boolean>(false);
  const handleSubmit = async () => {
    try {
      isLoading.value = true;
      const res = await exportData({ datasetId: id });
      emit('setExportRecord', res);
      closeModal();
    } catch (e) {}

    setTimeout(() => {
      isLoading.value = false;
    }, 300);
  };
</script>
<style lang="less" scoped>
  .content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 40px 50px;
    font-size: 14px;
    line-height: 16px;
  }
</style>
