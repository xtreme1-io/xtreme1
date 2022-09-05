import { BasicPageParams, BasicFetchResult } from '/@/api/model/baseModel';

/** userList request params */
export interface getRoleParams extends BasicPageParams {
  name?: string;
}

/** userList response params */
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

/** change role params */
export interface changeRoleParams {
  userId: number;
  roleId: string;
}
/** change role batch params */
export interface changeRoleBatchParams {
  userIds: number[];
  roleId: string;
}

/** create/save role params */
export interface createEditParams {
  id?: number;
  name: string;
  description?: string;
  privilegeIds: number[];
}

/** get all privilege params */
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
