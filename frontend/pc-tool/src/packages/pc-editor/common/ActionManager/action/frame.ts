import { Box, MainRenderView, TransformControlsAction } from 'pc-render';
import { define } from '../define';
import Editor from '../../../Editor';

export const nextFrame = define({
    // valid(editor: Editor) {
    //     return editor.state.isSeriesFrame;
    // },
    execute(editor: Editor) {
        // editor.tool
        const { frameIndex } = editor.state;
        let toIndex = frameIndex + 1;
        editor.loadFrame(toIndex);
    },
});
export const preFrame = define({
    // valid(editor: Editor) {
    //     return editor.state.isSeriesFrame;
    // },
    execute(editor: Editor) {
        const { frameIndex } = editor.state;
        let toIndex = frameIndex - 1;
        editor.loadFrame(toIndex);
    },
});
