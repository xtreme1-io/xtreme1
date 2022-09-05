import { BasicPageParams, BasicFetchResult, SortTypeEnum } from '/@/api/model/baseModel';
import type { Dayjs } from 'dayjs';

/** classType */
export enum ClassTypeEnum {
  CLASS = 'CLASS',
  CLASSIFICATION = 'CLASSIFICATION',
}

/** toolType */
export enum ToolTypeEnum {
  POLYGON = 'POLYGON',
  BOUNDING_BOX = 'BOUNDING_BOX',
  POLYLINE = 'POLYLINE',
  KEY_POINT = 'KEY_POINT',
  SEGMENTATION = 'SEGMENTATION',
  CUBOID = 'CUBOID',
}

/** sort */
export enum SortFieldEnum {
  NAME = 'NAME',
  CREATE_TIME = 'CREATE_TIME',
}

/** inputType */
export enum inputTypeEnum {
  RADIO = 'RADIO',
  MULTI_SELECTION = 'MULTI_SELECTION',
  DROPDOWN = 'DROPDOWN',
  TEXT = 'TEXT',
}

/** datasetType */
export enum datasetTypeEnum {
  IMAGE = 'IMAGE',
  LIDAR_BASIC = 'LIDAR_BASIC',
  LIDAR_FUSION = 'LIDAR_FUSION',
}

/** searchForm params */
export interface SearchItem {
  name?: string;
  sortBy?: SortFieldEnum;
  ascOrDesc?: SortTypeEnum;
  startTime?: number | string | Nullable<Dayjs>;
  endTime?: number | string | Nullable<Dayjs>;
  toolType?: ToolTypeEnum;
  inputType?: inputTypeEnum;
}

/** request params */
export interface GetListParams extends BasicPageParams, SearchItem {
  ontologyId: number;
}

/** response params */
export interface ResponseItem {
  id: number;
  ontologyId: number;
  teamId: number;
  name: string;
  color: string;
  createdAt: Date;
}
export interface ToolTypeOptionsItem {
  defaultHeight: string;
  isConstraints: string;
  minHeight: string;
  minPoints: string;
}
/** class list item */
export interface ClassItem extends ResponseItem {
  attributes: any[];
  datasetType: datasetTypeEnum;
  toolType: ToolTypeEnum;
  toolTypeOptions: ToolTypeOptionsItem;
}

/** class response params */
export type ClassResponse = BasicFetchResult<ClassItem>;

/** classification list item */
export interface ClassificationItem extends ResponseItem {
  options: any[];
  inputType: inputTypeEnum;
  isRequired: boolean;
}

/** classification response params */
export type ClassificationResponse = BasicFetchResult<ClassificationItem>;

/** create/save class */
export interface SaveEditClassParams {
  id?: number;
  ontologyId: string | number;
  name: string;
  color: string;
  datasetType: datasetTypeEnum;
  toolType: ToolTypeEnum;
  toolTypeOptions: ToolTypeOptionsItem;
  attributes: any[];
}

/** create/save Classification */
export interface SaveEditClassificationParams {
  id?: number;
  ontologyId: string | number;
  name: string;
  inputType: inputTypeEnum;
  isRequired: boolean;
  options: any[];
}

/** get Classification by team name */
export interface FindClassificationByTeamParams {
  name: string;
}
