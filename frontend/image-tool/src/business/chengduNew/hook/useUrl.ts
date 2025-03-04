import { queryStr, refreshTab } from '../utils';
import { useInjectBSEditor } from '../context';

export default function useUrl() {
  const editor = useInjectBSEditor();
  async function updateUrl(refresh: boolean = true) {
    const { bsState, state } = editor;
    const query = { ...bsState.query };

    const hrefInfo = location.href.split('?');
    if (hrefInfo.length === 0) return;

    let itemIdsStr = '';
    const ids = state.isSeriesFrame ? state.sceneIds : state.frames.map((e) => e.id);
    const idStr = ids.join(',');
    itemIdsStr = encodeURIComponent(idStr);

    query.itemIds = itemIdsStr;
    query.claimPool = bsState.claimPool;
    query.claimRecordId = bsState.claimRecordId;

    const str = queryStr(query);
    // console.log(`${hrefInfo[0]}?${queryStr}`);
    history.replaceState({}, '', `${hrefInfo[0]}?${str}`);
    if (refresh) {
      editor.beforeRefresh();
      refreshTab();
    }
  }

  return {
    updateUrl,
  };
}
