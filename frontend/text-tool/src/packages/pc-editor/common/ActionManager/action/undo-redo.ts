import Editor from '../../../Editor';
import { define } from '../define';

export const undo = define({
    valid(editor: Editor) {
        return true;
    },
    execute(editor: Editor) {
        editor.cmdManager.undo();
    },
});

export const redo = define({
    valid(editor: Editor) {
        return true;
    },
    execute(editor: Editor) {
        editor.cmdManager.redo();
    },
});
