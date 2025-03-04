import * as api from '../api';
import { useInjectBSEditor } from '../context';
import { TaskClaimStatus } from '../type';

export default function useClaim() {
  const editor = useInjectBSEditor();
  const { bsState } = editor;

  function isPaused() {
    return bsState.claim?.status == TaskClaimStatus.PAUSED;
  }

  async function getClaimInfo() {
    if (bsState.claimRecordId) {
      const claim = await api.getTaskClaimRecordInfo(bsState.claimRecordId);
      bsState.claim = claim;
      if (bsState.claimAnnotators.length <= 0) {
        bsState.claimAnnotators = claim.filterConfig?.annotatorIds?.map((e: any) => +e) ?? [];
      }
    }
  }

  async function continueClaim() {
    if (bsState.claimRecordId) {
      await api.taskContinueClaim(bsState.claimRecordId);
    }
  }
  async function initClaimInfo() {
    await getClaimInfo();
    if (isPaused()) {
      await continueClaim();
      getClaimInfo();
    }
  }

  return {
    getClaimInfo,
    continueClaim,
    initClaimInfo,
  };
}
