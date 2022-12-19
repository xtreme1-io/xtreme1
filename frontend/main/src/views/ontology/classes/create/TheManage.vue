<template>
  <div class="manage_container">
    <div class="btn_box">
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
    <div v-if="showPushBox || showPullBox" class="push_box">
      <div v-if="showPushBox">
        Are you sure you want to override all attributes in classname in ontologyname by current
        attributes? Cancel Override
      </div>
      <div v-if="showPullBox">
        Are you sure you want to override all current attributes by classname in ontologyname?
      </div>
      <div class="flex justify-end gap-10px">
        <Button @click="handleCancel">Cancel</Button>
        <Button type="primary" class="override" @click="handleOverride"> Override </Button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, ref } from 'vue';
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
  const showPushBox = ref<boolean>(false);
  const handlePush = () => {
    showPullBox.value = false;
    showPushBox.value = true;
  };

  /** Pull */
  const showPullBox = ref<boolean>(false);
  const handlePull = () => {
    showPullBox.value = true;
    showPushBox.value = false;
  };

  const handleCancel = () => {
    showPullBox.value = false;
    showPushBox.value = false;
  };
  const handleOverride = () => {
    if (showPullBox.value) {
      emitter.emit('pullClass');
    } else {
      emitter.emit('pushClass');
    }
    handleCancel();
  };

  /** Manage */
  const handleManageAttr = () => {
    emits('manage');
    handleCancel();
  };
</script>
<style lang="less" scoped>
  .manage_container {
    min-height: 32px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transform: translateY(-40px);
    margin-bottom: -35px;
    .btn_box {
      position: absolute;
      display: flex;
      gap: 10px;
      transform: translateX(120px);
    }

    .push_box,
    .pull_box {
      margin-top: 40px;
      padding: 10px;
      background: #ffffff;
      box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.15);
      border-radius: 8px;
      font-size: 14px;
      line-height: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      color: #333333;
      .override {
        background-color: #fcb17a;
      }
    }
  }
</style>
