import qs from 'qs';
import { useInjectBSEditor } from '../context';
import { TaskClaimPool } from '../type';
import { parseUrlIds } from '../utils';

export default function useQuery() {
  const queryStr = location.href.split('?').reverse();

  const query = qs.parse(queryStr[0] || '');

  function iniQuery() {
    const editor = useInjectBSEditor();
    const { bsState } = editor;
    Object.assign(bsState.query, query || {});

    bsState.recordId = (query.recordId as string) || '';
    bsState.datasetId = (query.datasetId as string) || '';
    bsState.taskId = (query.taskId as string) || '';
    bsState.stageId = (query.stageId as string) || '';
    bsState.claimPool = (query.claimPool as any) ?? TaskClaimPool.NORMAL;
    bsState.sampleId = (query.sampleId as string) || '';
    bsState.claimRecordId = (query.claimRecordId as string) || '';
    if (query.isVisitorClaim) bsState.isVisitorClaim = true;
    if (bsState.query.itemIds) {
      bsState.query.itemIds = parseUrlIds(bsState.query.itemIds || '');
      bsState.claimNum = bsState.query.itemIds.length || 1;
    }
    if (bsState.query.qualityRuleIds) {
      bsState.query.qualityRuleIds = parseUrlIds(bsState.query.qualityRuleIds || '');
    }
    if (bsState.query.stageStatusList) {
      bsState.query.stageStatusList = parseUrlIds(bsState.query.stageStatusList || '');
    }
    if (bsState.query.excludeItemIds) {
      bsState.query.excludeItemIds = parseUrlIds(bsState.query.excludeItemIds || '');
    }
    if (bsState.query.classIds) {
      bsState.query.classIds = parseUrlIds(bsState.query.classIds || '');
    }
    if (bsState.query.classificationIds) {
      bsState.query.classificationIds = parseUrlIds(bsState.query.classificationIds || '');
    }
    if (bsState.query.dataIds) {
      bsState.query.dataIds = parseUrlIds(bsState.query.dataIds || '');
    }
    if (bsState.query.dataType) {
      bsState.query.dataType = bsState.query.dataType.toUpperCase();
    }
  }
  return { query, iniQuery };
}
