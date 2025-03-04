<template>
  <div class="modal-confirm-base" style="padding-left: 20px">
    <!-- <title> You have completed all claimed data </title> -->
    <div class="msg">
      {{ t('image.noDataInQueue') }}
    </div>
    <div class="msg">
      <span>Click "Re-Claim" to claim next</span>&nbsp;
      <a-input-number v-model:value="bsState.claimNum" size="small" :min="1" :max="1000" />
      &nbsp;<span>data, or click close tool to close tool page</span>
    </div>
    <div class="confirm-btns">
      <a-button class="btn" @click="onClose()"> {{ t('image.Close') }} </a-button>
      <a-button class="btn" type="primary" @click="onClick()">
        {{ t('image.Re-Claim') }}
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useInjectBSEditor } from '../../context';
  import { t } from '@/lang';

  // ***************Props and Emits***************
  const emit = defineEmits(['cancel', 'ok']);

  const editor = useInjectBSEditor();
  const { bsState } = editor;
  function onClick() {
    emit('ok');
  }

  function onClose() {
    emit('cancel');
  }

  /**
   * defineExpose
   */
  function valid(): Promise<boolean> {
    return Promise.resolve(true);
  }
  function getData(): any {
    return bsState.claimNum;
  }
  defineExpose({
    valid,
    getData,
  });
</script>

<style lang="less" scoped>
  .confirm-btns {
    display: flex;
    margin-top: 20px;
    justify-content: space-between;
    flex-direction: row;
  }
</style>
