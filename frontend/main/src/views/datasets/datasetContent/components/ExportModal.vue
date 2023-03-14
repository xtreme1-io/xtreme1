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
        <div class="flex items-center gap-10px">
          <div class="whitespace-nowrap" style="color: #333; width: 100px">Data</div>
          <Select v-model:value="selectValue" style="width: 240px" allowClear>
            <Select.Option v-for="item in selectOption" :key="item.value" :value="item.value">
              {{ item.label }}
            </Select.Option>
          </Select>
        </div>
        <div class="flex items-center gap-10px">
          <div class="whitespace-nowrap" style="color: #333; width: 100px">Results</div>
          <Select v-model:value="selectValue" style="width: 240px" allowClear>
            <Select.Option v-for="item in selectOption" :key="item.value" :value="item.value">
              {{ item.label }}
            </Select.Option>
          </Select>
        </div>
        <div class="flex items-center gap-10px">
          <div class="whitespace-nowrap" style="color: #333; width: 100px">Export Format</div>
          <Select v-model:value="selectValue" style="width: 240px" allowClear>
            <Select.Option v-for="item in selectOption" :key="item.value" :value="item.value">
              {{ item.label }}
            </Select.Option>
          </Select>
        </div>
        <div class="flex items-center gap-8px">
          <Icon icon="eva:info-fill" size="20" color="#57CCEF" />
          <span style="color: #666"
            >Click
            <a href="https://docs.xtreme1.io/xtreme1-docs/export-data" target="_blank">here</a> to
            check out our data format explanation</span
          >
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
  import { setEndTime, setStartTime } from '/@/utils/business/timeFormater';
  import { message } from 'ant-design-vue';
  import { Select } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Icon } from '/@/components/Icon';

  import { exportData } from '/@/api/business/dataset';
  import { dataTypeEnum } from '/@/api/business/model/datasetModel';

  const { query } = useRoute();
  const { id } = query;
  const { prefixCls } = useDesign('exportModal');
  const { t } = useI18n();
  const [register, { closeModal }] = useModalInner();

  const props = defineProps<{ filterForm: any }>();
  const emit = defineEmits(['setExportRecord']);

  const selectValue = ref<string>('');
  const selectOption = [
    {
      value: 'Xtreme1 v0.5.5',
      label: 'Xtreme1 v0.5.5',
    },
  ];

  const isLoading = ref<boolean>(false);
  const handleSubmit = async () => {
    const data = Object.assign(
      {
        datasetId: id,
      },
      {
        ...props.filterForm,
        createStartTime:
          props.filterForm.createStartTime && props.filterForm.createEndTime
            ? setStartTime(props.filterForm.createStartTime)
            : undefined,
        createEndTime:
          props.filterForm.createEndTime && props.filterForm.createStartTime
            ? setEndTime(props.filterForm.createEndTime)
            : undefined,
        projectIds: props.filterForm.projectIds && props.filterForm.projectIds + '',
        modelRunIds: props.filterForm.modelRunIds && props.filterForm.modelRunIds + '',
      },
    );
    if (data.type !== dataTypeEnum.SINGLE_DATA) {
      delete data.annotationCountMin;
      delete data.annotationCountMax;
    }
    if (data.type === dataTypeEnum.ALL) {
      data.type = undefined;
    }

    try {
      isLoading.value = true;
      const res = await exportData(data);
      message.success({
        content: 'successed',
        duration: 5,
      });
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
