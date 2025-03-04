import * as api from '../api';
import { IObject } from '../type';
// import * as utils from '@/business/chengduNew/utils';

export function pollModelTrack(
  recordId: string,
  onComplete: (e: IObject[][]) => void,
  onErr?: (e?: any) => void,
) {
  let stop = false;
  let error: any = undefined;
  let requestTimes = 0; // 请求次数
  poll();
  return clear;

  async function poll() {
    let result;

    try {
      requestTimes++;
      result = await request();
    } catch (e: any) {
      error = e;
    }

    if (stop) return;

    if (error) {
      onErr && onErr(error);
    } else {
      if (result || requestTimes > 30) onComplete(result || []);
      else {
        setTimeout(poll, 2000);
      }
    }
  }

  function clear() {
    stop = true;
  }

  async function request() {
    const request = api.getModelResult([], recordId).then((data) => {
      data = data.data || {};
      const { modelCode, modelDataResults } = data;
      if (!modelCode || !modelDataResults || modelDataResults.length === 0) return undefined;

      const dataResult = modelDataResults[0];
      const resultList = dataResult.modelResult || []; // 每一帧的结果列表的集合
      if (resultList.code === -1) throw new Error(resultList.message || '');
      return resultList;
    });
    return request;
  }
}
