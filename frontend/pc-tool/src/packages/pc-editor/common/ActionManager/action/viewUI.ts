// import { Box, MainRenderView, TransformControlsAction } from 'pc-render';
import Editor from '../../../Editor';
import { define } from '../define';
// import * as THREE from 'three';

export const toggleClassView = define({
    valid(editor: Editor) {
        let selection = editor.pc.selection;
        return selection.length > 0;
    },
    execute(editor: Editor) {
        let state = editor.state;
        state.config.showClassView = !state.config.showClassView;
    },
});
