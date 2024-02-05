export interface IDataInfo {
  name: string;
  sceneName: string;
  details: { label: string; value: IDataInfoItem[] }[];
}
export interface IDataInfoItem {
  label: string;
  value: string | number;
}
export interface IStage {
  id: string;
  name: string;
  type: string;
}
export interface IStageInfo {
  stageName: string;
  stageType: string;
  stages: IStage[];
}
export interface IFlowIndex {
  total: number;
  currentIndex: number;
}
export interface IFlowIndexCallback {
  index: number;
}
export interface IStatus {
  // visible
  showTaskTimer?: boolean;
  showWorkflow?: boolean;
  showSave?: boolean;
  showReject?: boolean;
  showModify?: boolean;
  showSubmit?: boolean;
  showRevise?: boolean;
  showSuspend?: boolean;
  // doing
  saving: boolean;
  rejecting: boolean;
  submitting: boolean;
  suspending: boolean;
  isModify: boolean;
}
export enum TimeStatus {
  PAUSED = 'PAUSED',
  WORKING = 'WORKING',
  TIMEOUT = 'TIMEOUT',
  DONE = 'DONE',
}
export interface ITimeInfo {
  status?: TimeStatus;
  updateTm: number;
  remainTm: number;
  pausedTm?: number;
}
