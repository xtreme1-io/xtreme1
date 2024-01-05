import { provide, inject, reactive } from 'vue';
import Editor from './common/Editor';
import { context } from 'image-ui/context';
import { initRegistry } from './registry';

export function useProvideBSEditor() {
  const editor = new Editor();
  // @ts-ignore
  window.editor = editor;
  // @ts-ignore
  editor.state = reactive(editor.state);
  editor.bsState = reactive(editor.bsState);

  initRegistry(editor);

  provide(context, editor);

  return editor;
}

export function useInjectBSEditor(): Editor {
  return inject(context) as Editor;
}
