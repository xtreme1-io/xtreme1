import en from './lang/en-US';
import zh from './lang/zh-CN';
import ko from './lang/ko-KR';
export * from './lang/type';

const languages = {
  'en-US': en,
  'zh-CN': zh,
  'ko-KR': ko,
  default: en,
};

export { languages };
