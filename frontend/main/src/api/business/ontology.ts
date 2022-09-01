import { defHttp } from '/@/utils/http/axios';
import {
  OntologyListItem,
  GetOntologyParams,
  SaveOntologyParams,
  UpdateOntologyParams,
  DeleteOntologyParams,
  FindOntologyByTeamParams,
  ResponseOntologyParams,
} from './model/ontologyModel';

enum Api {
  ONTOLOGY = '/annotation/ontology',
}

/**
 * 分页查询 ontology，
 * 搜索
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

/** 添加修改 ontology */
export const createEditOntologyApi = (params: SaveOntologyParams | UpdateOntologyParams) =>
  defHttp.post<null>({
    url: `${Api.ONTOLOGY}/save`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 删除 ontology */
export const deleteOntologyApi = (params: DeleteOntologyParams) =>
  defHttp.post<null>({
    url: `${Api.ONTOLOGY}/delete/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/**
 * 根据 team 查询 ontology，
 * datasetOntology 页面的 copy、sync
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

/**
 * 查询 ontology 详情
 * 详情页面获取类型
 */
export const getOntologyInfoApi = (params: { id: string }) =>
  defHttp.get<OntologyListItem>({
    url: `${Api.ONTOLOGY}/info/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 验证 ontology 名称是否重复 */
export const validateNameApi = (params: { name: string }) =>
  defHttp.post<boolean>({
    url: `${Api.ONTOLOGY}/validateName/${params.name}`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
