import { User, GetUserInfoModel } from '../../sys/model/userModel';
import { BasicFetchResult, BasicPageParams } from '/@/api/model/baseModel';
import { RoleEnum } from '/@/enums/roleEnum';
import { responseGroupItem } from './groupModel';
export type CreateParams = {
  name: string;
};

// export type TeamListParams = BasicPageParams;

/** team member request params */
export interface TeamListParams extends BasicPageParams {
  isIncludeCurrentUser?: boolean;
  nickname?: string;
  tagIds?: number[];
  groupIds?: number[];
  roleIds?: number[];
  status?: TeamStatusEnum;
  excludeGroupId?: number;
}

export interface ApproveParams {
  userIds: (string | number)[];
  agree: number;
}

export interface TeamUser {
  active: TeamStatusEnum;
  id: string | number;
  status: TeamStatusEnum;
  user: User;
  role: Role;
  team: Team;
}

export type TeamUserList = TeamUser[];

export interface Role {
  id: number | string;
  name: RoleEnum;
}

export enum TeamStatusEnum {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  JOINING = 'JOINING',
  REJECT = 'REJECT',
  CANCEL = 'CANCEL',
}
export interface Team {
  id: number | string;
  name: string;
  role?: Role;
  status: TeamStatusEnum;
  isDefaultTeam?: boolean;
  inviteCode: string;
}

export interface SwitchTeamResult extends GetUserInfoModel {
  token: string;
}

export type TeamMemberListResultModel = BasicFetchResult<TeamUser>;

export type TeamListResultModel = Team[];

/** ------- Tag Start ------- */

export enum ETagType {
  TAG = 'TAG',
  CATEGORY = 'CATEGORY',
}

/** create/save tag params */
export interface TagItem {
  id?: string | number;
  name: string;
  type: ETagType;
  parentId: string | number;
  color?: string;
  weight?: number;
  isEdit?: boolean;
  key?: string;
}

/** get tagTree response params */
export interface CategoryItem {
  id?: string | number;
  name: string;
  type: ETagType;
  parentId: string | number;
  weight?: number;
  isEdit?: boolean;
  key?: string;
  children: TagItem[];
}

export type TagResultModel = BasicFetchResult<CategoryItem>;

/** get user tag response params */
export interface UserTagList {
  userId: string;
}

/** get user tag response params */
export interface UserTag {
  userId: number | string;
  tagIds: number[];
}

/** assign tag params */
export type AssignTag = UserTag;

/** ------- Tag End ------- */

/** search user | group | tag response */

export interface responseUserGroupTagParams {
  userDTO: User;
  groups: responseGroupItem[];
  tags: TagItem[];
}
