import Editor from '../Editor';
import { isString } from 'lodash';
import { template } from './string';

export function initI18n(editor: Editor) {
  // default i18n
  const lang = (
    module: string | Record<string, any>,
    name: string,
    args?: any[] | Record<string, any>,
  ) => {
    const { lang } = editor.state;
    const i18n = editor.i18n;
    const moduleLang = isString(module)
      ? i18n.messages[lang] || i18n.messages.default || undefined
      : module;

    if (moduleLang && moduleLang[name]) {
      const data = moduleLang[name];
      if (args) {
        return template(data, args);
      }
      return data;
    } else {
      return '';
    }
  };

  editor.i18n = {
    messages: {},
    lang,
    // t: () => '',
  };
}
