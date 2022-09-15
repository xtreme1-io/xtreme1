import { datasetTypeEnum } from './datasetModel';
import { StageTypeEnum } from './taskModel';
import { BasicPageParams, BasicFetchResult } from '/@/api/model/baseModel';

export enum ActionTypeEnum {
  CLAIM = 'CLAIM',
  CONTINUE = 'CONTINUE',
}
export interface claimListItem {
  id: number;
  datasetId: number;
  name: string;
  datasetName: string;
  datasetType: datasetTypeEnum;
  stageTypeList: StageTypeEnum[];
  type: ActionTypeEnum;
}

export interface ClaimParams {
  taskId: number;
  type: StageTypeEnum;
}

export interface ClaimActionModel {
  batchId: number;
  stageId: number;
}

export type ListParams = BasicPageParams;
export type ClaimListGetResultModel = BasicFetchResult<claimListItem>;
