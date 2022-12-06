<template>
  <div class="create-card">
    <PlusCircleFilled style="color: #aaa; font-size: 22px" />
    <span>Create</span>
  </div>
</template>
<script lang="ts" setup>
  import { PlusCircleFilled } from '@ant-design/icons-vue';
</script>
<style lang="less" scoped>
  .create-card {
    min-height: 222px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    // height: 222px;
    background-color: #ffffff;
    border: 2px dashed #cccccc;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
    &:hover {
      background-color: #f9fcff;
      border-color: rgba(96, 169, 254, 0.8);
    }
  }
</style>
