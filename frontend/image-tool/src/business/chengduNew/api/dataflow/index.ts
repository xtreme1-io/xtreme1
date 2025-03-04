import { get, post } from '../base';
import { Api } from '../apiEnum';
import { SourceType, IResultSource } from '../../type';
import {
  // list
  getResultResourceParams,
  // get
  getDataflowAnnotationParams,
  responseGetDataflow,
} from './typing';

/** 查询task和model run列表 */
export const getResultSourcesApi = async (params: getResultResourceParams) => {
  const url = `${Api.DATASET}/annotation/result/getResultSourcesByDataId`;

  const res = await get(url, params);
  const data = res.data || {};
  let groundTruth = (data.GROUND_TRUTH || []).map((item: any) => {
    return {
      sourceId: item.id,
      name: item.resultName,
      sourceType: item.type,
    } as IResultSource;
  }) as IResultSource[];

  groundTruth = groundTruth.filter((e) => e.sourceType !== SourceType.DATA_FLOW);
  groundTruth.push({
    sourceId: '-1',
    name: 'Without Task',
    sourceType: SourceType.DATA_FLOW,
  });

  const model = (data.MODEL_RUNS || []).map((item: any) => {
    return {
      sourceId: item.id,
      name: item.resultName,
      sourceType: item.type,
    } as IResultSource;
  }) as IResultSource[];

  return { groundTruth, model };
};

/** 查询标注结果 */
export const getDataflowAnnotationApi = async (params: getDataflowAnnotationParams) => {
  const url = `${Api.DATASET}/annotation/result/listByDataIds`;

  const res = await post(url, params);

  const data = (res.data as responseGetDataflow[]) ?? [];
  return data;
};

/** 保存标注结果 */
export async function saveDataflow(datasetId: string, data: any) {
  const url = `/api/dataset/annotation/result/save/${datasetId}`;
  const config = { headers: { 'Content-Encoding': 'gzip' } };
  const res = await post(url, data, config);
  return res;
}
