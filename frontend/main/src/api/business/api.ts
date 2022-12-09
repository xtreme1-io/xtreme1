import { defHttp } from '/@/utils/http/axios';
import { BasicIdParams } from '/@/api/model/baseModel';

enum Api {
  TOKEN = '/user/api/token',
}

export const getTokenInfo = () =>
  defHttp.get<any[]>({
    url: `${Api.TOKEN}/info`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const createToken = (params) =>
  defHttp.post<any[]>({
    url: `${Api.TOKEN}/create`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const deleteToken = (params: BasicIdParams) =>
  defHttp.post<any[]>({
    url: `${Api.TOKEN}/delete/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
