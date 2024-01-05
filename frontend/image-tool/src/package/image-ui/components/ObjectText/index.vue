<template>
  <div :style="getStyleFromStage()" class="all-object-tags">
    <ClassText :data="classTags" v-show="config.showClassTitle" />
  </div>
</template>

<script setup lang="ts">
  import { StyleValue, onMounted, ref } from 'vue';
  import { Event } from 'image-editor';
  import { useInjectEditor } from '../../context';
  import { ITextItem } from './type';
  import useTags from './useTags';

  //ui
  import ClassText from './class-text.vue';

  const editor = useInjectEditor();
  const config = editor.state.config;
  const classTags = ref<ITextItem[]>([]);

  const { getClassTags } = useTags();
  onMounted(() => {
    editor.on(Event.DRAW, update);
  });

  function update() {
    const root = editor.mainView.getRoot();
    if (!root) {
      classTags.value = [];
      return;
    }
    const { showClassTitle } = config;
    if (!showClassTitle) return;
    const objects = root.allObjects.filter((e) => root.renderFilter(e) && e.showVisible);

    const { classTexts } = getClassTags(objects);
    classTags.value = classTexts;
    // console.log('=========>>>>>>>>', classTags);
  }
  function getStyleFromStage(): StyleValue {
    if (!editor.mainView) return {};
    const { stage } = editor.mainView;
    const stagePos = stage.position();
    return {
      left: `${stagePos.x}px`,
      top: `${stagePos.y}px`,
      rotate: `${editor.mainView.stage.rotation()}deg`,
    };
  }
</script>

<style lang="less">
  .all-object-tags {
    position: absolute;
    transform-origin: 0 0;
    // border: '1px solid green',
  }
  .object-title {
    position: absolute;
    user-select: none;
    pointer-events: none;

    .item {
      display: flex;
      position: absolute;
      margin-top: -24px;
      height: 22px;
      font-size: 12px;
      white-space: nowrap;
      color: white;
      flex-direction: row;
      gap: 1px;
      line-height: 22px;
      pointer-events: none;
      transform-origin: 0 110%;
      // opacity: 0.8;
      &-class-title {
        padding: 0 6px;
        border-radius: 4px;
        background: rgb(255 0 0);
      }

      &-invalid {
        padding: 0 6px;
        border-radius: 4px;
        background-color: #ffffff;
        color: #fcb17a;
      }
    }
  }
</style>
