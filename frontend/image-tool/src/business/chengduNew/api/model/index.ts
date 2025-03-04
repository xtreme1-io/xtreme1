import { AxiosRequestConfig } from 'axios';
import { get, post } from '../base';
import { Api } from '../apiEnum';
import { IModel, IModelClass } from 'image-editor';
import { IObject, IPoint } from '../common/typing';

/**
 * model相关
 */
export async function getModelList() {
  const url = `${Api.DATASET}/model/findAll`;
  const res = await get(url, { datasetType: 'IMAGE', status: 'CONFIGURATION_COMPLETED' });
  const data = res.data || [];

  const models = [] as IModel[];
  data.forEach((e: any) => {
    if (e.datasetType !== 'IMAGE') return;
    let classes = (e.classes || []) as IModelClass[];
    //  COCO 模型有subClass
    classes = classes
      .map((item) => {
        return item.subClasses || item;
      })
      .flat(1)
      .map((e: any) => {
        return { ...e, label: e.name, value: e.code };
      });
    models.push({
      id: e.id,
      name: e.name,
      version: e.version,
      code: e.modelCode,
      classes,
      isInteractive: e.isInteractive,
      type: e.type,
    });
  });

  return models;
}

export async function clearModel(dataIds: number[], recordId: string) {
  const url = `${Api.DATASET}/data/removeModelDataResult`;
  const data = {
    dataIds,
    serialNo: recordId,
    removeHeaderField: ['X-Current-Task-Id'],
  };
  return await post(url, data);
}

export async function getModelResult(dataIds: string[], recordId: string) {
  const url = `${Api.DATASET}/data/modelAnnotationResult`;
  const data = {
    dataIds,
    serialNo: recordId,
    removeHeaderField: ['X-Current-Task-Id'],
  };
  return await post(url, data);
}

export async function runModel(config: any) {
  const url = `${Api.DATASET}/data/modelAnnotate`;

  const data = {
    ...config,
    removeHeaderField: ['X-Current-Task-Id'],
  };
  return await post(url, data);
}

interface IModelMapClassParam {
  modelId: number;
  datasetId: string;
}
interface IModelMapClassResult {
  classId: string;
  className: string;
  modelClasses: { code: string; id: string }[];
}
// 获取人工class与模型class的映射关系
export async function getModelMapClass(params: IModelMapClassParam) {
  const url = `${Api.DATASET}/modelClass/findMappedDatasetClass`;
  const data = await get(url, { ...params });
  const result: Record<string, IModelMapClassResult> = {};
  (data?.data || []).forEach((mapClass: any) => {
    const obj = result[mapClass.className];
    if (!obj) {
      result[mapClass.className] = {
        classId: mapClass.classId,
        className: mapClass.className,
        modelClasses: [{ code: mapClass.modelClassCode, id: mapClass.modelClassId }],
      };
    } else {
      obj.modelClasses.push({ code: mapClass.modelClassCode, id: mapClass.modelClassId });
    }
  });
  return result;
}

interface IImageModelTrack {
  datasetId: number;
  dataId: number;
  direction: string;
  modelId: number;
  dataIds: number[] | string[];
  taskId?: number;
  imageTargetObjects: IObject[];
}
export async function runModelTrack(config: IImageModelTrack) {
  const url = '/api/dataset/data/modelTracing';
  const data = {
    ...config,
    removeHeaderField: ['X-Current-Task-Id'],
  };
  return await post(url, data);
}

// export async function getModelQuotaApi() {
//     const url = `${Api.DATASET}/modelQuota/queryModelQuota`;
//     return await get(url);
// }

/** AI工具识别 */
interface IClickSeq extends IPoint {
  type: string;
}
export interface IIdentify {
  crop: IPoint[];
  clickSeq: IClickSeq[];
  imgUrl: string;
}
/** AI工具识别 */
export async function identifyImage(
  param: { datas: IIdentify[]; params: { distThres: string }; modelId: number },
  config: AxiosRequestConfig,
) {
  const url = `${Api.DATASET}/annotation/result/image/identify`;

  const data = {
    ...param,
    removeHeaderField: ['X-Current-Task-Id'],
  };
  return await post(url, data, config);
}
