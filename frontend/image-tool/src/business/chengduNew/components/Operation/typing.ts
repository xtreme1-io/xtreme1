export enum tabKey {
  VALIDITY = 'validity',
  INSTANCE = 'results',
  CLASSIFICATION = 'classification',
  COMMENT = 'comments',
}
export enum validityEnum {
  VALID = 'VALID',
  INVALID = 'INVALID',
  UNKNOWN = 'UNKNOWN',
}

export interface ITab {
  key: tabKey;
  label: string;
  icon: string;
  component?: any;
}
