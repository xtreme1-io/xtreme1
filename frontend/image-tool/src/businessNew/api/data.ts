import { IFrame } from '@/package/image-editor';
import { ISaveFormat, ISaveResp } from '../types';
import { get, post } from './base';
import { Api, DataflowAnnotationParamsReq, DataflowAnnotationParamsRsp, IFileConfig } from './type';

export async function getAnnotationByDataIds(params: DataflowAnnotationParamsReq) {
  const url = `${Api.ANNOTATION}/data/listByDataIds`;

  const res = await get(url, { dataIds: params.dataIds.join(',') });
  const data = (res.data || []) as DataflowAnnotationParamsRsp[];
  console.log('frame data', data);
  return data;
}

export async function getDataFile(id: string) {
  const url = `${Api.DATA}/listByIds`;
  let data = await get(url, { dataIds: id });
  data = data.data || [];

  const name = data[0]?.name || '';
  let configs = [] as IFileConfig[];
  data[0].content.forEach((config: any) => {
    let file = config.files?.[0].file || config.file;
    configs.push({
      name,
      size: +file.size,
      url: file.url,
      deviceName: config.name,
    });
  });

  return {
    config: configs[0],
    datasetId: data[0].datasetId,
    annotationStatus: data[0].annotationStatus,
    validStatus: data[0].status,
  };
}

export async function saveData(datasetId: string, dataInfos: Array<ISaveFormat>) {
  const url = `${Api.ANNOTATION}/data/save`;

  let data = await post(url, { datasetId, dataInfos });
  return (data.data || []) as ISaveResp[];
}

export async function getFrameSeriesData(datasetId: string, frameSeriesId: string) {
  const url = `/api/data/getDataIdBySceneIds`;
  const data = await get(url, {
    datasetId,
    sceneIds: frameSeriesId,
    // sortFiled: 'ID',
    // ascOrDesc: 'ASC',
  });
  console.log(data);
  const list = (data.data || {})[frameSeriesId] || [];
  // (list as any[]).reverse();
  if (list.length === 0) throw '';

  const dataList = [] as IFrame[];
  list.forEach((e: any) => {
    dataList.push({
      id: e,
      datasetId: datasetId,
      needSave: false,
      model: undefined,
      sceneId: frameSeriesId,
    } as IFrame);
  });
  return dataList;
  // return configs;
}
