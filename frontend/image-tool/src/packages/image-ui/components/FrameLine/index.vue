<template>
  <!-- 时间轴 -->
  <div ref="topContainerRef" class="editor-frame">
    <div class="editor-frame-head" v-show="visible">
      <ToolBar
        @updateTrackLine="updateTrackLine"
        :state="iState"
        @onTrackAction="onHandleTrackAction"
      />
    </div>
    <div ref="zoomContainer" v-show="visible" class="editor-frame-body">
      <div class="i-body-left">
        <div class="i-lineheight i-label tick-line-title">{{ t('image.timeLine') }}</div>
        <div class="i-lineheight i-label">
          <span style="font-size: 12px">
            <component :is="iState.trackTargetLine.trackIcon"></component>
          </span>
          <ToolIcon
            v-if="iState.trackTargetLine.trackIcon"
            :tool="iState.trackTargetLine.trackIcon"
            style="font-size: 12px"
          />
          <IconDataset v-else />
          <span class="i-title"> {{ getTitle(iState.trackTargetLine) }}</span>
        </div>
        <div v-show="iState.trackAction">
          <div v-if="iState.trackList.length > 0" class="i-lineheight i-label"></div>
          <div>
            <div class="i-lineheight i-label" v-for="item in iState.trackList" :key="item.trackId">
              <IconDataset class="icon" style="font-size: 12px" />
              <span class="i-title"> {{ getTitle(item) }}</span>
              <span class="new-badge" v-if="newBadge(item.trackId)">{{ t('image.newBadge') }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="i-body-right">
        <TickLine :frames="editor.state.frames" :config="iState.frameConfig" />
        <!-- 当前追终对象 -->
        <TrackLine
          style="height: 32px"
          :trackList="iState.trackTargetLine.list"
          :frameStatus="iState.frameStatus"
          :colorMap="iState.colorMap"
          :msg-event="false"
          :msg-tip="iState.tip"
          :click="true"
          :showStatus="true"
          :spanWidth="iState.frameConfig.spanWidth"
          :activeType="iState.activeType"
        />
        <!-- 操作提示 -->
        <div v-if="iState.trackAction && iState.trackList.length > 0">
          <div class="i-lineheight">
            <div class="i-lineheight i-label" style="position: fixed; padding-left: 60px">
              {{ ['PreMergeFrom', 'MergeFrom'].indexOf(iState.trackAction) >= 0 ? '↑↑↑' : '↓↓↓' }}
            </div>
          </div>
          <!-- 追踪对象列表 -->
          <div class="container-tracklist">
            <TrackLine
              v-for="item in iState.trackList"
              :key="item.trackId"
              :trackList="item.list"
              :primary="true"
              :colorMap="iState.colorMap"
              :spanWidth="iState.frameConfig.spanWidth"
              :activeType="iState.activeType"
            />
          </div>
        </div>
      </div>
      <div v-show="!canOperate() || iState.play" class="over-not-allowed"></div>
    </div>
    <contentMsg :state="iState" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch, provide } from 'vue';
  import { IconDataset } from '@basicai/icons';
  import useUI from '../../hook/useUI';
  import useBottom, { ITrackObject, IConfig } from './useBottom';
  import { useProvideFrame } from './frameContext';
  import ToolBar from './toolbar.vue';
  import TickLine from './tickLine.vue';
  import TrackLine from './trackLine.vue';
  import contentMsg from './tip/msg.vue';
  import { ToolIcon } from '../../../image-editor';
  import { t } from '@/lang';

  const { canOperate } = useUI();
  const { editor, updateTrackLine, iState, zoomContainer, setConfig, onHandleTrackAction } =
    useBottom();
  provide('localLang', t);
  const visible = ref(true);
  const props = defineProps<{
    config?: IConfig;
  }>();
  const topContainerRef = ref<HTMLElement>();
  watch(
    () => props.config,
    () => {
      setConfig(props.config);
    },
    {
      deep: true,
      immediate: true,
    },
  );
  function canSplit() {
    return ['PreSplit', 'Split'].indexOf(iState.trackAction) >= 0;
  }
  function getTitle(trackObject: ITrackObject) {
    const { trackId, trackName } = trackObject;
    if (trackId) return `#${trackName} (${trackId})`;
    else return t('image.selectObject');
  }
  function newBadge(trackId: string) {
    const selectTrackId = iState.trackTargetLine.trackId;
    return canSplit() && selectTrackId !== trackId;
  }
  useProvideFrame({
    editor,
    t,
    state: iState,
  });
</script>

<style lang="less">
  .editor-frame {
    display: flex;
    position: relative;
    margin-top: 4px;
    padding-left: 2px;
    width: 100%;
    height: 100%;
    background-color: #1e1f22;
    text-align: left;
    flex-direction: column;

    .toggle-handle {
      position: absolute;
      top: -18px;
      left: 50%;
      padding: 0 15px;
      text-align: center;
      color: #aaaaaa;
      transform: translateX(-50%);
      line-height: 18px;
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;

      &:hover {
        background: #2b2a2e;
      }
    }

    .i-lineheight {
      height: 32px;
      line-height: 32px;
      white-space: nowrap;

      .comment {
        display: block;
        margin-top: 2px;
        font-size: 12px;
        text-align: center;
        color: @primary-color;
        line-height: 1;
      }

      .miss-icon {
        display: block;
        padding-left: 1px;
        font-size: 12px;
      }

      .invalid-icon {
        display: block;
        margin-top: 2px;
        font-size: 12px;
        text-align: center;
        color: #ff5656;
        line-height: 1;
      }

      .i-title {
        padding-left: 8px;
        font-size: 12px;
      }

      .new-badge {
        display: block;
        padding-right: 4px;
        float: right;
        font-size: 12px;
        color: red;
      }
    }

    .i-label {
      padding-left: 8px;
      overflow: hidden;
    }

    &-body {
      flex: 1;
      display: flex;
      position: relative;
      flex-direction: row;

      .i-body-left {
        width: 200px;

        .tick-line-title {
          height: 36px;
          line-height: 36px;
          background-color: #23262e;
          box-shadow: inset 0 -1px 0 #43454b;
        }
      }

      .i-body-right {
        &::-webkit-scrollbar-thumb {
          border-radius: 10px;
          background: #818181;
        }

        &::-webkit-scrollbar {
          // display: none;
          position: absolute;
          height: 6px;
        }

        position: relative;
        overflow: auto hidden;
        width: 0;
        text-align: left;
        flex: 1;
        // }
      }
    }
  }
</style>
