import { defineAction } from 'image-editor';
import Event from '../config/event';
import { IAction } from '../type';
import Editor from '../common/Editor';
import { BsUIType } from '../config/ui';

export const flowHung = defineAction({
  valid(editor: Editor) {
    return true;
  },
  execute(editor: Editor) {
    editor.emit(Event.FLOW_ACTION, 'hung' as IAction);
  },
});

export const flowEdit = defineAction({
  valid(editor: Editor) {
    return true;
  },
  execute(editor: Editor) {
    editor.emit(Event.FLOW_ACTION, 'edit' as IAction);
  },
});

export const flowReject = defineAction({
  valid(editor: Editor) {
    const { state, bsState } = editor;
    return state.modeConfig.ui[BsUIType.flowReject] && !bsState.doing.rejecting;
  },
  execute(editor: Editor) {
    editor.emit(Event.FLOW_ACTION, 'reject' as IAction);
  },
});
export const flowSuspend = defineAction({
  valid(editor: Editor) {
    const { state, bsState } = editor;
    return state.modeConfig.ui[BsUIType.flowSuspend] && !bsState.doing.suspending;
  },
  execute(editor: Editor) {
    editor.emit(Event.FLOW_ACTION, 'suspend' as IAction);
  },
});

export const flowSubmit = defineAction({
  valid(editor: Editor) {
    const { state, bsState } = editor;
    return state.modeConfig.ui[BsUIType.flowSubmit] && !bsState.doing.submitting;
  },
  execute(editor: Editor) {
    editor.emit(Event.FLOW_ACTION, 'submit' as IAction);
  },
});

export const flowSave = defineAction({
  valid(editor: Editor) {
    const { state, bsState } = editor;
    return state.modeConfig.ui[BsUIType.flowSave] && !bsState.doing.saving;
  },
  execute(editor: Editor) {
    editor.emit(Event.FLOW_ACTION, 'save' as IAction);
  },
});

export const flowPass = defineAction({
  valid(editor: Editor) {
    const { state, bsState } = editor;
    return state.modeConfig.ui[BsUIType.flowPass] && !bsState.doing.submitting;
  },
  execute(editor: Editor) {
    editor.emit(Event.FLOW_ACTION, 'pass' as IAction);
  },
});

export const flowModify = defineAction({
  valid(editor: Editor) {
    const state = editor.state;
    return state.modeConfig.ui[BsUIType.flowModify];
  },
  execute(editor: Editor) {
    const action: IAction = editor.bsState.isModify ? 'back' : 'modify';
    // editor.bsState.isModify = !editor.bsState.isModify;
    editor.emit(Event.FLOW_ACTION, action);
  },
});

export const dataFrameNext = defineAction({
  valid(editor: Editor) {
    return !editor.bsState.blocking;
  },
  execute(editor: Editor) {
    if (editor.state.isSeriesFrame) changeScene(editor, 1);
    else changeFrame(editor, 1);
  },
});
export const dataFrameLast = defineAction({
  valid(editor: Editor) {
    return !editor.bsState.blocking;
  },
  execute(editor: Editor) {
    if (editor.state.isSeriesFrame) changeScene(editor, -1);
    else changeFrame(editor, -1);
  },
});
function changeFrame(editor: Editor, step: number) {
  const { frames, frameIndex } = editor.state;
  const index = frameIndex + step;
  if (index < 0 || index >= frames.length) return;
  editor.switchFrame(index, { Method: step > 0 ? 'Next' : 'Previous' });
}
async function changeScene(editor: Editor, step: number) {
  const { state, bsState } = editor;
  const { sceneId, sceneIds } = state;
  const isShow = state.isSeriesFrame && sceneIds.length > 0 && !bsState.isModify;
  if (!isShow) return;
  const sceneIdx = sceneIds.indexOf(sceneId);
  const nextIdx = sceneIdx + step;
  if (nextIdx < 0 || nextIdx >= sceneIds.length) return;
  const needSave = state.frames.findIndex((e) => e.needSave) !== -1 && !bsState.isVisitorClaim;
  if (needSave) {
    const result = await editor.save();
    if (!result) return;
  }
  await editor.loadManager.loadSceneData(nextIdx);
  editor.emit(Event.SCENE_CHANGE, { preScene: sceneIdx, newScene: nextIdx });
}
