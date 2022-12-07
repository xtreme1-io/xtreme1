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

export const getAllOntologyApi = (params: { type: string }) =>
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
