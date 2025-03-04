import { post } from '../base';
import { ISignParam } from '../../type';
import axios from 'axios';

export async function getPresignedUrlBatch(configs: ISignParam[]) {
  const url = '/api/storage/storage/generatePreSignUrlList';
  const data = await post(url, configs);
  const dataMap = {} as Record<
    string,
    { accessUrl: string; presignedUrl: string; filePath: string }
  >;
  ((data.data as any[]) || []).forEach((e, index) => {
    const config = configs[index];
    dataMap[`${config.dataId}##${config.sourceId}`] = {
      accessUrl: e.accessUrl,
      presignedUrl: e.preSignedUrl,
      filePath: e.filePath,
    };
  });
  return dataMap;
}
export async function getPreSignUrlList(
  filePaths: string[],
  source = 'TASK_ITEM_HISTORICAL_ANNOTATION_RESULT',
) {
  const url = 'api/storage/storage/getPreSignUrlList';
  const res = await post(url, {
    filePaths: filePaths,
    source: source,
  });
  return res.data;
}

export async function getIssuePresigned(configs: ISignParam[]) {
  const url = '/api/storage/storage/generatePreSignUrlList';
  const urlList: { accessUrl: string; preSignedUrl: string }[] = [];
  const data = await post(url, configs);
  ((data.data as any[]) || []).forEach((e) => {
    urlList.push({ accessUrl: e.accessUrl, preSignedUrl: e.preSignedUrl });
  });
  return urlList;
}

export function uploadBufferData(url: string, buffer: any) {
  return axios({
    method: 'put',
    url: url,
    data: buffer,
    headers: {
      'Content-Type': 'application/octet-stream',
    },
  });
}
