import { BasicPageParams, BasicFetchResult } from '/@/api/model/baseModel';

/** group item params */
export interface groupItem {
  name: string;
  avatarId?: number;
  description?: string;
  id?: number;
}

/** search group params */
export interface getGroupParams extends BasicPageParams {
  name?: string;
}

/** response params */
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

/** group detail response params */
export interface responseGroupInfoParams extends responseGroupItem {
  id: number;
}

/** add member request params */
export interface addMemberParams {
  groupId: number;
  userIds: number[];
}

/** remove member request params */
export interface removeMemberParams {
  groupId: number;
  userIds: number[];
}

/** userGroup response params */
export interface UserGroup {
  userId: number;
  groupIds: number[];
}

/** assign group request params */
export type AssignGroup = UserGroup;

/** validate name request params */
export interface CheckGroup {
  groupId?: string | number;
  groupName: string | undefined;
}
