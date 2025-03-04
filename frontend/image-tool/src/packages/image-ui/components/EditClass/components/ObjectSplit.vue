<template>
  <div class="advance-item item-flex">
    <div>{{ t('image.split') }}</div>
    <div class="btns">
      <button :class="{ active: thisSta.showConfirm }" @click="onSplit()">
        {{ t('image.Split from Current Frame') }}
      </button>
    </div>
    <div v-show="thisSta.showConfirm" class="confirm-info">
      <div> {{ t('image.New Tracking Object') }} </div>
      <a-input
        size="small"
        style="width: 250px; line-height: 24px; font-size: 12px"
        disabled
        :value="thisSta.trackId"
        placeholder=""
      />
      <!-- <div class="item-info"> {{ thisSta.trackId }} </div> -->
      <div> {{ t('image.class') }} </div>
      <a-select
        size="small"
        v-model:value="thisSta.classVal"
        :options="thisSta.classList"
        style="width: 250px"
        class="confirm-info-select"
      >
      </a-select>
      <div class="confirm-info-btns">
        <a-button style="margin-right: 10px" @click="onCancel">
          {{ t('image.cancel') }}
        </a-button>
        <a-button type="primary" danger @click="onSure" :disabled="!thisSta.classVal">
          {{ t('image.confirm') }}
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, watch } from 'vue';
  import { IClassType, utils, Event, ToolType, IClassTypeItem } from '../../../../image-editor';
  import { useInjectEditor } from '../../../context';
  import { useInject } from '../context';
  import { t } from '@/lang';

  interface IClassSelect extends IClassType {
    label: string;
    value: string;
  }

  const editor = useInjectEditor();
  const editState = useInject();
  const thisSta = reactive({
    showConfirm: false,
    trackId: '',
    classVal: '',
    classList: [] as IClassSelect[],
  });
  watch(
    () => editor.state.config.showClassView,
    () => {
      if (editor.state.config.showClassView) {
        onCancel();
      }
    },
  );

  function onSplit() {
    if (thisSta.showConfirm) {
      onCancel();
      return;
    }
    thisSta.showConfirm = true;
    thisSta.classVal = '';
    if (!thisSta.trackId) thisSta.trackId = utils.createTrackId();
    const classType = editor.getClassType(editState.classId);
    if (!classType) return;
    thisSta.classList = getSplitClasses();
    const data = {
      action: 'preSplit',
      trackId: thisSta.trackId,
    };
    editor.emit(Event.TRACK_SPLIT, data);
  }
  function getSplitClasses(): IClassSelect[] {
    const classType = editor.getClassType(editState.classId);
    if (!classType) return [];
    const type = classType.toolType;
    if (type === ToolType.SKELETON)
      return [{ ...classType, value: classType.id, label: classType.name }];
    let classList = editor.getClassList(classType.toolType);
    const polygonPoint = classType.getToolOptions().polygonPoint || 0;
    if (type === ToolType.POLYGON || type === ToolType.POLYGON_PLUS) {
      classList = classList.filter(
        (e: IClassTypeItem) => (e.getToolOptions().polygonPoint || 0) === polygonPoint,
      );
    }
    const list = classList.map((e) => {
      return { ...e, value: e.id, label: editor.showNameOrAlias(e, true) };
    });
    return list;
  }
  function onSure() {
    const data = {
      action: 'split',
      trackId: thisSta.trackId,
      classId: thisSta.classVal,
    };
    editor.emit(Event.TRACK_SPLIT, data);
    thisSta.trackId = '';
    editState.reset && editState.reset();
    onCancel();
  }
  function onCancel() {
    thisSta.showConfirm = false;
    thisSta.classVal = '';
    const data = { action: 'cancel' };
    editor.emit(Event.TRACK_SPLIT, data);
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

    &-trackid {
      padding: 2px 5px;
      width: 290px;
      background-color: #4a5162;
    }

    &-btns {
      margin: 5px 0;
      text-align: right;
    }

    .ant-select-selector {
      border-color: #4a5162 !important;
    }
  }
</style>
