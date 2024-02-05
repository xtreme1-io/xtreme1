import { defineAction } from 'image-editor';
import Editor from '../common/Editor';
import { BsUIType } from '../configs/ui';
import Event from '../configs/event';
import { FlowAction } from '../types';

// save
export const flowSave = defineAction({
  valid(editor: Editor) {
    const { state, bsState } = editor;
    return state.modeConfig.ui[BsUIType.flowSave] && !bsState.doing.saving;
  },
  execute(editor: Editor) {
    editor.emit(Event.FLOW_ACTION, FlowAction.save);
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
  editor.switchFrame(index);
}
async function changeScene(editor: Editor, step: number) {
  const { state } = editor;
  const { sceneIds, sceneId } = state;
  const isShow = state.isSeriesFrame && sceneIds.length > 0;
  if (!isShow) return;
  const sceneIdx = sceneIds.indexOf(sceneId);
  const nextIdx = sceneIdx + step;
  if (nextIdx < 0 || nextIdx >= sceneIds.length) return;
  const needSave = state.frames.findIndex((e) => e.needSave) !== -1;
  if (needSave) {
    const result = await editor.save();
    if (!result) return;
  }
  await editor.loadManager.loadSceneData(nextIdx);
  editor.emit(Event.SCENE_CHANGE, { preScene: sceneIdx, newScene: nextIdx });
}
