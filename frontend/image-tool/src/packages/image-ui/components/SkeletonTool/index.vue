<template>
  <!-- <Info v-show="iState.visible" :data="iState.infos" :active-index="iState.currentIndex" /> -->
  <div class="skeleton-tool" v-show="iState.visible">
    <!-- class list -->
    <div class="skeleton-class-tab">
      <a-tooltip
        placement="topLeft"
        v-for="classType in iState.classList"
        :key="classType.id"
        :title="classType.name"
      >
        <a-radio-button
          :style="{
            borderColor: classType.color,
            color: classType.id === iState.curClass.id ? 'white' : classType.color,
          }"
          :value="classType"
          :class="[{ 'ant-radio-button-wrapper-checked': classType.id === iState.curClass.id }]"
          @click.stop="onConfirmChangeClass(classType)"
        >
          {{ editor.showNameOrAlias(classType) }}
        </a-radio-button>
      </a-tooltip>
    </div>
    <!-- next point -->
    <div v-if="iState.nextIndex >= 0">
      {{ t('image.nextPoint') + (iState.nextIndex + 1) }}
    </div>
    <!-- skeleton cavans -->
    <div ref="skeletonContainer" class="skeleton-graph"></div>
    <!-- skeleton config -->
    <div class="skeleton-config">
      <div class="skeleton-point-tag">
        <!-- point list -->
        <div class="title"> {{ t('image.KeyPoints') }} </div>
        <div class="points-wrap">
          <span
            :class="iState.nextIndex === index ? 'point-wrap active' : 'point-wrap'"
            v-for="(item, index) in iState.points"
            :key="item.name"
          >
            <span
              @click="onPointClick(item, index)"
              :style="{ background: item.color }"
              :class="{
                point: true,
                active: iState.currentIndex === index,
                invalid: !item.valid,
              }"
            >
              {{ item.name }}
            </span>
            <span class="point-extra" v-if="item.extra">
              <img :src="commentSvg" />
            </span>
          </span>
        </div>
        <!-- tag list -->
        <!-- <div class="tags-wrap" v-show="iState.currentIndex >= 0"> -->
        <div class="title"> {{ t('image.Attribute') }} </div>
        <div class="tags-wrap">
          <span
            :title="item.hotkey !== undefined ? t('image.hotKey') + ' ' + item.hotkey : undefined"
            :class="
              iState.points[iState.currentIndex] &&
              iState.points[iState.currentIndex].tag === item.attribute
                ? 'tag active'
                : 'tag'
            "
            v-for="item in iState.tags"
            :key="item.id"
            @click="
              iState.points[iState.currentIndex] &&
              iState.points[iState.currentIndex].tag === item.attribute
                ? undefined
                : onTagClick(item)
            "
            :style="{ background: item.color }"
          >
            {{ editor.showNameOrAlias({ name: item.attribute, ...item }) }}
          </span>
        </div>
      </div>
      <div class="skeleton-point-tag" v-show="iState.showEquidistant">
        <div class="title">{{ t('image.Equidistant Skeleton') }}</div>
        <div v-if="iState.orderList.length > 0" class="equidistant-component">
          <div>
            <span style="margin-right: 8px">{{ t('image.In order') }}</span>
            <a-radio-group
              v-model:value="iState.equalTool.order"
              size="small"
              style="display: inline-block"
              :disabled="!canEdit()"
            >
              <a-radio-button value="curve">{{ t('image.Curve') }}</a-radio-button>
              <a-radio-button value="line">{{ t('image.lineTips') }}</a-radio-button>
            </a-radio-group>
          </div>
          <div v-for="orderItem in iState.orderList" :key="orderItem.id">
            <!-- <p class="equidistant-label">{{ orderItem.label }}</p> -->
            <a-input
              placeholder=""
              :value="orderItem.label"
              size="small"
              style="margin-right: 4px; width: 150px"
              disabled
            />
            <a-button type="primary" size="small" @click="onEqual(orderItem, 'order')">
              {{ t('image.Equal') }}
            </a-button>
          </div>
        </div>
        <div v-if="iState.customList.length > 0" class="equidistant-component">
          <div>
            <span style="margin-right: 8px">{{ t('image.Custom') }}</span>
            <a-radio-group
              v-model:value="iState.equalTool.custom"
              size="small"
              style="display: inline-block"
            >
              <a-radio-button value="curve">{{ t('image.Curve') }}</a-radio-button>
              <a-radio-button value="line">{{ t('image.lineTips') }}</a-radio-button>
            </a-radio-group>
          </div>
          <div v-for="customItem in iState.customList" :key="customItem.id">
            <!-- <p class="equidistant-label">{{ orderItem.label }}</p> -->
            <a-input
              placeholder=""
              :value="customItem.label"
              size="small"
              style="margin-right: 4px; width: 150px"
              disabled
            />
            <a-button type="primary" size="small" @click="onEqual(customItem, 'custom')">
              {{ t('image.Equal') }}
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { debounce } from 'lodash';
  import { nextTick, onMounted, ref, watch, WatchStopHandle } from 'vue';
  import { useInjectEditor } from '../../context';
  import useTool from './useTool';
  import { t } from '@/lang';

  import { IClassTypeItem, SkeletonGraph } from '@basicai/tool-components';
  import commentSvg from '@/assets/comment-tag.svg';
  import { useUI } from '../../hook';

  const editor = useInjectEditor();
  const { iState, initSkeleton, updateSkeleton, onTagClick, onPointClick, onEqual } = useTool();
  const { canEdit } = useUI();
  /******************skeleton init******************/
  const skeletonContainer = ref();
  let stopWatch: WatchStopHandle;
  onMounted(() => {
    stopWatch = watch(
      () => iState.visible,
      () => {
        initSkeletonGraph();
      },
    );
  });
  function initSkeletonGraph() {
    if (!iState.visible) return;
    nextTick(() => {
      const skeleton = new SkeletonGraph({
        cxt: skeletonContainer.value as any,
        editable: false,
      });
      initSkeleton(skeleton);
    });
    stopWatch();
  }
  const onConfirmChangeClass = debounce((classType: IClassTypeItem) => {
    if (classType.id === iState.curClass.id || !editor.editable) return;
    const needConfirm = iState.points?.filter((e) => e.valid).length > 0;
    if (!needConfirm) {
      updateClass(classType);
      return;
    }
    editor
      .showConfirm({
        title: t('image.confirm-title'),
        subTitle: t('image.changeTips', { pre: iState.curClass.name, cur: classType.name }),
        okText: t('image.confirm'),
        cancelText: t('image.cancel'),
        okDanger: true,
      })
      .then(
        () => {
          updateClass(classType);
        },
        () => {},
      );
  }, 100);
  const updateClass = (classType: IClassTypeItem) => {
    iState.curClass = classType;
    editor.state.currentClass = classType.id;
    updateSkeleton();
  };
</script>

<style lang="less">
  .skeleton-tool {
    display: flex;
    position: absolute;
    right: 2px;
    bottom: 2px;
    padding: 10px 0;
    border-radius: 12px;
    z-index: 10;
    align-items: center;
    width: 240px;
    min-height: 400px;
    max-height: 99%;
    background: #393c45;
    flex-direction: column;
    gap: 10px;

    .skeleton-config {
      display: flex;
      flex-direction: column;
      gap: 10px;
      position: relative;
      overflow: auto;
    }

    .skeleton-class-tab {
      display: flex;
      padding: 0 8px 0 10px;
      align-items: flex-start;
      overflow: auto;
      width: inherit;
      min-height: 32px;
      max-height: 72px;
      flex-flow: row wrap;
      gap: 8px;

      .ant-radio-button-wrapper {
        // height: 28px;
        // border-radius: 6px;
        border-left-width: 1px;
        overflow: hidden;
        width: 66.67px;
        min-width: 66.67px;
        text-align: center;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .title {
      font-size: 14px;
    }

    .skeleton-graph {
      width: inherit;
      height: 260px;
      background: #5c5c5c;
    }

    .skeleton-point-tag {
      display: flex;
      padding: 0 10px;
      align-items: flex-start;
      width: inherit;
      flex-direction: column;
      gap: 10px;

      .ant-radio-button-wrapper {
        color: #ffffff !important;
      }
    }

    .points-wrap,
    .tags-wrap {
      display: flex;
      flex-flow: row wrap;
      align-items: flex-start;
      gap: 6px;
    }

    .point-wrap {
      position: relative;

      &.active {
        border-bottom: 2px solid @primary-color;
      }

      .point-extra {
        position: absolute;
        top: -5px;
        right: -5px;
        line-height: 12px;

        img {
          width: 14px;
          height: 14px;
        }
      }

      .ant-avatar {
        border-radius: 0;
        width: 12px;
        height: 12px;
        line-height: 12px;
      }
    }

    .point {
      display: inline-block;
      border: 2px solid transparent;
      border-radius: 15px;
      width: 30px;
      height: 30px;
      font-size: 12px;
      text-align: center;
      color: white;
      line-height: 26px;
      cursor: pointer;

      &.active {
        border-color: #ff3333;
      }

      &.invalid {
        // background: rgb(96 96 96) !important;
        // color: #ababab !important;
        background: #aaaaaa !important;
      }
    }

    .tag {
      padding: 0 3px;
      border-radius: 4px;
      overflow: hidden;
      width: 69px;
      height: 20px;
      background: #cccccc;
      font-size: 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: white;
      line-height: 20px;
      cursor: pointer;

      &.active {
        border-color: red;
      }
    }

    .equidistant-component {
      display: flex;
      padding: 0;
      align-items: flex-start;
      width: 220px;
      flex-direction: column;
      gap: 10px;

      .equidistant-label {
        display: inline-block;
        margin-right: 5px;
        width: 150px;
        text-align: left;
      }
    }

    .custom-key {
      margin-left: 8px;
      padding: 2px 4px;
      border-radius: 4px;
      background: @primary-color;
    }

    .ant-radio-button-wrapper::before {
      display: none;
    }

    .ant-radio-button-wrapper {
      padding: 0 4px;
      border: 1px solid @primary-color;
      border-left-width: 0;
      font-size: 12px;

      &:first-child {
        border-left-width: 1px;
      }

      &.ant-radio-button-wrapper-checked {
        background: @primary-color;
      }
    }

    .ant-input {
      border-color: #767676;
    }
  }
</style>
