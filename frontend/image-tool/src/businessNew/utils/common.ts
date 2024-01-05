import { Vector2 } from 'image-editor';
import { isNaN } from 'lodash';

export function empty(value: any) {
  return value == undefined || value == null || value === '';
}
export function validNumber(val: any) {
  return !empty(val) && typeof val === 'number' && !isNaN(val) && isFinite(val);
}
export function fixed(num: number, len: number = 4) {
  return Number(num.toFixed(len));
}
export function checkPoints(points?: Vector2[]) {
  if (!Array.isArray(points)) return [];
  const keys: String[] = [];
  const pointKey = (p: Vector2) => fixed(p.x) + '##' + fixed(p.y);
  return points.filter((point) => {
    if (point && validNumber(point.x) && validNumber(point.y) && !keys.includes(pointKey(point))) {
      keys.push(pointKey(point));
      point.x = fixed(point.x);
      point.y = fixed(point.y);
      return true;
    }
    return false;
  });
}
export function fillStr(v: string | number, fill = 2) {
  let str = v + '';
  const len = Math.max(str.length, fill);
  str = '0000000000' + str;
  return str.substring(str.length - len);
}
export function parseUrlIds(str: string) {
  str = decodeURIComponent(str);
  const ids = str.split(',');
  const set = new Set(ids);
  return [...set];
}

export function enableEscOnFullScreen() {
  // @ts-ignore
  if (navigator.keyboard && navigator.keyboard.lock) {
    // @ts-ignore
    navigator.keyboard.lock(['Escape']);
  }
}
export function closeTab() {
  const win = window.open('about:blank', '_self');
  win && win.close();
}
export function refreshTab() {
  window.location.reload();
}
