import { defHttp } from '/@/utils/http/axios';
import {
  groupItem,
  getGroupParams,
  responseGroupItem,
  responseGroupParams,
  responseGroupInfoParams,
  addMemberParams,
  removeMemberParams,
  UserGroup,
  AssignGroup,
  CheckGroup,
} from './model/groupModel';
import { BasicIdParams } from '/@/api/model/baseModel';

enum Api {
  GROUP = '/user/group',
}

/** get group list */
export const getGroupApi = (params: getGroupParams) =>
  defHttp.get<responseGroupParams>({
    url: `${Api.GROUP}/findByPage`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** get group detail */
export const getGroupInfoApi = (params: BasicIdParams) =>
  defHttp.get<responseGroupInfoParams>({
    url: `${Api.GROUP}/info/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** save group */
export const saveGroupApi = (params: groupItem) =>
  defHttp.post<null>({
    url: `${Api.GROUP}/add`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** edit group */
export const editGroupApi = (params: groupItem) =>
  defHttp.post<null>({
    url: `${Api.GROUP}/update/${params.id}`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** delete group */
export const deleteGroupApi = (params: BasicIdParams) =>
  defHttp.post<null>({
    url: `${Api.GROUP}/delete/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** add member */
export const addMemberApi = (params: addMemberParams) =>
  defHttp.post<null>({
    url: `${Api.GROUP}/addMembers`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** remove member */
export const removeMemberApi = (params: removeMemberParams) =>
  defHttp.post<null>({
    url: `${Api.GROUP}/removeMembers`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** get all group */
export const getGroupAllApi = () =>
  defHttp.get<responseGroupItem[]>({
    url: `${Api.GROUP}/findAll`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** get user group */
export const getUserGroupApi = (params: { userIds: string }) =>
  defHttp.get<UserGroup[]>({
    url: `${Api.GROUP}/userGroup/list`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** assign group */
export const assignGroupApi = (params: AssignGroup[]) =>
  defHttp.post<null>({
    url: `${Api.GROUP}/assignGroups`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** validate name */
export const checkGroupNameExistApi = (params: CheckGroup) =>
  defHttp.get<boolean>({
    url: `${Api.GROUP}/checkGroupNameExist`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
