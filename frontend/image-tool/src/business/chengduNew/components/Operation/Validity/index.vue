<template>
  <Collapse>
    <template #header>
      <IconValidity />
      <span>{{ t('image.validity') }}</span>
    </template>
    <div class="operation-validity" v-if="sourceData">
      <div class="validity-item" :sign-attr-id="editor.getCurrentFrame().id">
        <div class="title">{{ t('image.frame-title') }}</div>
        <a-radio-group
          v-model:value="sourceData.validity"
          :options="validityOptions()"
          @change="handleChange"
          :disabled="!editable"
        />
      </div>
    </div>
  </Collapse>
</template>

<script setup lang="ts">
  import Collapse from '../../Collapse/index.vue';
  import { useInjectBSEditor } from '../../../context';
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
  import { Event } from 'image-editor';
  import { useUI } from 'image-ui/hook';
  import { ISourceData } from '../../../type';
  import { t } from '@/lang';
  import { validityEnum } from '@/enum/baseModel';
  import { historyStore } from '@/business/chengduNew/stores';
  const H = historyStore();
  const { canEdit } = useUI();
  const editor = useInjectBSEditor();
  const { bsState } = editor;

  const validityOptions = () => [
    { label: t('image.Valid'), value: validityEnum.VALID },
    { label: t('image.Invalid'), value: validityEnum.INVALID },
    { label: t('image.Unknown'), value: validityEnum.UNKNOWN },
  ];

  const sourceData = ref<ISourceData>();

  onMounted(() => {
    editor.on(Event.FRAME_CHANGE, onChange);
  });
  onUnmounted(() => {
    editor.off(Event.FRAME_CHANGE, onChange);
  });

  watch(() => [bsState.currentSource, H.UI.state.activeItem], onChange);

  function onChange() {
    const frame = editor.getCurrentFrame();
    if (editor.state.isHistoryView) {
      sourceData.value = H.sourceData[frame.id];
    } else {
      sourceData.value = editor.dataManager.getSourceData(frame, bsState.currentSource);
    }
  }

  const handleChange = (e: any) => {
    const frame = editor.getCurrentFrame();
    frame.needSave = true;
    editor.state.frames = [...editor.state.frames];
    editor.emit(Event.UPDATE_TIME_LINE);
  };

  const editable = computed(() => canEdit());
</script>

<style lang="less" scoped>
  .operation-validity {
    display: flex;
    position: relative;
    padding: 8px;
    text-align: left;
    flex-direction: column;
    gap: 8px;

    .validity-item {
      padding: 8px;
    }

    .title {
      font-size: 14px;
      line-height: 16px;
      color: #dee5eb;
    }
  }
</style>
