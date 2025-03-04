<template>
  <div class="advance-item item-flex">
    <div>{{ t('image.delete') }}</div>
    <div class="btns">
      <button :class="{ active: thisSta.deleteType == 'all' }" @click="onDelete('all')">
        {{ t('image.All Frames') }}
      </button>
      <button :class="{ active: thisSta.deleteType == 'some' }" @click="onDelete('some')">
        {{ t('image.Some Frames') }}
      </button>
      <button :class="{ active: thisSta.deleteType == 'untrue' }" @click="onDelete('untrue')">
        {{ t('image.All Non-True Values') }}
      </button>
    </div>
    <div v-show="thisSta.showConfirm" class="confirm-info">
      <div class="confirm-info-label">{{ thisSta.deleteTips }}</div>
      <div v-if="thisSta.deleteType == 'some'">
        {{ t('image.Frames') + (thisSta.range.length > 0 ? ` (${String(thisSta.range)})` : '') }}
        <a-slider range v-model:value="thisSta.range" :min="1" :max="thisSta.frames" />
      </div>
      <div class="confirm-info-btns">
        <a-button style="margin-right: 10px" @click="onCancel">
          {{ t('image.cancel') }}
        </a-button>
        <a-button type="primary" danger @click="onSure">
          {{ t('image.confirm') }}
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, watch } from 'vue';
  import { useInjectEditor } from '../../../context';
  import { useInject } from '../context';
  import { t } from '@/lang';

  const editor = useInjectEditor();
  const editClassState = useInject();
  const thisSta = reactive({
    deleteType: '',
    showConfirm: false,
    deleteTips: '',
    range: [1, 2],
    frames: 2,
  });
  const deleteHandlerMap = {
    all: deleteAll,
    some: deleteSome,
    untrue: deleteAllUntrue,
  };
  watch(
    () => editor.state.config.showClassView,
    () => {
      if (editor.state.config.showClassView) {
        onCancel();
      }
    },
  );

  function onDelete(type: 'all' | 'some' | 'untrue' | '') {
    if (!type || thisSta.deleteType == type) {
      onCancel();
      return;
    }
    thisSta.deleteType = type;
    thisSta.showConfirm = true;
    if (type == 'all') {
      thisSta.deleteTips = t('image.deleteFromAllFrames');
    } else if (type == 'some') {
      thisSta.deleteTips = t('image.deleteFromSomeFrames');
      thisSta.frames = editor.state.frames.length;
      thisSta.range = [1, thisSta.frames];
    } else if (type == 'untrue') {
      thisSta.deleteTips = t('image.deleteAllUntrue');
    }
  }
  function onSure() {
    (deleteHandlerMap as any)[thisSta.deleteType]?.();
    onCancel();
  }
  function onCancel() {
    thisSta.deleteType = '';
    thisSta.showConfirm = false;
  }
  function deleteAll() {
    editor.trackManager.deleteObjectByTrack(editClassState.trackId);
  }
  function deleteSome() {
    const [rStart, rEnd] = thisSta.range;
    const deleteFrames = editor.state.frames.slice(rStart - 1, rEnd);
    editor.trackManager.deleteObjectByTrack(editClassState.trackId, deleteFrames);
  }
  function deleteAllUntrue() {
    const trackId = editClassState.trackId[0] || '';
    if (!trackId) return;
    editor.trackManager.deleteUntrueObjectByTrack(trackId);
  }
</script>

<style lang="less" scoped>
  .btns {
    button {
      padding: 2px 10px;
      border: 1px solid #a61d24;
      border-radius: 0;
      background: none;
      color: #a61d24;

      &:hover {
        border-color: rgb(255 83 83);
        color: rgb(255 83 83);
        cursor: pointer;
      }
    }

    .active {
      background-color: #a61d24;
      color: #ffffff !important;
    }
  }

  .confirm-info {
    padding: 5px 10px;
    border: 1px solid #3a3a3a;
    width: 100%;
    text-align: left;

    &-label {
      color: #d89614;
    }

    &-btns {
      margin: 10px 0 5px;
      text-align: right;
    }
  }
</style>
