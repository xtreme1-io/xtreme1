<template>
  <div class="image-editor-wrap">
    <div class="editor-render" ref="dom"></div>
    <div class="editor-components">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { Editor } from '../../../image-editor';
  import { useProvideEditor, useInjectEditor } from '../../context';

  let editor = useInjectEditor();
  if (!editor) {
    editor = new Editor();
    useProvideEditor(editor);
  }

  const dom = ref();
  onMounted(() => {
    editor.init(dom.value as any, {
      actions: ['zoom-move', 'select-hover'],
    });
  });
</script>

<style lang="less">
  .image-editor-wrap {
    position: absolute;
    right: 0;
    left: 0;
    height: 100%;

    .editor-render {
      height: 100%;
      background: #6a6a6a;
    }

    .editor-components {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;

      > * {
        pointer-events: visible;
      }
    }
  }
</style>
