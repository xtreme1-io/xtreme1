import { defHttp } from '/@/utils/http/axios';
import {
  groupItem,
  getGroupParams,
  responseGroupItem,
  responseGroupParams,
  responseGroupInfoParams,
  addMemberParams,
  removeMemberParams,
  UserGroup,
  AssignGroup,
  CheckGroup,
} from './model/groupModel';
import { BasicIdParams } from '/@/api/model/baseModel';

enum Api {
  GROUP = '/user/group',
}

/** 分页查询分组 */
export const getGroupApi = (params: getGroupParams) =>
  defHttp.get<responseGroupParams>({
    url: `${Api.GROUP}/findByPage`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 查询分组详情 */
export const getGroupInfoApi = (params: BasicIdParams) =>
  defHttp.get<responseGroupInfoParams>({
    url: `${Api.GROUP}/info/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 保存分组 */
export const saveGroupApi = (params: groupItem) =>
  defHttp.post<null>({
    url: `${Api.GROUP}/add`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 编辑分组 */
export const editGroupApi = (params: groupItem) =>
  defHttp.post<null>({
    url: `${Api.GROUP}/update/${params.id}`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 删除分组 */
export const deleteGroupApi = (params: BasicIdParams) =>
  defHttp.post<null>({
    url: `${Api.GROUP}/delete/${params.id}`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 添加成员 */
export const addMemberApi = (params: addMemberParams) =>
  defHttp.post<null>({
    url: `${Api.GROUP}/addMembers`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 移除人员 */
export const removeMemberApi = (params: removeMemberParams) =>
  defHttp.post<null>({
    url: `${Api.GROUP}/removeMembers`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 查询所有分组信息 */
export const getGroupAllApi = () =>
  defHttp.get<responseGroupItem[]>({
    url: `${Api.GROUP}/findAll`,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 查询用户分组 */
export const getUserGroupApi = (params: { userIds: string }) =>
  defHttp.get<UserGroup[]>({
    url: `${Api.GROUP}/userGroup/list`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 分配分组 */
export const assignGroupApi = (params: AssignGroup[]) =>
  defHttp.post<null>({
    url: `${Api.GROUP}/assignGroups`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });

/** 检查名称是否存在 */
export const checkGroupNameExistApi = (params: CheckGroup) =>
  defHttp.get<boolean>({
    url: `${Api.GROUP}/checkGroupNameExist`,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
