import { reactive, onMounted, onBeforeUnmount, watch, ref } from 'vue';
import { Event as EditorEvent, IUserData, MsgType, ToolType, utils } from '../../../image-editor';
import PlayManager from 'image-editor/common/PlayManager';
import * as THREE from 'three';
import { useInjectEditor } from '../../context';
import { debounce, throttle } from 'lodash';

const COLOR = new THREE.Color();

export interface IConfig {
  noModelTrack?: boolean;
}

export type ITrackAction =
  | 'Split'
  | 'Delete'
  | 'MergeTo'
  | 'MergeFrom'
  | 'PreSplit'
  | 'PreMergeTo'
  | 'PreMergeFrom'
  | 'Cancel'
  | '';
export interface ITrackObject {
  trackId: string;
  trackName: string;
  trackIcon?: ToolType;
  list: IUserData[];
}
export type IMsgOption = {
  target: {
    x: number;
    y: number;
  };
  data: {
    msg: { class: string; msg: string }[];
  };
  visible: boolean;
};

export interface IBottomState {
  tip: (option: IMsgOption) => void;
  _config: IConfig;
  colorMap: {};
  // play
  playSpeed: number;
  playStart: number;
  play: boolean;
  animation: number;
  // trackFlag: boolean;
  trackSplitIndex: number;
  annotationStatus: boolean[];
  showAnnotation: boolean;
  trackTargetLine: ITrackObject;
  trackList: ITrackObject[];
  trackSplitClass: string;
  trackSplitTrackId: string;
  trackMergeErrFrame: number[];
  trackPinSelected: string;
  trackMergeResult: ITrackObject;
  trackAction: ITrackAction;
  activeType: {
    classType: any;
    modelClass: any;
  };
  frameConfig: {
    curFrameIndex: number;
    interval: number;
    spanWidth: number;
    // showProcess: boolean;
  };
}
export default function useBottom() {
  const editor = useInjectEditor();
  PlayManager.instance.init(editor);
  const zoomContainer = ref<HTMLElement>();

  const iState = reactive<IBottomState>({
    tip: async (option: IMsgOption) => {},
    _config: {},
    colorMap: {},
    playSpeed: 1,
    playStart: 0,
    play: false,
    animation: 1,
    // trackFlag: true,
    trackList: [],
    annotationStatus: [],
    showAnnotation: false,
    // trackPinList: [],
    trackSplitIndex: -1,
    trackSplitClass: '',
    trackSplitTrackId: '',
    trackTargetLine: { trackId: '', trackName: '', list: [] },
    trackMergeResult: { trackId: '', trackName: '', list: [] },
    trackMergeErrFrame: [],
    trackAction: '',
    trackPinSelected: '',
    activeType: {
      classType: undefined as any,
      modelClass: undefined as any,
    },
    frameConfig: {
      curFrameIndex: editor.state.frameIndex + 1,
      interval: 5, // default 5
      spanWidth: 18,
      // showProcess: false,
    },
  });
  watch(
    () => editor.state.classTypes,
    (classTypes) => {
      const colorMap = {} as any;
      classTypes.forEach((item) => {
        colorMap[item.name] = item.color;
        colorMap[`false_${item.name}`] = `#${COLOR.set(item.color).getHexString()}aa`;
      });
      iState.colorMap = colorMap;
    },
    { immediate: true },
  );

  watch(
    () => editor.state.frameIndex,
    () => {
      iState.frameConfig.curFrameIndex = editor.state.frameIndex + 1;
    },
  );
  watch(
    () => editor.state.frames,
    () => {
      if (iState.trackTargetLine.list.length !== editor.state.frames.length) {
        iState.trackTargetLine = emptyTrackObject();
      }
    },
    {
      immediate: true,
    },
  );

  onMounted(() => {
    editor.on(EditorEvent.CURRENT_TRACK_CHANGE, onSelect);
    editor.on(EditorEvent.ANNOTATE_ADD, onUpdate);
    PlayManager.instance.on(EditorEvent.PLAY_STOP, onFrameStop);
    // editor.cmdManager.addEventListener(EditorEvent.UNDO, onUpdate);
    // editor.cmdManager.addEventListener(EditorEvent.REDO, onUpdate);
    editor.hotkeyManager.bindSeriesFrameEvent();
    if (zoomContainer.value) {
      const container = zoomContainer.value as HTMLElement;
      container.addEventListener('wheel', onMouseWheel);
    }
  });

  onBeforeUnmount(() => {
    editor.off(EditorEvent.CURRENT_TRACK_CHANGE, onSelect);
    editor.off(EditorEvent.ANNOTATE_ADD, onUpdate);
    PlayManager.instance.off(EditorEvent.PLAY_STOP, onFrameStop);
    // editor.cmdManager.removeEventListener(EditorEvent.UNDO, onUpdate);
    // editor.cmdManager.removeEventListener(EditorEvent.REDO, onUpdate);
  });

  function updateAnnotationStatus() {}

  function onFrameStop() {
    iState.play = false;
    editor.loadFrame(editor.state.frameIndex, false, true);
  }

  // ------
  function onMouseWheel(event: WheelEvent) {
    // return;

    event.preventDefault();

    if (event.deltaY < 0) {
      if (++iState.frameConfig.spanWidth > 36) {
        iState.frameConfig.spanWidth = 36;
      }
    } else {
      if (--iState.frameConfig.spanWidth < 14) {
        iState.frameConfig.spanWidth = 14;
      }
    }

    iState.frameConfig.interval = iState.frameConfig.spanWidth < 18 ? 10 : 5;
  }

  const onHandleTrackAction = debounce((action: ITrackAction) => {
    iState.trackAction = action;
    switch (action) {
      case 'Cancel':
        onClear();
        break;
      case 'Delete':
        onDelete();
        break;
      default:
      case '':
        break;
    }
  }, 100);
  function onDelete() {
    const trackTargetId = iState.trackTargetLine.trackId;
    if (!trackTargetId) {
      editor.showMsg(MsgType.warning, editor.lang('warnNoObject'));
      return;
    }
    editor
      .showConfirm({
        title: editor.lang('btnDelete'),
        subTitle: editor.lang('deleteTitle'),
        okText: editor.lang('btnDelete'),
        cancelText: editor.lang('btnCancelText'),
        okDanger: true,
      })
      .then(
        () => {
          try {
            editor.trackManager.deleteObjectByTrack(trackTargetId, []);
            editor.selectObject();
            editor.showMsg(MsgType.success, editor.lang('successDelete'));
            onClear();
          } catch (error) {
            editor.showMsg(MsgType.error, editor.lang('errorDelete'));
          }
        },
        () => {},
      );
  }
  function updateTrackLine(force: boolean = false) {
    const trackId = editor.state.currentTrack;
    if (trackId && trackId === iState.trackTargetLine.trackId && !force) return;
    if (trackId) {
      const obj = editor.selection[0];
      Object.assign(iState.trackTargetLine, {
        trackId: trackId,
        trackName: obj?.userData.trackName || '',
        trackIcon: obj?.toolType,
      });
      iState.trackTargetLine.list = getTrackLine(trackId);
      console.log('==========>>>>>>>>>', iState.trackTargetLine);
    } else {
      iState.trackTargetLine = emptyTrackObject();
    }
  }

  function getTrackLine(trackId: string) {
    const length = editor.state.frames.length;
    if (!trackId) return Array(length);
    const list = editor.trackManager.getAllFrameDataByTrack(trackId);
    return list.map((item) => {
      if (!item) return undefined;
      //   let trueValue = item.userData.resultStatus === Const.True_Value;
      return item.userData;
      //   return {
      //     ...item.userData,
      //     trueValue: trueValue,
      //   };
    });
  }

  // Object userData change Event
  const onUpdate = throttle((data: any) => {
    updateTrackLine(true);
  }, 200);

  function emptyTrackObject(): ITrackObject {
    const length = editor.state.frames.length;
    return {
      trackId: '',
      trackName: '',
      trackIcon: undefined,
      list: Array(length),
    };
  }
  // object select event
  const onSelect = debounce(() => {
    onClear();
    updateTrackLine();
    updateAnnotationStatus();
  }, 200);
  function onClear() {
    iState.trackAction = '';
    iState.trackMergeErrFrame = [];
    iState.trackMergeResult = emptyTrackObject();
    iState.trackList = [];
    iState.trackSplitClass = '';
    iState.trackSplitTrackId = '';
    // iState.trackMergeResultList = [];
    iState.trackSplitIndex = -1;
  }

  function setConfig(config?: IConfig) {
    Object.assign(iState._config, config || {});
  }
  return {
    editor,
    iState,
    setConfig,
    zoomContainer,
    updateTrackLine,
    onHandleTrackAction,
  };
}
