import { __UNSERIES__ } from '.';
import { modes } from './configs';
import {
  AnnotateModeEnum,
  DisplayModeEnum,
  IConfig,
  IState,
  IToolConfig,
  LangType,
  LineDrawMode,
  StatusType,
  ToolName,
} from './types';

function getDefaultConfig(): IConfig {
  return {
    autoLoad: false,
    baseFillOpacity: 0.2,
    baseLineWidth: 0,
    bisectrixLine: {
      enable: false,
      vertical: 2,
      horizontal: 2,
      width: 1,
      color: '#b3e08fb3',
    },
    brightness: 0,
    contrast: 0,
    helperLine: {
      showLine: false,
      lineColor: '#ffffff',
    },
    imageSmoothing: true,
    showAttrs: false,
    showSize: false,
    showClassTitle: true,
    showClassView: false,
    showSizeTips: true,
    strokeWidth: 1,
    viewType: DisplayModeEnum.MARK,
  };
}
function getDefaultToolConfig(): IToolConfig {
  return {
    lineMode: LineDrawMode.default,
    polyAuto: false,
    polyAutoTm: 100,
  };
}

export function getDefaultState(): IState {
  return {
    activeTool: ToolName.default,
    annotateMode: AnnotateModeEnum.INSTANCE,
    annotateModeList: [AnnotateModeEnum.INSTANCE],
    blocked: false,
    classTypes: [],
    config: getDefaultConfig(),
    currentClass: '',
    currentTrack: '',
    defaultSourceId: '-1',
    editorMuted: false,
    editorMutedMsg: '',
    editorMessage: { visible: false },
    frameIndex: 0,
    frames: [],
    modeConfig: modes.empty,
    models: [],
    modelConfig: {
      confidence: [0.5, 1],
      predict: true,
      classes: {},
      model: '',
      loading: false,
      code: '',
    },
    isSeriesFrame: false,
    lang: LangType['en-US'],
    sceneId: __UNSERIES__,
    sceneIndex: 0,
    sceneIds: [__UNSERIES__],
    status: StatusType.Default,
    toolConfig: getDefaultToolConfig(),
  };
}
