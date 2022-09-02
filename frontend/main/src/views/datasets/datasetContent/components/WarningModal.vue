<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    title="Warning"
    :closable="false"
    :okText="t('business.task.annotate')"
    :cancelText="t('sys.lock.unlock')"
    @cancel="handleUnlock"
    @ok="handleAnnotate"
  >
    <div :class="prefixCls">
      You have {{ props.lockedNum }} data occupied, continue annotating？
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { defineProps } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { unLock } from '/@/api/business/dataset';
  import { goToTool } from '/@/utils/business';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  const [register] = useModalInner();
  const { prefixCls } = useDesign('warning-modal');
  const { t } = useI18n();
  const props = defineProps<{
    lockedId: number;
    lockedNum: number;
    type: datasetTypeEnum;
  }>();

  const handleUnlock = async () => {
    await unLock({ id: props.lockedId });
    window.location.reload();
  };

  const handleAnnotate = async () => {
    goToTool({ recordId: props.lockedId }, props.type);
    window.location.reload();
  };
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-warning-modal';
  .@{prefix-cls} {
    color: #333;
    text-align: center;
    padding-top: 100px;
  }
</style>
