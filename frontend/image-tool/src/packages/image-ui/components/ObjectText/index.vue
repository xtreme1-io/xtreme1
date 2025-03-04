<template>
  <div :style="getStyleFromStage()" class="all-object-tags">
    <!-- 结果class标签 -->
    <ClassText :data="iState.objectInfos" v-show="showText" />
    <!-- 骨骼点标签 -->
    <SkeletonInfo :data="iState.skeletonInfos" :active-index="-1" v-show="showSkeClass" />
    <!-- 属性标签 -->
    <AttrInfo :data="iState.attrsInfos" v-show="showAttr" />
    <!-- 多边形方向指示 -->
    <PolygonDirection :data="iState.directions" v-show="showDirection" />
  </div>
</template>

<script setup lang="ts">
  import { StyleValue, computed, onMounted, reactive } from 'vue';
  import { AnnotateObject, Event, Line, Polygon, Skeleton } from '../../../image-editor';
  import { useInjectEditor } from '../../context';
  import { ISkeletonInfo } from '../SkeletonTool/type';

  import useClassTag, { ITextItem } from './useClassTag';
  import useDirection, { IDirection } from './useDirection';
  import useAttr, { IAttrText } from './useAttr';

  import ClassText from './ClassText.vue';
  import SkeletonInfo from '../SkeletonTool/Info.vue';
  import AttrInfo from './attrInfo.vue';
  import PolygonDirection from './polygonDirection.vue';

  const editor = useInjectEditor();
  const config = editor.state.config;
  const iState = reactive({
    objectInfos: [] as ITextItem[],
    skeletonInfos: [] as ISkeletonInfo[],
    attrsInfos: [] as IAttrText[],
    directions: [] as IDirection[],
  });
  const showText = computed(() => {
    return config.showClassTitle || config.showResultNumber;
  });
  const showSkeClass = computed(() => {
    return (
      config.showClassTitle ||
      config.showResultNumber ||
      config.skeletonConfig.showAttr ||
      config.skeletonConfig.showNumber
    );
  });
  const showAttr = computed(() => {
    return config.showObjectAttrs > 0;
  });
  const showDirection = computed(() => {
    return config.showObjectDriect > 0;
  });

  const { getObjClassText, getSkeClassText } = useClassTag();
  const { getDirections } = useDirection();
  const { getAttrsInfo } = useAttr();

  onMounted(() => {
    editor.on(Event.DRAW, update);
    editor.on(Event.NAME_OR_ALIAS, update);
    editor.on(Event.ANNOTATE_ANCHOR_ATTR, update);
    editor.on(Event.ANNOTATE_OBJECT_POINT, update);
  });

  function getStyleFromStage(): StyleValue {
    if (!editor.mainView) return {};
    const { stage } = editor.mainView;
    const stagePos = stage.position();
    return {
      left: `${stagePos.x}px`,
      top: `${stagePos.y}px`,
      rotate: `${editor.mainView.rotation()}deg`,
    };
  }
  function update() {
    const root = editor.mainView.getRoot();
    if (!root) {
      iState.objectInfos = [];
      iState.skeletonInfos = [];
      iState.attrsInfos = [];
      iState.directions = [];
      return;
    }
    const updateClass = showText.value || showSkeClass.value;
    const needUpdate = updateClass || showAttr.value || showDirection.value;
    if (!needUpdate) return;
    const objects = root.allObjects.filter((e) => root.renderFilter(e) && e.showVisible);

    if (updateClass) {
      const objs: AnnotateObject[] = [];
      const skes: Skeleton[] = [];
      objects.forEach((e) => {
        if (e.isGroup() && !config.showGroupBox && !e.state.select) return;
        if (e instanceof Skeleton) skes.push(e);
        else objs.push(e);
      });
      showText.value && (iState.objectInfos = getObjClassText(objs));
      showSkeClass.value && (iState.skeletonInfos = getSkeClassText(skes));
    }
    if (showAttr.value) iState.attrsInfos = getAttrsInfo(objects);
    if (showDirection.value) {
      const filters = objects.filter((e) => e instanceof Polygon || e instanceof Line);
      iState.directions = getDirections(filters);
    }
    // console.log('=========>>>>>>>>', iState);
  }
</script>

<style lang="less">
  .all-object-tags {
    position: absolute;
    transform-origin: 0 0;
    // border: '1px solid green',
  }
</style>
