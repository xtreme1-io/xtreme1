<template>
  <div class="advance-item item-flex">
    <div>{{ t('image.merge') }}</div>
    <div class="btns">
      <button :class="{ active: thisSta.type == 'to' }" @click="onMerge('to')">
        {{ t('image.mergeTo') }}
      </button>
      <button :class="{ active: thisSta.type == 'from' }" @click="onMerge('from')">
        {{ t('image.mergeFrom') }}
      </button>
    </div>
    <div v-show="thisSta.showConfirm" class="confirm-info">
      <div> {{ t('image.target') }} </div>
      <a-select
        show-search
        v-model:value="thisSta.value"
        :options="thisSta.list"
        class="confirm-info-select"
        @change="onMergeChange"
        @focus="updateTrackIds"
      >
      </a-select>
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
  import { Event, IUserData } from '../../../../image-editor';
  import { useInjectEditor } from '../../../context';
  import { useInject } from '../context';
  import { t } from '@/lang';

  interface IOption extends IUserData {
    value: string;
    label: string;
  }

  const editor = useInjectEditor();
  const editState = useInject();

  const thisSta = reactive({
    type: '',
    showConfirm: false,
    value: '',
    list: [] as IOption[],
    mergeTrack: {} as IOption,
  });
  watch(
    () => editor.state.config.showClassView,
    () => {
      if (editor.state.config.showClassView) {
        onCancel();
      }
    },
  );

  function onMerge(type: 'to' | 'from' | '') {
    if (!type || thisSta.type == type) {
      onCancel();
      return;
    }
    thisSta.type = type;
    thisSta.showConfirm = true;
    // updateTrackIds();
    toPreMerge();
  }
  function updateTrackIds() {
    const allObjects = editor.dataManager.getFramesObject();
    const curTrack = editor.trackManager.getTrackObject(editor.state.currentTrack);
    const trackInfo: string[] = [];
    allObjects.forEach((obj) => {
      const userData = obj.userData;
      const valid =
        userData.trackId != curTrack?.trackId &&
        userData.annotationType == curTrack?.annotationType &&
        userData.sourceId == curTrack?.sourceId &&
        !trackInfo.includes(userData.trackId);
      if (valid) trackInfo.push(userData.trackId);
    });
    thisSta.list = trackInfo.map((trackId) => {
      const item = editor.trackManager.getTrackObject(trackId);
      const trackLabel = item.trackName
        ? `#${item.trackName} (${item.trackId})`
        : `(${item.trackId})`;
      return {
        ...item,
        label: trackLabel,
        value: trackLabel,
      };
    });
  }
  function onMergeChange(value: string, item: IOption) {
    thisSta.mergeTrack = item;
    toPreMerge();
  }
  function toPreMerge() {
    if (thisSta.mergeTrack.trackId && thisSta.type) {
      const data = {
        action: 'preMerge',
        type: thisSta.type,
        trackId: thisSta.mergeTrack.trackId || '',
        trackName: thisSta.mergeTrack.trackName || '',
      };
      editor.emit(Event.TRACK_MERGE, data);
    }
  }
  function onSure() {
    const data = { action: 'merge', type: thisSta.type };
    editor.emit(Event.TRACK_MERGE, data);
    editState.reset && editState.reset();
    onCancel();
  }
  function onCancel() {
    thisSta.type = '';
    thisSta.value = '';
    thisSta.mergeTrack = {} as IOption;
    thisSta.showConfirm = false;
    const data = { action: 'cancel' };
    editor.emit(Event.TRACK_MERGE, data);
  }
</script>

<style lang="less" scoped>
  .btns {
    button {
      padding: 2px 10px;
      border: 1px solid @primary-color;
      border-radius: 0;
      background: none;
      color: @primary-color;

      &:hover {
        border-color: @primary-color;
        color: @primary-color;
        cursor: pointer;
      }
    }

    .active {
      background-color: @primary-color;
      color: #ffffff !important;
    }
  }

  .confirm-info {
    display: flex;
    padding: 5px 10px;
    border: 1px solid #3a3a3a;
    width: 100%;
    text-align: left;
    flex-direction: column;
    gap: 10px;

    &-btns {
      margin: 5px 0;
      text-align: right;
    }
  }
</style>
