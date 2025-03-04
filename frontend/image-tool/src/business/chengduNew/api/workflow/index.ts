import { get, post } from '../base';
import { Api } from '../apiEnum';
import { getWorkflowAnnotationParams, getItemFlowParams, responseGetWorkflow } from './typing';

/** 获取数据的标注数据 */
export const getWorkflowAnnotationApi = async (params: getWorkflowAnnotationParams) => {
  const url = `${Api.ANNOTATION}/task/dataAnnotationResult/listByDataIds`; // new

  const res = await post(url, params);
  const data = (res.data as responseGetWorkflow[]) || [];

  return data;
};

/** 查询某个item的工作流信息 */
export const getItemFlow = async (params: getItemFlowParams) => {
  // const url = `${Api.ANNOTATION}/task/itemFlowRecord/listByItemId`;
  const url = `${Api.ANNOTATION}/task/itemFlowRecord/getClaimInfoByItemId`;
  const res = await get(url, params);

  return res.data;
};

/** 获取reject消息 */
export const getRejectInfo = async (params: getItemFlowParams) => {
  const url = `${Api.ANNOTATION}/task/reworkRecord/getRejectInfo`;
  const res = await get(url, params);

  return res.data;
};
