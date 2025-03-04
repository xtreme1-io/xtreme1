import { provide, inject, reactive, App } from 'vue';
import Editor from './common/Editor';
import { context } from 'image-ui/context';
import { initRegistry } from './registry';

export function useProvideBSEditor(app?: App) {
  const editor = new Editor();
  // @ts-ignore
  window.editor = editor;
  // @ts-ignore
  editor.state = reactive(editor.state);
  editor.bsState = reactive(editor.bsState);
  const { classLabelKey } = editor.dataResource.store.get();
  if (classLabelKey) editor.state.config.nameShowType = classLabelKey as any;

  initRegistry(editor);

  app ? app.provide(context, editor) : provide(context, editor);

  return editor;
}

export function useInjectBSEditor(): Editor {
  return inject(context) as Editor;
}
