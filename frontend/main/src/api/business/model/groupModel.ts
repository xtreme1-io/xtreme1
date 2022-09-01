import { BasicPageParams, BasicFetchResult } from '/@/api/model/baseModel';

/** 保存修改分组 请求参数 */
export interface groupItem {
  name: string;
  avatarId?: number;
  description?: string;
  id?: number;
}

/** 分页查询分组 请求参数 */
export interface getGroupParams extends BasicPageParams {
  name?: string;
}

/** 分页查询分组 响应参数 */
export interface responseGroupItem {
  id: number;
  createdBy: number;
  name: string;
  avatarId: Nullable<number>;
  groupAvatarUrl: Nullable<string>;
  description: Nullable<string>;
  createdAt: string;
  createdName: string;
  createdAvatarUrl: Nullable<string>;
  groupMemberCount: string;
  members: Nullable<memberItem[]>;
}
export interface memberItem {
  nickName: string;
  avatarUrl: Nullable<string>;
}
export type responseGroupParams = BasicFetchResult<responseGroupItem>;

/** 分组详情 响应参数 */
export interface responseGroupInfoParams extends responseGroupItem {
  id: number;
}

/** 添加人员 请求参数 */
export interface addMemberParams {
  groupId: number;
  userIds: number[];
}

/** 移除人员 请求参数 */
export interface removeMemberParams {
  groupId: number;
  userIds: number[];
}

/** 查询用户分组 响应参数 */
export interface UserGroup {
  userId: number;
  groupIds: number[];
}

/** 分配分组 请求参数 */
export type AssignGroup = UserGroup;

/** 检查名称重复 请求参数 */
export interface CheckGroup {
  groupId?: string | number;
  groupName: string | undefined;
}
