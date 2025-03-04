import { reactive, onMounted, onBeforeUnmount, watch, ref } from 'vue';
import { Event as EditorEvent, IUserData, IValidity, ToolType, utils } from '../../../image-editor';
import * as THREE from 'three';
import { useInjectEditor } from '../../context';
import { t, tI } from '@/lang';
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

export type FrameStatus = {
  invalid: boolean;
  hasComment: boolean;
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
  showAnnotation: boolean;
  // 当前选中 track line
  trackTargetLine: ITrackObject;
  frameStatus: FrameStatus[];
  // 预览 数据
  trackList: ITrackObject[];
  trackSplitClass: string;
  trackSplitTrackId: string;
  trackMergeErrFrame: number[]; // 合并冲突帧
  trackPinSelected: string; //
  // 预合并 track line
  trackMergeResult: ITrackObject;
  trackAction: ITrackAction; // 操作行为
  // 用于 hover 事件
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
    frameStatus: [],
    showAnnotation: false,
    // trackPinList: [],
    trackSplitIndex: -1,
    trackSplitClass: '',
    trackSplitTrackId: '',
    trackTargetLine: { trackId: '', trackName: '', list: [] },
    trackMergeResult: { trackId: '', trackName: '', list: [] },
    // 合并冲突帧
    trackMergeErrFrame: [],
    // 操作行为
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
    editor.on(EditorEvent.TRACK_SPLIT, toSplit);
    editor.on(EditorEvent.TRACK_MERGE, toMerge);
    editor.on(EditorEvent.ANNOTATE_ADD, onUpdate);
    editor.on(EditorEvent.ANNOTATE_REMOVE, onUpdate);
    editor.on(EditorEvent.UPDATE_TIME_LINE, onUpdate);
    editor.playManager.on(EditorEvent.PLAY_STOP, onFrameStop);
    editor.cmdManager.addEventListener(EditorEvent.UNDO, onUpdate);
    editor.cmdManager.addEventListener(EditorEvent.REDO, onUpdate);
    editor.hotkeyManager.bindSeriesFrameEvent();
    if (zoomContainer.value) {
      const container = zoomContainer.value as HTMLElement;
      container.addEventListener('wheel', onMouseWheel);
    }
  });

  onBeforeUnmount(() => {
    editor.off(EditorEvent.CURRENT_TRACK_CHANGE, onSelect);
    editor.off(EditorEvent.TRACK_SPLIT, toSplit);
    editor.off(EditorEvent.TRACK_MERGE, toMerge);
    editor.off(EditorEvent.ANNOTATE_ADD, onUpdate);
    editor.off(EditorEvent.ANNOTATE_REMOVE, onUpdate);
    editor.off(EditorEvent.UPDATE_TIME_LINE, onUpdate);
    editor.playManager.off(EditorEvent.PLAY_STOP, onFrameStop);
    editor.cmdManager.removeEventListener(EditorEvent.UNDO, onUpdate);
    editor.cmdManager.removeEventListener(EditorEvent.REDO, onUpdate);
  });

  function onFrameStop() {
    iState.play = false;
    editor.loadFrame(editor.state.frameIndex, false, true);
  }

  // ------
  // 时间轴 缩放
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

  function onPreTrackAction(action: ITrackAction) {
    const trackTargetId = iState.trackTargetLine.trackId;
    const { frameIndex } = editor.state;
    if (!trackTargetId) {
      onClear();

      editor.showMsg('warning', t('image.selectObject'));

      return;
    }

    switch (action) {
      case 'PreSplit':
        iState.trackSplitIndex = frameIndex;
        onPreSplitData();
        break;
      case 'PreMergeTo':
      case 'PreMergeFrom':
        if (!iState.trackMergeResult.trackId) {
          onClear();
          // tool.editor.showMsg('warning', 'Please chose track object trackId');
        } else {
          onPreMergeData();
        }
        break;
      default:
        break;
    }
  }

  const onHandleTrackAction = debounce((action: ITrackAction) => {
    iState.trackAction = action;
    switch (action) {
      case 'Cancel':
        onClear();
        break;
      case 'PreSplit':
      case 'PreMergeFrom':
      case 'PreMergeTo':
        onPreTrackAction(action);
        break;
      case 'MergeTo':
      case 'MergeFrom':
        onMerge();
        break;
      case 'Split':
        onSplit();
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
      editor.showMsg('warning', t('image.warnNoObject'));
      return;
    }
    editor
      .showConfirm({
        title: t('image.btnDelete'),
        subTitle: t('image.deleteTitle'),
        okText: t('image.btnDelete'),
        cancelText: t('image.btnCancelText'),
        okDanger: true,
      })
      .then(
        () => {
          try {
            editor.trackManager.deleteObjectByTrack(trackTargetId, []);
            editor.selectObject();
            editor.showMsg('success', t('image.successDelete'));
            onClear();
          } catch (error) {
            editor.showMsg('error', t('image.errorDelete'));
          }
        },
        () => {},
      );
  }
  // 合并预览
  function onPreMergeData() {
    const trackIdMerge = iState.trackMergeResult.trackId;
    const trackName = iState.trackMergeResult.trackName;
    const trackId = iState.trackTargetLine.trackId;

    if (!trackId || !trackIdMerge) return;

    const trackList = [];

    // const frameCount = tool.state.dataList.length;

    const mergeTargetTrackList: IUserData[] = getTrackLine(trackIdMerge);

    trackList.push({
      trackName: trackName,
      trackId: trackIdMerge,
      list: mergeTargetTrackList,
    });

    iState.trackList = trackList;
  }
  // 拆分预览
  function onPreSplitData() {
    const { trackId, list, trackName, trackIcon } = iState.trackTargetLine;
    const dataIndex = iState.trackSplitIndex;
    if (!trackId || dataIndex < 0) return;
    const frameCount = list.length;
    if (!iState.trackSplitTrackId) {
      iState.trackSplitTrackId = utils.createTrackId();
    }
    const trackIdNew = iState.trackSplitTrackId;
    const trackListMap: ITrackObject[] = [];
    const beforeList = Array(frameCount);
    const afterList = Array(frameCount);
    const classType = iState.trackSplitClass;
    list.forEach((item, index) => {
      if (!item) return;
      if (index < dataIndex) {
        beforeList[index] = item;
      } else {
        afterList[index] = { ...item, classType: classType };
      }
    });
    trackListMap.push({
      trackName,
      trackId: trackId,
      list: beforeList,
      trackIcon,
    });

    trackListMap.push({
      trackName: '',
      trackId: trackIdNew,
      list: afterList,
      trackIcon,
    });

    iState.trackList = trackListMap;
  }
  function toMerge(data: { action: string; type: string; trackId: string; trackName: string }) {
    const act = data.action;
    if (act == 'cancel') {
      onHandleTrackAction('Cancel');
    } else if (act == 'preMerge') {
      const action: ITrackAction = data.type == 'to' ? 'PreMergeTo' : 'PreMergeFrom';
      iState.trackSplitTrackId = data.trackId;
      Object.assign(iState.trackMergeResult, {
        trackName: data.trackName,
        trackId: data.trackId,
      });
      onHandleTrackAction(action);
    } else if (act == 'merge') {
      iState.trackAction = data.type == 'to' ? 'MergeTo' : 'MergeFrom';
      onMerge();
    }
  }
  // 合并
  function onMerge() {
    const curTrackId = iState.trackTargetLine.trackId;
    const mergeTrackId = iState.trackMergeResult.trackId;
    const trackMergeCode = editor.trackManager.checkMerge(curTrackId, mergeTrackId);
    if (trackMergeCode !== 'merge_ok') {
      editor.showMsg('warning', tI(trackMergeCode));
      return;
    }
    try {
      switch (iState.trackAction) {
        case 'MergeFrom':
          editor.trackManager.mergeTrackObject(curTrackId, mergeTrackId);
          break;

        case 'MergeTo':
          editor.trackManager.mergeTrackObject(mergeTrackId, curTrackId);
          break;

        default:
          break;
      }
      editor.selectObject();
      editor.showMsg('success', t('image.successMerge'));
    } catch (error) {
      editor.showMsg('error', t('image.errorMerge'));
    }
  }
  function toSplit(data: { action: string; trackId: string; classId: string }) {
    const act = data.action;
    if (act == 'cancel') {
      onHandleTrackAction('Cancel');
    } else if (act == 'preSplit') {
      iState.trackSplitTrackId = data.trackId;
      onHandleTrackAction('PreSplit');
    } else if (act == 'split') {
      iState.trackSplitClass = data.classId;
      onSplit();
    }
  }
  // 拆分
  function onSplit() {
    const trackList = iState.trackList;
    const preList = trackList[0].list;
    const nextList = trackList[1].list;
    const preState = preList && Boolean(preList.find((e) => e));
    const nextState = nextList && Boolean(nextList.find((e) => e));
    const canSplit = preState && nextState;
    if (!canSplit) {
      editor.showMsg('warning', t('image.warnEmptyObject'));
      return;
    }
    const trackId = iState.trackTargetLine.trackId;
    const start = iState.trackSplitIndex;
    try {
      const splitTrackId = trackList[1].trackId;
      editor.trackManager.splitTrackObject({
        trackId: trackId,
        start: start,
        userData: {
          trackId: splitTrackId,
          classId: iState.trackSplitClass,
        },
      });
      onClear();
      updateTrackLine();
      // editor.dispatchEvent({ type: EditorEvent.CLEAR_MERGE_SPLIT });
      editor.showMsg('success', t('image.successSplit'));
    } catch (error) {
      editor.showMsg('error', t('image.errorSplit'));
    }
  }
  // 更新当前TrackLine
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
    } else {
      iState.trackTargetLine = emptyTrackObject();
    }
  }
  function updateFrameState() {
    iState.frameStatus = editor.state.frames.map((frame, i) => {
      const sourceData = editor.dataManager.getCurrentSourceData(frame);
      const objectId = iState.trackTargetLine.list[i]?.objectId;
      return {
        invalid: sourceData?.validity == IValidity.INVALID,
        hasComment: editor.checkTrackLineItem(i, objectId),
      };
    });
  }

  function getTrackLine(trackId: string) {
    const length = editor.state.frames.length;
    if (!trackId) return Array(length);
    const list = editor.trackManager.getAllFrameDataByTrack(trackId);
    return list.map((item) => {
      if (!item || item._deleted) return undefined;
      //   let trueValue = item.userData.resultStatus === Const.True_Value;
      return Object.assign({ objectId: item.uuid }, item.userData || {});
      //   return {
      //     ...item.userData,
      //     trueValue: trueValue,
      //   };
    });
  }

  // Object userData change Event
  const onUpdate = throttle((data: any) => {
    updateTrackLine(true);
    updateFrameState();
    // const trackIds = [
    //   ...iState.trackList.map((item) => item.trackId),
    //   iState.trackMergeResult.trackId,
    // ];
    // if (editor.currentTrack && trackIds.indexOf(editor.currentTrack) < 0) return;
    // const { trackAction } = iState;
    // switch (trackAction) {
    //     case 'PreMergeFrom':
    //     case 'PreMergeTo':
    //         updateMergeCodeMsg;
    //     case 'PreSplit':
    //         onPreTrackAction(trackAction);
    //         break;
    // }
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
    updateFrameState();
  }, 200);
  // 重置
  function onClear() {
    iState.trackAction = '';
    iState.trackMergeErrFrame = [];
    iState.trackMergeResult = emptyTrackObject();
    iState.trackList = [];
    iState.trackSplitClass = '';
    iState.trackSplitTrackId = '';
    // iState.trackMergeResultList = [];
    iState.trackSplitIndex = -1;
    iState.frameStatus = [];
  }

  function setConfig(config?: IConfig) {
    Object.assign(iState._config, config || {});
  }
  return {
    t,
    editor,
    iState,
    setConfig,
    zoomContainer,
    updateTrackLine,
    onHandleTrackAction,
  };
}
