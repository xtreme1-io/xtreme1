import { BasicPageParams, BasicIdParams, BasicFetchResult } from '/@/api/model/baseModel';
import { datasetTypeEnum } from './ontologyClassesModel';

/** list item */
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

/** list request params */
export interface GetOntologyParams extends BasicPageParams {
  name?: string;
}

/** list response params */
export type ResponseOntologyParams = BasicFetchResult<OntologyListItem>;

/** create ontology */
export interface SaveOntologyParams {
  name: string;
  type: datasetTypeEnum;
}

/** update ontology */
export interface UpdateOntologyParams extends SaveOntologyParams {
  id: string;
}

/** delete ontology */
export type DeleteOntologyParams = BasicIdParams;

/** get ontology by team name */
export interface FindOntologyByTeamParams {
  name: string;
  type: datasetTypeEnum;
}
