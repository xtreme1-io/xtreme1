<template>
  <div :class="{ ...getOpClassKV(data), 'sub-item': true }">
    <ToolIcon :tool="(data.icon as any)"></ToolIcon>
    <span class="name">#{{ data.name }}</span>
    <IconExit class="menu" v-show="editable" @click.stop="onClick" />
  </div>
</template>

<script setup lang="ts">
  import { ToolIcon } from 'image-editor';
  import { IItem, Event } from '../type';
  import { useInjectEditor } from 'image-ui/context';
  import { IconExit } from '@basicai/icons';

  const editor = useInjectEditor();
  // ***************Props and Emits***************
  defineEmits(['tool']);
  const props = defineProps<{
    data: IItem;
    editable: boolean;
    parent: IItem;
    // showDelete?: boolean;
  }>();
  // *********************************************

  function onClick(event: MouseEvent) {
    editor.emit(
      Event.SHOW_INSTANCE_MENU,
      { x: event.clientX, y: event.clientY },
      props.data,
      props.parent,
    );
  }
  function getOpClassKV(item: IItem) {
    const classKV: Record<string, boolean> = {};
    if (item._log_op) {
      classKV[item._log_op] = true;
    }
    return classKV;
  }
</script>

<style lang="less" scoped>
  .sub-item {
    display: inline-flex;
    margin-bottom: 8px;
    padding: 0 6px;
    border: 1px solid #878f98;
    border-radius: 4px;
    align-items: center;
    width: 90px;
    line-height: 22px;
    gap: 4px;

    .menu {
      margin-left: auto;
      font-size: 16px;
    }
  }
</style>
