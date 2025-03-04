<template>
  <Collapse>
    <template #header>
      <IconTabClassfication />
      <span>{{ t('image.classification') }}</span>
    </template>
    <Classification
      v-bind="{
        langType: state.lang as any,
        labelKey: state.config.nameShowType,
        onAttrChange: onAttrChange,
        data: currentSource?.classifications ?? [],
        disabled: disabled,
        isScene: state.isSeriesFrame,
      }"
    ></Classification>
  </Collapse>
</template>

<script setup lang="ts">
  import { Classification, IClassIfTargetEnum } from '@basicai/tool-components';
  // -------------------------------------------------//

  import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
  import { t } from '@/lang';
  import { useInjectBSEditor } from '../../../context';
  import { IClassificationAttr, ISourceData } from '../../../type';
  import Collapse from '../../Collapse/index.vue';
  import { IFrame, Event } from 'image-editor';
  import { useUI } from 'image-ui/hook';
  import { historyStore } from '@/business/chengduNew/stores';
  const H = historyStore();
  const editor = useInjectBSEditor();
  const { state, bsState } = editor;
  const { canOperate, canEdit } = useUI();
  const currentSource = ref<ISourceData>();

  function getCurrentSource() {
    // const frame = state.frames[state.frameIndex];
    const frame = editor.getCurrentFrame();
    return getFrameSource(frame);
  }
  function getFrameSource(frame: IFrame) {
    if (!frame) return undefined;
    return editor.dataManager.getSourceData(frame, bsState.currentSource);
  }
  function onChange() {
    const sourceData = getCurrentSource();
    if (sourceData) sourceData.needCompose = true;
    currentSource.value = sourceData;
    if (editor.state.isHistoryView) {
      const frame = editor.getCurrentFrame();
      currentSource.value = H.sourceData[frame.id];
    } else {
      const sourceData = getCurrentSource();
      if (sourceData) sourceData.needCompose = true;
      currentSource.value = sourceData;
    }
  }
  onMounted(() => {
    editor.on(Event.FRAME_CHANGE, onChange);
  });
  onUnmounted(() => {
    editor.off(Event.FRAME_CHANGE, onChange);
  });

  watch(() => [bsState.currentSource, H.UI.state.activeItem], onChange);
  // watch(
  //   () => [currentSource.value],
  //   () => {
  //     if (currentSource.value) {
  //       currentSource.value.needCompose = true;
  //     }
  //   },
  // );
  const disabled = computed(() => {
    return !canOperate() || !canEdit();
  });
  function onAttrChange(name: string, value: any, item: IClassificationAttr) {
    const { classificationId, id } = item;
    const classifi = editor.bsState.classifications.find(
      (c: { id: any }) => c.id == classificationId,
    );
    if (classifi?.targetOn === IClassIfTargetEnum.SCENE && editor.state.isSeriesFrame) {
      const frames = editor.state.frames;
      frames.forEach((f) => {
        const source = getFrameSource(f);
        if (source) {
          const cifi = source.classifications.find((c: { id: any }) => c.id == classificationId);
          if (cifi) {
            const attr = cifi.attrs.find((a: { id: any }) => a.id == id);
            if (attr) {
              attr.value = value;
              editor.setFrameNeedSave(f, true);
            }
          }
        }
      });
    } else {
      const frame = editor.getCurrentFrame();
      editor.setFrameNeedSave(frame, true);
    }
  }
</script>

<style lang="less">
  .operation-classification {
    .ant-form-item {
      margin-bottom: 0;
    }

    .ant-form-vertical .ant-form-item-label {
      padding: 8px 0;
    }

    .ant-collapse-item {
      position: relative;
      border: none !important;
    }
  }

  .verify {
    position: absolute;
    top: 14px;
    right: 10px;
    z-index: 999;
    font-size: 12px;
    color: #ff0000;
  }
</style>
