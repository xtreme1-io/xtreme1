import Editor from '../../../Editor';
import { define } from '../define';
import { OPType, StatusType, AnnotateModeEnum } from '../../../types';

export const toNextFrame = define({
  valid(editor: Editor) {
    return editor.isDefaultStatus();
  },
  execute(editor: Editor) {
    changeFrame(editor, 1);
  },
});
export const previousFrame = define({
  valid(editor: Editor) {
    return editor.isDefaultStatus();
  },
  execute(editor: Editor) {
    changeFrame(editor, -1);
  },
});
export const copyToNext = define({
  valid(editor: Editor) {
    return canCopy(editor);
  },
  execute(editor: Editor) {
    editor.dataManager.copyForward();
  },
});
export const copyToLast = define({
  valid(editor: Editor) {
    return canCopy(editor);
  },
  execute(editor: Editor) {
    editor.dataManager.copyBackWard();
  },
});

function changeFrame(editor: Editor, type: number) {
  const { frames, frameIndex } = editor.state;
  const index = frameIndex + type;
  if (index < 0 || index >= frames.length) return;
  editor.switchFrame(index);
}
function canCopy(editor: Editor) {
  const { state } = editor;
  return (
    (state.modeConfig.op === OPType.EDIT || state.modeConfig.name === 'all') &&
    state.annotateMode === AnnotateModeEnum.INSTANCE &&
    state.status === StatusType.Default
  );
}
