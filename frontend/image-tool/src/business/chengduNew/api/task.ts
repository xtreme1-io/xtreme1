import { get, post, setCurrentTask } from './base';
// import { utils, IObjectV2, IObject } from 'image-editor';
import { ITask, IStage, IClaim, ITaskData } from '../type';
import { ClassBsUtils } from '@basicai/tool-components';

export async function getTaskInfo(taskId: string) {
  const url = `/api/annotation/task/info/${taskId}`;
  let data = await get(url);
  data = data.data;
  const task: ITask = {
    annotationType: data.annotationType || [],
    batchSize: data.batchSize,
    datasetId: data.datasetId,
    datasetType: data.datasetType,
    dataDefaultValidity: data.dataDefaultValidity,
    historyAccessPermissions: data.historyAccessPermissions || [],
    id: data.id,
    instruction: data.instruction,
    instructionFiles: data.instructionFiles,
    itemType: data.itemType,
    name: data.name,
    status: data.status,
    teamId: data.teamId,
    commentTypeIds: data.commentTypeIds || [],
    toolLimitConf: data.toolLimitConf || {},
    distanceMeasureConf: data.distanceMeasureConf || {},
  };
  return task;
}

export async function getTaskClasses(taskId: string) {
  const url = `/api/annotation/task/class/findAll/${taskId}`;
  let data = await get(url, { isSearchSubClass: 1 });

  data = data.data || [];

  const classTypes = ClassBsUtils.parseClassesFromBackend(data);
  return classTypes;
}

export async function getTaskClassifications(taskId: string) {
  // 数据流加载 需要设置一下
  setCurrentTask(taskId);

  const url = `/api/annotation/task/classification/findAll/${taskId}`;
  let data = await get(url);
  data = data.data || [];
  const classifications = ClassBsUtils.parseClassificationFromBackend(data);
  return classifications;
}

export async function getTaskDataStatus(itemIds: string[], taskId: string) {
  const url = `/api/annotation/task/item/getItemStatusInTool`;
  // const data = await post(`${url}?${argsStr}`);
  const data = await post(url, { itemIds, taskId });
  return (data.data || []) as ITaskData[];
}

export async function getTaskStageInfo(stageId: string) {
  const url = `/api/annotation/task/stage/info/${stageId}`;
  let data = await get(url);
  data = data.data;
  const stage: IStage = {
    id: data.id,
    name: data.name,
    type: data.type,
  };
  return stage;
}

export async function getTaskSceneData(taskId: string, sceneId: string) {
  const url = `/api/annotation/task/sceneData/getDataIdByTaskIdSceneId`;
  let data = await get(url, { taskId, sceneId });

  data = data.data || [];

  return data as string[];
}

export async function getAllTaskStageInfo(taskId: string) {
  const url = `/api/annotation/task/stage/getAllStage`;
  let data = await get(url, { taskId });
  data = data.data || [];
  const stages: IStage[] = data.map((e: any) => {
    return {
      id: e.id,
      name: e.name,
      type: e.type,
    };
  });
  return stages;
}

export async function getTaskPreStage(taskId: string, stageId: string) {
  const url = `/api/annotation/task/stage/getPreStages`;
  let data = await get(url, { taskId, stageId });
  data = data.data;

  const stages: IStage[] = data.map((e: any) => {
    return { id: e.id, name: e.name, type: e.type } as IStage;
  });

  return stages;
}

export async function taskSaveObject(taskId: string, data: any) {
  const url = `/api/annotation/task/dataAnnotationResult/save/${taskId}`;
  const config = { headers: { 'Content-Encoding': 'gzip' } };
  const res = await post(url, data, config);
  return res;
}

export async function taskSubmit(data: any) {
  const url = `/api/annotation/task/itemFlow/submit`;
  return await post(url, data);
}

export async function taskClaim(
  stageId: string,
  taskId: string,
  annotatorIds: string[],
  claimPool: string,
) {
  const url = `/api/annotation/task/employee/claim`;
  return await post(url, { stageId, taskId, annotatorIds, claimPool });
}

export async function taskSuspend(
  taskId: string,
  stageId: string,
  claimRecordId: string,
  itemIds: string[],
) {
  const url = `/api/annotation/task/itemFlow/suspendItems`;
  return await post(url, { taskId, stageId, claimRecordId, itemIds });
}

export async function taskClaimAccData(taskId: string, size = 5) {
  const url = `/api/annotation/task/acceptance/getItemsInAcceptance`;
  return await get(url, { taskId, size });
}

export async function getTaskClaimInfo(claimRecordId: string) {
  const url = `/api/annotation/task/employee/claimed/list`;
  return await get(url, { claimRecordId });
}

export async function taskReviewReject(data: any) {
  const url = `/api/annotation/task/itemFlow/reject`;
  return await post(url, data);
}

export async function taskAcceptanceReject(data: any) {
  const url = `/api/annotation/task/acceptance/reject`;
  return await post(url, data);
}

export async function taskAcceptanceAccept(taskId: string, itemId: string) {
  const url = `/api/annotation/task/acceptance/accept`;
  return await post(url, { taskId, itemId });
}

export async function taskStopClaim(id: string) {
  const url = `/api/annotation/task/claimRecord/pause/${id}`;
  return await post(url);
}

export async function taskRelease(
  taskId: string,
  stageId: string,
  claimRecordId: string,
  itemIds: string[],
) {
  const url = `/api/annotation/task/itemFlow/release`;
  return await post(url, { taskId, stageId, claimRecordId, itemIds });
}

export async function taskAccUnlock(params: { taskId: number; userIds: number[] }) {
  const url = `/api/annotation/task/lockItem/unlock`;
  return await post(url, params);
}

export async function taskContinueClaim(id: string) {
  const url = `/api/annotation/task/claimRecord/continue/${id}`;
  return await post(url);
}

export async function taskRevise(param: {
  taskId: string;
  itemId: string;
  reason: string;
  toStageId: string | number;
}) {
  const url = '/api/annotation/task/acceptance/revise';
  return await post(url, param);
}

export async function getTaskClaimRecordInfo(id: string) {
  const url = `/api/annotation/task/claimRecord/info/${id}`;
  let data = await get(url);
  data = data.data;
  const claim: IClaim = {
    id: data.id,
    pauseTotalTime: data.pauseTotalTime,
    remainTotalTime: data.effectiveTotalTime,
    updateTime: Date.now() / 1000,
    status: data.status,
    filterConfig: data.filterConfig,
    // updateTime: new Date(data.statusUpdateAt).getTime() / 1000,
  };
  return claim;
}
export async function reportWorkTime(
  taskId: string,
  params: {
    dataId: string;
    version: string;
    workingDuration: number;
  },
) {
  const url = `/api/annotation/task/dataAnnotationResult/addWorkingDuration/${taskId}`;
  await post(url, params);
}

export async function getTaskSampleInfo(taskId: string, sceneId: string, sampleId: string) {
  const url = `/api/annotation/task/sampleSceneData/findDataIdBySampleIdSceneId`;
  const data = await get(url, { taskId, sceneId, sampleId });
  return (data.data || []) as string[];
}
export async function getAssigneeAnnotator(taskId: string) {
  const url = `/api/annotation/task/item/getAssigneeAnnotator`;
  const data = await get(url, {
    taskIds: [taskId],
  });
  return data.data;
}
// 验收阶段通过条件查询dataIds
export async function getItemIdsByFilter(filter: {
  taskId?: string;
  sortField?: string;
  keywords?: string;
  name?: string;
  batchName?: string;
  stageId?: string;
  qualityRuleIds?: string[];
  isWithBatch?: boolean;
  ascOrDesc?: string;
  annotator?: string;
  itemIds?: string[];
  createEndTime?: string;
  createStartTime?: string;
  stageStatusList?: string[];
  status?: string;
  activities?: string;
  excludeItemIds?: string[];
}) {
  const url = `/api/annotation/task/item/getViewInAccItemIds`;
  const data = await post(url, filter).catch((e) => {
    return [];
  });
  return data.data || [];
}
export async function getAccLockItems(taskId: string, userId: string) {
  const url = `/api/annotation/task/lockItem/info/${taskId}/${userId}`;
  const data = await get(url);
  return data.data?.itemIds || [];
}
/**分页查询历史记录列表 */
export async function queryHistoricalRecord(params: {
  pageNo: number;
  pageSize: number;
  taskId: string;
  itemId: string;
}) {
  const url = '/api/annotation/annotationResultHistoricalRecord/findByPage';
  const res = await get(url, params);
  return res.data;
}
/**根据历史记录id 查询与上一个全量版本之间所有记录用于拼接数据 */
export async function findHistoricalRecordList(id: string | number) {
  const url = `/api/annotation/annotationResultHistoricalRecord/findHistoricalRecordList/${id}`;
  const res = await get(url);
  return res.data;
}
