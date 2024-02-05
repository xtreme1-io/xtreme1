import { provide, inject } from 'vue';
import { Editor } from '../image-editor';

export const context = Symbol('image-editor');

export function useProvideEditor(editor: Editor) {
  provide(context, editor);
}

export function useInjectEditor() {
  return inject(context) as Editor;
}
