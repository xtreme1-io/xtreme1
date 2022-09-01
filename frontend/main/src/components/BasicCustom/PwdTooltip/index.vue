<template>
  <div class="pwd-tool-tip">
    <Tooltip placement="rightTop" :title="text">
      <Icon size="15" class="info-icon" icon="uiw:information" />
    </Tooltip>
  </div>
</template>
<script lang="tsx" setup>
  import { Tooltip } from 'ant-design-vue';
  import Icon from '/@/components/Icon';
  const text = (
    <div style="width:300px;font-size: 12px">
      <div>Password must contain:</div>
      <ul style="padding-left: 15px;list-style: disc;">
        <li>8 and 64 characters</li>
        <li>Number</li>
        <li>Letter</li>
      </ul>
    </div>
  );
</script>
<style lang="less" scoped>
  .pwd-tool-tip {
    display: inline-block;
    cursor: pointer;
  }

  .info-icon {
    color: #ccc;
    padding: 5px;
  }
</style>
