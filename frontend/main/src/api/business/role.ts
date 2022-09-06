import { defHttp } from '/@/utils/http/axios';
import {
  roleItem,
  getRoleParams,
  responseRoleParams,
  changeRoleParams,
  changeRoleBatchParams,
  createEditParams,
  responsePrivilegeParams,
} from './model/roleModel';

enum Api {
  ROLE = '/user/role',
  PRIVILEGE = '/user/privilege',
}

/** get role list */
export const getRoleApi = (params: getRoleParams) =>
  defHttp.get<responseRoleParams>({
    url: `${Api.ROLE}/findAll`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** get role select list */
export const getRoleSelectApi = () =>
  defHttp.get<roleItem[]>({
    url: `${Api.ROLE}/find`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** change role */
export const changeRoleApi = (params: changeRoleParams) =>
  defHttp.post<null>({
    url: `${Api.ROLE}/changeRole`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** change roles */
export const changeRoleBatchApi = (params: changeRoleBatchParams) =>
  defHttp.post<null>({
    url: `${Api.ROLE}/changeRoleBatch`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** create role */
export const createRoleApi = (params: createEditParams) =>
  defHttp.post<null>({
    url: `${Api.ROLE}/create`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** edit role */
export const editRoleApi = (params: createEditParams) =>
  defHttp.post<null>({
    url: `${Api.ROLE}/edit`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** delete role */
export const deleteRoleApi = (params: { roleId: number }) =>
  defHttp.post<null>({
    url: `${Api.ROLE}/delete/${params.roleId}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** get privilege by role */
export const getPrivilegeByRoleApi = (params: { roleId: string | number }) =>
  defHttp.get<number[]>({
    url: `${Api.ROLE}/getPrivilegeByRole/${params.roleId}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** get privilege tree */
export const getPrivilegeTreeByRoleApi = (params: { roleId: string | number }) =>
  defHttp.get<responsePrivilegeParams>({
    url: `${Api.ROLE}/getPrivilegeTreeByRole/${params.roleId}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** get all privilege */
export const getAllPrivilegesApi = () =>
  defHttp.get<responsePrivilegeParams>({
    url: `${Api.PRIVILEGE}/findAll`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** transfer owner */
export const transferOwnerApi = (params: changeRoleParams) =>
  defHttp.post<null>({
    url: `${Api.ROLE}/transferOwner`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
