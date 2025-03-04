import { get, post } from '../base';
import { Api } from '../apiEnum';
import { ICreateParams, IReplyParams, getCommentListParams } from './typing';
import { ICommentItem } from '../../type';

/** 创建评论 */
export const createComment = async (params: ICreateParams) => {
  const url = `${Api.COMMENT}/create`;
  const res = await post(url, params);

  return res.data as ICommentItem;
};

/** 回复评论 */
export const replyComment = async (params: IReplyParams) => {
  const url = `${Api.COMMENT}/createReply`;
  const res = await post(url, params);

  return res.data as ICommentItem;
};

/** 解决/取消解决评论 */
export const resolveComment = async (
  commentId: string | number,
  stageId: string,
  status: boolean,
) => {
  const resolveurl = `${Api.COMMENT}/resolve/${commentId}`;
  const cancelurl = `${Api.COMMENT}/cancelResolve/${commentId}`;
  const res = await post(status ? resolveurl : cancelurl, { stageId: stageId });

  return res;
};
export const fixComment = async (commentId: string | number, stageId: string, status: boolean) => {
  const resolveurl = `${Api.COMMENT}/fix/${commentId}`;
  const cancelurl = `${Api.COMMENT}/unfix/${commentId}`;
  const res = await post(status ? resolveurl : cancelurl, { stageId: stageId });

  return res;
};

/** 解决所有评论 */
export const resolveCommentBatch = async (params: {
  taskId: string;
  itemId: string;
  stageId: string;
  commentIds: string[];
}) => {
  const url = `${Api.COMMENT}/resolveBatch`;
  const res = await post(url, params);
  return res;
};
export const fixCommentBatch = async (params: {
  taskId: string;
  itemId: string;
  stageId: string;
  commentIds: string[];
}) => {
  const url = `${Api.COMMENT}/fixBatch`;
  const res = await post(url, params);
  return res;
};

/** 删除评论 */
export const deleteComment = async (params: { taskId: string; commentId: string }) => {
  const url = `${Api.COMMENT}/delete/${params.commentId}`;
  const res = await post(url, params);

  return res;
};

/** 查询评论列表 */
export const getComment = async (params: getCommentListParams) => {
  const url = `${Api.COMMENT}/list`;
  const res = await post(url, params);
  return res.data as ICommentItem[];
};

/** 查询任务的评论类型配置 */
export const getCommentTypes = async (toolMode: any) => {
  const url = `${Api.ANNOTATION}/commentType/list`;
  const params = { dataType: 'IMAGE', annotationTypes: toolMode };
  const res = await get(url, params);
  return res.data;
};
