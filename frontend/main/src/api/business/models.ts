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
} from './model/modelsModel';

enum Api {
  Model = '/dataset/model',
  ModelRun = '/dataset/modelRun',
}

/** 查询全部 Models */
export const getModelAllApi = (params: GetModelParams) =>
  defHttp.get<ResponseModelParams>({
    url: `${Api.Model}/list`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 根据 ID 查询 model */
export const getModelByIdApi = (params: BasicIdParams) =>
  defHttp.get<ModelListItem>({
    url: `${Api.Model}/info/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 添加修改 Models */
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

/** 分页查询 model run 表格 */
export const getModelRunApi = (params: GetModelRunParams) =>
  defHttp.get<ResponseModelRunParams>({
    url: `${Api.ModelRun}/findModelRunRecordByPage`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 查询team内所有model run记录*/
export const getAllModelRunRecordApi = (params: GetModelRunParams) =>
  defHttp.get<ResponseModelRunParams>({
    url: `${Api.ModelRun}/findAllModelRunRecord`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 创建一个 model run 任务 */
export const createModelRunApi = (params: runModelRunParams) =>
  defHttp.post<null>({
    url: `${Api.Model}/modelRun`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 重新执行 model run */
export const rerunModelRunApi = (params: BasicIdParams) =>
  defHttp.post<null>({
    url: `${Api.Model}/reRun`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 根据 ID 删除 models */
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
