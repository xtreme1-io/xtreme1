<template>
  <a-tooltip
    trigger="click"
    placement="right"
    v-model:visible="visible"
    overlayClassName="ske-setting-tooltip"
  >
    <div
      class="tool-trigger"
      :style="{
        color: visible ? 'rgb(23, 125, 220)' : '',
      }"
    >
      <IconHorizontalMore style="font-size: 14px; border-top: 1px solid #4e4e4e" />
    </div>
    <template #title>
      <div class="ske-setting-content">
        <div class="ske-setting-item">
          <div class="item-title"> {{ t('image.Creation') }} </div>
          <div class="item-option">
            <a-checkbox v-model:checked="skeletonConfig.creation">
              {{ t('image.Create new when complete') }}
            </a-checkbox>
          </div>
        </div>
        <div class="ske-setting-item">
          <div class="item-title"> {{ t('image.Canvas Skeleton Setting') }} </div>
          <div class="item-option" style="width: 200px">
            <span>{{ t('image.Size') }}</span>
            <a-slider v-model:value="skeletonConfig.radius" :min="1" :max="10" :step="1" />
            <span>{{ skeletonConfig.radius }}</span>
          </div>
          <div class="item-option">
            <div>
              <span>{{ t('image.Show Series Number') }}</span> &nbsp;
              <IconKeyboard class="item-hotkey" />
              <span>{{ `${CtrlStr}+J` }}</span>
            </div>
            <div>
              <a-switch v-model:checked="skeletonConfig.showNumber" size="small" />
            </div>
          </div>
          <div class="item-option">
            <div>
              <span>{{ t('image.Show Attribute') }}</span> &nbsp;
              <IconKeyboard class="item-hotkey" />
              <span>{{ `${CtrlStr}+M` }}</span>
            </div>
            <div>
              <a-switch v-model:checked="skeletonConfig.showAttr" size="small" />
            </div>
          </div>
        </div>
        <div class="ske-setting-item">
          <div class="item-title">{{ t('image.Sample Skeleton Setting') }}</div>
          <div class="item-option" style="width: 200px">
            <span>{{ t('image.Size') }}</span>
            <a-slider v-model:value="skeletonConfig.graphRadius" :min="1" :max="10" :step="1" />
            <span>{{ skeletonConfig.graphRadius }}</span>
          </div>
          <div class="item-option">
            <div>
              <span>{{ t('image.Show Series Number') }}</span> &nbsp;
              <IconKeyboard class="item-hotkey" />
              <span>{{ `Shift+J` }}</span>
            </div>
            <div>
              <a-switch v-model:checked="skeletonConfig.showGraphLabel" size="small" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </a-tooltip>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { useInjectEditor } from '../../../context';
  import { IconHorizontalMore } from '@basicai/icons';
  import { isMac } from 'image-editor/lib/ua';
  import { Skeleton, ToolModelEnum, Event } from 'image-editor';
  import { t } from '@/lang';

  const editor = useInjectEditor();
  const { skeletonConfig } = editor.state.config;
  const visible = ref(false);
  const CtrlStr = isMac ? '⌘' : 'Ctrl';

  watch(
    () => skeletonConfig.radius,
    () => {
      const frame = editor.getCurrentFrame();
      if (!frame) return;
      const objs = editor.dataManager.getFrameObject(frame.id, ToolModelEnum.INSTANCE);
      const skes = objs?.filter((e) => e instanceof Skeleton) || [];
      editor.mainView.updateStateStyle(skes);
    },
  );
  watch(
    () => [skeletonConfig.showAttr, skeletonConfig.showNumber],
    () => {
      editor.mainView.draw();
    },
  );
  watch(
    () => [skeletonConfig.showGraphLabel, skeletonConfig.graphRadius],
    () => {
      editor.emit(Event.SKELETON_GRAPH);
    },
  );
</script>

<style lang="less">
  .ske-setting-tooltip {
    max-width: none;
  }

  .ske-setting-content {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 6px;
  }

  .ske-setting-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .item-title {
      font-size: 14px;
      color: #ffffff;
    }

    .item-option {
      display: flex;
      margin-left: 14px;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      flex-direction: row;
      gap: 4px;

      .ant-slider {
        flex: 1;
      }

      .item-hotkey {
        font-size: 12px;
      }
    }
  }
</style>
