import { defHttp } from '/@/utils/http/axios';
import { BasicIdParams } from '/@/api/model/baseModel';
import {
  GetModelParams,
  ResponseModelParams,
  ModelListItem,
  SaveModelParams,
  // modelRun
  GetModelRunParams,
  ResponseModelRunParams,
  runModelRunParams,
  editParams,
  setClassParams,
  ModelDataCountParams,
  testModelUrlConnectioParams,
} from './model/modelsModel';

enum Api {
  Model = '/model',
  ModelRun = '/modelRun',
  ModelQuota = '/dataset/modelQuota',
  DATASET = '/dataset',
}

/** get all Models */
export const getModelAllApi = (params: GetModelParams) =>
  defHttp.get<ResponseModelParams>({
    url: `${Api.Model}/list`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** SET  Models  */
export const setClassModelApi = (params: setClassParams) =>
  defHttp.post<null>({
    url: `${Api.Model}/configurationModelClass`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
/** add  Models  */
// TODO
export const addModelApi = (params: GetModelParams) =>
  defHttp.post<null>({
    url: `${Api.Model}/add`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** delete  Models  */

export const deleteModelApi = (id: number) =>
  defHttp.post<null>({
    url: `${Api.Model}/delete/${id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
/** edit  Models  */
export const editModelApi = (params: editParams) =>
  defHttp.post<ResponseModelParams>({
    url: `${Api.Model}/update`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** add  Models  */
export const testModelUrlConnectionApi = (params: testModelUrlConnectioParams) =>
  defHttp.post<null>({
    url: `${Api.Model}/testModelUrlConnection`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** get  Models  list*/
export const getModelPageApi = (params: GetModelParams) =>
  defHttp.get<ResponseModelParams>({
    url: `${Api.Model}/page`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** get model by id */
export const getModelByIdApi = (params: BasicIdParams) =>
  defHttp.get<ModelListItem>({
    url: `${Api.Model}/info/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** get model by id */
export const getModelDataCountApi = (params: ModelDataCountParams) =>
  defHttp.get<ModelListItem>({
    url: `${Api.Model}/modelRun/dataCount`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** create/save Models */
export const createEditModelApi = (params: SaveModelParams) =>
  defHttp.post<null>({
    url: `${Api.Model}/save`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

// ModelRun

/** get model run table */
export const getModelRunApi = (params: GetModelRunParams) =>
  defHttp.get<ResponseModelRunParams>({
    url: `${Api.ModelRun}/findModelRunRecordByPage`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** get model run by team*/
export const findModelRunFilterDatasetNameApi = (params: { datasetName: string }) =>
  defHttp.get<ResponseModelRunParams>({
    url: `${Api.ModelRun}/findModelRunFilterDatasetName`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** get model run by team*/
export const getAllModelRunRecordApi = (params: GetModelRunParams) =>
  defHttp.get<ResponseModelRunParams>({
    url: `${Api.ModelRun}/findAllModelRunRecord`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** create model run */
export const createModelRunApi = (params: runModelRunParams) =>
  defHttp.post<null>({
    url: `${Api.Model}/modelRun`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** reRun model */
export const rerunModelRunApi = (params: BasicIdParams) =>
  defHttp.post<null>({
    url: `${Api.Model}/reRun`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** delete models by id */
export const deleteModelRunByIdApi = (params: BasicIdParams) =>
  defHttp.post<null>({
    url: `${Api.ModelRun}/delete/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const modelRunRecordListApi = () =>
  defHttp.get<ModelListItem[]>({
    url: `${Api.ModelRun}/findAllModelRunRecord`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const getReportByDataset = (params: { id: string }) =>
  defHttp.get<ModelListItem[]>({
    url: `${Api.ModelRun}/findModelRunRecordByDatasetId/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 查询模型配额 */
export const getModelQuotaApi = () =>
  // TODO TS类型
  defHttp.get<any>({
    url: `${Api.ModelQuota}/queryModelQuota`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 获取 team 下所有数据集 */
export const getAllDataset = (params: { datasetTypes: string }) =>
  defHttp.get<Array<{ id: string; name: string }>>({
    url: `${Api.DATASET}/findByType`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
