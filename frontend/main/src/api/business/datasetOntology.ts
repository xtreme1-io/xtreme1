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

/** get class by datasetId */
export const getClassApi = (params: GetListParams) =>
  defHttp.get<ClassResponse>({
    url: `${Api.CLASS}/findByPage`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** create class */
export const createDatasetClassApi = (params: SaveEditClassParams) =>
  defHttp.post<null>({
    url: `${Api.CLASS}/create`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** update class */
export const updateDatasetClassApi = (params: SaveEditClassParams) =>
  defHttp.post<null>({
    url: `${Api.CLASS}/update/${params.id}`,
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

/** sync datasetClass to ontology */
export const syncClassToOntologyApi = (params: SyncParams) =>
  defHttp.post<null>({
    url: `${Api.CLASS}/synchronizeToOntology`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** validate dataset class name */
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

/** get classification by datasetId */
export const getClassificationApi = (params: GetListParams) =>
  defHttp.get<ClassificationResponse>({
    url: `${Api.ClASSIFICATION}/findByPage`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** create classification */
export const createDatasetClassificationApi = (params: SaveEditClassificationParams) =>
  defHttp.post<null>({
    url: `${Api.ClASSIFICATION}/create`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** update classification */
export const updateDatasetClassificationApi = (params: SaveEditClassificationParams) =>
  defHttp.post<null>({
    url: `${Api.ClASSIFICATION}/update/${params.id}`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** delete classification */
export const deleteClassificationApi = (params: BasicIdParams) =>
  defHttp.post<null>({
    url: `${Api.ClASSIFICATION}/delete/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** get classification detail by id */
export const getClassificationByIdApi = (params: BasicIdParams) =>
  defHttp.get<ClassificationItem>({
    url: `${Api.ClASSIFICATION}/info/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** get classification by name */
export const getClassificationByNameApi = (params: { ontologyId: string; name?: string }) =>
  defHttp.get<any>({
    url: `${Api.ClASSIFICATION}/find/${params.ontologyId}?&`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** sync datasetClassification to ontology */
export const syncClassificationToOntologyApi = (params: SyncParams) =>
  defHttp.post<null>({
    url: `${Api.ClASSIFICATION}/synchronizeToOntology`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** validate datasetClassification name */
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
