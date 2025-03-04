import type { App } from 'vue';
import { set } from 'lodash';
import { createI18n } from 'vue-i18n';
// import zh from '../locales/image/zh-CN';
// import ko from '../locales/image/ko-KR';
// import en from '../locales/image/en-US';

import { LangType } from './packages/image-editor';

const usModules: Record<string, any> = import.meta.glob(
  ['../locales/tool/en-US/image.ts', '../locales/tool/en-US/common.ts'],
  {
    eager: true,
  },
);
const cnModules: Record<string, any> = import.meta.glob(
  ['../locales/tool/zh-CN/image.ts', '../locales/tool/zh-CN/common.ts'],
  {
    eager: true,
  },
);
const krModules: Record<string, any> = import.meta.glob(
  ['../locales/tool/ko-KR/image.ts', '../locales/tool/ko-KR/common.ts'],
  {
    eager: true,
  },
);
const arModules: Record<string, any> = import.meta.glob(
  ['../locales/tool/ar-AE/image.ts', '../locales/tool/ar-AE/common.ts'],
  {
    eager: true,
  },
);

export function genMessage(langs: Record<string, Record<string, any>>) {
  const obj: any = {};
  const keyReg = new RegExp(`/(${Object.values(LangType).join('|')})/(.*?).ts`);
  Object.keys(langs).forEach((key) => {
    const langFileModule = langs[key].default;
    const keyList = (key.match(keyReg) as string[])[2].split('/');
    const moduleName = keyList.shift();
    const objKey = keyList.join('.');
    if (moduleName) {
      if (objKey) {
        set(obj, moduleName, obj[moduleName] || {});
        set(obj[moduleName], objKey, langFileModule);
      } else {
        set(obj, moduleName, langFileModule || {});
      }
    }
  });
  return obj;
}

export let i18n: ReturnType<typeof createI18n>;

// setup i18n instance with glob
export async function setupI18n(app: App) {
  i18n = createI18n({
    legacy: false,
    locale: LangType['en-US'],
    fallbackLocale: LangType['en-US'],
    // messages: {
    //   [LangType['en-US']]: Object.assign(en, en),
    //   [LangType['zh-CN']]: Object.assign(zh, zh),
    //   [LangType['ko-KR']]: Object.assign(ko, ko),
    // },
    messages: {
      [LangType['en-US']]: genMessage(usModules),
      [LangType['zh-CN']]: genMessage(cnModules),
      [LangType['ko-KR']]: genMessage(krModules),
      [LangType['ar-AE']]: genMessage(arModules),
    },
    availableLocales: [LangType['en-US'], LangType['ko-KR'], LangType['zh-CN'], LangType['ar-AE']],
    silentTranslationWarn: true, // true - warning off
    missingWarn: false,
    silentFallbackWarn: true,
  });
  app.use(i18n);
  return i18n;
}

export function t(...arg: any) {
  if (typeof arg[0] == 'string' && !arg[0]?.includes('.')) {
    arg[0] = `image.${arg[0]}`;
  }
  return (<any>i18n).global.t(...arg);
}
export function tI(str: string, arg?: any) {
  return (<any>i18n).global.t(`image.${str}`, arg);
}
