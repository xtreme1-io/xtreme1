import { defHttp } from '/@/utils/http/axios';

import {
  ClaimListGetResultModel,
  ListParams,
  ClaimParams,
  ClaimActionModel,
} from './model/claimModel';

enum Api {
  claim = '/annotation/task',
}

export const claimListApi = (params: ListParams) =>
  defHttp.get<ClaimListGetResultModel>({
    url: `${Api.claim}/claimList`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const claimApi = (params: ClaimParams) =>
  defHttp.post<ClaimActionModel>({
    url: `${Api.claim}/claim`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
