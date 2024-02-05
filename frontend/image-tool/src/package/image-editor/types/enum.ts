export enum LangType {
  'zh-CN' = 'zh-CN',
  'en-US' = 'en-US',
  'ko-KR' = 'ko-KR',
}
export enum OPType {
  EDIT = 'edit',
  VIEW = 'view',
}
export enum ToolType {
  BOUNDING_BOX = 'BOUNDING_BOX',
  RECTANGLE = 'RECTANGLE',
  POLYGON = 'POLYGON',
  POLYLINE = 'POLYLINE',
  KEY_POINT = 'KEY_POINT',
}
export enum ToolName {
  default = '',
  edit = 'edit', // edit tool, ToolType: none
  // instance
  rect = 'rect', // rect tool, ToolType.BOUNDING_BOX
  polygon = 'polygon', // polygon tool, ToolType.POLYGON
  polyline = 'polyline', // polyline tool, ToolType.POLYLINE
  'key-point' = 'key-point', // key-point tool, ToolType.KEY_POINT
  // model
  model = 'model',
}
export enum AnnotateModeEnum {
  INSTANCE = 'INSTANCE',
  SEGMENTATION = 'SEGMENTATION',
}
export enum DataTypeEnum {
  SINGLE_DATA = 'SINGLE_DATA',
  FRAME_SERIES = 'FRAME_SERIES',
  SCENE = 'SCENE',
}
export enum LoadStatus {
  DEFAULT = '',
  LOADING = 'loading',
  COMPLETE = 'complete',
  ERROR = 'error',
}
export enum ModelCodeEnum {
  IMAGE_DETECTION = 'IMAGE_DETECTION',
}

export enum ModelTypeEnum {
  DETECTION = 'DETECTION',
  TRACKING = 'TRACKING',
  INTERACTIVE = 'INTERACTIVE',
}
export enum AttrType {
  RADIO = 'RADIO',
  MULTI_SELECTION = 'MULTI_SELECTION',
  DROPDOWN = 'DROPDOWN',
  TEXT = 'TEXT',
  RANK = 'RANK',
}
export enum StatusType {
  Default = '',
  Create = 'Create',
  Loading = 'Loading',
  Modal = 'Modal',
  Confirm = 'Confirm',
  Play = 'Play',
  Stop = 'Stop',
}
export enum DisplayModeEnum {
  MASK = 'mask',
  MARK = 'mark',
}
export enum LineDrawMode {
  default = '',
  horizontal = 'HORIZONTAL',
  vertical = 'VERTICAL',
}
export enum ToolAction {
  del = 'del',
  esc = 'esc',
  stop = 'stop-current',
  undo = 'undo',
}
export enum Const {
  Fixed = 'Fixed',
  Dynamic = 'Dynamic',
  Frozen = 'Frozen',
  Standard = 'Standard',
  True_Value = 'True_value',
  Predicted = 'Predicted',
  Copied = 'Copied',
}

export enum MsgType {
  error = 'error',
  warning = 'warning',
  success = 'success',
  info = 'info',
}
export enum SourceType {
  DATA_FLOW = 'DATA_FLOW',
  MODEL = 'MODEL',
}
export enum ResourceLoadMode {
  near = 'near', // load last and next frame data
  all = 'all', // load all frame data
}
