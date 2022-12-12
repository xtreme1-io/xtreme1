<template>
  <div class="flex gap-10px">
    <Button v-if="showPush" type="default" @click="handlePush">
      {{ 'Push' }}
    </Button>
    <Button v-if="showPull" type="default" @click="handlePull">
      {{ 'Pull' }}
    </Button>
    <Button type="primary" @click="handleManageAttr">
      {{ 'Manage attributes' }}
    </Button>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { Button } from '/@@/Button';
  import emitter from 'tiny-emitter/instance';
  import { ClassTypeEnum } from '/@/api/business/model/classesModel';

  const props = defineProps<{ isCenter: boolean; activeTab: ClassTypeEnum }>();
  const emits = defineEmits(['manage']);

  const showPush = computed(() => {
    return !props.isCenter && props.activeTab == ClassTypeEnum.CLASS;
  });
  const showPull = computed(() => {
    return !props.isCenter && props.activeTab == ClassTypeEnum.CLASS;
  });

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
