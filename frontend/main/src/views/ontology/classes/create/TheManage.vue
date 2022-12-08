<template>
  <div class="flex gap-10px">
    <Button type="default" @click="handlePush">
      {{ 'Push' }}
    </Button>
    <Button type="default" @click="handlePull">
      {{ 'Pull' }}
    </Button>
    <Button type="primary" @click="handleManageAttr">
      {{ 'Manage attributes' }}
    </Button>
  </div>
</template>
<script lang="ts" setup>
  import { Button } from '/@@/Button';
  import emitter from 'tiny-emitter/instance';

  const emits = defineEmits(['manage']);

  /** Push */
  const handlePush = () => {
    emitter.emit('pushClass');
  };

  /** Pull */
  const handlePull = () => {
    emitter.emit('pullClass');
  };

  /** Manage */
  const handleManageAttr = () => {
    emits('manage');
  };
</script>
<style lang="less" scoped></style>
