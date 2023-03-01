<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    destroyOnClose
    :width="360"
    :height="136"
    :closable="false"
    :centered="true"
    wrapClassName="models__modal"
    :footer="null"
  >
    <template #title> </template>
    <div class="inner">
      <div class="text">
        <img :src="warningSvg" class="mr-5px" />
        <span>Coming Soon！</span>
      </div>
      <div class="btn">
        <Button type="primary" @click="closeModal">{{ t('common.okText') }}</Button>
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { Button } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import warningSvg from '/@/assets/images/models/warning.svg';

  const { t } = useI18n();
  const [registerModal, { closeModal }] = useModalInner();
</script>
<style lang="less" scoped>
  .inner {
    .text {
      width: 100%;
      display: flex;
      align-items: center;
      padding: 40px;

      font-weight: 500; //font-weight: 600;

      font-size: 16px;
      color: #333;
    }

    .btn {
      position: relative;
      top: -25px;
      left: -10px;
      text-align: right;

      button {
        width: 51px;
        height: 36px;
        border-radius: 6px;
      }
    }
  }
</style>

<style lang="less">
  .models__modal {
    .scrollbar__wrap {
      overflow: hidden;
    }

    .scrollbar__bar {
      display: none;
    }

    .ant-modal-body {
      height: 150px;
    }
  }
</style>
