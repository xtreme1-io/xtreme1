import { BasicPageParams, BasicFetchResult } from '/@/api/model/baseModel';
import { datasetTypeEnum } from './ontologyClassesModel';

/** Models List Start */
/** 卡片列表项 */
export interface ModelListItem {
  id: number;
  teamId: Nullable<string>;
  name: string;
  runNo: Nullable<number>;
  runCount: number;
  isDeleted: boolean;
  enable: boolean;
  description: Nullable<string>;
  scenario: Nullable<string>;
  classes: Nullable<any[]>;
  createdAt: Date;
  createdBy: string | number;
  creatorName: string;
  datasetType: datasetTypeEnum;
  isInteractive: boolean;
  img: string;
}
/** 分页查询 - 请求参数 */
export interface GetModelParams extends BasicPageParams {
  datasetType?: datasetTypeEnum;
  isInteractive?: 0 | 1;
}

/** 分页查询 - 响应参数 */
export type ResponseModelParams = BasicFetchResult<ModelListItem>;

/** 添加 Models */
export interface SaveModelParams {
  name: string;
}
/** Models List End */

/** Runs Start */
/** status 状态枚举 */
export enum statusEnum {
  started = 'STARTED',
  running = 'RUNNING',
  success = 'SUCCESS',
  failure = 'FAILURE',
  SUCCESS_WITH_ERROR = 'SUCCESS_WITH_ERROR',
}
/** run表格项 */
export interface ModelRunItem {
  id: number;
  teamId: number;
  modelId: number;
  datasetId: number;
  datasetName: string;
  createdAt: Date;
  status: statusEnum;
  runNo: string;
  errorReason: Nullable<string>;
  parameter: string;
}
/** 请求 run表格 参数 */
export interface GetModelRunParams extends BasicPageParams {
  modelId?: number;
}

/** 响应 run表格 参数 */
export type ResponseModelRunParams = BasicFetchResult<ModelRunItem>;

/** PreModel 参数 */
export interface PreModelParam {
  minConfidence: number;
  maxConfidence: number;
  classes: string[];
}

/** 执行 modelRun任务 参数 */
export interface runModelRunParams {
  datasetId: number;
  modelId: number;
  resultFilterParam: Nullable<PreModelParam>;
}
/** Runs End */
