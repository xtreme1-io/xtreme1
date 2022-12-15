import { defHttp } from '/@/utils/http/axios';
import {
  OntologyListItem,
  GetOntologyParams,
  SaveOntologyParams,
  UpdateOntologyParams,
  DeleteOntologyParams,
  FindOntologyByTeamParams,
  ResponseOntologyParams,
  ValidateOntologyNameParams,
} from './model/ontologyModel';
import { datasetTypeEnum } from './model/datasetModel';

enum Api {
  ONTOLOGY = '/ontology',
}

/**
 * get/search ontology list
 */
export const getOntologyApi = (params: GetOntologyParams) =>
  defHttp.get<ResponseOntologyParams>({
    url: `${Api.ONTOLOGY}/findByPage`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** create ontology */
export const createOntologyApi = (params: SaveOntologyParams) =>
  defHttp.post<null>({
    url: `${Api.ONTOLOGY}/create`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** update ontology */
export const updateOntologyApi = (params: UpdateOntologyParams) =>
  defHttp.post<null>({
    url: `${Api.ONTOLOGY}/update/${params.id}`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** delete ontology */
export const deleteOntologyApi = (params: DeleteOntologyParams) =>
  defHttp.post<null>({
    url: `${Api.ONTOLOGY}/delete/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const getAllOntologyApi = (params: { type?: datasetTypeEnum }) =>
  defHttp.get<OntologyListItem[]>({
    url: `${Api.ONTOLOGY}/findAll`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/**
 * get ontology detail
 */
export const getOntologyInfoApi = (params: { id: string }) =>
  defHttp.get<OntologyListItem>({
    url: `${Api.ONTOLOGY}/info/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** validate ontology name */
export const validateOntologyNameApi = (params: ValidateOntologyNameParams) =>
  defHttp.get<boolean>({
    url: `${Api.ONTOLOGY}/validateName`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/**
 * get ontology by team
 */
export const getOntologyByTeamApi = (params: FindOntologyByTeamParams) =>
  defHttp.get<OntologyListItem[]>({
    url: `${Api.ONTOLOGY}/find`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const exportClass = (params: any) =>
  // axios.get(`/api${Api.ONTOLOGY}/exportAsJson`, { params });
  defHttp.get<null>({
    url: `${Api.ONTOLOGY}/exportAsJson`,
    params,
    headers: {
      'content-type': 'octet-stream;charset=UTF-8',
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const importClass = (params: any) =>
  defHttp.uploadFile<any>(
    {
      url: `/api${Api.ONTOLOGY}/importByJson`,
      headers: {
        // @ts-ignore
        ignoreCancelToken: true,
      },
    },
    params,
  );

export const mergeClass = (params: any) =>
  defHttp.post<any>({
    url: `${Api.ONTOLOGY}/saveClassAndClassificationBatch`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
