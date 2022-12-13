export interface IPieData {
  type: pieDataEnum;
  count: number;
}
export enum pieDataEnum {
  ANNOTATED = 'Annotated',
  NOT_ANNOTATED = 'Not Annotated',
  INVALID = 'Invalid',
}

export enum tabPaneEnum {
  CLASS = 'Class',
  CLASSIFICATION = 'Classification',
}

export enum brushEnum {
  RECT = 'rect',
  PATH = 'path',
}

export enum optionEnum {
  NO_OPTIONS = 'No Options',
  MULTIPLE_OPTIONS = 'Multiple Options',
}
