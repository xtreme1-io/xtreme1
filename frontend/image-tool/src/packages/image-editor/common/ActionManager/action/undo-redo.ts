import { ToolAction } from './../../../types';
import Editor from '../../../Editor';
import { define } from '../define';

export const undo = define({
  valid() {
    return true;
  },
  canBlocked: () => false,
  execute(editor: Editor) {
    const { currentDrawTool, currentEditTool } = editor.mainView;
    const tool = currentDrawTool || currentEditTool;
    if (tool && tool.checkAction(ToolAction.undo)) {
      tool.onAction(ToolAction.undo);
    } else {
      editor.cmdManager.undo();
    }
  },
});

export const redo = define({
  valid() {
    return true;
  },
  execute(editor: Editor) {
    editor.cmdManager.redo();
  },
});
