import { Api, IModelResult } from './type';
import { get, post } from './base';
import { IFrame, LoadStatus, __UNSERIES__, IObjectSource, SourceType } from 'image-editor';

export async function unlockRecord(recordId: string) {
  const url = `${Api.DATA}/unLock/${recordId}`;
  return await post(url);
}

export async function getInfoByRecordId(recordId: string) {
  const url = `${Api.DATA}/findDataAnnotationRecord/${recordId}`;
  let data = await get(url);
  data = data.data;
  if (!data) return { dataInfos: [], isSeriesFrame: false, seriesFrameId: '' };

  const isSeriesFrame = data.itemType === 'SCENE';
  let model: IModelResult;
  if (data.serialNo) {
    model = { recordId: data.serialNo, id: '', version: '', state: LoadStatus.DEFAULT };
  }
  const dataInfos: IFrame[] = [];
  const seriesFrames: string[] = [];
  (data.datas || []).forEach((config: any) => {
    const sceneId = config.sceneId || __UNSERIES__;
    dataInfos.push({
      id: config.dataId,
      datasetId: config.datasetId,
      needSave: false,
      model,
      sceneId,
    } as IFrame);
    if (!seriesFrames.includes(sceneId)) seriesFrames.push(sceneId);
  });

  return { dataInfos, isSeriesFrame, seriesFrames };
}
export async function getResultSources(dataId: string) {
  let url = `/api/data/getDataModelRunResult/${dataId}`;
  let data = await get(url);
  data = data.data || {};

  let sources = [] as IObjectSource[];
  data.forEach((item: any) => {
    let { modelId, modelName, runRecords = [] } = item;
    runRecords.forEach((e: any) => {
      sources.push({
        name: e.runNo,
        sourceId: e.id,
        modelId: modelId,
        modelName: modelName,
        sourceType: SourceType.MODEL,
        frameId: dataId,
      });
    });
  });
  return sources;
}
/** Data flow */
export async function setInvalid(dataId: string) {
  const url = `${Api.DATA}/flow/markAsInvalid/${dataId}`;
  await post(url);
}
export async function setValid(dataId: string) {
  const url = `${Api.DATA}/flow/markAsValid/${dataId}`;
  await post(url);
}
export async function submit(dataId: string) {
  const url = `${Api.DATA}/flow/submit/${dataId}`;
  await post(url);
}
export async function getDataStatusByIds(dataId: string) {
  let url = `${Api.DATA}/getDataStatusByIds`;
  let data = await get(url, { dataIds: dataId });
  data = data.data || [];
  return data[0];
}

export async function takeRecordByData(params: any) {
  const url = `${Api.DATA}/annotate`;
  const res = await post(url, params);
  return res;
}
