import { defHttp } from '/@/utils/http/axios';
import { TaskListItem, BaseTaskModel, TaskDetail } from './model/taskModel';
import { BasicIdParams } from '/@/api/model/baseModel';

enum Api {
  QUERY = '/annotation/dataset',
  TASK = '/annotation/task',
}

/**
 * @description: Get sample list value
 */
export const getTaskListApi = (params: BasicIdParams) =>
  defHttp.get<TaskListItem[]>({
    url: `${Api.QUERY}/${params.id}/tasks`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const getTaskApi = (params: BaseTaskModel) =>
  defHttp.get<TaskDetail>({
    url: `${Api.QUERY}/${params.datasetId}/task/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const getTaskDefaultApi = (params: BasicIdParams) =>
  defHttp.get<TaskDetail>({
    url: `${Api.QUERY}/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const saveTaskApi = (params: TaskDetail) =>
  defHttp.post<null>({
    url: `${Api.TASK}/save`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const closeTaskApi = (params: BasicIdParams) =>
  defHttp.post<null>({
    url: `${Api.TASK}/close/${params.id}`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const publishTaskApi = (params: TaskDetail) =>
  defHttp.post<null>({
    url: `${Api.TASK}/publish`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const saveChangeTaskApi = (params: TaskDetail) =>
  defHttp.post<null>({
    url: `${Api.TASK}/saveChange`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

export const deleteTaskApi = (params: BasicIdParams) =>
  defHttp.post<null>({
    url: `${Api.TASK}/delete/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
