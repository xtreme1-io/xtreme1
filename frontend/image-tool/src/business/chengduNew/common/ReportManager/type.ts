/**
 * 常量及接口定义
 */
export const mixpanelToken = {
  dev: '11e42d660a54aef4f1fa731c18048916',
  test: 'b8e9a0bae9e8845599484193f3c262eb',
};

/**
 * 导出方法及枚举等
 */
export enum ReportEvent {
  ENTER = 'Image-Enter Tool',
  CLOSE = 'Image-Close Tool',
  SAVE = 'Image-Save Results',
  SWITCHDATA = 'Image-Switch Data',
  LOADED = 'Image-Finish Loading Data',
  CREATED = 'Image-Create Object Success',
  SELECTED = 'Image-Select Object',
  DELETED = 'Image-Delete Object',
  EDITED = 'Image-Edit Object',
  MODELRUN = 'Run Detection Model',
  MODEL_RESULT_ADD = 'Add Model Results',
  MODEL_TRACK = 'Run Tracking Model',
  MODEL_TRACK_SUCCESS = 'Tracking Succeed',
  AUTO_LOAD = 'Auto Load',
  PLAY = 'Play',
  PAUSE = 'Pause',
  REPLAY = 'Replay',
  SPEED = 'Speed Play',
  ERROR = 'console error',
}
// stage对应枚举
export enum ReportStage {
  all = 'all',
  execute = 'Annotation',
  view = 'View',
  preview = 'Preview',
  taskAnnotate = 'Task Annotation',
  taskReview = 'Review',
  taskReviewEdit = 'ReviewEdit',
  taskAccept = 'Acceptance',
  taskAcceptEdit = 'AcceptanceEdit',
  taskQuality = 'QA',
}

export interface IToolParams {
  Mode: 'View' | 'Annotate';
  'Is Frame Series': boolean;
  '# of Data': number;
  'Enter From': 'Dataset' | 'Task';
  'Enter From Stage': 'Annotation' | 'Review' | 'Acceptance' | 'QA' | 'View' | 'Preview';
  'Task Role': 'Annotator' | 'Reviewer' | 'Task' | 'Admin' | 'Worker' | 'Admin';
}
