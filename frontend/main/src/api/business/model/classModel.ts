import { BasicPageParams, BasicFetchResult } from '/@/api/model/baseModel';

export enum ClassTypeEnum {
  CLASS = 'CLASS',
  CLASSIFICATION = 'CLASSIFICATION',
}

export enum ToolTypeEnum {
  POLYGON = 'POLYGON',
  BOUNDING_BOX = 'BOUNDING_BOX',
  POLYLINE = 'POLYLINE',
  KEY_POINT = 'KEY_POINT',
  SEGMENTATION = 'SEGMENTATION',
  CUBOID = 'CUBOID',
}

export interface ClassListParams extends BasicPageParams {
  datasetId: Nullable<string | number>;
  type?: ClassTypeEnum;
  toolType?: ToolTypeEnum;
  name?: string;
}

export interface ClassItem {
  id: string | number;
  datasetId: string | number;
  type: ClassTypeEnum;
  toolType: ToolTypeEnum;
  name: string;
  color: string;
  inputType: string;
  isRequired: boolean;
  cuboidProperties: any;
  attributes: any;
}

export interface createEditClassParams extends Omit<ClassItem, 'id'> {
  id?: string | number;
}

export type ClassListGetResultModel = BasicFetchResult<ClassItem>;
