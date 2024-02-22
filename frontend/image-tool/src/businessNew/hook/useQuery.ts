import qs from 'qs';
import { useInjectBSEditor } from '../context';
import { parseUrlIds } from '../utils';

export default function useQuery() {
  const queryStr = location.href.split('?').reverse();
  const query = qs.parse(queryStr[0] || '');

  const editor = useInjectBSEditor();
  const { bsState } = editor;
  function iniQuery() {
    Object.assign(bsState.query, query || {});

    bsState.recordId = (query.recordId as string) || '';
    bsState.datasetId = (query.datasetId as string) || '';
    if (bsState.query.itemIds) {
      bsState.query.itemIds = parseUrlIds(bsState.query.itemIds || '');
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
      bsState.query.dataType = bsState.query.dataType;
    }
  }
  return { query, iniQuery };
}
