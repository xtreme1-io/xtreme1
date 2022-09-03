import { provide, inject } from 'vue';
import { IEditorState } from './state';
import { Editor } from './index';

export const content = Symbol('editor');

export function useProvideEditor(editor: Editor) {
    provide(content, editor);
}
export function useInjectEditor() {
    return inject(content) as Editor;
}

export const editorStatContent = Symbol('editor-state');

export function useProvideEditorState(editState: IEditorState) {
    provide(editorStatContent, editState);
}
export function useInjectEditorState() {
    return inject(editorStatContent) as IEditorState;
}

export type IInjectBusiness = any;
