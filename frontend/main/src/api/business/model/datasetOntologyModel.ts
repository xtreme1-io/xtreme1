import { BasicPageParams, BasicFetchResult } from '/@/api/model/baseModel';
import {
  ToolTypeEnum,
  inputTypeEnum,
  SearchItem as OntologySearchItem,
  ResponseItem as OntologyResponseItem,
} from './ontologyClassesModel';

/** searchForm params */
export type SearchItem = OntologySearchItem;

/** request params */
export interface GetListParams extends BasicPageParams, SearchItem {
  datasetId: number;
}

/** response params */
export interface ResponseItem extends OntologyResponseItem {
  datasetId?: number;
  classId?: number;
  classificationId?: number;
  type?: string;
}

/** class list item */
export interface ClassItem extends ResponseItem {
  toolType: ToolTypeEnum;
  toolTypeOptions: string;
  attributes: any[];
  // attributes: Nullable<string>;
}

/** class response params */
export type ClassResponse = BasicFetchResult<ClassItem>;

/** classification list item */
export interface ClassificationItem extends ResponseItem {
  inputType: inputTypeEnum;
  isRequired: boolean;
  options: any[];
  // options: Nullable<string>;
}

/** classification response params */
export type ClassificationResponse = BasicFetchResult<ClassificationItem>;

export interface SaveEditItem {
  id?: Nullable<number>;
  ontologyId?: Nullable<number>;

  datasetId: Nullable<number>;
  name: string;
  color: string;
}

/** create/save class */
export interface SaveEditClassParams extends SaveEditItem {
  classId?: Nullable<number>;
  toolType: ToolTypeEnum;
  isSync: boolean;
  attributes: any[];
  toolTypeOptions: any;
  // attributes: string;
  // toolTypeOptions: Nullable<string>;
}

/** create/save classification */
export interface SaveEditClassificationParams extends SaveEditItem {
  classificationId?: Nullable<number>;
  inputType: inputTypeEnum;
  isRequired: boolean;
  options: any[];
  // options: string;
}

/** sync class | classification*/
export interface SyncParams {
  id: string | number;
  ontologyId: string | number;
}

/** validate name */
export interface ValidateNameParams {
  name: string;
  datasetId: number;
}
