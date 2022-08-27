import { useInjectEditor } from '../state';
import { LangType } from 'pc-editor';

export default function useLang() {
    let editor = useInjectEditor();

    function get<T extends Record<LangType, Record<string, string>>, D extends keyof T['en']>(
        name: D,
        locale: T,
        args?: Record<string, any>,
    ) {
        editor.getLocale(name, locale, args);
    }

    function bindLocale<T extends Record<LangType, Record<string, string>>>(locale: T) {
        return editor.bindLocale(locale);
    }

    return {
        get,
        bindLocale,
    };
}
