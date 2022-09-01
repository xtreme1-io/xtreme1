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

/** 获取角色列表 表格*/
export const getRoleApi = (params: getRoleParams) =>
  defHttp.get<responseRoleParams>({
    url: `${Api.ROLE}/findAll`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 获取角色列表 下拉框 */
export const getRoleSelectApi = () =>
  defHttp.get<roleItem[]>({
    url: `${Api.ROLE}/find`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 修改单个用户角色 */
export const changeRoleApi = (params: changeRoleParams) =>
  defHttp.post<null>({
    url: `${Api.ROLE}/changeRole`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 修改多个用户角色 */
export const changeRoleBatchApi = (params: changeRoleBatchParams) =>
  defHttp.post<null>({
    url: `${Api.ROLE}/changeRoleBatch`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 创建角色 */
export const createRoleApi = (params: createEditParams) =>
  defHttp.post<null>({
    url: `${Api.ROLE}/create`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 修改角色 */
export const editRoleApi = (params: createEditParams) =>
  defHttp.post<null>({
    url: `${Api.ROLE}/edit`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 删除角色 */
export const deleteRoleApi = (params: { roleId: number }) =>
  defHttp.post<null>({
    url: `${Api.ROLE}/delete/${params.roleId}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 查询已存在的角色的权限 */
export const getPrivilegeByRoleApi = (params: { roleId: string | number }) =>
  defHttp.get<number[]>({
    url: `${Api.ROLE}/getPrivilegeByRole/${params.roleId}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 查询角色的权限树 */
export const getPrivilegeTreeByRoleApi = (params: { roleId: string | number }) =>
  defHttp.get<responsePrivilegeParams>({
    url: `${Api.ROLE}/getPrivilegeTreeByRole/${params.roleId}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 查询所有权限 */
export const getAllPrivilegesApi = () =>
  defHttp.get<responsePrivilegeParams>({
    url: `${Api.PRIVILEGE}/findAll`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 转移团队所有人 */
export const transferOwnerApi = (params: changeRoleParams) =>
  defHttp.post<null>({
    url: `${Api.ROLE}/transferOwner`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
