import { BasicPageParams, BasicFetchResult, SortTypeEnum } from '/@/api/model/baseModel';
import type { Dayjs } from 'dayjs';
import { datasetTypeEnum } from './datasetModel';

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
  LONG_TEXT = 'LONG_TEXT',
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
export interface getOntologyClassesParams extends BasicPageParams, SearchItem {
  ontologyId: number;
}
export interface getDatasetClassesParams extends BasicPageParams, SearchItem {
  datasetId: number;
}

/** ontology response */
export interface ontologyResponseItem {
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
/** ontology class */
export interface ontologyClassItem extends ontologyResponseItem {
  attributes: any[];
  datasetType: datasetTypeEnum;
  toolType: ToolTypeEnum;
  toolTypeOptions: ToolTypeOptionsItem;
  datasetClassNum: number;
  datasetClasses: any;
  isResetRelations: boolean;
}
export type ontologyClassResponse = BasicFetchResult<ontologyClassItem>;
/** ontology classification */
export interface ontologyClassificationItem extends ontologyResponseItem {
  options: any[];
  inputType: inputTypeEnum;
  isRequired: boolean;
}
export type ontologyClassificationResponse = BasicFetchResult<ontologyClassificationItem>;
/** dataset response */
export interface datasetResponseItem extends ontologyResponseItem {
  datasetId?: number;
  classId?: number;
  classificationId?: number;
  type?: string;
}
/** dataset class */
export interface datasetClassItem extends datasetResponseItem {
  toolType: ToolTypeEnum;
  toolTypeOptions: string;
  attributes: any[];
}
export type datasetClassResponse = BasicFetchResult<datasetClassItem>;
/** dataset classification */
export interface datasetClassificationItem extends datasetResponseItem {
  inputType: inputTypeEnum;
  isRequired: boolean;
  options: any[];
}
/** classification response params */
export type datasetClassificationResponse = BasicFetchResult<datasetClassificationItem>;

/** ontology create/save class */
export interface ontologySaveEditClassParams {
  id?: number;
  ontologyId: string | number;
  name: string;
  color: string;
  datasetType: datasetTypeEnum;
  toolType: ToolTypeEnum;
  toolTypeOptions: ToolTypeOptionsItem;
  attributes: any[];
}

/** ontology create/save Classification */
export interface ontologySaveEditClassificationParams {
  id?: number;
  ontologyId: string | number;
  name: string;
  inputType: inputTypeEnum;
  isRequired: boolean;
  options: any[];
}

/** dataset */
export interface datasetSaveEditItem {
  id?: Nullable<number>;
  ontologyId?: Nullable<number>;

  datasetId: Nullable<number>;
  name: string;
  color: string;
}

/** dataset create/save class */
export interface datasetSaveEditClassParams extends datasetSaveEditItem {
  classId?: Nullable<number>;
  toolType: ToolTypeEnum;
  isSync: boolean;
  attributes: any[];
  toolTypeOptions: any;
}

/** dataset create/save classification */
export interface datasetSaveEditClassificationParams extends datasetSaveEditItem {
  classificationId?: Nullable<number>;
  inputType: inputTypeEnum;
  isRequired: boolean;
  options: any[];
}

/** ontology getAll */
export interface getAllOntologyParams {
  ontologyId: string | number;
  toolType?: ToolTypeEnum;
}
/** dataset getAll */
export interface getAllDatasetParams {
  datasetId: string | number;
}

export interface ValidateOntologyClassesNameParams {
  id?: string | number;
  ontologyId?: string | number;
  name?: string;
  toolType?: ToolTypeEnum;
}
export interface ValidateDatasetClassesNameParams {
  id?: string | number;
  name: string;
  datasetId: number;
  toolType?: ToolTypeEnum;
}

/** Copy */
export interface ICopyClassParams {
  datasetId: string | number;
  ontologyId: string | number;
  classIds: Array<string | number>;
}
export interface ICopyClassificationParams {
  datasetId: string | number;
  ontologyId: string | number;
  classificationIds: Array<string | number>;
}

/**----------------------------- */
/** sync class | classification*/
export interface SyncParams {
  id: string | number;
  ontologyId: string | number;
}
