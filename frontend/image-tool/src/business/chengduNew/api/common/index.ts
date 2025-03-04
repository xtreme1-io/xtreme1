import { get, post } from '../base';
import { Api } from '../apiEnum';
import { empty } from '../../utils';
import { IModelResult, IFileConfig, IObject } from './typing';
import { DataTypeEnum, IFrame, __UNSERIES__ } from 'image-editor';
import { ClassBsUtils } from '@basicai/tool-components';
/** 查询静态文件 */
export async function getUrl(url: string) {
  return get(url, undefined, { headers: { 'x-request-type': 'resource' } });
}

/** 解除数据锁定 */
export async function unlockRecord(recordId: string) {
  const url = `${Api.DATASET}/data/unLock/${recordId}`;
  return await post(url);
}

/** 根据流水号查询数据锁定记录 */
export async function getInfoByRecordId(recordId: string) {
  const url = `${Api.DATASET}/data/findDataAnnotationRecord/${recordId}`;
  let data = await get(url);
  data = data.data;
  // 没有结果
  if (!data) return { dataInfos: [], isSeriesFrame: false };

  const isSeriesFrame = data.dataType === 'SCENE';
  const modelRecordId = data.serialNo || '';
  let model = undefined as IModelResult | undefined;
  if (modelRecordId) {
    model = { recordId: modelRecordId, id: '', version: '', state: '' };
  }
  const datasetId = data.datasetId;
  const dataInfos: IFrame[] = [];
  const sceneIds = new Set<string>();
  (data.datas || []).forEach((config: any) => {
    const sceneId = config.sceneId || __UNSERIES__;
    dataInfos.push({
      // id: config.id,
      id: config.dataId,
      datasetId,
      needSave: false,
      model,
      sceneId,
    } as IFrame);
    sceneIds.add(sceneId);
  });

  return { datasetId, dataInfos, isSeriesFrame, seriesFrames: [...sceneIds] };
}

// 根据连续帧id查dataid
export async function getFrameSeriesData(datasetId: string, sceneIds: string[] | string) {
  const url = `/api/dataset/data/getDataIdBySceneIds`;
  if (!Array.isArray(sceneIds)) sceneIds = [sceneIds];
  const data = await get(url, {
    datasetId,
    sceneIds: sceneIds,
  });

  const sceneMap: Record<string, string[]> = data.data;
  if (!sceneMap) throw '';

  const sceneFramesMap: Record<string, IFrame[]> = {};
  sceneIds.forEach((id) => {
    const frameIds = sceneMap[id];
    const dataList = [] as IFrame[];
    frameIds.forEach((frameId) => {
      dataList.push({
        id: frameId,
        datasetId: datasetId,
        sceneId: id,
        loadState: '',
        needSave: false,
      });
    });
    sceneFramesMap[id] = dataList;
  });
  return sceneFramesMap;
}

/** 查询当前 dataset 的全部 类别Classification */
export async function getDataflowClassification(datasetId: string) {
  const url = `${Api.ANNOTATION}/datasetClassification/findAll/${datasetId}`;
  let data = await get(url);
  data = data.data || [];
  const classifications = ClassBsUtils.parseClassificationFromBackend(data);
  return classifications;
}

/** 查询当前 dataset 的全部 class */
export async function getDataflowClass(datasetId: string) {
  const url = `${Api.ANNOTATION}/datasetClass/findAll/${datasetId}`;
  let data = await get(url);
  data = data.data || [];

  const classTypes = ClassBsUtils.parseClassesFromBackend(data);

  return classTypes;
}

/** 根据ids查询 图片数据 */
export async function getDataFile(dataId: string, datasetId?: string) {
  const url = `${Api.DATASET}/data/listByIds`;
  let data = await post(url, { dataIds: [dataId], datasetId, isQueryDeletedData: true });

  data = data.data || [];

  const name = data[0]?.name || '';
  const configs = [] as IFileConfig[];
  data[0]?.content.forEach((config: any) => {
    const file = config.files[0].file;
    configs.push({
      // name: file.name,
      name,
      size: file.size,
      url: file.url,
      deviceName: config.name,
    });
  });

  return {
    config: configs[0],
    datasetId: data[0].datasetId,
  };
}

/** 获取当前用户信息 */
export const getUserInfo = async () => {
  const url = '/api/user/user/logged';
  const res = await get(url);

  return res.data as any;
};

/** 获取全局配置信息 */
export const getGlobalConfig = async () => {
  const url = '/api/user/config/globalConfig';
  const data = await get(url, { errorMessageMode: 'none' });
  return data.data;
};

/** 获取权限信息 */
export const getAuthorityConfig = async () => {
  const url = '/api/user/onpremResource/listProjectResources';
  const data = await get(url);
  return data;
};

/** 根据dataIds查询数据标注详情（class） -- 应该不会用了 */
export async function getDataObject(params: { dataIds: string; datasetId: string }) {
  const url = `${Api.DATASET}/annotation/object/listByDataIds`;
  let data = await get(url, params);
  data = data.data || [];

  const objects = [] as IObject[];
  (data.dataAnnotationObjects || []).forEach((e: any) => {
    e.classAttributes.uuid = e.id + '';
    e.classAttributes.modelRun = empty(e.modelRunId) ? '' : e.modelRunId + '';
    objects.push(e.classAttributes);
  });
  return {
    objects,
    queryTime: data.queryDate,
  };
}

/** 根据dataIds查询数据Classification标注结果 -- 应该不会用了 */
export async function getDataClassification(dataId: string) {
  const url = `${Api.DATASET}/annotation/data/listByDataIds`;
  let data = await get(url, { dataIds: dataId });
  data = data.data || {};
  const dataAnnotations = data.dataAnnotations || [];

  const attrsMap = {};
  dataAnnotations.forEach((e: any) => {
    Object.assign(attrsMap, e.classificationAttributes || {});
  });
  return attrsMap;
}

/**
 * QA
 */
// 获取qa rules
export async function queryQaRules(datasetId: string, taskId?: string) {
  const url = `/api/dataset/quality/config/find`;
  const data = await get(url, { datasetId, isDraft: false, taskId });
  return data.data;
}
// 实时质检
export async function queryQaResultRealtime(params: {
  isTransferResult: boolean;
  isOnlyDetectMandatoryRules: boolean;
  datasetId?: string;
  taskId?: string;
  sceneIds?: string[];
  dataIds?: string[];
  annotationResults?: any[];
}) {
  const url = `/api/dataset/quality/realtime/getRealtimeQaResult`;
  const config = { headers: { 'Content-Encoding': 'gzip' } };
  const res = await post(url, params, config);
  return res.data;
}
// 请求QA结果
export async function queryQaResult(jobId: string, itemId: string, itemType: DataTypeEnum) {
  const url = `/api/dataset/quality/tool/qaResult`;
  const data = await get(url, { jobId, itemId, itemType });
  return data.data;
}
// 数据流获取连续帧详情
export async function getDataInfo(id: string) {
  const url = `/api/dataset/data/info/${id}`;
  const data = await get(url);
  return data.data;
}

// issue上报
export async function reportIssue(param: any) {
  const url = '/api/user/issue/create';
  await post(url, param);
}
