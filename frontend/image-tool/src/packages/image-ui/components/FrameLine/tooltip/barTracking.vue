<template>
  <div>
    <a-button type="primary" @click="onTrack" size="small">{{
      t('image.objectTracking')
    }}</a-button>
    <a-tooltip trigger="click" placement="top">
      <template #title>
        <div class="frame-setting" style="padding-bottom: 10px; width: 280px">
          <div class="title border-bottom">{{ t('image.settingTrack') }}</div>
          <div class="wrap" v-if="!state._config.noModelTrack">
            <div class="title2">
              <label> {{ t('image.method') }}: </label>
              <a-select
                style="width: 100%; font-size: 12px; flex: 1"
                :getPopupContainer="(node:HTMLElement) => node.parentNode"
                v-model:value="iState.trackMethod"
                @change="onMethodChange"
                :options="methods"
              ></a-select>
            </div>
          </div>
          <div class="wrap">
            <div class="title2">
              <label> {{ t('image.object') }}: </label>
              <a-select
                style="width: 100%; font-size: 12px; flex: 1"
                :getPopupContainer="(node:HTMLElement) => node.parentNode"
                v-model:value="iState.trackObject"
                :options="objects"
              ></a-select>
            </div>
          </div>
          <div class="wrap">
            <div class="title2">
              <label> {{ t('image.direction') }}: </label>
              <a-radio-group
                style="display: flex; width: 100%; flex: 1; font-size: 12px"
                v-model:value="config.trackDirection"
              >
                <template v-for="item in directions" :key="item.value">
                  <a-radio-button
                    v-if="item.visible()"
                    style="padding: 0; font-size: 12px; flex: 1; text-align: center"
                    :value="item.value"
                    >{{ item.label }}</a-radio-button
                  >
                </template>
              </a-radio-group>
            </div>
          </div>
          <template v-if="config.trackDirection == TrackDirEnum.CUSTOM">
            <!-- 帧范围 -->
            <div class="wrap">
              <div class="title2">
                <label> {{ t('common.labelFrameRange') }}: </label>
                <a-input-number
                  v-model:value="iState.trackFrameRange[0]"
                  style="flex: 1"
                  @blur="() => onBlur(0)"
                  :min="1"
                  :max="
                    iState.trackFrameRange[1]
                      ? iState.trackFrameRange[1] - 1
                      : editor.state.frames.length
                  "
                  :step="1"
                ></a-input-number>
                <span style="padding: 0 4px">{{ t('common.labelRangeTo') }}</span>
                <a-input-number
                  v-model:value="iState.trackFrameRange[1]"
                  style="flex: 1"
                  @blur="() => onBlur(1)"
                  :min="
                    Math.max(Math.min(iState.trackFrameRange[0] + 1, editor.state.frames.length), 1)
                  "
                  :max="editor.state.frames.length"
                  :step="1"
                ></a-input-number>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="wrap">
              <div class="title2">
                <label> {{ t('image.frameNumber') }}: </label>
                <a-input-number
                  v-model:value="iState.trackFrameNumber"
                  style="width: 100%; flex: 1"
                  @blur="onBlur"
                  :min="1"
                  :max="30"
                  :step="1"
                ></a-input-number>
              </div>
            </div>
          </template>
          <div class="wrap">
            <div class="title2">
              <a-checkbox-group v-model:value="editor.state.config.trackStrategy" size="small">
                <a-checkbox style="font-size: 12px" :value="Const.True_Value">
                  {{ t('common.msgOverwriteGroundTruth') }}
                </a-checkbox>
                <br />
                <a-checkbox style="font-size: 12px" :value="Const.Predicted">
                  {{ t('common.msgOverwritePrediction') }}
                </a-checkbox>
              </a-checkbox-group>
            </div>
          </div>
        </div>
      </template>
      <a-button type="default">
        <template #icon>
          <SettingOutlined />
        </template>
      </a-button>
    </a-tooltip>
  </div>
</template>
<script lang="ts" setup>
  import { IBottomState } from '../useBottom';
  import { useInjectEditor } from '../../../context';
  import { SettingOutlined } from '@ant-design/icons-vue';
  import { reactive, computed, watch } from 'vue';
  import { Const, ModelTypeEnum, TrackDirEnum } from '../../../../image-editor';
  import { t } from '@/lang';

  defineProps<{ state: IBottomState }>();
  enum Method {
    Copy = 'copy',
  }
  type TrackState = {
    trackFrameNumber: number;
    trackFrameRange: number[];
    trackObject: 'all' | 'select';
    trackMethod: string;
  };
  const editor = useInjectEditor();
  const config = editor.state.config;
  const iState = reactive<TrackState>({
    trackFrameNumber: 1,
    trackFrameRange: [1, 2],
    trackObject: 'all',
    trackMethod: Method.Copy,
  });

  const methods = computed(() => {
    const models = editor.getModelsByType(ModelTypeEnum.OBJECT_TRACKING);
    const list: { value: any; label: string }[] = [
      { value: Method.Copy, label: t('image.method_copy') },
    ];
    models.forEach((model) => {
      list.push({ value: model.id, label: model.name });
    });
    return list;
  });
  const objects = computed(() => {
    return [
      { value: 'all', label: t('image.allObjects') },
      { value: 'select', label: t('image.selectObjects') },
    ];
  });
  const directions = computed(() => {
    return [
      {
        value: TrackDirEnum.BACKWARD,
        label: t('image.left'),
        visible() {
          return true;
        },
      },
      {
        value: TrackDirEnum.FORWARD,
        label: t('image.right'),
        visible() {
          return true;
        },
      },
      {
        value: TrackDirEnum.CUSTOM,
        label: t('common.labelCustom'),
        visible() {
          const validMethod: string[] = [Method.Copy];
          return validMethod.includes(iState.trackMethod);
        },
      },
    ];
  });
  watch(
    () => config.trackDirection,
    () => {
      editor.dataResource.store.set({ trackDirection: config.trackDirection });
    },
  );
  function onBlur(index?: number) {
    if (!iState.trackFrameNumber) iState.trackFrameNumber = 1;
    const range = iState.trackFrameRange;
    if (typeof index == 'number') {
      if (!range[index] && range.every((r) => !r)) {
        range[index] = index + 1;
      }
    }
  }
  function onMethodChange() {
    const validMethod: string[] = [Method.Copy];
    if (!validMethod.includes(iState.trackMethod)) {
      config.trackDirection = TrackDirEnum.FORWARD;
    }
  }
  function onTrack() {
    let frameN: number | number[] = iState.trackFrameNumber;
    if (config.trackDirection == TrackDirEnum.CUSTOM && iState.trackMethod == Method.Copy) {
      frameN = iState.trackFrameRange.map((n) => n - 1);
    }
    editor.dataManager.track({
      method: iState.trackMethod as any,
      object: iState.trackObject,
      direction: config.trackDirection,
      frameN: frameN,
      strategy: editor.state.config.trackStrategy,
    });
  }
</script>
