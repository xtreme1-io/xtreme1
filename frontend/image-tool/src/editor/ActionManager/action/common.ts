import { Editor } from '../../Editor';
import { define } from '../define';

// ctrl + s - onSave
export const onSave = define({
    valid() {
        return true;
    },
    execute(editor: Editor) {
        editor.handleSaveObject();
    },
});

// delete - deleteResult
export const onDelete = define({
    valid() {
        return true;
    },
    execute(editor: Editor) {
        console.log('deleteResult');
        editor.handleDelete();
    },
});

// enter - finishDraw
export const KeyEnterDown = define({
    valid() {
        return true;
    },
    execute(editor: Editor) {
        console.log('Press Enter');
        const currentTool = editor?.tool?.toolmanager?.currentTool;
        if (currentTool) {
            currentTool.done();
        }
    },
});

// Esc - cancelDraw
export const KeyEscDown = define({
    valid() {
        return true;
    },
    execute(editor: Editor) {
        console.log('Press Esc');
        const currentTool = editor?.tool?.toolmanager?.currentTool;
        if (currentTool) {
            currentTool.cancel();
        }
    },
});

// space -
export const KeySpaceDown = define({
    valid() {
        return true;
    },
    execute() {},
});
export const KeySpaceUp = define({
    valid() {
        return true;
    },
    execute() {},
});
// ctrl + z
export const KeyBackDown = define({
    valid() {
        return true;
    },
    execute() {},
});

// ctrl + shift + z
export const KeyForwardDown = define({
    valid() {
        return true;
    },
    execute() {},
});
