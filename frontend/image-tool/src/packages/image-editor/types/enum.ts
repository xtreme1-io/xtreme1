import {
  AttrTypeEnum,
  LineDrawModeEnum,
  ToolTypeEnum as ToolType,
  LangTypeEnum,
} from '@basicai/tool-components';
export { AttrTypeEnum, ToolType, LineDrawModeEnum, LangTypeEnum };
export enum OPType {
  EDIT = 'edit',
  VIEW = 'view',
}

export enum DataTypeEnum {
  SINGLE_DATA = 'SINGLE_DATA', // 单帧
  FRAME_SERIES = 'FRAME_SERIES', // 连续帧
  SCENE = 'SCENE', // 连续帧
}

// export type LoadStatus = '' | 'loading' | 'complete' | 'error';
export enum LoadStatus {
  LOADING = 'loading',
  COMPLETE = 'complete',
  ERROR = 'error',
}

export enum StatusType {
  Default = '',
  // 创建
  Create = 'Create',
  // 拾取
  Pick = 'Pick',
  // 加载框
  Loading = 'Loading',
  // 弹窗
  Modal = 'Modal',
  // 确认框
  Confirm = 'Confirm',
  // play
  Play = 'Play',
  // stop
  Stop = 'Stop',
}

// export enum AttrType {
//   RADIO = 'RADIO',
//   MULTI_SELECTION = 'MULTI_SELECTION',
//   DROPDOWN = 'DROPDOWN',
//   TEXT = 'TEXT',
// }

export enum ToolName {
  // 通用
  default = '',
  edit = 'edit', // 选择编辑工具, 无ToolType
  comment = 'comment', // 评论工具, 无ToolType
  'show-points' = 'show-points', // 顶点显示工具, 无ToolType
  // 实例
  rect = 'rect', // 矩形工具, ToolType.BOUNDING_BOX & ToolType.RECTANGLE
  polygon = 'polygon', // 多边形工具, ToolType.POLYGON & ToolType.POLYGON_PLUS
  line = 'line', // 折线工具, ToolType.POLYLINE
  ellipse = 'ellipse', // 椭圆工具, ToolType.ELLIPSE
  'shape-circle' = 'shape-circle', // 圆工具, ToolType.CIRCLE
  'spline-curve' = 'spline-curve', // 曲线工具, ToolType.CURVE
  'key-point' = 'key-point', // 关键点工具, ToolType.KEY_POINT
  skeleton = 'skeleton', // 骨骼点工具, ToolType.SKELETON
  cuboid = 'cuboid', // 伪3D框工具, ToolType.IMAGE_CUBOID
  // 分割
  segment = 'segment', // 分割工具, 占位用的, ToolType.MASK
  brush = 'brush', // 分割-刷子, ToolType.MASK
  'mask-polygon' = 'mask-polygon', // 分割-多边形, ToolType.MASK
  'mask-fill' = 'mask-fill', // 分割-填充, ToolType.MASK
  // 模型工具
  interactive = 'interactive', // 实例, 交互式模型
  model = 'model', // 实例, 预测模型
  intellect = 'intellect', // 分割, 智能交互式模型(SAM)
  panoramic = 'panoramic', // 分割, 全景分割预测模型
  // 其他
  group = 'group', // 组工具(废弃)
}

export enum ToolAction {
  del = 'del',
  esc = 'esc',
  stop = 'stop-current',
  undo = 'undo',
}

export enum SelectToolEnum {
  FILL = 'fill',
  CONTOUR = 'Contour',
}

export enum ToolModelEnum {
  INSTANCE = 'INSTANCE',
  SEGMENTATION = 'SEGMENTATION',
}

export enum DisplayModeEnum {
  MASK = 'mask',
  MARK = 'mark',
}

export enum ShareDrawMode {
  default = '', // 默认值
  point = 'point', // 共享点模式
  edge = 'edge', // 共享边模式
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

export enum IValidity {
  VALID = 'VALID',
  INVALID = 'INVALID',
  UNKNOWN = 'UNKNOWN',
}
export enum ClassLimitInfo {
  noInfo = '',
  areaS = 'areaLimitLower', // 低于面积限制
  areaL = 'areaLimitExceed', // 超过面积限制
  widthS = 'widthLimitLower', // 低于长度限制
  widthL = 'widthLimitExceed', // 超过长度限制
  heightS = 'heightLimitLower', // 低于宽度限制
  heightL = 'heightLimitExceed', // 超过宽度限制
  nonH = 'non-horizontal', // 非水平
  nonV = 'non-verticality', // 非垂直
}

// flow enum
// 流程阶段枚举
export enum StageTypeEnum {
  ANNOTATE = 'annotate',
  REVIEW = 'review',
  ACCEPTANCE = 'acceptance',
  VIEW = 'view',
  QUALITY = 'quality',
  COMPLETED = 'completed',
  EMPTY = 'empty',
}
// 模型类型枚举
export enum ModelTypeEnum {
  OBJECT_TRACKING = 'OBJECT_TRACKING', // 追踪模型类型
  OBJECT_DETECTION = 'OBJECT_DETECTION', // 预识别类型
  SEMANTIC_SEGMENTATION = 'SEMANTIC_SEGMENTATION', // 分割类型
}

// class 属性初始值类型
export enum PropValueOrigin {
  default = 'default', // 取配置默认值
  inherit = 'inherit', // 继承上一个对象的值
}
export enum TrackDirEnum {
  BACKWARD = 'BACKWARD',
  FORWARD = 'FORWARD',
  CUSTOM = 'CUSTOM',
}
