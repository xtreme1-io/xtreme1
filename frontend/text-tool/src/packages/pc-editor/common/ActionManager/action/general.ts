import { Box, Image2DRenderView, MainRenderView, TransformControlsAction } from 'pc-render';
import { define } from '../define';
import Editor from '../../../Editor';
import { IAnnotationInfo, StatusType } from '../../../type';
import { CreateAction } from 'pc-render';
import Event from '../../../config/event';
// import * as THREE from 'three';

export const toggleTranslate = define({
    valid(editor: Editor) {
        return true;
    },
    execute(editor: Editor) {
        let selection = editor.pc.selection;
        let config = editor.state.config;
        let object = selection.find((annotate) => annotate instanceof Box);

        if (object) {
            if (config.activeTranslate) {
                editor.toggleTranslate(false);
            } else {
                editor.toggleTranslate(true, object as any);
            }
        }
        config.activeTranslate = !config.activeTranslate;
    },
});

export const focusObject = define({
    valid(editor: Editor) {
        let box = editor.pc.selection.find((annotate) => annotate instanceof Box);
        return !!box;
    },
    execute(editor: Editor) {
        editor.focusObject(editor.pc.selection.find((annotate) => annotate instanceof Box) as Box);
    },
});

export const deleteObject = define({
    valid(editor: Editor) {
        return editor.pc.selection.length > 0;
    },
    execute(editor: Editor) {
        let object = editor.pc.selection[0];
        editor.cmdManager.execute('delete-object', object);
    },
});

export const toggleShowAnnotation = define({
    valid(editor: Editor) {
        return true;
    },
    execute(editor: Editor) {
        let config = editor.state.config;
        config.showAnnotation = !config.showAnnotation;
        editor.pc.render();
    },
});

export const toggleShowLabel = define({
    valid(editor: Editor) {
        return true;
    },
    execute(editor: Editor) {
        let config = editor.state.config;
        config.showLabel = !config.showLabel;
        editor.pc.render();
    },
});
export const toggleShowMeasure = define({
    valid(editor: Editor) {
        return true;
    },
    execute(editor: Editor) {
        let groupTrack = editor.pc.groupTrack;
        groupTrack.visible = !groupTrack.visible;
        editor.pc.render();
    },
});
export const pickObject = define({
    valid(editor: Editor) {
        return true;
    },
    end(editor: Editor) {
        let view = editor.viewManager.getMainView();
        let action = view.getAction('create-obj') as CreateAction;
        action.end();
        editor.state.status = StatusType.Default;
    },
    execute(editor: Editor) {
        let view = editor.viewManager.getMainView();
        editor.state.status = StatusType.Pick;

        if (view) {
            return new Promise<any>(async (resolve) => {
                let action = view.getAction('create-obj') as CreateAction;
                this.action = action;

                action.start(
                    { type: 'points-1', trackLine: false },
                    async (data: THREE.Vector2[]) => {
                        let obj = view.getObjectByCanvas(data[0]);
                        // editor.state.status = StatusType.Default;
                        resolve(obj);
                    },
                );
            });
        }
    },
});
export const copyForward = define({
    valid(editor: Editor) {
        return editor.state.isSeriesFrame;
    },
    execute(editor: Editor) {
        editor.dataManager.copyForward();
    },
});
export const copyBackWard = define({
    valid(editor: Editor) {
        return editor.state.isSeriesFrame;
    },
    execute(editor: Editor) {
        editor.dataManager.copyBackWard();
    },
});

export const resultExpandToggle = define({
    execute(editor: Editor) {
        editor.dispatchEvent({ type: Event.RESULT_EXPAND_TOGGLE });
    },
});

export const filter2DByTrack = define({
    execute(editor: Editor) {
        let config = editor.state.config;
        config.filter2DByTrack = !config.filter2DByTrack;
        editor.pc.render();
    },
});
