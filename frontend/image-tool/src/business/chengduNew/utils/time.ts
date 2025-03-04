import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import zh from 'dayjs/locale/zh';
import en from 'dayjs/locale/en';
import ko from 'dayjs/locale/ko';
import ar from 'dayjs/locale/ar';
import { LangType } from 'image-editor';

dayjs.extend(utc);
dayjs.extend(relativeTime);
export function formatTimeUTC(time: number) {
  return dayjs(time).utc().format();
}

/** 处理时间为 X minutes/hours ago */
export const getDiffTime = (time: any) => {
  return dayjs(time).fromNow();
};

// 设置多语言
export function setDayjsLocale(locale: LangType) {
  const localeMap: Record<LangType, any> = {
    [LangType['zh-CN']]: zh,
    [LangType['en-US']]: en,
    [LangType['ko-KR']]: ko,
    [LangType['ar-AE']]: ar,
  };
  dayjs.locale(localeMap[locale] || en);
}
