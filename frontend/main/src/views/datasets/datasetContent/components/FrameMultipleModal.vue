<template>
  <div :class="`${prefixCls}`">
    <BasicModal
      @register="register"
      v-bind="$attrs"
      class="modal"
      :title="t('business.datasetContent.modalTitle.frameMultiple')"
      @ok="handleSubmit"
    >
      <div class="content" style="margin-top: 78px; text-align: center">
        <div>
          <span>{{ t('business.datasetContent.tips.frameMultipleTipsBefore') }}</span>
          <Input
            autocomplete="off"
            class="inline-block"
            style="width: 50px; margin: 0 5px"
            v-model:value="value"
          />
          <span>{{ t('business.datasetContent.tips.frameMultipleTipsAfter') }}</span>
        </div>
      </div>
    </BasicModal>
  </div>
</template>
<script lang="ts" setup>
  import { onBeforeMount, ref, defineProps, defineEmits } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Input } from 'ant-design-vue';
  import { makeFrameSeriesApi } from '/@/api/business/dataset';
  import { useRoute } from 'vue-router';
  const { query } = useRoute();
  const { id } = query;
  const { prefixCls } = useDesign('Template');
  const [register, { closeModal, changeOkLoading }] = useModalInner();
  const { t } = useI18n();
  const value = ref();
  onBeforeMount(async () => {});
  const props = defineProps<{
    selectedList: any[];
  }>();
  const emits = defineEmits(['fetchList']);

  const handleSubmit = async () => {
    try {
      changeOkLoading(true);
      await makeFrameSeriesApi({
        dataIds: props.selectedList,
        datasetId: id as unknown as number,
        frameSize: value.value,
      });
      changeOkLoading(false);
    } catch (e) {}
    changeOkLoading(false);
    closeModal();
    emits('fetchList');
  };
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-Template';
  .@{prefix-cls} {
    color: #333;
  }
</style>
