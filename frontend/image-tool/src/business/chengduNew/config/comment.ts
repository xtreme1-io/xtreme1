import { ToolModelEnum } from 'image-editor';

// 评论标签类型枚举
export enum CommentType {
  MISSED = 'MISSED',
  WRONG_OBJECT = 'WRONG_OBJECT',
  WRONG_POINT = 'WRONG_POINT',
  WRONG_LABEL = 'WRONG_LABEL',
  NOT_FIT = 'NOT_FIT',
  DUPLICATED = 'DUPLICATED',
  UNCERTAIN = 'UNCERTAIN',
  DISCUSSION = 'DISCUSSION',
  OTHER = 'OTHER',
}
export enum CommentSeverity {
  high = 'HIGH',
  medium = 'MEDIUM',
  low = 'LOW',
}
export enum CommentWrongType {
  MISS = 'MISS', // 可打在空白处
  WRONG = 'WRONG', // 可打在object上
  DISCUSSION = 'DISCUSSION', // 两者皆可
}

// 评论标签类型颜色枚举
export const CommentTypeColor: Record<CommentSeverity, string> = {
  [CommentSeverity.high]: '#F8827B',
  [CommentSeverity.medium]: '#FCB17A',
  [CommentSeverity.low]: '#57CCEF',
};

export const CommentTypeText: Record<CommentType, any> = {
  [CommentType.MISSED]: 'Missed',
  [CommentType.WRONG_OBJECT]: 'Wrong Object',
  [CommentType.WRONG_POINT]: 'Wrong Point',
  [CommentType.WRONG_LABEL]: 'Wrong label',
  [CommentType.DUPLICATED]: 'Duplicate',
  [CommentType.DISCUSSION]: 'Discussion',
  [CommentType.NOT_FIT]: 'Not Fit',
  [CommentType.UNCERTAIN]: 'Uncertain',
  [CommentType.OTHER]: 'Other',
};
// 评论tab标签枚举
export enum CommentTabEnum {
  OPEN = 'OPEN',
  FIXED = 'FIXED',
  RESOLVED = 'RESOLVED',
}
// 评论对象类型
export enum CommentObjectType {
  OBJECT = 'OBJECT',
  POINT = 'POINT',
}
// 评论Tab枚举
export enum CommentTabType {
  empty = 'empty',
  object = 'object',
  point = 'point',
}

export interface ICommentTag {
  entityId: number;
  label?: any;
  color: string;
  resultType: CommentObjectType;
  annotationTypes: ToolModelEnum[];
  wrongType: CommentWrongType;

  entityVersion?: string;
  name?: string;
  disable?: boolean;
  severity?: CommentSeverity;
}
export const configs: ICommentTag[] = [
  {
    entityId: 0,
    label: CommentTypeText.MISSED,
    color: CommentTypeColor.HIGH,
    resultType: CommentObjectType.OBJECT,
    annotationTypes: [ToolModelEnum.INSTANCE, ToolModelEnum.SEGMENTATION],
    wrongType: CommentWrongType.MISS,
    disable: false,
  },
  {
    entityId: 1,
    label: CommentTypeText.WRONG_OBJECT,
    color: CommentTypeColor.HIGH,
    resultType: CommentObjectType.OBJECT,
    annotationTypes: [ToolModelEnum.INSTANCE, ToolModelEnum.SEGMENTATION],
    wrongType: CommentWrongType.WRONG,
    disable: false,
  },
  {
    entityId: 2,
    label: CommentTypeText.WRONG_POINT,
    color: CommentTypeColor.HIGH,
    resultType: CommentObjectType.POINT,
    annotationTypes: [ToolModelEnum.INSTANCE, ToolModelEnum.SEGMENTATION],
    wrongType: CommentWrongType.WRONG,
    disable: false,
  },
  {
    entityId: 3,
    label: CommentTypeText.WRONG_LABEL,
    color: CommentTypeColor.HIGH,
    resultType: CommentObjectType.OBJECT,
    annotationTypes: [ToolModelEnum.INSTANCE, ToolModelEnum.SEGMENTATION],
    wrongType: CommentWrongType.WRONG,
    disable: false,
  },
  {
    entityId: 4,
    label: CommentTypeText.NOT_FIT,
    color: CommentTypeColor.MEDIUM,
    resultType: CommentObjectType.OBJECT,
    annotationTypes: [ToolModelEnum.INSTANCE, ToolModelEnum.SEGMENTATION],
    wrongType: CommentWrongType.WRONG,
    disable: false,
  },
  {
    entityId: 5,
    label: CommentTypeText.NOT_FIT,
    color: CommentTypeColor.MEDIUM,
    resultType: CommentObjectType.POINT,
    annotationTypes: [ToolModelEnum.INSTANCE, ToolModelEnum.SEGMENTATION],
    wrongType: CommentWrongType.WRONG,
    disable: false,
  },
  {
    entityId: 6,
    label: CommentTypeText.DUPLICATED,
    color: CommentTypeColor.MEDIUM,
    resultType: CommentObjectType.OBJECT,
    annotationTypes: [ToolModelEnum.INSTANCE, ToolModelEnum.SEGMENTATION],
    wrongType: CommentWrongType.WRONG,
    disable: false,
  },
  {
    entityId: 7,
    label: CommentTypeText.UNCERTAIN,
    color: CommentTypeColor.LOW,
    resultType: CommentObjectType.OBJECT,
    annotationTypes: [ToolModelEnum.INSTANCE, ToolModelEnum.SEGMENTATION],
    wrongType: CommentWrongType.DISCUSSION,
    disable: false,
  },
  {
    entityId: 8,
    label: CommentTypeText.UNCERTAIN,
    color: CommentTypeColor.LOW,
    resultType: CommentObjectType.POINT,
    annotationTypes: [ToolModelEnum.INSTANCE, ToolModelEnum.SEGMENTATION],
    wrongType: CommentWrongType.DISCUSSION,
    disable: false,
  },
  {
    entityId: 9,
    label: CommentTypeText.DISCUSSION,
    color: CommentTypeColor.LOW,
    resultType: CommentObjectType.OBJECT,
    annotationTypes: [ToolModelEnum.INSTANCE, ToolModelEnum.SEGMENTATION],
    wrongType: CommentWrongType.DISCUSSION,
    disable: false,
  },
  {
    entityId: 10,
    label: CommentTypeText.OTHER,
    color: CommentTypeColor.LOW,
    resultType: CommentObjectType.OBJECT,
    annotationTypes: [ToolModelEnum.INSTANCE, ToolModelEnum.SEGMENTATION],
    wrongType: CommentWrongType.DISCUSSION,
    disable: false,
  },
  {
    entityId: 11,
    label: CommentTypeText.OTHER,
    color: CommentTypeColor.LOW,
    resultType: CommentObjectType.POINT,
    annotationTypes: [ToolModelEnum.INSTANCE, ToolModelEnum.SEGMENTATION],
    wrongType: CommentWrongType.DISCUSSION,
    disable: false,
  },
];
