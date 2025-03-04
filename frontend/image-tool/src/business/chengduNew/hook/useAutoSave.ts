import Editor from '../common/Editor';
import { OPType, Event, StatusType } from 'image-editor';
export default function useAutoSave(editor: Editor) {
  const { bsState, state } = editor;
  const timeN = 5 * 60 * 1000;
  let _enableSave = true;
  let timer: any;
  const startEventSave = () => {
    resetTimer();
    if (!bsState.isTaskFlow || bsState.isVisitorClaim) return;
    const { op } = state.modeConfig;
    const canSave = op === OPType.EDIT || state.modeConfig.name === 'all';
    if (!canSave) return;
    autoSave();
  };

  const autoSave = () => {
    timer = setTimeout(async () => {
      const claim = bsState.claim;
      if (
        _enableSave &&
        state.status !== StatusType.Loading &&
        (!claim || claim.remainTotalTime > 0)
      ) {
        await editor.saveTaskFlow(undefined, { isAutoSave: true });
      }
      autoSave();
    }, timeN);
  };
  const resetTimer = () => {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
  };
  editor.on(Event.UPDATE_VIEW_MODE, startEventSave);
  return {
    init: startEventSave,
    reset: resetTimer,
    enableSave: (value: boolean) => {
      _enableSave = value;
    },
    destroy: () => {
      resetTimer();
      editor.off(Event.UPDATE_VIEW_MODE, startEventSave);
    },
  };
}
