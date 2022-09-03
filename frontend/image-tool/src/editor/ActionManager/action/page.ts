import { Editor } from '../../Editor';
import { define } from '../define';

export const pageUp = define({
    valid() {
        return true;
    },
    execute(editor: Editor) {
        editor.handlePageUp();
        console.log(editor);
    },
});

export const pageDown = define({
    valid() {
        return true;
    },
    execute(editor: Editor) {
        editor.handlePageDown();
    },
});
export const toggleKeyboard = define({
    valid() {
        return true;
    },
    execute(editor: Editor) {
        editor.handleToggleKeyboard();
    },
});
