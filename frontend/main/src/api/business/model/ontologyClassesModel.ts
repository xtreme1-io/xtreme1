import { BasicPageParams, BasicFetchResult, SortTypeEnum } from '/@/api/model/baseModel';
import type { Dayjs } from 'dayjs';

/** classType 枚举 */
export enum ClassTypeEnum {
  CLASS = 'CLASS',
  CLASSIFICATION = 'CLASSIFICATION',
}

/** toolType 枚举 */
export enum ToolTypeEnum {
  POLYGON = 'POLYGON',
  BOUNDING_BOX = 'BOUNDING_BOX',
  POLYLINE = 'POLYLINE',
  KEY_POINT = 'KEY_POINT',
  SEGMENTATION = 'SEGMENTATION',
  CUBOID = 'CUBOID',
}

/** sort 枚举 */
export enum SortFieldEnum {
  NAME = 'NAME',
  CREATE_TIME = 'CREATE_TIME',
}

/** inputType 枚举 */
export enum inputTypeEnum {
  RADIO = 'RADIO',
  MULTI_SELECTION = 'MULTI_SELECTION',
  DROPDOWN = 'DROPDOWN',
  TEXT = 'TEXT',
}

/** datasetType 枚举 */
export enum datasetTypeEnum {
  IMAGE = 'IMAGE',
  LIDAR_BASIC = 'LIDAR_BASIC',
  LIDAR_FUSION = 'LIDAR_FUSION',
}

/** 搜索表单参数 */
export interface SearchItem {
  name?: string;
  sortBy?: SortFieldEnum;
  ascOrDesc?: SortTypeEnum;
  startTime?: number | string | Nullable<Dayjs>;
  endTime?: number | string | Nullable<Dayjs>;
  toolType?: ToolTypeEnum;
  inputType?: inputTypeEnum;
}

/** 分页查询 - 请求参数 */
export interface GetListParams extends BasicPageParams, SearchItem {
  ontologyId: number;
}

/** 响应参数 */
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
/** class 列表项 */
export interface ClassItem extends ResponseItem {
  // attributes: Nullable<string>;
  attributes: any[];
  datasetType: datasetTypeEnum;
  toolType: ToolTypeEnum;
  toolTypeOptions: ToolTypeOptionsItem;
}

/** class 响应参数 */
export type ClassResponse = BasicFetchResult<ClassItem>;

/** classification 列表项 */
export interface ClassificationItem extends ResponseItem {
  // options: Nullable<string>;
  options: any[];
  inputType: inputTypeEnum;
  isRequired: boolean;
}

/** classification 响应参数 */
export type ClassificationResponse = BasicFetchResult<ClassificationItem>;

/** 添加修改 class */
export interface SaveEditClassParams {
  id?: number;
  ontologyId: string | number;
  name: string;
  color: string;
  datasetType: datasetTypeEnum;
  toolType: ToolTypeEnum;
  toolTypeOptions: ToolTypeOptionsItem;
  attributes: any[];
  // attributes: Nullable<string>;
  // toolTypeOptions?: {
  //   isConstraints: boolean;
  //   defaultHeight?: string;
  //   minHeight?: string;
  //   minPoints?: string;
  // };
}

/** 添加修改 Classification */
export interface SaveEditClassificationParams {
  id?: number;
  ontologyId: string | number;
  name: string;
  inputType: inputTypeEnum;
  isRequired: boolean;
  options: any[];
  // options: Nullable<string>;
}

/** 根据 team 查询 Classification */
export interface FindClassificationByTeamParams {
  name: string;
}
