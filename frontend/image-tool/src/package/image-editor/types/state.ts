import { IClassType } from './class';
import { IBisectrixLine, IFrame, IHelpLine, IModeConfig, IModel, IModelConfig } from './common';
import {
  AnnotateModeEnum,
  DisplayModeEnum,
  LangType,
  LineDrawMode,
  StatusType,
  ToolName,
} from './enum';

export interface IState {
  // global state
  lang: LangType;
  currentClass: string;
  currentTrack: string;
  // scene && frame state
  isSeriesFrame: boolean;
  sceneIds: string[];
  sceneId: string;
  sceneIndex: number;
  frames: IFrame[];
  frameIndex: number;
  defaultSourceId: string;
  // class
  classTypes: IClassType[];
  // block msg
  blocked: boolean;
  editorMuted: boolean;
  editorMutedMsg?: string;
  editorMutedData?: IMuted;
  editorMessage: IMessage;
  // model
  models: IModel[];
  modelConfig: IModelConfig;
  // status
  config: IConfig;
  status: StatusType;
  modeConfig: IModeConfig;
  // tool
  activeTool: ToolName;
  toolConfig: IToolConfig;
  annotateMode: AnnotateModeEnum;
  annotateModeList: AnnotateModeEnum[];
}

export interface IConfig {
  autoLoad: boolean; // is load auto
  brightness: number;
  contrast: number;
  imageSmoothing: boolean;
  helperLine: IHelpLine;
  bisectrixLine: IBisectrixLine;
  viewType: DisplayModeEnum;
  // show
  showClassView: boolean;
  showClassTitle: boolean;
  showSize: boolean;
  showAttrs: boolean;
  showSizeTips: boolean;

  // other
  strokeWidth: number;
  baseLineWidth: number;
  baseFillOpacity: number;
}
export interface IToolConfig {
  polyAuto: boolean;
  polyAutoTm: number;
  lineMode: LineDrawMode;
}
export interface IMuted {
  message?: string;
  showBtn?: boolean;
  btnText?: string;
  btnCallback?: any;
}
export interface IMessage {
  visible: boolean;
  messgae?: string;
}
