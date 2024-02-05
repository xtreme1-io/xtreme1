<template>
  <div class="i-toolbar-container">
    <div class="bar-left">
      <span style="display: inline-block; padding-right: 10px; min-width: 60px">
        {{ editor.lang('autoLoad') }}</span
      >
      <a-tooltip placement="top">
        <template #title>{{ editor.lang('autoLoad') }}</template>
        <span @keydown.capture="(e) => e.stopPropagation()">
          <a-switch
            :checked="config.autoLoad"
            @change="onAutoLoadHandle"
            style="margin-right: 10px"
          />
        </span>
      </a-tooltip>
      <div v-show="disable" class="over-not-allowed"></div>
    </div>
    <div class="bar-center">
      <div style="display: flex; justify-content: center; width: 100%; text-align: center">
        <!-- CopyBackward -->
        <a-tooltip v-if="showCopy()" placement="top">
          <template #title>{{ editor.lang('copyLeft1') }}</template>
          <a-button
            v-show="!isCheck()"
            :disabled="disable"
            @click="() => onAction('CopyBackward')"
            style="width: 40px"
          >
            <template #icon>
              <div>
                <StepBackwardOutlined />
                <CopyOutlined
                  style="margin-left: -4px; font-size: 14px; transform: rotateY(180deg)"
                />
              </div>
            </template>
          </a-button>
        </a-tooltip>
        <!-- speedDown -->
        <a-tooltip placement="top">
          <template #title>{{
            editor.lang('speedDown', {
              n: state.playSpeed,
            })
          }}</template>
          <a-button :disabled="!canOperate()" v-show="!isCheck()" @click="onChangeSpeed(-1)">
            <template #icon>
              <i class="iconfont icon-backup" />
            </template>
          </a-button>
        </a-tooltip>
        <!-- replay -->
        <a-tooltip placement="top">
          <template #title>{{ editor.lang('replay') }}</template>
          <a-button :disabled="!canOperate()" v-show="!isCheck()" @click="() => onAction('Replay')">
            <template #icon>
              <i class="iconfont icon-replay" />
            </template>
          </a-button>
        </a-tooltip>
        <!-- last frame -->
        <a-tooltip placement="top">
          <template #title>{{ editor.lang('pre') }}</template>
          <a-button :disabled="isPreDisabled" @click="() => onAction('PreFrame')" type="default">
            <template #icon>
              <i class="iconfont icon-toleft" />
            </template>
          </a-button>
        </a-tooltip>
        <a-input-number
          style="width: 80px"
          :disabled="disable"
          v-model:value="iState.frameIndex"
          :precision="0"
          @blur="() => changeFrameIndex()"
          @pressEnter="() => changeFrameIndex()"
          :min="1"
          :max="total"
          size="small"
        />
        <span class="i-span">/ {{ total }}</span>
        <!-- next frame -->
        <a-tooltip placement="top">
          <template #title>{{ editor.lang('next') }}</template>
          <a-button :disabled="isNextDisabled" @click="() => onAction('NextFrame')" type="default">
            <template #icon>
              <i class="iconfont icon-toright" />
            </template>
          </a-button>
        </a-tooltip>
        <!-- play -->
        <a-tooltip placement="top">
          <template #title>{{
            state.play ? editor.lang('pause') : editor.lang('play', { n: state.playSpeed })
          }}</template>
          <a-button
            v-show="!isCheck()"
            :disabled="!canOperate()"
            @click="() => onAction(state.play ? 'Stop' : 'Play')"
            type="default"
          >
            <template #icon>
              <i class="iconfont icon-Frame23" v-if="state.play" />
              <i class="iconfont icon-play" v-else />
            </template>
          </a-button>
        </a-tooltip>
        <!-- speedUp -->
        <a-tooltip placement="top">
          <template #title>{{ editor.lang('speedUp', { n: state.playSpeed }) }}</template>
          <a-button :disabled="!canOperate()" v-show="!isCheck()" @click="onChangeSpeed(1)">
            <template #icon>
              <i class="iconfont icon-forward" />
            </template>
          </a-button>
        </a-tooltip>
        <!-- CopyForward -->
        <a-tooltip v-if="showCopy()" placement="top">
          <template #title>{{ editor.lang('copyRight1') }}</template>
          <a-button
            v-show="!isCheck()"
            :disabled="disable"
            @click="() => onAction('CopyForward')"
            style="width: 40px"
          >
            <template #icon>
              <div>
                <CopyOutlined style="margin-right: -4px; font-size: 14px" />
                <StepForwardOutlined />
              </div>
            </template>
          </a-button>
        </a-tooltip>
      </div>
    </div>
    <div class="bar-right" v-show="!isCheck()" v-if="canEdit()">
      <a-tooltip placement="top">
        <template #title>{{ editor.lang('delete') }}</template>
        <a-button @click="() => onTrackAction('Delete')">
          <template #icon>
            <i class="iconfont icon-delete" />
          </template>
        </a-button>
      </a-tooltip>
      <div v-show="disable" class="over-not-allowed"></div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { debounce } from 'lodash';
  import { computed, watch, reactive } from 'vue';
  import { useInjectEditor } from '../../context';
  import useUI from '../../hook/useUI';
  import { ITrackAction, IBottomState } from './useBottom';
  import { StepForwardOutlined, StepBackwardOutlined, CopyOutlined } from '@ant-design/icons-vue';
  import { useInjectFrame } from './frameContext';
  import { Event, MsgType } from '../../../image-editor';
  import PlayManager from 'image-editor/common/PlayManager';

  const props = defineProps<{
    state: IBottomState;
  }>();
  const { canEdit, isCheck, canOperate, showCopy } = useUI();
  const frameState = useInjectFrame();
  const editor = useInjectEditor();
  const config = editor.state.config;
  const iState = reactive({
    // autoLoad: false,
    frameIndex: editor.state.frameIndex + 1,
  });
  const emit = defineEmits(['onTrackAction', 'updateTrackLine']);

  watch(
    () => editor.state.frameIndex,
    () => {
      if (iState.frameIndex !== editor.state.frameIndex + 1)
        iState.frameIndex = editor.state.frameIndex + 1;
    },
    { immediate: true },
  );

  const isPreDisabled = computed(() => {
    return iState.frameIndex <= 1 || disable.value;
  });
  const isNextDisabled = computed(() => {
    return iState.frameIndex >= editor.state.frames.length || disable.value;
  });
  const total = computed(() => {
    return editor.state.frames.length;
  });

  type IBarAction =
    | 'AutoLoad'
    | 'CopyForward'
    | 'CopyBackward'
    | 'Replay'
    | 'PreFrame'
    | 'NextFrame'
    | 'Play'
    | 'Stop';

  function onChangeSpeed(dir: 1 | -1) {
    const scale = dir === 1 ? 2 : 0.5;
    frameState.state.playSpeed *= scale;
    frameState.state.playSpeed = Math.max(0.5, Math.min(4, props.state.playSpeed));
    PlayManager.instance.interval = Math.round(300 / props.state.playSpeed);
  }
  function onTrackAction(action: ITrackAction) {
    emit('onTrackAction', action);
  }
  function onAutoLoadHandle(val: boolean) {
    config.autoLoad = val;
    onAction('AutoLoad');
  }
  function onAction(action: IBarAction) {
    switch (action) {
      case 'AutoLoad':
        const mode: any = config.autoLoad ? 'all' : 'near';
        editor.dataResource.setLoadMode(mode);
        break;
      case 'CopyForward':
        editor.dataManager.copyForward();
        break;

      case 'CopyBackward':
        editor.dataManager.copyBackWard();
        break;
      case 'Replay':
        rePlay();
        editor.emit(Event.FRAME_REPLAY, editor.state.frameIndex);
        break;
      case 'PreFrame':
        iState.frameIndex--;
        changeFrameIndex();

        break;
      case 'NextFrame':
        iState.frameIndex++;
        changeFrameIndex();
        break;
      case 'Play':
        play();
        editor.emit(Event.FRAME_PLAY, editor.state.frameIndex);
        break;
      case 'Stop':
        PlayManager.instance.stop();
        editor.emit(Event.FRAME_PAUSE, editor.state.frameIndex);
        break;
    }
  }

  async function rePlay() {
    if (PlayManager.instance.playing) {
      PlayManager.instance.stop();
    }
    await editor.loadFrame(props.state.playStart, false);
    play();
  }

  function play() {
    const { frames, frameIndex } = editor.state;
    const nextData = frames[frameIndex + 1];
    if (!nextData || nextData.loadState !== 'complete') {
      editor.showMsg(MsgType.warning, editor.lang('noPlayData'));
      return;
    }

    frameState.state.play = true;
    frameState.state.playStart = frameIndex;
    PlayManager.instance.play();
  }

  const changeFrameIndex = debounce(() => {
    const { frames } = editor.state;
    if (!iState.frameIndex) iState.frameIndex = 1;
    iState.frameIndex = Math.max(1, Math.min(frames.length, iState.frameIndex));
    editor.switchFrame(iState.frameIndex - 1);
  }, 300);

  const disable = computed(() => {
    return !canOperate() || props.state.play;
  });
</script>
<style lang="less">
  .i-toolbar-container {
    display: flex;
    position: relative;
    align-items: center;
    overflow-x: auto;
    overflow-y: hidden;
    height: 32px;
    background-color: #1e1f22;
    white-space: nowrap;
    flex-direction: row;

    .annotation {
      font-size: 14px;
    }

    .bar-left {
      display: flex;
      position: relative;
      align-items: center;
      height: 100%;
    }

    .bar-right {
      display: flex;
      position: relative;
      align-items: center;
      height: 100%;
    }

    .bar-center {
      display: flex;
      position: relative;
      align-items: center;
      height: 100%;
      flex: 1;
    }

    &::-webkit-scrollbar {
      // display: none;
      position: absolute;
      height: 2px;
    }

    .i-margin-right {
      margin-right: 1px;
    }

    .ant-input-number-input-wrap {
      line-height: 32px;
    }

    .ant-input-number-handler-wrap {
      display: none;
    }

    .ant-input-number {
      margin-left: 2px;
    }

    .ant-input-number-input {
      background-color: white;
      text-align: center;
      color: black;
    }

    .empty-space {
      display: inline-block;
      width: 80px;
      height: 20px;
    }

    .divide-line {
      display: inline-block;
      margin: 0 10px;
      width: 1px;
      height: 20px;
      border-left: 1px solid white;
    }

    .ant-btn {
      border: none;
    }

    .i-span {
      display: inline-block;
      user-select: none;
      margin: 0 4px;
      line-height: 32px;
    }

    .item {
      display: inline-block;
      margin-left: 10px;
      cursor: pointer;

      &.icon {
        margin-right: 5px;
        margin-left: 8px;
      }
    }
  }

  .frame-setting {
    width: 220px;

    .wrap {
      margin-top: 10px;
      padding-right: 4px;
      padding-left: 6px;
    }

    .title {
      font-size: 14px;
      text-align: center;
      line-height: 32px;
    }

    .title1 {
      font-size: 12px;
      text-align: left;
      // padding-bottom: 8px;
      line-height: 32px;
    }

    .title2 {
      display: flex;
      font-size: 12px;
      color: white;
      line-height: 32px;

      .ant-input-number-input {
        text-align: center;
      }

      > label {
        display: inline-block;
        padding: 0 8px 0 0;
        min-width: 70px;
        text-align: left;
        line-height: 32px;
      }
    }
  }
</style>
