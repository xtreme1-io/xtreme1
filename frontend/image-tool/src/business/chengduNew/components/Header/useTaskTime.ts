import { computed, watch } from 'vue';
import { useInjectBSEditor } from '../../context';
import { TaskClaimStatus } from '../../type';
import * as api from '../../api';
import useClaim from '../../hook/useClaim';
import useTaskFlow from '../../hook/useTaskFlow';
import Event from '../../config/event';

export default function useTaskTime() {
  const editor = useInjectBSEditor();
  const { bsState } = editor;
  const { getClaimInfo } = useClaim();
  const { claimData } = useTaskFlow();
  let doing = false;
  editor.on(Event.TASK_PAUSE, () => {
    onPause();
  });
  editor.on(Event.TASK_CONTINUE, () => {
    onContinue();
  });

  function isWorking() {
    if (!bsState.claim) return false;
    const passTm = Date.now() / 1000 - bsState.claim.updateTime;
    const time = bsState.claim.remainTotalTime - passTm;
    return bsState.claim.status === TaskClaimStatus.WORKING && time > 0;
  }
  function isPaused() {
    return bsState.claim?.status === TaskClaimStatus.PAUSED;
  }
  function isTimeout() {
    if (!bsState.claim) return false;
    const passTm = Date.now() / 1000 - bsState.claim.updateTime;
    const time = bsState.claim.remainTotalTime - passTm;
    return bsState.claim.status === TaskClaimStatus.TIMEOUT || time <= 0;
  }
  function isDone() {
    return bsState.claim?.status === TaskClaimStatus.DONE;
  }
  // 暂停/继续
  async function onTimer(state: 'pause' | 'continue') {
    if (!bsState.claimRecordId || doing) return;
    try {
      doing = true;
      if (state === 'continue') {
        await api.taskContinueClaim(bsState.claimRecordId);
        editor.resetWorkTime();
      } else {
        await api.taskStopClaim(bsState.claimRecordId);
        editor.reportWorkTime();
      }
      await getClaimInfo();
    } catch (err) {
      editor.handleErr(err as any);
    }
    doing = false;
  }
  // 轮询claimInfo
  let pollClaimTimer: any;
  async function pollClaim() {
    clearTimeout(pollClaimTimer);
    if (isTimeout() || isDone() || bsState.isVisitorClaim) return;
    pollClaimTimer = setTimeout(() => {
      getClaimInfo();
    }, 5000);
  }
  watch(
    () => bsState.claim,
    () => {
      if (bsState.claim && bsState.isTaskFlow) {
        editor.block(!isWorking());
        pollClaim();
      }
    },
    {
      immediate: true,
    },
  );

  /**
   * export
   */
  const timerInfo = computed(() => {
    return {
      status: bsState.claim?.status,
      updateTm: bsState.claim?.updateTime || Date.now() / 1000,
      remainTm: bsState.claim?.remainTotalTime,
      pausedTm: bsState.claim?.pauseTotalTime,
    };
  });
  // 过期后重新领取
  async function onReClaim() {
    await claimData(true);
  }
  async function onPause() {
    if (!doing && isWorking()) onTimer('pause');
  }
  async function onContinue() {
    if (!doing && isPaused()) onTimer('continue');
  }
  async function updateClaimInfo() {
    await getClaimInfo();
  }

  return {
    timerInfo,
    onReClaim,
    onPause,
    onContinue,
    updateClaimInfo,
  };
}
