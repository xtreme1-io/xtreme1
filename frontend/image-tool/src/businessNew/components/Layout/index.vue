<template>
  <!-- [header] -->
  <!-- [container] = [tools, editor, operation] -->
  <div class="image-tool-layout">
    <div class="layout-header"><slot name="header" /></div>
    <div class="layout-content">
      <div class="tools-wrap"><slot name="tools" /></div>
      <div class="main-wrap"><slot name="default" /></div>
      <div class="operation-wrap"><slot name="operation" /></div>
      <slot name="mask"></slot>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="less">
  .image-tool-layout {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background-color: #3a393e;

    .layout-header {
      width: 100%;
      height: 54px;
      background-color: #1e1f22;
    }
    .layout-content {
      flex: 1;
      display: flex;
      flex-direction: row;
      position: relative;
    }
    .tools-wrap {
      width: 50px;
    }
    .operation-wrap {
      position: relative;
      width: 300px;
      padding: 4px;
    }
    .main-wrap {
      flex: 1;
    }
  }
</style>
