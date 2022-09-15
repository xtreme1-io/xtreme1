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

/** get class by ontologyId */
export const getClassApi = (params: GetListParams) =>
  defHttp.get<ClassResponse>({
    url: `${Api.CLASS}/findByPage`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** create/save class */
export const createEditClassApi = (params: SaveEditClassParams) =>
  defHttp.post<null>({
    url: `${Api.CLASS}/save`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** delete class */
export const deleteClassApi = (params: BasicIdParams) =>
  defHttp.post<null>({
    url: `${Api.CLASS}/delete/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** get class detail by id */
export const getClassByIdApi = (params: BasicIdParams) =>
  defHttp.get<ClassItem>({
    url: `${Api.CLASS}/info/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** get class by name */
export const getClassByNameApi = (params: { ontologyId: string; name?: string }) =>
  defHttp.get<any>({
    url: `${Api.CLASS}/find/${params.ontologyId}?&`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** get classification by ontologyId */
export const getClassificationApi = (params: GetListParams) =>
  defHttp.get<ClassificationResponse>({
    url: `${Api.CLASSIFICATION}/findByPage`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** create/save classification */
export const createEditClassificationApi = (params: SaveEditClassificationParams) =>
  defHttp.post<null>({
    url: `${Api.CLASSIFICATION}/save`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** delete classification */
export const deleteClassificationApi = (params: BasicIdParams) =>
  defHttp.post<null>({
    url: `${Api.CLASSIFICATION}/delete/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** get classification detail by id */
export const getClassificationByIdApi = (params: BasicIdParams) =>
  defHttp.get<ClassificationItem>({
    url: `${Api.CLASSIFICATION}/info/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
