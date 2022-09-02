import { defHttp } from '/@/utils/http/axios';
import {
  GetListParams,
  ClassItem,
  ClassResponse,
  ClassificationItem,
  ClassificationResponse,
  SaveEditClassParams,
  SaveEditClassificationParams,
  SyncParams,
  ValidateNameParams,
} from './model/datasetOntologyModel';
import { BasicIdParams } from '/@/api/model/baseModel';

enum Api {
  CLASS = '/datasetClass',
  ClASSIFICATION = '/datasetClassification',
}

/**
 * 根据 datasetId 分页查询 class，
 * 搜索
 */
export const getClassApi = (params: GetListParams) =>
  defHttp.get<ClassResponse>({
    url: `${Api.CLASS}/findByPage`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 添加修改 class */
export const createDatasetClassApi = (params: SaveEditClassParams) =>
  defHttp.post<null>({
    url: `${Api.CLASS}/create`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 添加修改 class */
export const updateDatasetClassApi = (params: SaveEditClassParams) =>
  defHttp.post<null>({
    url: `${Api.CLASS}/update/${params.id}`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 删除 class */
export const deleteClassApi = (params: BasicIdParams) =>
  defHttp.post<null>({
    url: `${Api.CLASS}/delete/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/**
 * 根据 id 查询 class 详情，
 * 编辑回显
 */
export const getClassByIdApi = (params: BasicIdParams) =>
  defHttp.get<ClassItem>({
    url: `${Api.CLASS}/info/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 根据 name 查询 class -- 目前未使用 */
export const getClassByNameApi = (params: { ontologyId: string; name?: string }) =>
  defHttp.get<any>({
    url: `${Api.CLASS}/find/${params.ontologyId}?&`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 同步 datasetClass 到 ontology */
export const syncClassToOntologyApi = (params: SyncParams) =>
  defHttp.post<null>({
    url: `${Api.CLASS}/synchronizeToOntology`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 校验 dataset class 重名 */
export const validateClassNameApi = (params: ValidateNameParams) =>
  defHttp.get<boolean>({
    url: `${Api.CLASS}/validateName`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

// -------------

/**
 * 根据 datasetId 分页查询 classification，
 * 搜索
 */
export const getClassificationApi = (params: GetListParams) =>
  defHttp.get<ClassificationResponse>({
    url: `${Api.ClASSIFICATION}/findByPage`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 添加修改 classification */
export const createDatasetClassificationApi = (params: SaveEditClassificationParams) =>
  defHttp.post<null>({
    url: `${Api.ClASSIFICATION}/create`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 添加修改 classification */
export const updateDatasetClassificationApi = (params: SaveEditClassificationParams) =>
  defHttp.post<null>({
    url: `${Api.ClASSIFICATION}/update/${params.id}`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 删除 classification */
export const deleteClassificationApi = (params: BasicIdParams) =>
  defHttp.post<null>({
    url: `${Api.ClASSIFICATION}/delete/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/**
 * 根据 id 查询 classification 详情，
 * 编辑回显
 */
export const getClassificationByIdApi = (params: BasicIdParams) =>
  defHttp.get<ClassificationItem>({
    url: `${Api.ClASSIFICATION}/info/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 根据 name 查询 classification -- 目前未使用 */
export const getClassificationByNameApi = (params: { ontologyId: string; name?: string }) =>
  defHttp.get<any>({
    url: `${Api.ClASSIFICATION}/find/${params.ontologyId}?&`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 同步 datasetClassification 到 ontology */
export const syncClassificationToOntologyApi = (params: SyncParams) =>
  defHttp.post<null>({
    url: `${Api.ClASSIFICATION}/synchronizeToOntology`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 校验 datasetClassification 重名 */
export const validateClassificationNameApi = (params: ValidateNameParams) =>
  defHttp.get<boolean>({
    url: `${Api.ClASSIFICATION}/validateName`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const getAllClass = (params: GetListParams) =>
  defHttp.get<ClassResponse>({
    url: `${Api.CLASS}/find`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
