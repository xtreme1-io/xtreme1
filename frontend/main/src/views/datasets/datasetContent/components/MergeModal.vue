<template>
  <div :class="`${prefixCls}`">
    <BasicModal
      @register="register"
      v-bind="$attrs"
      class="modal"
      :title="t('business.datasetContent.modalTitle.merge')"
      @ok="handleSubmit"
      @visible-change="handleChange"
    >
      <div class="content" style="margin-top: 78px">
        <div class="tips text-center"> {{ t('business.datasetContent.tips.mergeTips') }} </div>
        <div class="text-center">
          <Select style="width: 200px" v-model:value="value">
            <Select.Option v-for="item in list" :key="item.id" :value="item.id">
              {{ item.name }}
            </Select.Option>
          </Select>
        </div>
      </div>
    </BasicModal>
  </div>
</template>
<script lang="ts" setup>
  import { ref, defineProps, defineEmits } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Select } from 'ant-design-vue';
  import { getFrameApi, mergeFrameApi } from '/@/api/business/dataset';
  import { FrameItem } from '/@/api/business/model/datasetModel';
  import { useRoute } from 'vue-router';
  const { query } = useRoute();
  const { id } = query;
  const { prefixCls } = useDesign('Template');
  const [register, { closeModal }] = useModalInner();
  const { t } = useI18n();
  const list = ref<FrameItem[]>();
  const value = ref();
  // onBeforeMount(async () => {});
  const props = defineProps<{
    selectedList: any[];
  }>();
  const emits = defineEmits(['fetchList']);

  const fetchData = async () => {
    const data = await getFrameApi({
      datasetId: id as unknown as number,
    });
    list.value = data.list;
  };

  const handleChange = (flag) => {
    if (flag) {
      fetchData();
    }
  };

  const handleSubmit = async () => {
    try {
      await mergeFrameApi({
        targetFrameId: value.value,
        sourceDataIds: props.selectedList,
        datasetId: id as unknown as number,
      });
    } catch (e) {}
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
