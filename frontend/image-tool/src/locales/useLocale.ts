import { Editor } from 'image-editor';
import { ILocale, languages } from './index';

export default function useLocale(editor: Editor) {
  function lang<D extends keyof ILocale>(name: D, args?: Record<string, any> | any[]) {
    const data = editor.i18n.lang('common', name as any, args);
    if (!data) {
      return editor.i18n.lang(languages.default, String(name), args);
    }
    return data;
  }

  return {
    lang,
  };
}
