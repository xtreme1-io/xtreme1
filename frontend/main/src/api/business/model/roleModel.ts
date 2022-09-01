import { BasicPageParams, BasicFetchResult } from '/@/api/model/baseModel';

/** 获取角色列表 请求参数 */
export interface getRoleParams extends BasicPageParams {
  name?: string;
}

/** 获取角色列表 响应参数 */
export interface roleItem {
  id: number;
  name: string;
  teamId: number;
  description: string;
  isDefault: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: Nullable<string>;
  userCount?: Nullable<number>;
}
export type responseRoleParams = BasicFetchResult<roleItem>;

/** 修改用户角色 请求参数 */
export interface changeRoleParams {
  userId: number;
  roleId: string;
}
/** 批量修改用户角色 请求参数 */
export interface changeRoleBatchParams {
  userIds: number[];
  roleId: string;
}

/** 创建\修改角色 请求参数 */
export interface createEditParams {
  id?: number;
  name: string;
  description?: string;
  privilegeIds: number[];
}

/** 查询所有权限 响应参数 */
export interface responsePrivilegeParams {
  id: number;
  children: responsePrivilegeItem[];
}
// export interface responsePrivilegeItem {
//   id: number;
//   name: string;
//   parentId: number;
//   weight: number;
//   description?: string;
//   children?: responsePrivilegeItem[];
//   isCheck?: boolean;
// }

export interface responsePrivilegeItem {
  id: number;
  name: string;
  parentId: number;
  weight: number;
  children: PrivilegeItem2[];
  isCheck?: boolean;
}
export interface PrivilegeItem2 {
  id: number;
  name: string;
  parentId: number;
  weight: number;
  children: PrivilegeItem3[];
  isCheck?: boolean;
}
export interface PrivilegeItem3 {
  id: number;
  name: string;
  parentId: number;
  weight: number;
  children: PrivilegeItem3[];
  dependenceChildren: Nullable<number[]>;
  dependenceParents: Nullable<number[]>;
  description?: string;
  isCheck?: boolean;
}
