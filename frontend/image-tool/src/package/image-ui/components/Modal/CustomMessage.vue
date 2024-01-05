<template>
  <div v-show="state.editorMessage.visible">
    <div class="custom-message">
      <div class="custom-message-notice">
        <div class="custom-message-content">
          <span>{{ state.editorMessage.messgae }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useInjectEditor } from '../../context';

  const editor = useInjectEditor();
  const { state } = editor;
</script>
<style lang="less" scoped>
  .custom-message {
    margin: 0;
    padding: 0;
    position: fixed;
    top: 35px;
    left: 0;
    z-index: 1010;
    width: 100%;
    pointer-events: none;
  }
  .custom-message-notice {
    padding: 8px;
    text-align: center;
  }
  .custom-message-content {
    display: inline-block;
    padding: 10px 16px;
    background: #647dff;
    border-radius: 15px 0;
    box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.48);
    pointer-events: all;
    user-select: none;
  }
</style>
