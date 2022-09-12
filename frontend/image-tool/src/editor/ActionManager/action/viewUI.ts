// import { Box, MainRenderView, TransformControlsAction } from 'pc-render';
import { Editor } from '../../Editor';
import { define } from '../define';
import Event from 'editor/config/event';

export const toggleClassView = define({
    valid() {
        return true;
    },
    execute(editor: Editor) {
        const selectedShape = editor?.tool?.selectedShape;
        if (!selectedShape) return;

        const state = editor.state;

        if (!state.showClassView) {
            editor.emit(Event.SHOW_CLASS_INFO, {
                data: {
                    object: selectedShape,
                },
            });
        } else {
            state.showClassView = false;
        }
    },
});

export const selectTool = define({
    valid() {
        return true;
    },
    execute(editor: Editor, args) {
        if (editor.toolConfig.isDrawing) {
            editor.showMsg('error', 'Please finish drawing first');
            return;
        }
        editor.handleSelectTool(args);
    },
});
