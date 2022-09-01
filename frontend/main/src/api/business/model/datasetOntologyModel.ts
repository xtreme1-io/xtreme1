import { BasicPageParams, BasicFetchResult } from '/@/api/model/baseModel';
import {
  ToolTypeEnum,
  inputTypeEnum,
  SearchItem as OntologySearchItem,
  ResponseItem as OntologyResponseItem,
} from './ontologyClassesModel';

/** 搜索表单参数 */
export type SearchItem = OntologySearchItem;

/** 请求参数 */
export interface GetListParams extends BasicPageParams, SearchItem {
  datasetId: number;
}

/** 响应参数 */
export interface ResponseItem extends OntologyResponseItem {
  datasetId?: number;
  classId?: Nullable<number>;
  classificationId?: Nullable<number>;
  type?: string;
}

/** class 列表项 */
export interface ClassItem extends ResponseItem {
  toolType: ToolTypeEnum;
  toolTypeOptions: string;
  attributes: any[];
  // attributes: Nullable<string>;
}

/** class 响应参数 */
export type ClassResponse = BasicFetchResult<ClassItem>;

/** classification 列表项 */
export interface ClassificationItem extends ResponseItem {
  inputType: inputTypeEnum;
  isRequired: boolean;
  options: any[];
  // options: Nullable<string>;
}

/** classification 响应参数 */
export type ClassificationResponse = BasicFetchResult<ClassificationItem>;

export interface SaveEditItem {
  id?: Nullable<number>;
  ontologyId?: Nullable<number>;

  datasetId: Nullable<number>;
  name: string;
  color: string;
}

/** 添加修改 class */
export interface SaveEditClassParams extends SaveEditItem {
  classId?: Nullable<number>;
  toolType: ToolTypeEnum;
  isSync: boolean;
  attributes: any[];
  toolTypeOptions: any;
  // attributes: string;
  // toolTypeOptions: Nullable<string>;
}

/** 添加修改 classification */
export interface SaveEditClassificationParams extends SaveEditItem {
  classificationId?: Nullable<number>;
  inputType: inputTypeEnum;
  isRequired: boolean;
  options: any[];
  // options: string;
}

/** 同步 class | classification*/
export interface SyncParams {
  id: string | number;
  ontologyId: string | number;
}

/** 重名校验 */
export interface ValidateNameParams {
  name: string;
  datasetId: number;
}
