import { defHttp } from '/@/utils/http/axios';
import {
  ListParams,
  DatasetParams,
  CreateParams,
  InsertUploadDataParams,
  DatasetItem,
  DatasetGetResultModel,
  DatasetListGetResultModel,
  DatasetListItem,
  DatasetIdParams,
  InsertPointCloudParams,
  MakeFrameParams,
  MergeFrameParams,
  GetFrameParams,
  FrameListResult,
  MinioInfo,
  takeRecordParams,
  exportFileRecord,
  GetPresignedParams,
  ResponsePresignedParams,
  UploadParams,
  ResponseUploadRecord,
  SelectedDataPa,
  splitFliterParams,
  TotalDataCountPa,
} from './model/datasetModel';
import { BasicIdParams } from '/@/api/model/baseModel';

enum Api {
  DATASET = '/dataset',
  DATA = '/data',
  DATASET_CLASS = '/datasetClass',
  MODEL_RUN = '/modelRun',
}

/**
 * @description: Get sample list value
 */

export const datasetListApi = (params: ListParams) =>
  defHttp.get<DatasetListGetResultModel>({
    url: `${Api.DATASET}/findByPage`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const datasetApi = (params: DatasetParams) =>
  defHttp.get<DatasetGetResultModel>({
    url: `${Api.DATA}/findByPage`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const datasetObjectApi = (params: { dataIds: string }) =>
  defHttp.get<any>({
    url: `/annotate/data/listByDataIds`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const datasetDetailApi = (params: BasicIdParams) => {
  return defHttp.get<DatasetItem>(
    {
      url: `${Api.DATA}/info/${params.id}`,
      params,
      headers: {
        // @ts-ignore
        hiddenErrorMsg: true,
      },
    },
    { errorMessageMode: 'none' },
  );
};

export const createDatasetApi = (params: CreateParams) =>
  defHttp.post<DatasetItem>({
    url: `${Api.DATASET}/create`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const deleteDatasetApi = (params: BasicIdParams) =>
  defHttp.post<null>({
    url: `${Api.DATASET}/delete/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const insertUploadData = (params: InsertUploadDataParams) =>
  defHttp.post<null>({
    url: `${Api.DATA}/upload`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const insertUploadPointCloudApi = (params: InsertPointCloudParams) =>
  defHttp.post<null>({
    url: `${Api.DATA}/uploadCompressed`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const deleteBatchDataset = (params: { ids: number[]; datasetId: number }) =>
  defHttp.post<null>({
    url: `${Api.DATA}/deleteBatch`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const updateDataset = (params: { id: string | number; name: string }) =>
  defHttp.post<null>({
    url: `${Api.DATASET}/update/${params.id}`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const datasetItemDetail = (params: BasicIdParams) =>
  defHttp.get<DatasetListItem>({
    url: `${Api.DATASET}/info/${params.id}`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const getMaxCountApi = (params: DatasetIdParams) =>
  defHttp.get<number>({
    url: `${Api.DATA}/selectMaxAnnotationCountByDatasetId`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const makeFrameSeriesApi = (params: MakeFrameParams) =>
  defHttp.post<null>({
    url: `${Api.DATA}/frames/combine`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const ungroupFrameSeriesApi = (params: MakeFrameParams) =>
  defHttp.post<null>({
    url: `${Api.DATA}/frames/remove`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const mergeFrameApi = (params: MergeFrameParams) =>
  defHttp.post<null>({
    url: `${Api.DATA}/frames/merge`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const getFrameApi = (params: GetFrameParams) =>
  defHttp.get<FrameListResult>({
    url: `${Api.DATA}/frames/list`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const getMinioInfo = () =>
  defHttp.get<MinioInfo>({
    url: `${Api.DATASET}/getMinioUserInfo`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const getLockedByDataset = (params) =>
  defHttp.get<Nullable<any>>({
    url: `${Api.DATA}/findLockRecordIdByDatasetId`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const unLock = (params) =>
  defHttp.post<null>({
    url: `${Api.DATA}/unLock/${params.id}`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const takeRecordByData = (params: takeRecordParams) =>
  defHttp.post<null>({
    url: `${Api.DATA}/annotate`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const checkRootByDataId = async (recordId: string, dataId: string) => {
  const res = await defHttp.get<any>({
    url: `${Api.DATA}/findDataAnnotationRecord/${recordId}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
  return (res?.datas || []).some((item) => item.dataId === dataId);
};

export const takeRecordByDataModel = (params: takeRecordParams) =>
  defHttp.post<null>({
    url: `${Api.DATA}/annotateWithModel`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const exportData = (params: any) =>
  defHttp.get<null>({
    url: `${Api.DATA}/export`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const exportDataRecordCallBack = (params: { serialNumbers: string }) =>
  defHttp.get<exportFileRecord[]>({
    url: `${Api.DATA}/findExportRecordBySerialNumbers`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const generatePresignedUrl = (params: GetPresignedParams) =>
  defHttp.get<ResponsePresignedParams>({
    url: `${Api.DATA}/generatePresignedUrl`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const uploadDatasetApi = (params: UploadParams, signal?: any) =>
  defHttp.post<string>({
    url: `${Api.DATA}/upload`,
    signal: signal,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const findUploadRecordBySerialNumbers = (params: string, signal?: any) =>
  defHttp.get<ResponseUploadRecord[]>({
    url: `${Api.DATA}/findUploadRecordBySerialNumbers?serialNumbers=${params}`,
    signal: signal,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const getStatusNum = (params: { datasetId: number }) =>
  defHttp.get<ResponseUploadRecord[]>({
    url: `${Api.DATA}/getAnnotationStatusStatisticsByDatasetId`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const hasOntologyApi = (params: { datasetId: number }) =>
  defHttp.get<ResponseUploadRecord[]>({
    url: `${Api.DATASET}/findOntologyIsExistByDatasetId`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const getScenario = (params: any) =>
  defHttp.get<any>({
    url: `${Api.DATA}/findByScenarioPage`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const getDataByIds = (params: any) =>
  defHttp.get<any[]>({
    url: `${Api.DATA}/listByIds`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
export const getRelationByIds = (params: any) =>
  defHttp.get<any[]>({
    url: `${Api.DATA}/listRelationByIds`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const getDatasetClass = (id) =>
  defHttp.get<any>({
    url: `${Api.DATASET_CLASS}/findAll/${id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const exportScenario = (params) =>
  defHttp.get<any>({
    url: `${Api.DATA}/scenarioExport`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const createByScenario = (params) =>
  defHttp.post<any>({
    url: `${Api.DATASET}/createByScenario`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const getClassificationOptions = (params) =>
  defHttp.get<any>({
    url: `${Api.DATA}/classificationOption/findAll`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
export const splitFliter = (params: splitFliterParams) =>
  defHttp.post<null>({
    url: `${Api.DATA}/split/filter`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const getTotalDataCount = (params: TotalDataCountPa) =>
  defHttp.get<any>({
    url: `${Api.DATA}/split/totalDataCount`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const splitDataSelected = (params: SelectedDataPa) =>
  defHttp.post<any>({
    url: `${Api.DATA}/split/dataIds`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const getMoelResultApi = (datasetId: number) =>
  defHttp.get<any>({
    url: `${Api.MODEL_RUN}/getDatasetModelRunResult/${datasetId}`,

    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const getLockedRecordByDataset = (params: any) =>
  defHttp.get<any>({
    url: `${Api.DATA}/findLockRecordByDatasetId`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const unLockApi = (params: any) =>
  defHttp.post<null>({
    url: `${Api.DATA}/unLockByLockRecordIds`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
