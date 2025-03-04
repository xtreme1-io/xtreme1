<template>
  <div class="mask-config" v-show="showMaskConfig">
    <BrushConfig />
    <div class="config-btns">
      <!-- 是否覆盖 -->
      <a-tooltip placement="bottom" trigger="hover">
        <template #title>
          <span>{{ t('image.cover') }}</span>
          <IconKeyboard style="margin: 3px 5px 0; font-size: 14px" />
          <span>2</span>
        </template>
        <div :class="{ 'btn-item': true, active: toolConfig.coverType === 1 }" @click="onCover()">
          <IconDisband />
        </div>
      </a-tooltip>
      <!-- 橡皮擦 -->
      <a-tooltip placement="bottom" trigger="hover">
        <template #title>
          <span>{{ t('image.Crop Region') }}</span>
          <IconKeyboard style="margin: 3px 5px 0; font-size: 14px" />
          <span>3</span>
        </template>
        <div
          :class="{ 'btn-item': true, active: toolConfig.maskDrawType == 1 }"
          @click="onEraser()"
        >
          <IconEraser />
        </div>
      </a-tooltip>
      <!-- 撤销 -->
      <!-- <a-tooltip placement="bottom" trigger="hover">
        <template #title>
          <span>Undo</span>
        </template>
        <div class="btn-item">
          <IconIosUndo />
        </div>
      </a-tooltip> -->
      <!-- 重绘 -->
      <!-- <a-tooltip placement="bottom" trigger="hover">
        <template #title>
          <span>Redo</span>
        </template>
        <div class="btn-item">
          <IconIosRedo />
        </div>
      </a-tooltip> -->
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useInjectEditor } from '../../../context';
  import { ToolName } from '../../../../image-editor';
  import { t } from '@/lang';

  import BrushConfig from './BrushConfig.vue';

  const editor = useInjectEditor();
  const { state } = editor;
  const { toolConfig } = editor.state;
  const configTools: ToolName[] = [
    ToolName.segment,
    ToolName.brush,
    ToolName['mask-polygon'],
    ToolName['mask-fill'],
  ];

  const showMaskConfig = computed(() => {
    return configTools.includes(state.activeTool) && toolConfig.segmentTool !== ToolName.default;
  });

  // 切换 覆盖与不覆盖模式
  function onCover() {
    toolConfig.maskDrawType = 0;
    toolConfig.coverType = 1 - toolConfig.coverType;
    editor.mainView.updateCurrentDrawTool();
  }

  // 切换 绘制与橡皮擦模式
  function onEraser() {
    toolConfig.coverType = 0;
    toolConfig.maskDrawType = 1 - toolConfig.maskDrawType;
    editor.mainView.updateCurrentDrawTool();
  }
</script>

<style lang="less" scoped>
  .mask-config {
    display: flex;
    padding: 0 10px;
    align-items: flex-start;
    flex-direction: column;

    .config-btns {
      display: flex;
      flex-direction: row;
      gap: 2px;
      padding: 0 0 6px;
    }

    .btn-item {
      display: inline-flex;
      // border: 1px solid #dddede;
      border-radius: 5px;
      justify-content: center;
      align-items: center;
      width: 32px;
      height: 24px;
      color: #ffffff;
      flex-direction: column;

      i {
        font-size: 20px;
        line-height: 32px;
      }

      &:hover {
        color: @primary-color;
      }

      &.active {
        background-color: @primary-color;
        color: #ffffff;
      }
    }

    p {
      margin: 0;
      white-space: nowrap;
    }
  }
</style>
