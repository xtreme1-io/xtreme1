import { defHttp } from '/@/utils/http/axios';
import {
  GetListParams,
  ClassItem,
  ClassResponse,
  ClassificationItem,
  ClassificationResponse,
  SaveEditClassParams,
  SaveEditClassificationParams,
} from './model/ontologyClassesModel';
import { BasicIdParams } from '/@/api/model/baseModel';

enum Api {
  CLASS = '/class',
  CLASSIFICATION = '/classification',
}

/**
 * 根据 ontologyId 分页查询 class，
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
export const createEditClassApi = (params: SaveEditClassParams) =>
  defHttp.post<null>({
    url: `${Api.CLASS}/save`,
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

/**
 * 根据 name 查询 class -- 目前未使用
 */
export const getClassByNameApi = (params: { ontologyId: string; name?: string }) =>
  defHttp.get<any>({
    url: `${Api.CLASS}/find/${params.ontologyId}?&`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/**
 * 根据 ontologyId 分页查询 classification，
 * 搜索
 */
export const getClassificationApi = (params: GetListParams) =>
  defHttp.get<ClassificationResponse>({
    url: `${Api.CLASSIFICATION}/findByPage`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 添加修改 classification */
export const createEditClassificationApi = (params: SaveEditClassificationParams) =>
  defHttp.post<null>({
    url: `${Api.CLASSIFICATION}/save`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 删除 classification */
export const deleteClassificationApi = (params: BasicIdParams) =>
  defHttp.post<null>({
    url: `${Api.CLASSIFICATION}/delete/${params.id}`,
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
    url: `${Api.CLASSIFICATION}/info/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 根据 name 查询 classification */
