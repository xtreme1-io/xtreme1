import { IClassificationData, IClassObject, IDataStatus } from './model/overviewModel';
import { defHttp } from '/@/utils/http/axios';

enum Api {
  DATASET = '/dataset',
  DATA = '/data',
}

export const getDataStatusApi = (params: { datasetId: number }) =>
  defHttp.get<IDataStatus>({
    url: `${Api.DATASET}/${params.datasetId}/statistics/dataStatus`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const getClassObjectApi = (params: { datasetId: number }) =>
  defHttp.get<IClassObject>({
    url: `${Api.DATASET}/${params.datasetId}/statistics/classObject`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const getClassificationDataApi = (params: { datasetId: number }) =>
  defHttp.get<Array<IClassificationData>>({
    url: `${Api.DATASET}/${params.datasetId}/statistics/classificationData`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
