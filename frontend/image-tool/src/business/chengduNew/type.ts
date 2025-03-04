import { IBisectrixLine, ISourceDataBase, IValidity, ToolModelEnum } from 'image-editor';
import {
  CommentObjectType,
  CommentSeverity,
  CommentTabEnum,
  CommentWrongType,
} from './config/comment';
import { QaType } from '@basicai/tool-components';
import { validityEnum } from '../../enum/baseModel';
import {
  type IClassification,
  AttrTypeEnum,
  type IClassificationAttr,
} from '@basicai/tool-components';

export { IClassification, AttrTypeEnum, IClassificationAttr };
export type IAction =
  | 'save'
  | 'close'
  | 'pause'
  | 'back'
  | 'submit'
  | 'reject'
  | 'rejectAndClaim'
  | 'modify'
  | 'pass'
  | 'passAndClaim'
  | 'switchSeriesFrame'
  | 'accept'
  | 'revise'
  | 'suspend';

export enum OPType {
  EXECUTE = 'execute',
  VERIFY = 'verify',
  VIEW = 'view',
  TASK = 'task',
  EMPTY = 'empty',
  ALL = 'all',
  TRIAL = 'trial',
}
export enum TaskStatusEnum {
  NOT_STARTED = 'NOT_STARTED',
  ONGOING = 'ONGOING',
  NEED_ACCEPTANCE = 'NEED_ACCEPTANCE',
  COMPLETED = 'COMPLETED',
}
export enum TaskClaimPool {
  NORMAL = 'NORMAL',
  REJECTED = 'REJECTED',
  RE_REVIEW = 'RE_REVIEW',
  SUSPENDED = 'SUSPENDED',
}
export interface IPageHandler {
  init: () => void;
  onAction: (e: IAction, data?: any) => void;
}

export interface IUser {
  id: string;
  nickname: string;
  email?: string;
  status?: string;
  username?: string;
  avatarUrl?: string;
  // ....其他属性
}
export interface ITeam {
  id: string;
  name: string;
  inviteCode: string;
  isDefaultTeam: boolean;
  isDeleted: boolean;
  planId: number;
  planType: string;
  status: string;
  expireAt: string;
}

export interface IDoing {
  // flow
  saving: boolean;
  submitting: boolean;
  suspending: boolean;
  rejecting: boolean;
  accepting: boolean;
}
export interface IGlobalConfig {
  runningMode: 'cloud-global' | 'onprem';
  business?: any;
  freeTrialDays?: number;
  isShowAiMaid?: boolean;
  uba?: any;
  userAuth?: any;
}
export interface IWorkFlow {
  avatarUrl?: string;
  createdAt?: string;
  id?: string;
  operateType?: string;
  stageId: string | number;
  stageName: string;
  workerId?: string | number;
  workerName?: string;
  status?: string;
}
export interface IRejectData {
  avatarUrl?: string;
  claimRecordId?: string;
  createdAt?: string;
  createdBy?: number;
  creatorName?: string;
  fromStageId: number;
  fromStageName: string;
  isClearResult: boolean;
  itemId: number;
  reworkReason: string;
  reworkType: string;
  reworkWorkerType: string;
  taskId: number;
  toStageId: number;
}

export interface IBSState {
  isTaskFlow?: boolean;
  user: IUser;
  team: ITeam;
  config: IGlobalConfig;
  isVisitorClaim?: boolean; // 是否是 demo team 的 visitor

  doing: IDoing;
  blocking: boolean;

  query: Record<string, any>;

  //流水号
  recordId: string;
  // 数据集
  datasetId: string;
  classifications: IClassification[];
  //
  // task
  task: ITask;
  taskId: string;
  sampleId: string;
  // flow
  workFlowData: Record<string, IWorkFlow[]>;
  rejectData: Record<string, IRejectData[]>;
  // stage
  stageId: string;
  stage: IStage;
  stages: IStage[];
  preStages: IStage[];
  isModify: boolean; // 流程中进入修改状态
  // stageType: StageType;
  // claim
  claim?: IClaim;
  claimRecordId: string;
  claimNum: number;
  claimPool: TaskClaimPool;
  remainTime: number;
  // 评论state
  commentState: ICommentState;
  // qa
  qa: IQAState;

  // fitler
  activeSource: string[];
  currentSource: string;
  filterClasses: string[];
  filterTools: string[];
  sceneInfoCache: Record<string, { name: string }>;
  // ALL: string;
  annotatorList: { name: string; value: string }[];
  claimAnnotators: string[];
}

export interface ITask {
  annotationType: ToolModelEnum[];
  batchSize: number;
  datasetId: string;
  datasetType: string;
  dataDefaultValidity: IValidity;
  id: string;
  instruction: string;
  instructionFiles?: {
    name: string;
    url: string;
  }[];
  itemType: string;
  name: string;
  status: TaskStatusEnum;
  historyAccessPermissions: TaskHistoryAuthEnum[];
  teamId: string;
  commentTypeIds: number[];
  toolLimitConf: {
    allowExceedAreas: boolean;
    allowExceedClassLimit: boolean;
    allowGroups: boolean;
    isNeedSubmitWithClass: boolean;
    allowSubmitUnCompletedSkeleton: boolean;
    enableEquisector: boolean;
    equisectorConfig: IBisectrixLine;
    needSubmitWithClassType?: 'ALL' | 'NORMAL' | 'GROUP';
  };
  distanceMeasureConf: {
    // 辅助工具
    enableDistanceMeasure: boolean;
    imageList: any[];
    measureToolColor: string;
    // 辅助线
    enableMeasureLine: boolean;
    measureLineConfig: any;
  };
}
/** 获取标注结果列表 */
export interface IFrameData {
  objects: IObject[];
  segments: IObject[];
  segmentations: ISegmentations[];
  sourceId: number | string;
  sourceType: string;
  id: string | number;
  dataId: string | number;
  datasetId: string | number;
  version: string;
  validity: validityEnum;
  classifications: any;
}
export interface IObject {
  id: string;
  type: string; // rectangle / polygon / polyline
  version?: number;
  createdAt?: string;
  createdBy?: string | number;
  trackId?: string;
  trackName?: string;
  groups: string[];
  classId?: number;
  classValues: any;
  classVersion: number;
  className?: string;
  sourceId: string;
  sourceType?: string;
  modelConfidence?: number;
  modelClass?: string;
  contour: any; // { points: [], ... }
  meta: any; // 其它必需信息
  deviceName?: string;
  _log_op?: string;
  // segment
  no?: number;
}

export enum TaskClaimStatus {
  PAUSED = 'PAUSED',
  WORKING = 'WORKING',
  TIMEOUT = 'TIMEOUT',
  DONE = 'DONE',
}

export interface IClaim {
  id: string;
  // 暂停时间
  pauseTotalTime: number;
  // 剩余时间
  remainTotalTime: number;
  updateTime: number;
  status: TaskClaimStatus;
  filterConfig: Record<string, any>;
}

export interface IStage {
  id: string;
  name: string;
  type: string;
}

export enum StageEnum {
  ANNOTATION = 'ANNOTATION',
  REVIEW = 'REVIEW',
  NEED_ACCEPTANCE = 'NEED_ACCEPTANCE',
}

export enum StageTypeEnum {
  annotate = 'annotate',
  review = 'review',
  acceptance = 'acceptance',
  quality = 'quality',
  view = 'view',
  modify = 'modify',
}

export interface ITaskData {
  itemId: string;
  stageId: string;
  status: TaskStatusEnum;
  workerId: string;
  lockedBy: string;
  isLocked: boolean;
  name: string;
}

export interface ISourceData extends ISourceDataBase {
  type: SourceType;
  // classification values
  classifications: IClassification[];
  oldClassifications?: Record<string, any>;
  needCompose?: boolean;
}

export interface IResultSource {
  name: string;
  sourceId: string;
  sourceType: SourceType;
}

export enum SourceType {
  TASK = 'TASK',
  DATA_FLOW = 'DATA_FLOW',
  MODEL = 'MODEL',
}

// export interface IClassification {
//   uuid: string;
//   id: string;
//   name: string;
//   alias?: string;
//   classificationVersion: number;
//   attrs: IClassificationAttr[];
// }
// export interface IClassificationAttr {
//   classificationId: string;
//   parent: string;
//   parentAttr: string;
//   parentValue: any;
//   key: string;
//   id: string;
//   type: AttrTypeEnum;
//   name: string;
//   alias?: string;
//   required: boolean;
//   options: IAttrOption[];
//   value: any;
//   leafFlag?: boolean;
//   attributeVersion: number;
// }
/**
 * 评论相关
 */
// 评论状态
export interface ICommentState {
  activeTab: CommentTabEnum; // 当前tab
  loading: boolean; // 加载loading
  activeKey: string[]; // 当前选中的 comment
  list: ICommentItem[]; // 评论列表
  commentNumber: number; // 总评论数
  filterObj: any; // 过滤条件
}
/** 单个评论详情 */
export interface ICommentItem {
  annotationType: ToolModelEnum;
  attributes: any;
  avatarUrl?: string;
  content: string;
  createdAt: string;
  createdBy: number | string;
  creatorName: string;
  dataId: number | string;
  id: number | string;
  isResolved: boolean;
  isReviewProduce: boolean;
  objectId: string;
  parentId: any;
  position: any;
  replies?: ICommentItem[];
  sampleId: any;
  sceneId: any;
  stageId: number | string;
  stageName: string;
  taskId: number | string;
  status: CommentTabEnum;
  resolvable: boolean;
  types: ICommentType[];
  display?: boolean;
  classId?: string;
}
export interface ICommentType {
  dataType: string;
  entityId: number;
  entityVersion: string;
  name: string;
  resultType: CommentObjectType;
  severity: CommentSeverity;
  wrongType: CommentWrongType;
}
// 预签名参数
export interface ISignParam {
  datasetId: any;
  fileName: string;
  dataId: any;
  taskId?: any;
  sourceId?: any;
  uploadSource: 'DATA_FLOW_SEGMENT_RESULT' | 'TASK_FLOW_SEGMENT_RESULT' | 'ISSUE';
}
export interface ISegmentInfo extends ISignParam {
  deviceName: string;
  objects: IObject[];
  sourceData: any;
}
export interface ISegmentations {
  deviceName: string;
  resultFileId: number;
  segmentPointsFilePath?: string;
  resultFilePath: string;
}
export interface IQAState {
  dataSource: QaType.TableDataItem[];
  objectSource: QaType.TableObjectItem[];
  ruleConfig: Record<string, QaType.RuleItem>;
  activeRow: string;
  activeTab: 'object' | 'data';
  loading: boolean;
  version: number;
  visible: boolean;
  executed: boolean;
  hasError: boolean;
}

export enum AppMode {
  China = 'cloud-china',
  Global = 'cloud-global',
}
export enum TaskHistoryAuthEnum {
  ANNOTATOR = 'ANNOTATOR',
  REVIEWER = 'REVIEWER',
  INSPECTOR = 'INSPECTOR',
}
