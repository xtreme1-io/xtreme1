import { provide, inject, reactive } from 'vue';
import { IBSState } from './type';
import Editor from './common/Editor';
import { initRegistry } from './registry';
import { IState } from 'pc-editor';

// global state
export const bsContext = Symbol('pc-tool-editor');
export const stateContext = Symbol('pc-tool-editor-state');

export function useProvideEditor() {
    let editor = new Editor();
    // @ts-ignore
    window.editor = editor;

    editor.state = reactive(editor.state);
    editor.state.config.enableShowAttr = true;
    editor.state.config.showAttr = true;

    initRegistry(editor);

    provide(bsContext, editor);
    provide(stateContext, editor.state);

    return editor;
}

export function useInjectEditor(): Editor {
    return inject(bsContext) as Editor;
}

export function useInjectState(): IState {
    return inject(stateContext) as IState;
}

export function getDefault(): IBSState {
    return {
        query: {},
        // flow
        saving: false,
        //
        // user
        user: {
            id: '',
            nickname: '',
        },
        datasetName:'',
        datasetType:'',
        datasetId: '',
        recordId: '',
    };
}