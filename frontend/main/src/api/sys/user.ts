import { defHttp } from '/@/utils/http/axios';
import {
  LoginParams,
  LoginResultModel,
  GetUserInfoModel,
  SignUpParams,
  GetUserInfoTeamModel,
  LoginConfirmParams,
} from './model/userModel';
// import { BasicIdParams } from '/@/api/model/baseModel';
import { ErrorMessageMode } from '/#/axios';

export enum Api {
  GetUserInfo = `/user/user/permission`,
  GetPermCode = '/user/user/permission',
  USER = '/user',
  AUTH = '/user',
  ROLE = '/user/role',
}

export function loginConfirmApi(params: LoginConfirmParams, mode: ErrorMessageMode = 'none') {
  return defHttp.get<null>(
    {
      url: `${Api.AUTH}/login/confirm`,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

/**
 * @description: user login api
 */
export function loginApi(params: LoginParams, mode: ErrorMessageMode = 'modal') {
  return defHttp.post<LoginResultModel>(
    {
      url: `${Api.AUTH}/login`,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

/**
 * @description: getUserInfo
 */
export function getUserInfo() {
  return defHttp.get<GetUserInfoModel>({ url: `${Api.USER}/logged` }, { errorMessageMode: 'none' });
}

export function getPermCode() {
  return defHttp.get<string[]>({ url: Api.GetPermCode });
}

export function doLogout() {
  return defHttp.get({ url: `${Api.USER}/logout` });
}

export function signUpEmail(params: { email: string }) {
  return defHttp.get<null>(
    {
      url: `${Api.AUTH}/register/email`,
      params,
      headers: {
        // @ts-ignore
        ignoreCancelToken: true,
      },
    },
    {
      errorMessageMode: 'none',
    },
  );
}

export function signUpApi(params: SignUpParams) {
  return defHttp.post<LoginResultModel>({
    url: `${Api.AUTH}/register`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
}

export const resetPwdSendEmail = (params: { email: string }) =>
  defHttp.get<null>({
    url: `${Api.AUTH}/resetPassword/email`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const resetPwdApi = (params: { token: string; newPassword: string }) =>
  defHttp.post<null>({
    url: `${Api.AUTH}/resetPassword`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const updateUser = (params: {
  user: {
    avatarId?: number;
    nickname?: string;
    newPassword?: string;
    avatarUrl?: string;
    password?: string;
  };
}) =>
  defHttp.post<null>({
    url: `${Api.USER}/update`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** upload avatar */
export const uploadAvatar = (params: any) =>
  defHttp.uploadFile<any>(
    {
      url: `/api${Api.USER}/uploadAvatar`,
      headers: {
        // @ts-ignore
        ignoreCancelToken: true,
      },
    },
    params,
  );

export const fetchUser = (params: { id: string | number }) =>
  defHttp.get<GetUserInfoTeamModel>({
    url: `${Api.USER}/info/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const fetchPermission = () =>
  defHttp.get<string[]>({
    url: `${Api.USER}/permission`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
