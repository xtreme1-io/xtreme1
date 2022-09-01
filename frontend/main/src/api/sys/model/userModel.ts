import { Team } from '../../business/model/teamModel';

/**
 * @description: Login interface parameters
 */
export interface LoginParams {
  username: string;
  password: string;
  teamId?: string;
}

export interface RoleInfo {
  roleName: string;
  value: string;
}

export interface User {
  id: number | string;
  username: string;
  password: string;
  email: string;
  nickname: string;
  intro: string;
  avatarUrl: string;
  avatarId?: number;
  hasPassword: boolean;
}

/**
 * @description: Login interface return value
 */
export interface LoginResultModel {
  token: string;
  user: User;
  team: Team;
}

/**
 * @description: Get user information return value
 */
export interface GetUserInfoModel {
  id: number | string;
  username: string;
  password: string;
  email: string;
  nickname: string;
  intro: string;
  avatarUrl: string;
  avatarId?: number;
  hasPassword: boolean;
}

export interface GetUserInfoTeamModel {
  user: User;
  teams: Nullable<Team[]>;
}

export interface SignUpParams {
  username: string;
  password: string;
}

export interface LoginConfirmParams {
  email: string;
}
