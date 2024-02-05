<template>
  <div class="class-msg-warn">
    <div class="content-wrap">
      <span class="icon"><WarningOutlined /></span>
      <span class="msg">
        <slot name="msg" v-if="$slots.msg"></slot>
      </span>
    </div>
    <div class="btn">
      <a-button style="margin-right: 10px" @click="onCancel">
        {{ editor.lang('cancel') }}
      </a-button>
      <a-button type="primary" @click="onOk">{{ editor.lang('confirm') }}</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { WarningOutlined } from '@ant-design/icons-vue';
  import { useInjectEditor } from '../../../context';

  const emit = defineEmits(['cancel', 'ok']);

  const editor = useInjectEditor();

  function onCancel() {
    emit('cancel');
  }
  function onOk() {
    emit('ok');
  }
</script>

<style lang="less" scoped>
  .class-msg-warn {
    margin-top: 10px;
    padding: 10px;
    border: 1px solid #d89614;
    border-radius: 10px;
    width: 306px;
    box-shadow: 0 0 2px 2px #000000;

    .content-wrap {
      display: flex;
      align-items: center;
    }

    .msg {
      color: #b1b1b1;
    }

    .icon {
      display: inline-block;
      width: 100px;
      font-size: 24px;
      text-align: center;
      color: #d89614;
    }

    .btn {
      margin-top: 10px;
      text-align: right;
    }
  }
</style>
