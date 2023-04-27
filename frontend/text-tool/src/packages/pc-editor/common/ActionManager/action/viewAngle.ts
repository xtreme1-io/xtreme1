// import { Box, MainRenderView, TransformControlsAction } from 'pc-render';
import Editor from '../../../Editor';
import { define } from '../define';
import * as THREE from 'three';
import { MainRenderView, ViewHelperAction, viewType } from 'pc-render';
function view(editor: Editor, type: viewType) {
    let view = editor.pc.renderViews.find((e) => e instanceof MainRenderView) as MainRenderView;
    if (view) {
        let action = view.getAction('view-helper') as ViewHelperAction;
        if (action) {
            return action.view(type);
        }
    }
}
export const toggleViewNegY = define({
    valid(editor: Editor) {
        let state = editor.state;
        return !state.config.showSingleImgView && state.modeConfig.actions['toggleViewNegY'];
    },
    execute(editor: Editor) {
        return view(editor, 'negY');
    },
});
export const toggleViewNegX = define({
    valid(editor: Editor) {
        let state = editor.state;
        return !state.config.showSingleImgView && state.modeConfig.actions['toggleViewNegX'];
    },
    execute(editor: Editor) {
        return view(editor, 'negX');
    },
});
export const toggleViewNegZ = define({
    valid(editor: Editor) {
        let state = editor.state;
        return !state.config.showSingleImgView && state.modeConfig.actions['toggleViewNegZ'];
    },
    execute(editor: Editor) {
        return view(editor, 'negZ');
    },
});
export const toggleViewPosY = define({
    valid(editor: Editor) {
        let state = editor.state;
        return !state.config.showSingleImgView && state.modeConfig.actions['toggleViewPosY'];
    },
    execute(editor: Editor) {
        return view(editor, 'posY');
    },
});
export const toggleViewPosX = define({
    valid(editor: Editor) {
        let state = editor.state;
        return !state.config.showSingleImgView && state.modeConfig.actions['toggleViewPosX'];
    },
    execute(editor: Editor) {
        return view(editor, 'posX');
    },
});
export const toggleViewPosZ = define({
    valid(editor: Editor) {
        let state = editor.state;
        return !state.config.showSingleImgView && state.modeConfig.actions['toggleViewPosZ'];
    },
    execute(editor: Editor) {
        return view(editor, 'posZ');
    },
});
