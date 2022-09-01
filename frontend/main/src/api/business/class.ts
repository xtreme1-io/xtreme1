import { defHttp } from '/@/utils/http/axios';
import {
  ClassListParams,
  ClassListGetResultModel,
  createEditClassParams,
  ClassItem,
} from './model/classModel';
import { BasicIdParams } from '../model/baseModel';

enum Api {
  CLASS = '/annotation/class',
}

export const classListApi = (params: ClassListParams) =>
  defHttp.get<ClassListGetResultModel>({
    url: `${Api.CLASS}/findByPage`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const deleteClassApi = (params: BasicIdParams) =>
  defHttp.post<null>({
    url: `${Api.CLASS}/delete/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const createEditClassApi = (params: createEditClassParams) =>
  defHttp.post<null>({
    url: `${Api.CLASS}/save`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const getDetailApi = (params: BasicIdParams) =>
  defHttp.get<ClassItem>({
    url: `${Api.CLASS}/info/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
