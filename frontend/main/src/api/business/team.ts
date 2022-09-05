import { defHttp } from '/@/utils/http/axios';
import { Api as UserApi } from '../sys/user';
import {
  CreateParams,
  TeamListParams,
  Team,
  TeamUserList,
  ApproveParams,
  TeamMemberListResultModel,
  TeamListResultModel,
  Role,
  SwitchTeamResult,
  // Tag
  TagItem,
  CategoryItem,
  // TagResultModel,
  UserTag,
  AssignTag,
  responseUserGroupTagParams,
} from './model/teamModel';
import { BasicIdParams } from '/@/api/model/baseModel';

enum Api {
  TEAM = '/user',
  TAG = '/user/tag',
}

export const teamList = () =>
  defHttp.get<TeamListResultModel>({
    url: `${Api.TEAM}/list`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
/**
 * @description: Get sample list value
 */
export const createTeamApi = (params: CreateParams) =>
  defHttp.post<{ id: number; name: string }>({
    url: `${Api.TEAM}/create`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const getTeamInfoApi = (params?: { teamId?: string }) =>
  defHttp.get<Team>({
    url: `${Api.TEAM}/get`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const joinTeamApi = (params: { teamId: string | number }) =>
  defHttp.post<Team>({
    url: `${Api.TEAM}/join/${params.teamId}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const teamListApi = (params?: TeamListParams) =>
  defHttp.get<TeamMemberListResultModel>({
    url: `${Api.TEAM}/list`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const approveListApi = (params) =>
  defHttp.get<TeamUserList>({
    url: `${Api.TEAM}/list/waitApproved`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const approveActionApi = (params: ApproveParams) =>
  defHttp.post<TeamUserList>({
    url: `${Api.TEAM}/approve`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const removeMemberActionApi = (params: { userIds: (string | number)[] }) =>
  defHttp.post<TeamUserList>({
    url: `${Api.TEAM}/delete`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const roleListApi = () =>
  defHttp.get<Role[]>({
    url: `${UserApi.ROLE}/find`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const getTemplate = () =>
  defHttp.get<Role[]>({
    url: `${Api.TEAM}/export/sample`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const importUser = (params) =>
  defHttp.uploadFile<any>(
    {
      url: `/api${Api.TEAM}/upload/invite`,
    },
    params,
  );

export const changeRoleApi = (params: { roleId: string | number; userId: string | number }) =>
  defHttp.post<null>({
    url: `${UserApi.ROLE}/changeRole`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const inviteMemberApi = (params: {
  members: { email: string; roleId: string | number }[];
}) =>
  defHttp.post<{ roles: Role[] }>({
    url: `${Api.TEAM}/invite`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const transferApi = (params: { roleId: string | number; userId: string | number }) =>
  defHttp.post<null>(
    {
      url: `${UserApi.ROLE}/transferOwner`,
      params,
      headers: {
        // @ts-ignore
        ignoreCancelToken: true,
      },
    },
    {
      errorMessageMode: 'modal',
    },
  );

export const cancelInviteApi = (params: { ids: string[] | number[] }) =>
  defHttp.post<null>({
    url: `${Api.TEAM}/member/cancel`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const switchTeam = (params: { id: number; autoSwitch?: number }) =>
  defHttp.get<SwitchTeamResult>({
    url: `${Api.TEAM}/switch/${params.id}`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const teamPendingApi = (params?: TeamListParams) =>
  defHttp.get<TeamMemberListResultModel>({
    url: `${Api.TEAM}/member/pending/list`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const disbandTeamApi = (params) =>
  defHttp.post<SwitchTeamResult>({
    url: `${Api.TEAM}/remove/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** ------- Tag Start ------- */

/** get tag tree */
export const getTagTreeApi = () =>
  defHttp.get<CategoryItem[]>({
    url: `${Api.TAG}/tree`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** create/save TagTree */
export const createEditTagApi = (params: TagItem) =>
  defHttp.post<TagItem | CategoryItem>({
    url: `${Api.TAG}/save`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** delete Tag | Category */
export const deleteTagApi = (params: BasicIdParams) =>
  defHttp.post<null>({
    url: `${Api.TAG}/delete/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** get userTag */
export const getUserTagListApi = (params: { userIds: string }) =>
  defHttp.get<UserTag[]>({
    url: `${Api.TAG}/userTag/list`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** assign tag */
export const assignTagApi = (params: AssignTag[]) =>
  defHttp.post<null>({
    url: `${Api.TAG}/assignTags`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** ------- Tag End ------- */

/** get user | group | tag */
export const getUserGroupTagApi = (params: { userId: string }) =>
  defHttp.get<responseUserGroupTagParams>({
    url: `${UserApi.USER}/groupTagInfo`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const updateTeamApi = (params: any) =>
  defHttp.post<null>({
    url: `${Api.TEAM}/update`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
