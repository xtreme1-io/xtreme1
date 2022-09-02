import { BasicPageParams, BasicIdParams, BasicFetchResult } from '/@/api/model/baseModel';
import { datasetTypeEnum } from './ontologyClassesModel';

/** 列表项 */
export interface OntologyListItem {
  id: number;
  teamId: number;
  name: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  classNum: number | null;
  type: datasetTypeEnum;
}

/** 分页查询 - 请求参数 */
export interface GetOntologyParams extends BasicPageParams {
  name?: string;
}

/** 分页查询 - 响应参数 */
export type ResponseOntologyParams = BasicFetchResult<OntologyListItem>;

/** 添加 ontology */
export interface SaveOntologyParams {
  name: string;
  type: datasetTypeEnum;
}

/** 修改 ontology */
export interface UpdateOntologyParams extends SaveOntologyParams {
  id: string;
}

/** 删除 ontology */
export type DeleteOntologyParams = BasicIdParams;

/** 根据 team 查询 ontology */
export interface FindOntologyByTeamParams {
  name: string;
  type: datasetTypeEnum;
}
