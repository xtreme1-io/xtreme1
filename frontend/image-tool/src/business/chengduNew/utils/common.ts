import UAParser from 'ua-parser-js';

export function rand(start: number, end: number) {
  return (Math.random() * (end - start) + start) | 0;
}

export function empty(value: any) {
  return value == undefined || value === '';
}
export function enableEscOnFullScreen() {
  // @ts-ignore
  if (navigator.keyboard && navigator.keyboard.lock) {
    // @ts-ignore
    navigator.keyboard.lock(['Escape']);
  }
}

// 是否是 mac 系统
export function isMac() {
  const parser = new UAParser();
  const osInfo = parser.getResult();
  const osName = (osInfo.os.name || '').toLowerCase();
  const isMac = osName.indexOf('mac') >= 0;
  return isMac;
}

export const formatEnum = (string: any) => {
  return string && string.slice
    ? string.slice(0, 1) + string.slice(1, string.length).toLowerCase().split('_').join(' ')
    : '';
};

export function parseUrlIds(str: string) {
  str = decodeURIComponent(str);
  const ids = str.split(',');
  const set = new Set(ids);
  return [...set];
}

export function queryStr(data: Record<string, any> = {}) {
  const queryArr = [] as string[];
  Object.keys(data).forEach((name) => {
    const value = data[name];
    if (Array.isArray(value)) {
      queryArr.push(`${name}=${value.join(',')}`);
    } else {
      value && queryArr.push(`${name}=${value}`);
    }
  });

  return queryArr.join('&');
}

export function closeTab() {
  const win = window.open('about:blank', '_self');
  win && win.close();
}
export function refreshTab() {
  window.location.reload();
}

export function fillStr(v: string | number, fill = 2) {
  let str = v + '';
  const len = Math.max(str.length, fill);
  str = '0000000000' + str;
  return str.substring(str.length - len);
}
