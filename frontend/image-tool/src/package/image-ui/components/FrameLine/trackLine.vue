<template>
  <div class="i-lineheight">
    <div
      @mousemove="(e) => onHandleEvent(e, true)"
      @mouseleave="(e) => onHandleEvent(e, false)"
      @click.stop="onCurTrackClick"
      @contextmenu.prevent.stop="onContextMenu"
      style="display: inline-block; height: 100%"
    >
      <div
        v-for="(item, index) in trackList"
        :key="index"
        :class="{
          'i-tool-frame': true,
          'truth-value': showStatus && isTrueValue(item),
          'no-truth-value': showStatus && isNoTrueValue(item),
        }"
        :style="{ width: spanWidth + 'px' }"
      >
        <span :class="['i-tool-span', _status_color(item)]" :style="_style_track(item, index)">
          <template v-if="showStatus">
            <div class="status-context miss" v-if="isMiss(item)"></div>
            <div class="status-context invalid" v-if="invalid(item, index)"></div>
            <div class="status-context frame-invalid" v-if="frameDataInvalid(index)"></div>
            <div class="icon-context">
              <i
                v-if="marked(index)"
                style="display: inline-block"
                class="comment iconfont icon-pizhu"
              ></i>
            </div>
          </template>
        </span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { CSSProperties, reactive } from 'vue';

  import { IUserData, Const } from '../../../image-editor';
  import { useInjectEditor } from '../../context';
  import { IMsgOption } from './useBottom';

  const editor = useInjectEditor();
  const errorColor = '#ff3653';

  const props = defineProps<{
    trackList: IUserData[];
    annotates?: boolean[];
    colorMap: {};
    spanWidth: number;
    msgEvent?: boolean;
    click?: boolean;
    showStatus?: boolean;
    primary?: boolean;
    msgTip?: (option: IMsgOption) => void;
    errIndex?: number[];
    activeType?: {
      classType: any;
      modelClass: any;
    };
  }>();
  enum IMsgStatus {
    MSG,
    Menu,
  }
  const iState = reactive({
    msgStatus: IMsgStatus.MSG,
    msgVisible: false,
    menuIndex: -1,
  });
  const isError = (index: number) => {
    return (props.errIndex || []).indexOf(index) !== -1;
  };
  const isTrueValue = (item?: IUserData) => {
    return item?.resultStatus === Const.True_Value;
  };
  const isNoTrueValue = (item?: IUserData) => {
    return item?.resultStatus && item.resultStatus !== Const.True_Value;
  };

  const _status_color = (userData: IUserData) => {
    if (userData?.classType) {
      return props.primary ? 'primary-color' : 'default-color';
    } else if (userData) {
      return 'no-class-color';
    } else {
      return 'empty-color';
    }
  };
  const _style_track = (userData: IUserData, index: number) => {
    const style: CSSProperties = {};
    if (isError(index)) {
      style.backgroundColor = errorColor;
    }
    if (index === iState.menuIndex || (iState.menuIndex < 0 && isActive(userData))) {
      style.top = '4px';
      style.bottom = '1px';
    }
    return style;
  };

  function isActive(userData: IUserData) {
    if (!userData || !props.activeType) return;
    if (!props.activeType?.classType) {
      return userData.classType === props.activeType?.classType;
    } else {
      return !userData.classType && userData.modelClass === props.activeType?.modelClass;
    }
  }
  function getFrameIndexByEvent(event: MouseEvent): number {
    const frameIndex = Math.ceil((event.offsetX + 0.001) / props.spanWidth);
    return frameIndex;
  }
  function onHandleEvent(event: MouseEvent, visible: boolean) {
    if (!props.msgTip) {
      return;
    }
    if (iState.msgStatus === IMsgStatus.Menu) return;
    const frameIndex = getFrameIndexByEvent(event);
    const userData: IUserData = props.trackList[frameIndex - 1];
    let msgVisible = false;
    const msg = [];
    if (visible) {
      if (invalid(userData, frameIndex - 1)) {
        msg.push({ msg: editor.lang('invalid'), class: 'invalid' });
        msgVisible = true;
      }
      if (userData && userData.invisibleFlag) {
        msg.push({
          msg: editor.lang('invisible'),
          class: 'invisible',
        });
        msgVisible = true;
      }
      if (marked(frameIndex - 1)) {
        msg.push({ msg: editor.lang('mark'), class: 'primary-font' });
        msgVisible = true;
      }
      iState.menuIndex = frameIndex - 1;
    } else {
      iState.menuIndex = -1;
    }
    showMsg(event, msgVisible, msg);
  }
  function showMsg(event: MouseEvent, visible: boolean, msg: { msg: string; class: string }[]) {
    if (!props.msgTip) return;
    const { offsetX, offsetY, clientX, clientY, pageY } = event;
    const { innerHeight, innerWidth } = window;

    props.msgTip({
      target: {
        x: clientX,
        y: innerHeight - clientY + offsetY,
      },
      data: {
        msg: msg,
      },
      visible: visible,
    });
  }
  function isMiss(item: IUserData) {
    return item?.invisibleFlag === true;
  }
  function invalid(item: IUserData, index: number) {
    // return true;
    if (editor.state.currentTrack) {
      const classLimitInvalid = !!item?.limitState; // class限制
      return classLimitInvalid;
    } else {
      return editor.state.frames[index]?.invalid;
    }
  }
  const frameDataInvalid = (index: number) => {
    const frame = editor.state.frames[index];
    if (!frame) return false;
    return frame.validStatus === 'INVALID';
  };
  function marked(index: number) {
    return props.annotates && props.annotates[index];
  }
  function onCurTrackClick(event: MouseEvent) {
    if (props.click !== true) return;
    const beforeIndex = editor.state.frameIndex;
    let index = getFrameIndexByEvent(event);
    // emit('frameIndexChange', frameIndex);
    const total = editor.state.frames.length;
    if (index > total) {
      index = total;
    }
    editor.loadFrame(index - 1);
    // editor.reportManager.reportChangeFrame('Time Line', beforeIndex);
  }

  function onContextMenu(event: MouseEvent) {
    const frameIndex = getFrameIndexByEvent(event);
    const userData: IUserData = props.trackList[frameIndex - 1];
    if (props.msgEvent === false || !userData) {
      return;
    }
    iState.msgStatus = IMsgStatus.Menu;
    iState.menuIndex = frameIndex - 1;
  }
</script>
<style lang="less">
  .i-lineheight {
    .i-tool-frame {
      display: inline-block;
      position: relative;
      height: 100%;
      pointer-events: none;
      border-right: 1px solid #1e1f22;
      transform: translateZ(0);

      &.truth-value::after {
        position: absolute;
        right: 0;
        bottom: 1px;
        left: 0;
        border: 2px solid #72c240;
        z-index: 7;
        height: 1px;
        content: '';
        // bottom: -3px;
      }

      &.no-truth-value::after {
        position: absolute;
        inset: 6px 1px 2px;
        z-index: 5;
        background: linear-gradient(to right, transparent 50%, #727272 50%);
        background-size: 4px 100%;
        content: '';
        // background: repeating-linear-gradient(90deg, transparent, transparent, gray, gray, transparent, transparent 4px);
      }

      .i-tool-span {
        position: absolute;
        inset: 5px 0 1px;
        // top: 14px;
        overflow: hidden;
        font-size: 14px;
        text-align: center;
        color: rgb(255 169 0);

        &.default-color {
          background-color: #474b5b;
        }

        &.model-color {
          background-color: #ffffff;
        }

        &.no-class-color {
          background-color: grey;
        }

        &.empty-color {
          background-color: #303036;
        }

        &.primary-color {
          background-color: #60a9fe;
        }

        &.invalid {
          border: 1px solid #f8827b;
        }

        // padding-top: 40%;
        &.active {
          // box-shadow: 0 0 1px 1px #666666;
          // z-index: 5;
        }

        .status-context {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;

          &.frame-invalid {
            border: 1px solid red;
            z-index: 6;
            background-size: 100% 100%;
            background-image: url('/image/x.png');
          }

          &.miss {
            border: 2px dashed white;
          }

          &.invalid {
            border: 1px solid #f8827b;
          }
        }

        .icon-context {
          display: inline-block;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 7;
          width: 100%;
          height: 100%;
          line-height: 26px;
        }
      }
    }
  }
</style>
