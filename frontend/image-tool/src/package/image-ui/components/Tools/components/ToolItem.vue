<template>
  <a-tooltip placement="right" trigger="hover">
    <template #title>
      <div style="display: flex; align-items: center">
        <span>{{ item.title }}</span>
        <i
          v-if="item.hotkey"
          style="margin: 3px 5px 0; font-size: 14px"
          class="iconfont icon-hotkey"
        ></i>
        <span>{{ item.hotkey }}</span>
      </div>
    </template>
    <span
      :class="{
        active: item.isActive(editor),
        'tool-item': true,
        'tool-extra': item.extraClass,
      }"
      :loading="true"
      @click="onTool(item.action)"
    >
      <span style="margin: 3px 0 0">
        <ToolIcon :tool="item.getIcon(editor)" />
      </span>
      <i class="msg" v-show="item.hasMsg && item.hasMsg(editor)">+</i>
    </span>
  </a-tooltip>
  <component v-if="item.extra" :is="item.extra(editor)" @callbackOntool="callbackOntool" />
</template>

<script setup lang="ts">
  import { useInjectEditor } from '../../../context';
  import { IToolItemConfig, ToolIcon } from '../../../../image-editor';

  defineProps<{ item: IToolItemConfig }>();
  const emit = defineEmits(['onItemClick']);

  const editor = useInjectEditor();

  const onTool = (name: string) => {
    emit('onItemClick', name);
  };
  const callbackOntool = (name: string) => {
    if (editor.state.activeTool === name) return;
    emit('onItemClick', name);
  };
</script>

<style lang="less">
  .tool-item {
    display: flex;
    position: relative;
    margin: 4px 0;
    padding: 5px 0;
    border-radius: 4px;
    justify-content: center;
    align-items: center;
    width: 38px;
    background: #1e1f22;
    color: #bec1ca;
    flex-direction: column;
    cursor: pointer;

    p {
      margin: 0;
      font-size: 10px;
    }

    .icon-reset {
      padding: 2px 0;
      width: 100%;
    }

    .default-icon {
      position: absolute;
      top: 5px;
      width: 100%;
      background: #1e1f22;
      text-align: center;

      &:hover {
        opacity: 0;
      }
    }

    .msg {
      display: inline-block;
      position: absolute;
      top: 2px;
      right: 2px;
      border-radius: 30px;
      width: 14px;
      height: 14px;
      background: red;
      font-size: 16px;
      font-style: normal;
      text-align: center;
      color: white;
      line-height: 14px;
    }

    .tool-label {
      overflow: auto;
      font-size: 12px;
    }

    .anticon,
    .iconfont {
      font-size: 18px;
    }

    &:disabled {
      background: #6d7278;
    }

    &:hover {
      .iconfont {
        color: #57ccef;
      }
    }

    &.active {
      background: #57ccef;
      color: #dee5eb;

      .iconfont {
        color: #dee5eb;
      }

      .interactive {
        color: #57ccef;
      }
    }
  }

  .tool-extra {
    margin-top: 4;
    margin-bottom: 0;
    padding-bottom: 5px;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
  }
</style>
