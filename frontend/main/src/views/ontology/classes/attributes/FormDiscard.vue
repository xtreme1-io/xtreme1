<template>
  <div class="inner-discard-modal" v-if="props.showModal">
    <div class="content">
      <div> {{ t('business.ontology.modal.optionValidFilled') }}</div>
      <div> {{ t('business.ontology.modal.optionValidDiscard') }}</div>
    </div>
    <div class="footer">
      <Button type="default" @click.stop="handleCancel">
        {{ t('common.cancelText') }}
      </Button>
      <Button type="primary" danger @click="handleDiscard">
        {{ t('business.ontology.modal.discard') }}
      </Button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { inject } from 'vue';
  import { Button } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n();

  const changeShowEdit = inject('changeShowEdit', Function, true);
  const props = withDefaults(defineProps<{ showModal: boolean }>(), {
    showModal: false,
  });

  const emits = defineEmits(['cancel', 'discard']);
  // Cancel -- Continue editing the current attribute
  const handleCancel = () => {
    emits('cancel');
  };
  // Confirm -- discard the current attribute
  const handleDiscard = () => {
    emits('discard');
    changeShowEdit(false);
  };
</script>
<style lang="less" scoped>
  .inner-discard-modal {
    // 弹窗
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    padding: 10px;
    width: 239px;
    // height: 122px;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 4;

    color: #333;
    box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.15);
    border-radius: 8px;
    background: #fff;

    .content {
      margin-bottom: 10px;
      line-height: 16px;
      font-weight: 400;
      font-size: 14px;
      color: #333;
    }

    .footer {
      display: flex;
      justify-content: space-evenly;
      flex-direction: row;
      width: 100%;
      border-top: none;

      button {
        width: 100px;
        border-radius: 6px;
      }
    }
  }
</style>
