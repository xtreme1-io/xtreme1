import { IClassification } from '@/businessNew/types';
import {
  AnnotateModeEnum,
  LoadStatus,
  ModelCodeEnum,
  ModelTypeEnum,
  OPType,
  SourceType,
} from './enum';

export interface IUserDataBase {
  id?: string;
  annotationType?: AnnotateModeEnum;
  trackId?: any;
  trackName?: any;
  sourceType?: SourceType;
  sourceId?: string;
  modelClass?: string;
  classType?: string;
  classId?: string;
  attrs?: Record<string, any>;
  // info
  valid?: boolean;
  version?: number;
  createdBy?: any;
  createdAt?: string;
}

export interface IUserData extends IUserDataBase {
  [key: string]: any;
}
export interface IDataResource {
  // IFileConfig
  url: string;
  name: string;
  size: number;
  deviceName: string;
  // extends
  time: number;
  image?: HTMLImageElement;
}
export interface IModelRunningState {
  recordId: string;
  id: string;
  version: string;
  code?: ModelCodeEnum;
  state?: LoadStatus;
  config?: Record<string, any>;
}
export interface IFrame {
  // id
  id: string;
  imageData?: IDataResource | undefined;
  datasetId?: string;
  sceneId?: string;
  loadState: LoadStatus | '';
  // model
  model?: IModelRunningState;
  // save
  needSave?: boolean;
  classifications: IClassification[];
  // other any
  [k: string]: any;
}
/** Model */
export interface IModel {
  id: string;
  name: string;
  version: string;
  classes: IModelClass[];
  mapClass?: Record<string, any>;
  code: ModelCodeEnum;
  isInteractive: boolean;
  type: ModelTypeEnum;
}
/** Model Config */
export interface IModelConfig {
  confidence: number[];
  predict: boolean;
  classes: { [key: string]: Record<string, IModelClass> };
  model: string;
  loading: boolean;
  code: ModelCodeEnum | '';
}
export interface IModelClass {
  code: string;
  name: string;
  label: string;
  value: string;
  selected?: boolean;
  subClasses?: IModelClass;
  url?: string;
  isShow?: boolean;
  mapClass?: string[];
}
export interface IHelpLine {
  showLine: boolean;
  lineColor: string;
}
export interface IBisectrixLine {
  enable?: boolean;
  horizontal: number;
  vertical: number;
  width: number;
  color: string;
}
export interface IModeConfig<U extends string = string, A extends string = string> {
  name: string;
  op: OPType;
  ui: Record<U, boolean>;
  actions: Record<A, boolean>;
}
export interface ILoadFrameDataOptions {
  source?: Boolean;
  resource?: Boolean;
}
export interface IObjectSource {
  name: string;
  sourceId: string;
  sourceType: SourceType;
  frameId: string;
  modelId?: string;
  modelName?: string;
}
