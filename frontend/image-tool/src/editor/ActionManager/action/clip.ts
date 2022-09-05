import { Editor } from '../../Editor';
import { define } from '../define';

export const clipPolygon = define({
    valid() {
        return true;
    },
    execute(editor: Editor, params: any) {
        // editor.cmdManager.undo();
        const imageLabel = editor?.tool;
        if (imageLabel) {
            imageLabel.clipPolygon(params.firstisClip);
        }
    },
});

export const cancelClip = define({
    valid() {
        return true;
    },
    execute(editor: Editor) {
        // editor.cmdManager.redo();
        console.log('cancelClip');
    },
});
